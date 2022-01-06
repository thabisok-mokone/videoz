import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';


const Editor = ()=> {

    const navigate = useNavigate();
    const { state } = useLocation();

    const [videoCurrentTime, setVideoCurrentTime] = React.useState(0);

    const [startTime, setStartTime] = React.useState(0);
    const [endTime, setEndTime] = React.useState(0);

    const [startTimeString, setStartTimeString] = React.useState("00:00:00");
    const [endTimeString, setEndTimeString] = React.useState("00:00:00");

    const [videoDuration, setVideoDuration] = React.useState(0);

    const [isTimeCorrect, setIsTimeCorrect] = React.useState(true);

    const [resolutionX , setResolutionX] = React.useState(1920);
    const [resolutionY , setResolutionY] = React.useState(1080);

    const [container , setContainer] = React.useState("mp4");
    const [quality , setQuality] = React.useState("Ultra");
    const [fileNameType , setFileNameType] = React.useState("Same");

    const [customFileName, setCustomFileName] = React.useState("");

    const [mergeFiles, setMergeFiles] = React.useState(false);
    const [changeResolution, setChangeResolution] = React.useState(false);

    const [canProcess, setCanProcess] = React.useState(false); 

    const [canPlayVideo, setCanPlayVideo] = React.useState(false); 

    const videoPlayer = React.useRef(null);

    React.useEffect(()=>{
        if (container=="mp4"||container=="webm") {
            if (startTime>=endTime||startTime>videoDuration||endTime>videoDuration) {
                setIsTimeCorrect(true);
            } else {
                setIsTimeCorrect(false);
            }
        } else if (container=="png"||container=="jpg") {
            if (startTime>videoDuration) {
                setIsTimeCorrect(true);
            } else {
                setIsTimeCorrect(false);
            }
        } else {
            setIsTimeCorrect(false);
        }
    }, [startTime, endTime, container, videoDuration]);

    React.useEffect(()=>{

        if (state.selectedVideos.length == 1) {
            if (getVideoExtension(state.selectedVideos[0]) == "mp4" || getVideoExtension(state.selectedVideos[0]) == "webm") {
                setCanPlayVideo(true);
            } else {
                window.api.callEvent('get-video-info', state.selectedVideos[0]);
            }
        }
       
        if (state.fromProcess) {
            setStartTime(state.startTime);
            setEndTime(state.endTime);
            setStartTimeString(state.startTimeString);
            setEndTimeString(state.endTimeString);
            setResolutionX(state.resolutionX);
            setResolutionY(state.resolutionY);
            setContainer(state.container);
            setQuality(state.quality);
            setFileNameType(state.fileNameType);
            setCustomFileName(state.customFileName);
            setMergeFiles(state.mergeFiles);
            setOutputPath(state.outputPath);
            setVideoCurrentTime(state.videoCurrentTime);
            setChangeResolution(state.changeResolution);
        }
        window.api.addListener('selected-output-directory', (data)=>{
            if (data) {
                setOutputPath(data);
            }
        });

        window.api.addListener('got-video-info', (data)=>{
            if (data) {
                setVideoDuration(data.duration);
                if (!state.fromProcess) {
                    setEndTime(data.duration);
                    setEndTimeString(toHMS(data.duration));
                }
                setResolutionX(data.resolution.x);
                setResolutionY(data.resolution.y);
                setCanProcess(true);
            }
        });

    }, []);

    const getVideoNameAndExtension = (videoPath)=> {
        const splittedPath = videoPath.split("\\");
        return splittedPath[splittedPath.length -1];
    }

    const getVideoExtension = (videoPath)=> {
        const splittedPath = videoPath.split("\\");
        const nameAndExt = splittedPath[splittedPath.length -1];
        const indexOfExt = nameAndExt.lastIndexOf(".");
        return nameAndExt.slice(indexOfExt+1);
    }

    const getVideoPath = (videoPath)=> {
        const indexOfName = videoPath.lastIndexOf("\\");
        return videoPath.slice(0, indexOfName);
    }

    const getVideoName = (videoPath)=> {
        const splittedPath = videoPath.split("\\");
        const nameAndExt = splittedPath[splittedPath.length -1];
        const indexOfExt = nameAndExt.lastIndexOf(".");
        return nameAndExt.slice(0, indexOfExt);
    }

    const toHMS = (value)=> {  
        return new Date(value * 1000).toISOString().substr(11, 8);
    }

    const toSeconds = (value) => {
        let a = value.split(':')
        return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2])
    }

    const [outputPath , setOutputPath] = React.useState(getVideoPath(state.selectedVideos[0]));

    const navigateToProgress = ()=> {
        
        window.api.removeListener('selected-output-directory');
        window.api.removeListener('got-video-info');

        let data = {};
        let videos = state.selectedVideos;
        let numberOfVideos = videos.length;
        let names = [];
        if (numberOfVideos > 1 && mergeFiles == false) {
            videos.forEach(video => {
                switch (fileNameType) {
                    case "Same":
                        names.push(getVideoName(video));
                        break;
                    case "Converted":
                        names.push(getVideoName(video)+"-converted");
                        break;
                    default:
                        names.push(getVideoName(video));
                        break;
                }
            });
        } else if (numberOfVideos > 1 && mergeFiles == true) {
            names.push(customFileName);
        } else if (numberOfVideos == 1) {
            switch (fileNameType) {
                case "Same":
                    names.push(getVideoName(videos[0]));
                    break;
                case "Converted":
                    names.push(getVideoName(videos[0])+"-converted");
                    break;
                case "Custom":
                    names.push(customFileName);
                    break;
                default:
                    names.push(getVideoName(videos[0]));
                    break;
            }
        }

        if (numberOfVideos > 1 && mergeFiles == false) {
            data = {
                numberOfVideos: numberOfVideos,
                mergeFiles: mergeFiles,
                changeResolution: changeResolution,
                videos: videos,
                names: names,
                outputPath: outputPath,
                container: container,
                quality: quality,
                resolution: {
                    x: resolutionX,
                    y: resolutionY
                }
            }    
        } else if (numberOfVideos > 1 && mergeFiles == true) {
            data = {
                numberOfVideos: numberOfVideos,
                mergeFiles: mergeFiles,
                changeResolution: changeResolution,
                videos: videos,
                name: names[0],
                outputPath: outputPath,
                container: container,
                quality: quality,
                resolution: {
                    x: resolutionX,
                    y: resolutionY
                }
            } 
        } else if (numberOfVideos == 1) {

            if (container == "mp4" || container == "webm") {
                data = {
                    numberOfVideos: numberOfVideos,
                    video: videos[0],
                    name: names[0],
                    changeResolution: changeResolution,
                    outputPath: outputPath,
                    container: container,
                    startTime: startTime,
                    endTime: endTime,
                    duration: endTime-startTime,
                    quality: quality,
                    resolution: {
                        x: resolutionX,
                        y: resolutionY
                    }
                }   
            } else if (container == "png" || container == "jpg") {
                data = {
                    numberOfVideos: numberOfVideos,
                    video: videos[0],
                    name: names[0],
                    changeResolution: changeResolution,
                    outputPath: outputPath,
                    container: container,
                    startTime: startTime,
                    quality: quality,
                    resolution: {
                        x: resolutionX,
                        y: resolutionY
                    }
                }
            }
            
        }

        navigate("/process", { replace: true, state: 
            {
                data:data, 
                editorState: {
                    fromProcess: true,
                    startTime,
                    endTime,
                    startTimeString,
                    endTimeString,
                    resolutionX,
                    resolutionY,
                    container,
                    quality,
                    fileNameType,
                    customFileName,
                    mergeFiles,
                    outputPath,
                    videoCurrentTime,
                    changeResolution,
                    selectedVideos: state.selectedVideos
                }
            } 
        });
    }

    return (
        <div className="Editor" style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
        }}>
            <Stack spacing={3}>
                {state.selectedVideos.length == 1?
                    <Typography variant="h4" align="center" noWrap={true} color="primary">{getVideoNameAndExtension(state.selectedVideos[0])}</Typography>
                :
                    <Typography variant="h4" align="center" color="primary">Multiple files selected</Typography>
                }
                {state.selectedVideos.length == 1 && canPlayVideo? 
                <video
                    ref={videoPlayer}
                    muted 
                    controls
                    onTimeUpdate={(event)=>{setVideoCurrentTime(event.target.currentTime)}}
                    onLoadedMetadata={(event)=>{
                        if (!state.fromProcess) {
                            setEndTime(event.target.duration);
                            setEndTimeString(toHMS(event.target.duration));
                            setResolutionX(event.target.videoWidth);
                            setResolutionY(event.target.videoHeight);
                            setVideoDuration(event.target.duration);
                        } else {
                            setVideoDuration(event.target.duration);
                            videoPlayer.current.currentTime = state.videoCurrentTime;
                        }
                        setCanProcess(true);
                    }}
                    style={{
                        width: "100%",
                        maxHeight: "30rem",
                        backgroundColor: "rgb(150, 150, 150)",
                        borderRadius: "0.5rem",
                    }}>
                    <source src={state.selectedVideos[0]}/>
                </video>
                : 
                    null
                }
                {(container == "mp4" || container == "webm") && state.selectedVideos.length == 1?
                    <Stack spacing={6} direction="row">
                        <Stack spacing={1} direction="row" sx={{ flex: 1 }}>
                            {canPlayVideo?
                                <Button fullWidth variant="contained" onClick={()=>{
                                    setStartTime(videoCurrentTime);
                                    setStartTimeString(toHMS(videoCurrentTime));
                                }}>Set start</Button>
                            :
                                null
                            }
                            <TextField fullWidth label="Start time" variant="outlined" value={startTimeString} error={isTimeCorrect} onChange={(event)=>{
                                let input = event.target.value = event.target.value.replace(/[^0-9:]/g,'');
                                setStartTimeString(input);
                                setStartTime(toSeconds(input));
                            }} />
                        </Stack>
                        <Stack spacing={1} direction="row" sx={{ flex: 1 }}>
                            <TextField fullWidth label="End time" variant="outlined" value={endTimeString} error={isTimeCorrect} onChange={(event)=>{
                                let input = event.target.value = event.target.value.replace(/[^0-9:]/g,'');
                                setEndTimeString(input);
                                setEndTime(toSeconds(input));
                            }} />
                            {canPlayVideo?
                                <Button fullWidth variant="contained" onClick={()=>{
                                    setEndTime(videoCurrentTime);
                                    setEndTimeString(toHMS(videoCurrentTime));
                                }}>Set end</Button>
                            :
                                null
                            }
                        </Stack> 
                    </Stack>
                :
                    null
                }  
                {(container == "png" || container == "jpg") && state.selectedVideos.length == 1?
                    <Stack spacing={1} direction="row" sx={{ flex: 1 }}>
                            {canPlayVideo?
                                <Button fullWidth variant="contained" onClick={()=>{
                                    setStartTime(videoCurrentTime);
                                    setStartTimeString(toHMS(videoCurrentTime));
                                }}>Set frame</Button>
                            :
                                null
                            }
                        <TextField fullWidth label="Frame time" variant="outlined" error={isTimeCorrect} value={startTimeString} onChange={(event)=>{
                                let input = event.target.value = event.target.value.replace(/[^0-9:]/g,'');
                                setStartTimeString(input);
                                setStartTime(toSeconds(input));
                        }} />
                    </Stack>
                :
                    null
                }  
                <FormControlLabel 
                        control={
                            <Checkbox 
                                checked={changeResolution} 
                                onChange={(event)=>{
                                    setChangeResolution(event.target.checked);
                                }} 
                            />
                        } 
                        label="Change resolution" 
                />
                {changeResolution?
                    <Stack spacing={6} direction="row">
                        <TextField fullWidth label="Resolution X" variant="outlined" type={"number"} value={resolutionX} onChange={(event)=>{setResolutionX(event.target.value);}} />
                        <TextField fullWidth label="Resolution Y" variant="outlined" type={"number"} value={resolutionY} onChange={(event)=>{setResolutionY(event.target.value);}} />
                    </Stack>
                :
                    null
                }
                <FormControl fullWidth>
                <InputLabel id="container-select-label">Container</InputLabel>
                <Select labelId="container-select-label" value={container} label="Container" onChange={(e)=>{setContainer(e.target.value);}}>
                    <MenuItem value={"mp4"}>mp4</MenuItem>
                    <MenuItem value={"webm"}>webm</MenuItem>
                    {state.selectedVideos.length == 1? <MenuItem value={"png"}>png</MenuItem> : null}
                    {state.selectedVideos.length == 1? <MenuItem value={"jpg"}>jpg</MenuItem> : null}
                </Select> 
                </FormControl>
                {container=="mp4" || container=="webm"?
                    <FormControl fullWidth>
                    <InputLabel id="quality-select-label">Quality</InputLabel>
                    <Select labelId="quality-select-label" value={quality} label="Quality" onChange={(e)=>{setQuality(e.target.value);}}>
                        <MenuItem value={"Ultra"}>Ultra</MenuItem>
                        <MenuItem value={"High"}>High</MenuItem>
                        <MenuItem value={"Medium"}>Medium</MenuItem>
                        <MenuItem value={"Low"}>Low</MenuItem>
                    </Select> 
                    </FormControl>
                :
                    null
                }
                {state.selectedVideos.length != 1?
                    <FormControlLabel 
                        control={
                            <Checkbox 
                                checked={mergeFiles} 
                                onChange={(event)=>{
                                    if (!event.target.checked && fileNameType=="Custom") {
                                        setFileNameType("Same");
                                    }
                                    if (event.target.checked) {
                                        setFileNameType("Custom");
                                    }

                                    setMergeFiles(event.target.checked);
                                }} 
                            />
                        } 
                        label="Merge all videos into a single file" />
                :
                    null
                }
                <Stack direction="row" spacing={1}>
                    <TextField fullWidth label="Output directory" variant="outlined" value={outputPath} inputProps={{readOnly: true, disabled: true}} />
                    <Button 
                        variant="contained" 
                        onClick={()=>{
                            window.api.callEvent('select-output-directory');
                        }}>
                        Select
                    </Button>
                </Stack> 
                <FormControl fullWidth>
                <InputLabel id="filename-select-label">File name</InputLabel>
                <Select labelId="filename-select-label" value={fileNameType} label="File name" onChange={(e)=>{setFileNameType(e.target.value);}}>
                    {mergeFiles == false?<MenuItem value={"Same"}>Keep the same name</MenuItem>:null}
                    {mergeFiles == false?<MenuItem value={"Converted"}>Add "-converted" suffix</MenuItem>:null}
                    {state.selectedVideos.length == 1 || mergeFiles == true? <MenuItem value={"Custom"}>Set custom name</MenuItem> : null}
                </Select> 
                </FormControl>
                {fileNameType=="Custom"?
                    <TextField fullWidth label="Custom file name" variant="outlined" value={customFileName} onChange={(event)=>{setCustomFileName(event.target.value);}} />
                :
                    null
                } 
                <Stack spacing={6} direction="row">
                    {(state.selectedVideos.length == 1 && canProcess && !isTimeCorrect) || state.selectedVideos.length != 1?
                        <Button 
                            style={{
                                padding:"1em"
                            }}
                            fullWidth 
                            variant="contained" 
                            onClick={()=>{
                                navigateToProgress();
                            }}>
                            Start
                        </Button>
                    :
                        <Button 
                            style={{
                                padding:"1em"
                            }}
                            fullWidth 
                            variant="contained" 
                            disabled
                            onClick={()=>{
                                navigateToProgress();
                            }}>
                            Start
                        </Button>
                    }
                    <Button 
                        style={{
                            padding:"1em"
                        }}
                        fullWidth 
                        variant="contained" 
                        color="error" 
                        onClick={()=>{
                            window.api.removeListener('selected-output-directory');
                            window.api.removeListener('got-video-info');
                             navigate("/", { replace: true }); 
                        }}>
                        Cancel
                    </Button>
                </Stack> 
                
            </Stack>
        </div>
    );
  }

  export default Editor;




