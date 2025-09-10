import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { BackloggdGames } from '../sc-backloggd-migrator-schemas/backloggd-games.interface';

const filePath = path.resolve(__dirname, '../sc-backloggd-migrator-gui/assets/senscritique_game_ratings.json');

export function writeSavedGames(games: BackloggdGames[]): void {
  const dir = path.dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  if (existsSync(filePath)) {
      const existingJson = readFileSync(filePath, 'utf-8');
      const existingGames: BackloggdGames[] = JSON.parse(existingJson);

      const mapTitlesToRatings = (collectionGameRatings: BackloggdGames[]) => {
        const titleToRating = new Map<string, number>();
        collectionGameRatings.forEach(game => titleToRating.set(game.title, game.rating));
        return titleToRating;
      };

      const existingTitleToRating = mapTitlesToRatings(existingGames);
      const incomingTitleToRating = mapTitlesToRatings(games);

      const isSameIgnoringMigrated =
        existingTitleToRating.size === incomingTitleToRating.size &&
        [...existingTitleToRating.entries()].every(
          ([title, rating]) => incomingTitleToRating.get(title) === rating
        );

      if (isSameIgnoringMigrated) return;
    }
  writeFileSync(filePath, JSON.stringify(games, null, 2));
}

export function readSavedGames(): BackloggdGames[] {
  const rawGames = readFileSync(filePath, 'utf-8');
  return JSON.parse(rawGames);
}

export function updateMigrationStatus(title: string): void {
  const games = readSavedGames();
  const updatedGames = games.map(game => game.title === title ? { ...game, migrated: true } : game);
  writeFileSync(filePath, JSON.stringify(updatedGames, null, 2));
}