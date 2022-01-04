const { contextBridge, ipcRenderer } = require('electron')

let eventCallbacks = [];

const dispatch = (eventType, eventData) => {
    for (let i = 0; i < eventCallbacks.length; i++) {
        if (eventCallbacks[i].type == eventType) {
            eventCallbacks[i].callback(eventData);
        }
    }
}

process.once('loaded', () => {

    window.addEventListener('message', event => {
        if (event.data.channel === 'to-main') {
            ipcRenderer.send('to-main', event.data);
        }
    });

    ipcRenderer.on('from-main', (event, arg) => {
        dispatch(arg.type, arg.data);
    })

})

contextBridge.exposeInMainWorld('api', {
    callEvent: (type, data) => {
        window.postMessage({ channel: 'to-main', type: type, data: data })
    },
    addListener: (type, callback) => {
        eventCallbacks.push({ type, callback });
    },
    removeListener: (type) => {
        for (let i = 0; i < eventCallbacks.length; i++) {
            if (eventCallbacks[i].type == type) {
                eventCallbacks.splice(i, 1);
                return;
            }
        }
    }
})