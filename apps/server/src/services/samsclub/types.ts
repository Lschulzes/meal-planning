export interface SamsClubProduct {
  productId: string;
  sku: string;
  upc: string;
  gtin: string;
  name: string;
  brand: string;
  description: string;
  category: string;
  subcategory: string;
  imageUrl: string;
  price: number;
  pricePerUnit: number | null;
  unitSize: string;
  unitType: string;
  inStock: boolean;
  nutritionFacts?: Record<string, unknown>;
}

export interface SamsClubCategory {
  id: string;
  name: string;
  slug: string;
  subcategories: SamsClubCategory[];
}

export interface ClubInfo {
  clubId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  distance: number;
}

export interface SamsClubSearchResponse {
  totalCount: number;
  products: SamsClubProduct[];
  offset: number;
  limit: number;
}

export interface FetchProgress {
  category: string;
  fetched: number;
  total: number;
}
