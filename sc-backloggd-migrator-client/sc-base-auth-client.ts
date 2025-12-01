import { ISensCritiqueAuthStrategy } from './sc-client-strategy.interface';
import { SensCritiqueScrappedProduct } from '../sc-backloggd-migrator-schemas/sc-products.interface';
import { BackloggdGames } from '../sc-backloggd-migrator-schemas/backloggd-games.interface';
import { BrowserWindow } from 'electron';
import { delay } from '../sc-backloggd-migrator-utils/delay';
const { DETECT_SC_TOTAL_PAGES, EXTRACT_SC_PAGE_DATA } = require('../sc-backloggd-migrator-scripts/sc-dom-crawling');

export class SensCritiqueBaseAuthStrategy implements ISensCritiqueAuthStrategy {
    private cookie: string;

    constructor(cookie: string) {
        this.cookie = cookie;
    }

    static async build(cookie: string): Promise<SensCritiqueBaseAuthStrategy> {
        return new SensCritiqueBaseAuthStrategy(cookie);
    }

    async fetchUserRatings(username: string, window: BrowserWindow): Promise<SensCritiqueScrappedProduct[]> {
        const allData = [];

        const baseUrl = `https://www.senscritique.com/${username}/collection`;
        await window.loadURL(baseUrl);
        await delay(800);

        const totalPages: number = await window.webContents.executeJavaScript(`(${DETECT_SC_TOTAL_PAGES.toString()})()`);

        for (let page = 1; page <= totalPages; page++) {
            const url = `${baseUrl}?page=${page}`;
            await window.loadURL(url);
            await delay(800);

            const pageData = await window.webContents.executeJavaScript(`(${EXTRACT_SC_PAGE_DATA.toString()})()`);
            allData.push(...pageData);
        }
        return allData;
    }

    fetchUserGamesOnlyRated(products: SensCritiqueScrappedProduct[]): BackloggdGames[] {
        return products
            .filter(p => p.genre === 'Jeu' && p.rating)
            .map(p => ({ title: p.title, rating: p.rating, wishlist: p.wishlist, migrated: false }));
    }

    fetchUserGamesOnWishlist(products: SensCritiqueScrappedProduct[]): BackloggdGames[] {
        return products
            .filter(p => p.genre === 'Jeu' && !p.rating)
            .map(p => ({ title: p.title, rating: p.rating, wishlist: p.wishlist, migrated: false }));
    }
}
