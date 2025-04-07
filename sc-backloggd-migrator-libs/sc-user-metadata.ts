import { BrowserWindow } from 'electron';
import { SensCritiqueAuthOptions } from '../sc-backloggd-migrator-schemas/sc-auth-options.interface';
import { delay } from '../sc-backloggd-migrator-utils/delay';
const { FIREBASE_METADATA_SECRETS_MAP } = require('../sc-backloggd-migrator-utils/indexedDB');
const { USERNAME_SENSCRITIQUE_DOM_CONTENT } = require('../sc-backloggd-migrator-utils/dom');

export async function pollUserMetadata(window: BrowserWindow, maxRetries = Number.MAX_SAFE_INTEGER, delayInMs = 1000): Promise<SensCritiqueAuthOptions> {
  let attempt: number = 0;

  while (attempt < maxRetries) {
    try {
      const firebaseAuthUser: SensCritiqueAuthOptions | null = await window.webContents.executeJavaScript(`
        (${FIREBASE_METADATA_SECRETS_MAP.toString()})()
      `);
      if (firebaseAuthUser) return firebaseAuthUser;
    } catch (error) {
      console.error(`Cannot evaluate js code injected inside the browser. See the error here: ${error}`);
    }
    console.log(`Retry for fetching firebase metadata: ${attempt + 1}/${maxRetries}...`);
    await delay(delayInMs);
    attempt++;
  }

  throw new Error("Failed to retrieve firebase metadata after many retries");
}

export async function extractUsernameFromDOM(window: BrowserWindow): Promise<string | undefined> {
  try {
    const username = await window.webContents.executeJavaScript(`
      (${USERNAME_SENSCRITIQUE_DOM_CONTENT.toString()})()
    `);
    return username;
  } catch (error) {
    console.error(`Cannot scrap the username from the DOM elements: ${error}`);
  }
}
