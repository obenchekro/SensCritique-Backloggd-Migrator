import path from 'path';
import { BrowserWindow } from 'electron';
import { runMigration } from '../core/sc-migration-ratings';
import { runBackloggdRatingAutomation } from '../core/backloggd-import-ratings';
import { readSavedGames } from '../../sc-backloggd-migrator-utils/filesystem';
import { BackloggdGames } from '../../sc-backloggd-migrator-schemas/backloggd-games.interface';

export async function startMigrationHandler(mainWindow: BrowserWindow): Promise<void> {
    await mainWindow.loadURL('https://www.senscritique.com');
    mainWindow.webContents.once('did-finish-load', async () => {
        const games = await runMigration(mainWindow);
        if (games) {
            await mainWindow.loadFile(path.resolve(__dirname, '../views/real-time-data/real-time-data.html'));
        }
    });
}

export async function runBackloggdRatingHandler(mainWindow: BrowserWindow): Promise<boolean> {
    try {
        await mainWindow.loadURL('https://backloggd.com/users/sign_in');

        return new Promise((resolve, reject) => {
            const handler = async () => {
                const url = mainWindow.webContents.getURL();

                if (!url.includes('/users/sign_in')) {
                    mainWindow.webContents.removeListener('did-navigate', handler);
                    mainWindow.webContents.removeListener('did-navigate-in-page', handler);

                    try {
                        await runBackloggdRatingAutomation(mainWindow);
                        resolve(true);
                    } catch (err) {
                        reject(false);
                    }
                }
            };

            mainWindow.webContents.on('did-navigate', handler);
            mainWindow.webContents.on('did-navigate-in-page', handler);
        });
    } catch (error) {
        return false;
    }
}

export function redirectToDisplayHandler(): BackloggdGames[] { 
    return readSavedGames(); 
}


