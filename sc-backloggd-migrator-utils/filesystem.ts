import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { BackloggdGames } from '../sc-backloggd-migrator-schemas/backloggd-games.interface';

const filePath = path.resolve(__dirname, '../sc-backloggd-migrator-gui/assets/senscritique_game_ratings.json');

export function writeSavedGames(games: BackloggdGames[]) {
  const dir = path.dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, JSON.stringify(games, null, 2));
}

export function readSavedGames(): BackloggdGames[] {
  const rawGames = readFileSync(filePath, 'utf-8');
  return JSON.parse(rawGames);
}