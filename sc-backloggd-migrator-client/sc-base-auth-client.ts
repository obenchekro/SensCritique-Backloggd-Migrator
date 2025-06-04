import { ISensCritiqueAuthStrategy } from './sc-client-strategy.interface';
import { SensCritiqueScrappedProduct } from '../sc-backloggd-migrator-schemas/sc-products.interface';
import { BackloggdGames } from '../sc-backloggd-migrator-schemas/backloggd-games.interface';
import { BrowserWindow } from 'electron';
import { delay } from '../sc-backloggd-migrator-utils/delay';
const { SENSCRITIQUE_BASE_AUTOMATION_SCRIPT } = require('../sc-backloggd-migrator-scripts/sc-dom-crawling');

export class SensCritiqueBaseAuthStrategy implements ISensCritiqueAuthStrategy {
    private cookie: string;

    constructor(cookie: string) {
        this.cookie = cookie;
    }

    static async build(cookie: string): Promise<SensCritiqueBaseAuthStrategy> {
        return new SensCritiqueBaseAuthStrategy(cookie);
    }

    async fetchUserRatings(username: string, window: BrowserWindow): Promise<SensCritiqueScrappedProduct[]> {
        const url = `https://www.senscritique.com/${username}/collection`;
        await window.loadURL(url);

        await delay(300);
        const products: SensCritiqueScrappedProduct[] = await window.webContents.executeJavaScript(
            `(${SENSCRITIQUE_BASE_AUTOMATION_SCRIPT.toString()})()`
        );
        return products;
    }

    fetchUserGamesOnlyRated(products: SensCritiqueScrappedProduct[]): BackloggdGames[] {
        return products
            .filter(p => p.genre === 'Jeu')
            .map(p => ({ title: p.title, rating: p.rating }));
    }
}
