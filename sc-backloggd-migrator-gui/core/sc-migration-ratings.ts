import { BrowserWindow } from 'electron';
import { pollUserMetadata, extractUsernameFromDOM } from './sc-user-metadata';
import { SensCritiqueClient } from '../../sc-backloggd-migrator-client/sc-client';
import { writeSavedGames } from '../../sc-backloggd-migrator-utils/filesystem';
import { delay } from '../../sc-backloggd-migrator-utils/delay';
import { SensCritiqueGraphQLService } from '../../sc-backloggd-migrator-client/sc-query';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { GetRatingsResponse, SensCritiqueProduct } from '../../sc-backloggd-migrator-schemas/sc-products.interface';
import { BackloggdGames } from '../../sc-backloggd-migrator-schemas/backloggd-games.interface';

export async function runMigration(window: BrowserWindow): Promise<BackloggdGames[]> {
  try {
    const firebaseMetaData = await pollUserMetadata(window);
    await delay(3000);

    const username = await extractUsernameFromDOM(window);
    const metadata = { ...firebaseMetaData, username };
    const scClient = await SensCritiqueClient.build({ ...metadata, username });

    const products = await fetchUserRatings(<string>metadata.username, scClient.apolloClient);
    const games = fetchUserGamesOnlyRated(products);
    writeSavedGames(games);
    return games;
  } catch (error) {
    console.error(`Migration failed. See the stacktrace here: ${error}`);
    return [];
  }
}

export async function fetchUserRatings(username: string, client: ApolloClient<NormalizedCacheObject>): Promise<SensCritiqueProduct[]> {
  const scQueryService = new SensCritiqueGraphQLService(client);
  const query = scQueryService.getUserRatingsQuery();
  const result = await scQueryService.executeQuery<GetRatingsResponse, { username: string }>(query, { username });

  return result.user?.collection?.products ?? [];
};

export function fetchUserGamesOnlyRated(products: SensCritiqueProduct[]) {
  return products
      .filter(p => p.url?.split('/')?.[1] === 'jeuvideo' && p.otherUserInfos.rating)
      .map(game => ({ title: game.title, rating: game.otherUserInfos.rating }));
};
