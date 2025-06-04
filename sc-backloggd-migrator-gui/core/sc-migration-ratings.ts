import { BrowserWindow, session } from 'electron';
import { extractUsernameFromDOM, pollUserMetadata } from './sc-user-metadata';
import { writeSavedGames } from '../../sc-backloggd-migrator-utils/filesystem';
import { delay } from '../../sc-backloggd-migrator-utils/delay';
import { BackloggdGames } from '../../sc-backloggd-migrator-schemas/backloggd-games.interface';
import { SensCritiqueClientStrategy } from '../../sc-backloggd-migrator-client/sc-client-strategy';
import { ISensCritiqueAuthStrategy } from '../../sc-backloggd-migrator-client/sc-client-strategy.interface';
import { SensCritiqueProduct, SensCritiqueScrappedProduct } from '../../sc-backloggd-migrator-schemas/sc-products.interface';
export async function runMigration(window: BrowserWindow): Promise<BackloggdGames[]> {
  try {
    const scClient: ISensCritiqueAuthStrategy = await SensCritiqueClientStrategy.build(window);
    await delay(3000);

    const username = await extractUsernameFromDOM(window);
    if (!username) throw new Error('Cannot retrieve SC username.');

    const products: (SensCritiqueScrappedProduct | SensCritiqueProduct)[] = await scClient.fetchUserRatings(username, window);
    const games: BackloggdGames[] = scClient.fetchUserGamesOnlyRated(products);
    writeSavedGames(games);
    return games;
  } catch (error) {
    console.error(`Migration failed. See the stacktrace here: ${error}`);
    return [];
  }
}