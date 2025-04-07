import { ApolloClient, DocumentNode, gql, NormalizedCacheObject } from '@apollo/client';

export class SensCritiqueGraphQLService {
    private client: ApolloClient<NormalizedCacheObject>;

    constructor(client: ApolloClient<NormalizedCacheObject>) {
        this.client = client;
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
                    collection(limit: 99999) {
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
}
