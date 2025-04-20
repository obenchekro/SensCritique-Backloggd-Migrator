import { BrowserWindow } from "electron";
import { slugify } from "../../sc-backloggd-migrator-utils/slug";
import { readSavedGames } from "../../sc-backloggd-migrator-utils/filesystem";
const { BACKLOGGD_AUTOMATION_SCRIPT } = require('../../sc-backloggd-migrator-utils/dom');

export async function runBackloggdRatingAutomation(window: BrowserWindow): Promise<void> {
  try {
    const collectionGameRatings = readSavedGames();

    for (const game of collectionGameRatings) {
      const gameSlug = slugify(game.title);
      const gameUrl = `https://www.backloggd.com/games/${gameSlug}`;
      await window.loadURL(gameUrl);

      await window.webContents.executeJavaScript(`(${BACKLOGGD_AUTOMATION_SCRIPT.toString()})()(${game.rating})`)
        .catch(err => console.error(`Failed to rate: ${game.title}`));
    }
  } catch (error) {
    console.error(`Rating automation failed. See the stacktrace here: ${error}`);
  }
}
