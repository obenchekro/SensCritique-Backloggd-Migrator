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

const EXTRACT_SC_PAGE_RATINGS = () => {
    const results = [];
    const gameCards = document.querySelectorAll('div[data-testid="poster"]');
    gameCards.forEach((card) => {
        const img = card.querySelector('img[data-testid="poster-img"]');

        const ratingEl = Array.from(card.parentElement?.querySelectorAll('div[data-testid="Rating"]') || [])
            .find(el => !el.classList.contains('globalRating'));

        const title = img?.alt?.trim() ?? '';
        const rating = ratingEl ? parseFloat(ratingEl.textContent || '') : null;

        const genreEl = card.parentElement?.parentElement?.parentElement?.querySelector('span[data-testid="creators-category"] span');
        const genre = genreEl?.textContent?.trim() ?? '';

        if (title && rating !== null && !isNaN(rating)) {
            results.push({ title, rating, genre });
        }
    });
    return results;
};

const EXTRACT_SC_WISHLIST = () => {
  const results = [];
  const items = document.querySelectorAll('[data-testid="product-list-item"]');

  items.forEach((item) => {
    const isWish =
      !!item.querySelector('svg[data-testid="icon-bookmark"]') ||
      !!item.querySelector('[data-testid="wish"]') ||
      !!item.querySelector('[data-action="WISH"]') ||
      !!item.querySelector('[aria-label*="Envie"], [title*="Envie"]');

    if (!isWish) return;

    const posterLink = item.querySelector('a[data-testid="poster"]');
    const img = posterLink?.querySelector('img[data-testid="poster-img"]');
    const title = img?.alt?.trim() || item.querySelector('[data-testid="product-title"]')?.textContent?.trim() || '';

    const ratingEl = item.querySelector('[data-testid="Rating"]:not(.globalRating)');
    const rating = ratingEl ? parseFloat((ratingEl.textContent || '').replace(',', '.')) : null;

    const genreEl = item.querySelector('span[data-testid="creators-category"] span');
    const genre = genreEl?.textContent?.trim() ?? '';

    if (title) results.push({ title, rating, genre });
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
    EXTRACT_SC_PAGE_RATINGS,
    EXTRACT_SC_WISHLIST,
    DETECT_SC_TOTAL_PAGES,
    SENSCRITIQUE_FIREBASE_METADATA_TO_TRASH
};