import { BrowserWindow } from 'electron';
import { SensCritiqueAuthOptions } from '../../sc-backloggd-migrator-schemas/sc-auth-options.interface';
import { retry } from '../../sc-backloggd-migrator-utils/retry';
const { FIREBASE_METADATA_SECRETS_MAP, USERNAME_SENSCRITIQUE_DOM_CONTENT } = require('../../sc-backloggd-migrator-scripts/sc-dom-crawling');

export async function pollUserMetadata(window: BrowserWindow): Promise<SensCritiqueAuthOptions> {
  return retry(
    async () => {
      return await window.webContents.executeJavaScript(`(${FIREBASE_METADATA_SECRETS_MAP.toString()})()`);
    },
    'Failed to retrieve Firebase metadata after multiple retries.'
  );
}

export async function pollUserCookie(window: BrowserWindow): Promise<string | undefined> {
  return retry(
    async () => {
      const cookies = await window.webContents.session.cookies.get({ url: 'https://www.senscritique.com' });
      return cookies.find(c => c.name === 'SC_AUTH')?.value;
    },
    'Failed to extract the session cookie after multiple retries.'
  );
}

export async function extractUsernameFromDOM(window: BrowserWindow): Promise<string | undefined> {
  return retry(
    async () => {
      return await window.webContents.executeJavaScript(`(${USERNAME_SENSCRITIQUE_DOM_CONTENT.toString()})()`);
    },
    'Failed to extract username from the DOM.',
    10,
    500,
  );
}