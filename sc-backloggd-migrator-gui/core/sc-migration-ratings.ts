import { BrowserWindow } from 'electron';
import { pollUserMetadata, extractUsernameFromDOM } from '../../sc-backloggd-migrator-libs/sc-user-metadata';
import { SensCritiqueClient } from '../../sc-backloggd-migrator-client/sc-client';
import { fetchUserRatings, fetchUserGamesOnlyRated } from '../../sc-backloggd-migrator-libs/sc-data-ratings-processor';
import { writeSavedGames } from '../../sc-backloggd-migrator-utils/filesystem';
import { delay } from '../../sc-backloggd-migrator-utils/delay';

export async function runMigration(window: BrowserWindow) {
  try {
    const firebaseMetaData = await pollUserMetadata(window);
    await delay(3000);

    const username = await extractUsernameFromDOM(window);
    const metadata = { ...firebaseMetaData, username };
    const scClient = await SensCritiqueClient.build({ ...metadata, username });

    const products = await fetchUserRatings(<string>metadata.username, scClient.apolloClient);
    const games = fetchUserGamesOnlyRated(products);
    writeSavedGames(games);
    return games;
  } catch (error) {
    console.error(`Migration failed. See the stacktrace here: ${error}`);
    return [];
  }
}
