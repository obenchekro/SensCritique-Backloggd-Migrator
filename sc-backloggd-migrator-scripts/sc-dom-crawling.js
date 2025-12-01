const FIREBASE_METADATA_SECRETS_MAP = async () => {
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
}

const USERNAME_SENSCRITIQUE_DOM_CONTENT = async () => {
    return new Promise((resolve) => {
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
};

const EXTRACT_SC_PAGE_DATA = () => {
  const results = [];
  const items = document.querySelectorAll('[data-testid="product-list-item"]');

  items.forEach(item => {
    const img = item.querySelector('img[data-testid="poster-img"]');
    const title = img?.alt?.trim() || item.querySelector('[data-testid="product-title"]')?.textContent?.trim() || '';

    const userRatingEl = item.querySelector('[data-testid="actions-info"] [data-testid="Rating"]');
    const rating = userRatingEl ? parseFloat((userRatingEl.textContent || '').replace(',', '.')) : null;

    const genreEl = item.querySelector('span[data-testid="creators-category"] span');
    const genre = genreEl?.textContent?.trim() ?? '';

    const isWished = !!item.querySelector('[data-testid="actions-info"] [data-testid="icon-bookmark"]');

    if (title) {
      results.push({ title, rating, genre, wishlist: isWished });
    }
  });

  return results;
};

const DETECT_SC_TOTAL_PAGES = () => {
    const spans = document.querySelectorAll('nav[aria-label="Navigation de la pagination"] span[data-testid^="click-"]');
    const nums = Array.from(spans).map(s => parseInt(s.textContent || '')).filter(n => !isNaN(n));
    return Math.max(...nums, 1);
};

const SENSCRITIQUE_FIREBASE_METADATA_TO_TRASH = async () => indexedDB.deleteDatabase("firebaseLocalStorageDb");

module.exports = {
    FIREBASE_METADATA_SECRETS_MAP,
    USERNAME_SENSCRITIQUE_DOM_CONTENT,
    EXTRACT_SC_PAGE_DATA,
    DETECT_SC_TOTAL_PAGES,
    SENSCRITIQUE_FIREBASE_METADATA_TO_TRASH
};