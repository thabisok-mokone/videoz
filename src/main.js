const { app, BrowserWindow } = require('electron');
const path = require('path');
const { dialog, ipcMain } = require('electron');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}

let mainWindow;

const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 800,
        title: "Videoz",
        show: false,
        autoHideMenuBar: true,
        icon: ("src/assets/icon.png"),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            enableRemoteModule: false,
            contextIsolation: true,
            sandbox: true,
            webSecurity: true
        }
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);


    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.show();
    })

    // Open the DevTools.
    //mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.


let childFFMPEG;
const spawn = require('child_process').spawn;
const ffmpeg = require('ffmpeg-static-electron').path;

const getDuration = (file) => {
    const ffprobe = require('ffprobe-static-electron').path;
    const execSync = require('child_process').execSync;
    let duration = JSON.parse(execSync(ffprobe + " -i " + '"' + file + '"' + " -print_format json -show_format -select_streams v -hide_banner", {windowsHide: true} ).toString()).format.duration;
    return (duration);
}

const getResolution = (file) => {
    const ffprobe = require('ffprobe-static-electron').path;
    const execSync = require('child_process').execSync;
    let res = execSync(ffprobe + " -i " + '"' + file + '"' + " -v error -select_streams v -hide_banner -show_entries stream=width,height -of csv=s=x:p=0", {windowsHide: true} ).toString();
    let resolution = {
        x: parseInt(res.split("x")[0]),
        y: parseInt(res.split("x")[1])
    }
    return (resolution);
}

const getMaxDuration = (files) => {
    let maxDuration = getDuration(files[0]);
    files.forEach(file => {
        let duration = getDuration(file);
        if (duration>maxDuration) {
            maxDuration=duration;
        }
    });
    return maxDuration;
}

const getDurationSum = (files) => {
    let sum = 0;
    files.forEach(file => {
        sum += parseFloat(getDuration(file));
    });
    return sum;
}


let toSeconds = (hms) => {
    let a = hms.split(':')
    return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2])
}

const ffmpegConfig = {
    mp4: {
        Ultra: ["-preset", "slower", "-codec:a", "aac", "-b:a", "320k", "-codec:v", "libx264", "-crf", "15", "-pix_fmt", "yuv420p", "-movflags", "+faststart"],

        High: ["-preset", "slow", "-codec:a", "aac", "-b:a", "320k", "-codec:v", "libx264", "-crf", "17", "-pix_fmt", "yuv420p", "-movflags", "+faststart"],

        Medium: ["-preset", "fast", "-codec:a", "aac", "-b:a", "256k", "-codec:v", "libx264", "-crf", "22", "-pix_fmt", "yuv420p", "-movflags", "+faststart"],

        Low: ["-preset", "faster", "-codec:a", "aac", "-b:a", "192k", "-codec:v", "libx264", "-crf", "26", "-pix_fmt", "yuv420p", "-movflags", "+faststart"]
    },
    webm: {
        Ultra: ["-codec:a", "libopus", "-b:a", "320k", "-codec:v", "libvpx-vp9", "-crf", "25", "-b:v", "0", "-pix_fmt", "yuv420p"],

        High: ["-codec:a", "libopus", "-b:a", "320k", "-codec:v", "libvpx-vp9", "-crf", "27", "-b:v", "0", "-pix_fmt", "yuv420p"],

        Medium: ["-codec:a", "libopus", "-b:a", "256k", "-codec:v", "libvpx-vp9", "-crf", "32", "-b:v", "0", "-pix_fmt", "yuv420p"],

        Low: ["-codec:a", "libopus", "-b:a", "192k", "-codec:v", "libvpx-vp9", "-crf", "36", "-b:v", "0", "-pix_fmt", "yuv420p"]
    }
}


