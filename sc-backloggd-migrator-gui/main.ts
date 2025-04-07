import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { runMigration } from './core/sc-migration-ratings';
import { readSavedGames } from '../sc-backloggd-migrator-utils/filesystem';

let mainWindow: BrowserWindow;

app.commandLine.appendSwitch('enable-logging');
app.whenReady().then(async () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.resolve(__dirname, '../dist/sc-backloggd-migrator-gui/preload.js')
    }
  });

  await mainWindow.loadFile(path.resolve(__dirname, 'vues/migrator-page/migrator-page.html'));

  ipcMain.handle('start-migration', async () => {
    await mainWindow.loadURL('https://www.senscritique.com');
    mainWindow.webContents.once('did-finish-load', async () => {
      const games = await runMigration(mainWindow);
      if (games.length > 0) {
        await mainWindow.loadFile(path.resolve(__dirname, 'vues/real-time-data/real-time-data.html'));
      }
    });
  });

  ipcMain.handle('redirect-to-display', () => {
    return readSavedGames();
  });
});
