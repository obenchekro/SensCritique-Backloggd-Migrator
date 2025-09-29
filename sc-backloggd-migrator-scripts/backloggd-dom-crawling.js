const USERNAME_BACKLOGGD_DOM_CONTENT = async () => {
    const profileLink = document.querySelector('a[href^="/u/"]');
    if (profileLink) {
        const href = profileLink.getAttribute("href");
        const username = href.split("/u/")[1].replace("/", "");
        return username;
    }
}

const BACKLOGGD_WISHLIST_SCRIPT = () => {
    const gameIdEl = document.querySelector('#game-page-id');
    const gameId = gameIdEl?.getAttribute('game_id');
    if (!gameId) return console.warn('game_id not found');

    const wishlistButton = document.querySelector(`#wishlist-${gameId} > button[game_id="${gameId}"]`)
        || document.querySelector(`#wishlist-${gameId} button`)
        || Array.from(document.querySelectorAll('#buttons .wishlist-btn-container button'))[0];

    if (!wishlistButton) return console.warn('Wishlist button not found via #wishlist-{id}.');

    const wishlistEvent = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
    if (!wishlistButton.dispatchEvent(wishlistEvent)) wishlistButton.click();
};

const BACKLOGGD_AUTOMATION_RATING_SCRIPT = () => async (rating) => {
    const gameIdEl = document.querySelector('#game-page-id');
    const gameId = gameIdEl?.getAttribute('game_id');
    if (!gameId) console.warn("Cannot retrieve gameId of the current game page.");

    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
    const csrf = csrfMeta?.content;
    if (!csrf) console.warn("Cannot retrieve CSRF token to ensure the reliability of the request.")

    const response = await fetch(`/rate/${gameId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-CSRF-Token": csrf,
            "X-Requested-With": "XMLHttpRequest",
        },
        body: `rating=${rating}`
    });

    if (response.ok) {
        console.log(`Succesfully rated the game ${gameId} with the following rating: ${rating}`);
    } else {
        console.warn(`Request to the Backloggd server failed with the following status code: ${response.status}`);
    }
};

const BACKLOGGD_DOM_STATUS_CODE_404_SCRIPT = () => {
  try {
    if (/\b404\b/i.test(document.title)) return true;
    if (document.querySelector('.404-error')) return true;
    const metas = [
      ['meta[itemprop="name"]','content'],
      ['meta[property="og:title"]','content'],
      ['meta[name="twitter:title"]','content']
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