import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { GetRatingsResponse, SensCritiqueProduct } from "../sc-backloggd-migrator-schemas/sc-products.interface";
import { SensCritiqueGraphQLService } from "../sc-backloggd-migrator-client/sc-query";

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