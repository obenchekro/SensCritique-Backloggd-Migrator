import { BrowserWindow } from "electron";
import { slugify } from "../../sc-backloggd-migrator-utils/slug";
import { readSavedGames } from "../../sc-backloggd-migrator-utils/filesystem";
import { delay } from '../../sc-backloggd-migrator-utils/delay';
const { BACKLOGGD_AUTOMATION_SCRIPT, USERNAME_BACKLOGGD_DOM_CONTENT } = require('../../sc-backloggd-migrator-utils/dom');

export async function runBackloggdRatingAutomation(window: BrowserWindow): Promise<void> {
  try {
    const collectionGameRatings = readSavedGames();
    const username = await window.webContents.executeJavaScript(`
      (${USERNAME_BACKLOGGD_DOM_CONTENT.toString()})()
    `);

    for (const game of collectionGameRatings) {
      await delay(3000)

      const gameSlug = slugify(game.title);
      const gameUrl = `https://www.backloggd.com/games/${gameSlug}`;
      await window.loadURL(gameUrl);

      await window.webContents.executeJavaScript(`(${BACKLOGGD_AUTOMATION_SCRIPT.toString()})()(${game.rating})`)
        .catch(error => console.error(`Failed to rate: ${game.title}. See the stacktrace here: ${error}`));
    }

    const gameUrl = `https://backloggd.com/u/${username}/games/`;
    await window.loadURL(gameUrl);
  } catch (error) {
    console.error(`Rating automation failed. See the stacktrace here: ${error}`);
  }
}