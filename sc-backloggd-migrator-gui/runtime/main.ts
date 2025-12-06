import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { flushMetadata } from '../core/sc-user-metadata';
import { redirectToDisplayHandler, runBackloggdRatingHandler, startMigrationHandler } from './ipc-handlers';

let mainWindow: BrowserWindow;

app.commandLine.appendSwitch('enable-logging');
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.resolve(__dirname, '../../dist/sc-backloggd-migrator-gui/preload.js')
    }
  });

  await mainWindow.loadFile(path.resolve(__dirname, '../vues/migrator-page/migrator-page.html'));
  await flushMetadata(mainWindow);

  ipcMain.handle('start-migration', () => startMigrationHandler(mainWindow));
  ipcMain.handle('run-backloggd-rating', () => runBackloggdRatingHandler(mainWindow));
  ipcMain.handle('redirect-to-display', () => redirectToDisplayHandler());
});
