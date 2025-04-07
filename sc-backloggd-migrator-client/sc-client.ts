import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { ApolloClient, InMemoryCache, HttpLink, gql, NormalizedCache, NormalizedCacheObject } from '@apollo/client/core';
import fetch from 'cross-fetch';
import { SensCritiqueAuthOptions } from '../sc-backloggd-migrator-schemas/sc-auth-options.interface';

export class SensCritiqueClient {
  firebaseApp: FirebaseApp;
  auth: Auth;
  apolloClient: ApolloClient<NormalizedCacheObject>;

  private constructor(firebaseApp: FirebaseApp, auth: Auth, apolloClient: ApolloClient<NormalizedCacheObject>) {
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
}
