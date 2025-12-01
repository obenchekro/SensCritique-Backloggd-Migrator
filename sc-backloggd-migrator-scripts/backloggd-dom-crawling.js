const USERNAME_BACKLOGGD_DOM_CONTENT = async () => {
    const profileLink = document.querySelector('a[href^="/u/"]');
    if (profileLink) {
        const href = profileLink.getAttribute("href");
        const username = href.split("/u/")[1].replace("/", "");
        return username;
    }
}

const BACKLOGGD_WISHLIST_SCRIPT = () => {
    const gameIdEl = document.querySelector('[data-game-id]');
    const gameId = gameIdEl?.getAttribute('data-game-id');
    if (!gameId) return console.error('Cannot retrieve the game ID from the DOM.');

    const backlogButton =
        document.querySelector(`.backlog-btn-container[game_id="${gameId}"] button`) ||
        document.querySelector(`.backlog-btn-container button`) ||
        Array.from(document.querySelectorAll('.backlog-btn-container button'))[0];

    if (!backlogButton) return console.error('Backlog button not found.');

    const backlogEvent = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
    if (!backlogButton.dispatchEvent(backlogEvent)) backlogButton.click();
};


const BACKLOGGD_AUTOMATION_RATING_SCRIPT = () => async (rating) => {
    const gameIdEl = document.querySelector('[data-game-id]');
    const gameId = gameIdEl?.getAttribute('data-game-id');

    if (!gameId) console.error("Cannot retrieve the game ID from the DOM.");

    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    const csrf = csrfMeta?.content;
    if (!csrf) console.error("Cannot retrieve CSRF token.");

    try {
        const response = await fetch(`/rate/${gameId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "X-CSRF-Token": csrf,
                "X-Requested-With": "XMLHttpRequest",
            },
            body: `rating=${encodeURIComponent(rating)}`
        });

        if (response.ok) {
            console.log(`Successfully rated game ${gameId} with rating: ${rating}`);
        } else {
            console.error(`Request failed with status code: ${response.status}`);
        }
    } catch (err) {
        console.error("Error while sending the request:", err);
    }
};


const BACKLOGGD_DOM_STATUS_CODE_404_SCRIPT = () => {
    try {
        if (/\b404\b/i.test(document.title)) return true;
        if (document.querySelector('.404-error')) return true;
        const metas = [
            ['meta[itemprop="name"]', 'content'],
            ['meta[property="og:title"]', 'content'],
            ['meta[name="twitter:title"]', 'content']
        ];
        for (const [sel, attr] of metas) {
            const el = document.querySelector(sel);
            if (el && /404 Not Found/i.test(el.getAttribute(attr) || '')) return true;
        }
        return false;
    } catch { return false; }
};

module.exports = {
    USERNAME_BACKLOGGD_DOM_CONTENT,
    BACKLOGGD_AUTOMATION_RATING_SCRIPT,
    BACKLOGGD_WISHLIST_SCRIPT,
    BACKLOGGD_DOM_STATUS_CODE_404_SCRIPT
};