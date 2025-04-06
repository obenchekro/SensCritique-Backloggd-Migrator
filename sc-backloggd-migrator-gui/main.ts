import { app, BrowserWindow } from 'electron';
import { extractUsernameFromDOM, pollUserMetadata } from './user-metadata';
import { SensCritiqueClient } from '../sc-backloggd-migrator-client/senscritique-client'

let mainWindow: BrowserWindow;

app.whenReady().then(async () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
  });

  await mainWindow.loadURL("https://www.senscritique.com");

  mainWindow.webContents.once('did-finish-load', async () => {
    try {
      pollUserMetadata(mainWindow).then(async firebaseMetadata => {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const username = await extractUsernameFromDOM(mainWindow);
        const metadata = { ...firebaseMetadata, username };

        const client = await SensCritiqueClient.build(metadata);
        const profile = await client.getUserRatings(<string>metadata.username);
        console.log(JSON.stringify(profile, null, 2));
      });
    } catch (error) {
      console.error(error);
    }
  });
});

