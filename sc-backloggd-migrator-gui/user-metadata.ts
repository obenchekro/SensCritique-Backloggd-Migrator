import { BrowserWindow } from 'electron';
import { SensCritiqueAuthOptions } from '../models/sc-auth-options-interface';

export async function pollUserMetadata(
  window: BrowserWindow,
  maxRetries = Number.MAX_SAFE_INTEGER,
  delay = 1000
): Promise<SensCritiqueAuthOptions> {
  let attempt: number = 0;

  while (attempt < maxRetries) {
    try {
      const firebaseAuthUser: SensCritiqueAuthOptions | null = await window.webContents.executeJavaScript(`
        (() => {
          return new Promise((resolve) => {
            const request = indexedDB.open("firebaseLocalStorageDb");
            request.onerror = () => resolve(null);
            request.onsuccess = () => {
              try {
                const db = request.result;
                const tx = db.transaction("firebaseLocalStorage", "readonly");
                const store = tx.objectStore("firebaseLocalStorage");
                const getAll = store.getAll();

                getAll.onsuccess = () => {
                  const result = getAll.result;

                  for (const item of result) {
                    if (item.value) {
                      const metadata = {
                        apiKey: item.value.apiKey || item.value?.stsTokenManager?.apiKey || null,
                        authDomain: item.value.authDomain || null,
                        accessToken: item.value?.stsTokenManager?.accessToken || null,
                        email: item.value?.email || null,
                        uid: item.value?.uid || null
                      };
                      resolve(metadata);
                      return;
                    }
                  }
                  resolve(null);
                };
                getAll.onerror = () => resolve(null);
              } catch {
                resolve(null);
              }
            };
          });
        })()
      `);
      if (firebaseAuthUser) return firebaseAuthUser;
    } catch (error) {
      console.error(`Cannot evaluate js code injected inside the browser. See the error here: ${error}`);
    }
    console.log(`Retry for fetching firebase metadata: ${attempt + 1}/${maxRetries}...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    attempt++;
  }

  throw new Error("Failed to retrieve firebase metadata after many retries");
}

export async function extractUsernameFromDOM(window: BrowserWindow): Promise<string | undefined> {
  try {
    const username = await window.webContents.executeJavaScript(`
      new Promise((resolve) => {
        const simulateClick = (element) => {
          if (!element) return;
          const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          });
          element.dispatchEvent(event);
        };

        const avatarImg = document.querySelector('img[alt][src*="avatar.jpg"]');
        const clickable = avatarImg?.closest('[data-testid="avatar"]') || avatarImg?.parentElement;
        simulateClick(clickable);

        const profileLink = document.querySelector('a[href^="/profil/"]');
        const username = profileLink?.getAttribute('href')?.split('/')[2] ?? avatarImg?.getAttribute('alt') ?? null;
        resolve(username);
      });
    `);
    return username;
  } catch (error) {
    console.error('❌ Échec lors de l\'extraction du username depuis le DOM :', error);
  }
}
