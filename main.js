'use strict';

const {app, BrowserWindow} = require("electron");

let mainWindow;
let server;

function createWindow() {
    if (process.platform === 'win32') {
        server = require('child_process').spawn('py', ['-3', '-m', 'pynetworktables2js']);
    } else {
        server = require('child_process').spawn('python3', ['-m', 'pynetworktables2js']);
    }

    mainWindow = new BrowserWindow({
        width: 1366,
        height: 570,
        show: false,
        webPreferences: {
            allowRunningInsecureContent: true
        }
    });

    mainWindow.setPosition(0, 0);

    //mainWindow.setMenu(null);

    mainWindow.loadURL('http://localhost:8888');

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
    app.quit();
});
app.on('quit', () => {
    console.log('Application quit.');
    server.kill('SIGINT');
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
})