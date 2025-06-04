import { BrowserWindow } from "electron";
import { BackloggdGames } from "../sc-backloggd-migrator-schemas/backloggd-games.interface";
import { SensCritiqueProduct, SensCritiqueScrappedProduct } from "../sc-backloggd-migrator-schemas/sc-products.interface";

export interface ISensCritiqueAuthStrategy {
    fetchUserRatings(username: string, window?: BrowserWindow): Promise<(SensCritiqueProduct | SensCritiqueScrappedProduct)[]>;
    fetchUserGamesOnlyRated(products: (SensCritiqueProduct | SensCritiqueScrappedProduct)[]): BackloggdGames[];
}