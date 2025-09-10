import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { runMigration } from './core/sc-migration-ratings';
import { readSavedGames } from '../sc-backloggd-migrator-utils/filesystem';
import { runBackloggdRatingAutomation } from './core/backloggd-import-ratings';
import { flushMetadata } from './core/sc-user-metadata';

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
      preload: path.resolve(__dirname, '../dist/sc-backloggd-migrator-gui/preload.js')
    }
  });

  await mainWindow.loadFile(path.resolve(__dirname, 'vues/migrator-page/migrator-page.html'));
  await flushMetadata(mainWindow);

  ipcMain.handle('start-migration', async () => {
    await mainWindow.loadURL('https://www.senscritique.com');
    mainWindow.webContents.once('did-finish-load', async () => {
      const games = await runMigration(mainWindow);
      if (games) {
        await mainWindow.loadFile(path.resolve(__dirname, 'vues/real-time-data/real-time-data.html'));
      }
    });
  });

  ipcMain.handle('run-backloggd-rating', async () => {
    try {
      await mainWindow.loadURL('https://backloggd.com/users/sign_in');

      return new Promise((resolve) => {
        const handler = async () => {
          const url = mainWindow.webContents.getURL();

          if (!url.includes('/users/sign_in')) {
            mainWindow.webContents.removeListener('did-navigate', handler);
            mainWindow.webContents.removeListener('did-navigate-in-page', handler);

            try {
              const result = await runBackloggdRatingAutomation(mainWindow);
              resolve({ success: true, data: result });
            } catch (err) {
              resolve({ success: false, error: err });
            }
          }
        };

        mainWindow.webContents.on('did-navigate', handler);
        mainWindow.webContents.on('did-navigate-in-page', handler);
      });
    } catch (error) {
      return { success: false, error };
    }
  });

  ipcMain.handle('redirect-to-display', () => {
    return readSavedGames();
  });
});
