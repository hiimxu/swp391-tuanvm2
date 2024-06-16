export type ProductFeatured = {
    id: string | null;
    thumbnail: string | null;
    name: string | null;
    description: string | null;
    original_price: number | null;
    discount_price: number | null;
};

export type Brand = {
    id?: string | null | null;
    name?: string | null;
};

export type Category = {
    id?: string | null;
    name?: string | null;
};
