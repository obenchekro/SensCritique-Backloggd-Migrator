import { BrowserWindow } from "electron";
import { slugify } from "../../sc-backloggd-migrator-utils/slug";
import { readSavedGames, updateMigrationStatus } from "../../sc-backloggd-migrator-utils/filesystem";
import { delay } from '../../sc-backloggd-migrator-utils/delay';
const { BACKLOGGD_AUTOMATION_RATING_SCRIPT, BACKLOGGD_WISHLIST_SCRIPT, USERNAME_BACKLOGGD_DOM_CONTENT } = require('../../sc-backloggd-migrator-scripts/backloggd-dom-crawling');

export async function runBackloggdRatingAutomation(window: BrowserWindow): Promise<void> {
  try {
    const collectionGameRatings = readSavedGames().filter(game => game.migrated === false);
    const username = await window.webContents.executeJavaScript(`(${USERNAME_BACKLOGGD_DOM_CONTENT.toString()})()`);

    for (const game of collectionGameRatings) {
      await delay(3000)

      const gameSlug = slugify(game.title);
      const gameUrl = `https://www.backloggd.com/games/${gameSlug}`;
      await window.loadURL(gameUrl);
      
      if (game.rating) {
        await window.webContents.executeJavaScript(`(${BACKLOGGD_AUTOMATION_RATING_SCRIPT.toString()})()(${game.rating})`)
          .then(() => updateMigrationStatus(game.title))
          .catch(error => console.error(`Failed to rate: ${game.title}. See the stacktrace here: ${error}`));
      } else {
        await window.webContents.executeJavaScript(`(${BACKLOGGD_WISHLIST_SCRIPT.toString()})()`)
          .then(() => updateMigrationStatus(game.title))
          .catch(error => console.error(`Failed to rate: ${game.title}. See the stacktrace here: ${error}`));
      }
    }

    const gameUrl = `https://backloggd.com/u/${username}/games/`;
    await window.loadURL(gameUrl);
  } catch (error) {
    console.error(`Rating automation failed. See the stacktrace here: ${error}`);
  }
}