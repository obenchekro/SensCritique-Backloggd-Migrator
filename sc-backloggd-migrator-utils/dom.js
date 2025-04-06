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
}

module.exports = {
    USERNAME_SENSCRITIQUE_DOM_CONTENT,
};