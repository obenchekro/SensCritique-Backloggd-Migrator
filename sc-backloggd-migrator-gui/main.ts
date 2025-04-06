import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { pollUserMetadata, extractUsernameFromDOM } from './user-metadata';
import { SensCritiqueClient } from '../sc-backloggd-migrator-client/senscritique-client';
import { SensCritiqueGraphQLService } from '../sc-backloggd-migrator-client/senscritique-query';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { GetRatingsResponse, SensCritiqueProduct } from '../sc-backloggd-migrator-schemas/sc-products.interface';

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
    },
  });

  await mainWindow.loadFile(path.resolve(__dirname, 'vues/migrator-page.html'));
  async function fetchUserRatings(username: string, client: ApolloClient<NormalizedCacheObject>): Promise<SensCritiqueProduct[]> {
    const scQueryService = new SensCritiqueGraphQLService(client);
    const query = scQueryService.getUserRatingsQuery();
    const result = await scQueryService.executeQuery<GetRatingsResponse, { username: string }>(query, { username });

    return result.user?.collection?.products ?? [];
  }
  ipcMain.handle('start-migration', async () => {
    await mainWindow.loadURL('https://www.senscritique.com');

    mainWindow.webContents.once('did-finish-load', async () => {
      try {
        const firebaseMetadata = await pollUserMetadata(mainWindow);
        console.log(firebaseMetadata)
        await new Promise(resolve => setTimeout(resolve, 3000));
        const username = await extractUsernameFromDOM(mainWindow);
        const metadata = { ...firebaseMetadata, username };

        const scClient = await SensCritiqueClient.build(metadata);
        const products = await fetchUserRatings(<string>metadata.username, scClient.apolloClient);
        console.log(`✅ Query fully executed: ${JSON.stringify(products, null, 2)}`);
      } catch (error) {
        console.error(`Error while fetching data from firebase: ${error}`);
      }
    });
  });
});