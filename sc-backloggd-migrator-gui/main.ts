import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { runMigration } from './core/sc-migration-ratings';
import { readSavedGames } from '../sc-backloggd-migrator-utils/filesystem';
import { runBackloggdRatingAutomation } from './core/backloggd-import-ratings';

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

  ipcMain.handle('start-migration', async () => {
    await mainWindow.loadURL('https://www.senscritique.com');
    mainWindow.webContents.once('did-finish-load', async () => {
      const games = await runMigration(mainWindow);
      if (games.length > 0) {
        await mainWindow.loadFile(path.resolve(__dirname, 'vues/real-time-data/real-time-data.html'));
      }
    });
  });

  ipcMain.handle('run-backloggd-rating', async () => {
    try {
      mainWindow.webContents.setMaxListeners(0);
      await mainWindow.loadURL('https://backloggd.com/users/sign_in');
    } catch (error) {
      return { success: false, error };
    }

    return new Promise((resolve) => {
      const listener = async () => {
        try {
          const currentUrl = mainWindow.webContents.getURL();

          if (!currentUrl.includes('/users/sign_in')) {
            mainWindow.webContents.removeListener('did-navigate', listener);
            const ratingAutomation = await runBackloggdRatingAutomation(mainWindow);
            resolve(ratingAutomation);
          }
        } catch (error) {
          mainWindow.webContents.removeListener('did-navigate', listener);
          resolve({ success: false, error });
        }
      };

      mainWindow.webContents.on('did-navigate', listener);
    });
  });

  ipcMain.handle('redirect-to-display', () => {
    return readSavedGames();
  });
});
