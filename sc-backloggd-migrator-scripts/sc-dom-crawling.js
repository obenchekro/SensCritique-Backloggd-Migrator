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

const SENSCRITIQUE_BASE_AUTOMATION_SCRIPT = async () => {
    const results = [];

    const extractPageData = () => {
        const pageResults = [];
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
                pageResults.push({ title, rating, genre });
            }
        });
        return pageResults;
    };

    try {
        const paginationSpans = document.querySelectorAll('nav[aria-label="Navigation de la pagination"] span[data-testid^="click-"]');
        const pageNumbers = Array.from(paginationSpans).map(el => parseInt(el.textContent)).filter(n => !isNaN(n));
        const totalPages = Math.max(...pageNumbers, 1);

        for (let page = 1; page <= totalPages; page++) {
            if (page > 1) {
                await fetch(`/patchwork-chimera/collection?page=${page}`, { credentials: 'same-origin' })
                    .then(resp => resp.text())
                    .then(html => {
                        document.documentElement.innerHTML = html;
                    });
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            results.push(...extractPageData());
        }

        return results;
    } catch (e) {
        console.error('SCRAPING FAILED:', e);
        return [];
    }
};

const SENSCRITIQUE_FIREBASE_METADATA_TO_TRASH = async () => indexedDB.deleteDatabase("firebaseLocalStorageDb");

module.exports = {
    FIREBASE_METADATA_SECRETS_MAP,
    USERNAME_SENSCRITIQUE_DOM_CONTENT,
    SENSCRITIQUE_BASE_AUTOMATION_SCRIPT,
    SENSCRITIQUE_FIREBASE_METADATA_TO_TRASH
};