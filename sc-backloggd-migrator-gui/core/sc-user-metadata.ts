import { BrowserWindow, session } from 'electron';
import { SensCritiqueAuthOptions } from '../../sc-backloggd-migrator-schemas/sc-auth-options.interface';
import { retry } from '../../sc-backloggd-migrator-utils/retry';
const { FIREBASE_METADATA_SECRETS_MAP, USERNAME_SENSCRITIQUE_DOM_CONTENT, SENSCRITIQUE_FIREBASE_METADATA_TO_TRASH } = require('../../sc-backloggd-migrator-scripts/sc-dom-crawling');

export async function pollUserMetadata(window: BrowserWindow): Promise<SensCritiqueAuthOptions> {
  return retry(
    async () => {
      return window.webContents.executeJavaScript(`(${FIREBASE_METADATA_SECRETS_MAP.toString()})()`);
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
      return window.webContents.executeJavaScript(`(${USERNAME_SENSCRITIQUE_DOM_CONTENT.toString()})()`);
    },
    'Failed to extract username from the DOM.',
    10,
    500,
  );
}

export async function flushMetadata(window: BrowserWindow): Promise<void> {
  await window.webContents.executeJavaScript(`(${SENSCRITIQUE_FIREBASE_METADATA_TO_TRASH.toString()})()`);
}