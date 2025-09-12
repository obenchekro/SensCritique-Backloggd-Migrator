import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { ApolloClient, InMemoryCache, HttpLink, gql, NormalizedCache, NormalizedCacheObject, DocumentNode } from '@apollo/client/core';
import fetch from 'cross-fetch';
import { SensCritiqueAuthOptions } from '../sc-backloggd-migrator-schemas/sc-auth-options.interface';
import { ISensCritiqueAuthStrategy } from './sc-client-strategy.interface';
import { GetRatingsResponse, SensCritiqueProduct } from '../sc-backloggd-migrator-schemas/sc-products.interface';
import { BackloggdGames } from '../sc-backloggd-migrator-schemas/backloggd-games.interface';

export class SensCritiqueSSOAuthStrategy implements ISensCritiqueAuthStrategy {
  firebaseApp: FirebaseApp;
  auth: Auth;
  client: ApolloClient<NormalizedCacheObject>;

  constructor(firebaseApp: FirebaseApp, auth: Auth, client: ApolloClient<NormalizedCacheObject>) {
    this.firebaseApp = firebaseApp;
    this.auth = auth;
    this.client = client;
  }

  static async build(scAuthOptions: SensCritiqueAuthOptions): Promise<SensCritiqueSSOAuthStrategy> {
    const firebaseConfig: Omit<SensCritiqueAuthOptions, "accessToken" | "email" | "uid" | "username"> = {
      apiKey: scAuthOptions.apiKey,
      authDomain: scAuthOptions.authDomain
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const apolloClient = new ApolloClient({
      link: new HttpLink({
        uri: 'https://apollo.senscritique.com/',
        headers: {
          Authorization: `Bearer ${scAuthOptions.accessToken}`,
        },
        fetch,
      }),
      cache: new InMemoryCache(),
    });

    return new SensCritiqueSSOAuthStrategy(app, auth, apolloClient);
  }

  async executeQuery<TData, TVariables extends Record<string, unknown> = Record<string, never>>(query: DocumentNode, variables?: TVariables): Promise<TData> {
    try {
      const result = await this.client.query<TData, TVariables>({
        query,
        variables,
        fetchPolicy: 'no-cache',
      });

      return result.data;
    } catch (err) {
      console.error(`GraphQL query failed: ${err}`);
      throw err;
    }
  }

  getUserRatingsQuery(): DocumentNode {
    return gql`
        query GetRatings($username: String!) {
            user(username: $username) {
                collection(limit: 999999) {
                    products {
                        id
                        title
                        url
                        rating
                        yearOfProduction
                        dateRelease
                        synopsis
                        medias {
                            picture
                            backdrop
                        }
                        genresInfos {
                            label
                        }
                        otherUserInfos(username: $username) {
                            rating
                        }
                    }
                }
            }
        }
    `;
  }

  async fetchUserRatings(username: string): Promise<SensCritiqueProduct[]> {
    const query = this.getUserRatingsQuery();
    const result = await this.executeQuery<GetRatingsResponse, { username: string }>(query, { username });
    return result.user?.collection?.products ?? [];
  };

  fetchUserGamesOnlyRated(products: SensCritiqueProduct[]): BackloggdGames[] {
    return products
      .filter(p => p.url?.split('/')?.[1] === 'jeuvideo' && p.otherUserInfos.rating)
      .map(p => ({ title: p.title, rating: p.otherUserInfos.rating, wishlist: false, migrated: false }));
  };

  fetchUserGamesOnWishlist(products: SensCritiqueProduct[]): BackloggdGames[] {
    return products
      .filter(p => p.url?.split('/')?.[1] === 'jeuvideo' && !p.otherUserInfos.rating)
      .map(p => ({ title: p.title, rating: p.otherUserInfos.rating, wishlist: true, migrated: false }));
  };
}