const process = async(data, callback) => {

    let task = [];
    let duration = 0;

    if (data.numberOfVideos == 1) {
        task = ["-y"];

        if (data.startTime != 0) {
            task.push("-ss");
            task.push(data.startTime);
        }

        task.push("-i");
        task.push(data.video);

        if (data.changeResolution) {
            task.push("-s");
            task.push(data.resolution.x + "x" + data.resolution.y);
        }

        if (data.container == "mp4" || data.container == "webm") {

            if (data.endTime != getDuration(data.video)) {
                task.push("-t");
                task.push(data.duration);
            }
            
            ffmpegConfig[data.container][data.quality].forEach(element => {
                task.push(element);
            });
            task.push(data.outputPath + "\\" + data.name + "." + data.container);
        } else if (data.container == "png" || data.container == "jpg") {
            task.push("-vframes");
            task.push("1");
            task.push(data.outputPath + "\\" + data.name + "." + data.container);
        }

        duration = data.duration;

    } else if (data.numberOfVideos > 1 && data.mergeFiles == true) {
        task = ["-y"];
        data.videos.forEach(video => {
            task.push("-i");
            task.push(video);
        });
        task.push("-filter_complex");
        task.push(("concat=n=" + data.numberOfVideos + ":v=1:a=1"));
        ffmpegConfig[data.container][data.quality].forEach(element => {
            task.push(element);
        });
        if (data.changeResolution) {
            task.push("-s");
            task.push(data.resolution.x + "x" + data.resolution.y);
        }
        task.push(data.outputPath + "\\" + data.name + "." + data.container);
        duration = getDurationSum(data.videos);
    } else if (data.numberOfVideos > 1 && data.mergeFiles == false) {
        task = ["-y"];
        data.videos.forEach(video => {
            task.push("-i");
            task.push(video);
        });
        for (let i = 0; i < data.numberOfVideos; i++) {
            ffmpegConfig[data.container][data.quality].forEach(element => {
                task.push(element);
            });
            if (data.changeResolution) {
                task.push("-s");
                task.push(data.resolution.x + "x" + data.resolution.y);
            }
            task.push("-map");
            task.push(i);
            task.push(data.outputPath + "\\" + data.names[i] + "." + data.container);
        }
        duration = getMaxDuration(data.videos);
    }

    childFFMPEG = spawn(ffmpeg, task);

    childFFMPEG.stderr.on('data', (output) => {
        let string = output.toString();
        let isProcessing = string.indexOf("time=") != -1;

        let progress = 0;
        if (isProcessing) {
            let start = string.indexOf("time=") + ("time=").length;
            let end = start + ("00:00:00").length;
            let time = toSeconds(string.slice(start, end));
            progress = ((time / duration) * 100).toFixed(1);
        }
        mainWindow.webContents.send('from-main', { type: "processing", data: {log: string, progress: progress} });
    });

    childFFMPEG.on('close', () => {
        callback(true);
    });

}

const cancel = async() => {
    childFFMPEG.kill();
    return;
}

const selectFiles = async() => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'multiSelections'],
        filters: [
            { name: 'Videos', extensions: ['mkv', 'avi', 'mp4', 'webm', 'mov', 'wmv', 'm4v'] }
        ]
    });
    return result.filePaths;
}


const selectOutputDir = async() => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    return result.filePaths[0];
}


const getVideoInfo = async(video, callback) => {
    let info = {
        duration: getDuration(video),
        resolution: getResolution(video)
    }
    callback(info);
    return;
}



ipcMain.on('to-main', async(event, arg) => {
    if (arg.type === 'select-files') {
        const files = await selectFiles();
        event.reply('from-main', { type: 'selected-files', data: files });
    }
    if (arg.type === 'select-output-directory') {
        const dir = await selectOutputDir();
        event.reply('from-main', { type: 'selected-output-directory', data: dir });
    }
    if (arg.type === 'process') {
        await process(arg.data, (result) => {
            event.reply('from-main', { type: 'processed', data: result });
        });
    }
    if (arg.type === 'cancel') {
        await cancel();
        event.reply('from-main', { type: 'processed', data: false });
    }
    if (arg.type === 'get-video-info') {
        await getVideoInfo(arg.data, (result) => {
            event.reply('from-main', { type: 'got-video-info', data: result });
        });
    }
})