import fetch from 'cross-fetch';
import { ISensCritiqueAuthStrategy } from './sc-client-strategy.interface';
import { SensCritiqueProduct } from '../sc-backloggd-migrator-schemas/sc-products.interface';
import { BackloggdGames } from '../sc-backloggd-migrator-schemas/backloggd-games.interface';

export class SensCritiqueBaseAuthStrategy implements ISensCritiqueAuthStrategy {
    private cookie: string;

    constructor(cookie: string) {
        this.cookie = cookie;
    }

    static async build(cookie: string): Promise<SensCritiqueBaseAuthStrategy> {
        return new SensCritiqueBaseAuthStrategy(cookie);
    }

    async fetchUserRatings(username: string): Promise<SensCritiqueProduct[]> {
        const url = `https://www.senscritique.com/${username}/collection`;

        const response = await fetch(url, {
            headers: {
                'Cookie': this.cookie,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
            }
        });

        const products: SensCritiqueProduct[] = [];
        // TODO
        return products;
    }

    fetchUserGamesOnlyRated(products: SensCritiqueProduct[]): BackloggdGames[] {
        throw new Error('Method not implemented.');
    }
}
