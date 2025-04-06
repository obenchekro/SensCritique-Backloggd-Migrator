export interface ProductMedia {
    picture: string;
    backdrop: string;
};

export interface GenreInfo {
    label: string;
};

export interface ProductUserInfos {
    rating: number;
};

export interface SensCritiqueProduct {
    id: number;
    title: string;
    url: string;
    rating: number;
    yearOfProduction: number;
    dateRelease: string;
    synopsis: string;
    medias: ProductMedia;
    genresInfos: GenreInfo[];
    otherUserInfos: ProductUserInfos;
};

export interface GetRatingsResponse {
    user: {
        collection: {
            products: SensCritiqueProduct[];
        };
    };
};
