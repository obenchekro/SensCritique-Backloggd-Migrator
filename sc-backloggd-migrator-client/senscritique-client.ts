import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { ApolloClient, InMemoryCache, HttpLink, gql } from '@apollo/client/core';
import fetch from 'cross-fetch';
import { SensCritiqueAuthOptions } from '../models/sc-auth-options-interface';

export class SensCritiqueClient {
  firebaseApp: FirebaseApp;
  auth: Auth;
  apolloClient: ApolloClient<unknown>;

  private constructor(firebaseApp: FirebaseApp, auth: Auth, apolloClient: ApolloClient<unknown>) {
    this.firebaseApp = firebaseApp;
    this.auth = auth;
    this.apolloClient = apolloClient;
  }

  static async build(scAuthConfig: SensCritiqueAuthOptions): Promise<SensCritiqueClient> {
    const firebaseConfig: Omit<SensCritiqueAuthOptions, "accessToken" | "email" | "uid" | "username"> = {
      apiKey: scAuthConfig.apiKey,
      authDomain: scAuthConfig.authDomain
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const apolloClient = new ApolloClient({
      link: new HttpLink({
        uri: 'https://apollo.senscritique.com/',
        headers: {
          Authorization: `Bearer ${scAuthConfig.accessToken}`,
        },
        fetch,
      }),
      cache: new InMemoryCache(),
    });

    return new SensCritiqueClient(app, auth, apolloClient);
  }

  async isAuthenticated(): Promise<boolean> {
    const query = gql`
      query {
        me {
          id
        }
      }
    `;

    try {
      const result = await this.apolloClient.query({ query });
      return !!result?.data?.me?.id;
    } catch (err) {
      console.error("❌ Auth Apollo échouée :", err);
      return false;
    }
  }

  async resolveUsernameByUid(uid: number): Promise<string | null> {
    const query = gql`
      query ResolveUsername($uid: ID!) {
        user(id: $uid) {
          name
        }
      }
    `;
  
    try {
      const result = await this.apolloClient.query({
        query,
        variables: { uid }
      });
  
      return result?.data?.user?.name ?? null;
    } catch (err) {
      console.error("❌ Erreur lors de la résolution du username :", err);
      return null;
    }
  }  

  async getUserRatings(username: string): Promise<any[]> {
    const query = gql`
    query GetRatings($username: String!) {
      user(username: $username) {
        collection(limit: 100) {
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

    try {
      const result = await this.apolloClient.query({
        query,
        variables: { username },
      });

      return result?.data?.user?.collection?.products || [];
    } catch (err) {
      console.error("❌ Erreur lors de la récupération des notations :", err);
      return [];
    }
  }
}
