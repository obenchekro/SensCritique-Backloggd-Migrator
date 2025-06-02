import { BackloggdGames } from "../sc-backloggd-migrator-schemas/backloggd-games.interface";
import { SensCritiqueProduct } from "../sc-backloggd-migrator-schemas/sc-products.interface";

export interface ISensCritiqueAuthStrategy {
    fetchUserRatings(username: string): Promise<SensCritiqueProduct[]>;
    fetchUserGamesOnlyRated(products: SensCritiqueProduct[]): BackloggdGames[];
}