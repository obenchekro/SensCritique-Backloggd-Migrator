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
      console.log("🔄 Chargement de la page de connexion Backloggd...");
      mainWindow.webContents.setMaxListeners(0); // éviter les warnings
  
      await mainWindow.loadURL('https://backloggd.com/users/sign_in');
    } catch (e) {
      console.error("❌ Erreur lors du chargement de la page :", e);
      return { success: false, error: 'Navigation échouée' };
    }
  
    return new Promise((resolve) => {
      const listener = async () => {
        try {
          const currentUrl = mainWindow.webContents.getURL();
          console.log("🌐 Nouvelle URL détectée :", currentUrl);
  
          if (!currentUrl.includes('/users/sign_in')) {
            console.log("✅ Connexion détectée. Lancement du script d'automatisation...");
            mainWindow.webContents.removeListener('did-navigate', listener);
  
            const result = await runBackloggdRatingAutomation(mainWindow);
            resolve(result);
          } else {
            console.log("🕓 Toujours sur la page de connexion...");
          }
        } catch (err) {
          console.error("⚠️ Erreur dans le listener :", err);
          mainWindow.webContents.removeListener('did-navigate', listener);
          resolve({ success: false, error: err });
        }
      };
  
      mainWindow.webContents.on('did-navigate', listener);
    });
  });  

  ipcMain.handle('redirect-to-display', () => {
    return readSavedGames();
  });
});
