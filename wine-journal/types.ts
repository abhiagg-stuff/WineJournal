export type WineType = 'red' | 'white' | 'rosé' | 'sparkling' | 'dessert' | 'unknown';

export interface WineEntry {
  id: string;
  name: string;
  vintage: number;
  varietal: string;
  country: string;
  rating: number; // User's personal rating 1-5
  notes: string; // User's personal notes
  description?: string; // Sourced from research
  imageUrl: string;
  dateAdded: string; // ISO string
  lastUpdated: string; // ISO string
  publicRating?: number; // Public rating, e.g., 4.8
  reviewCount?: number; // Number of public reviews
  ratingSource?: string; // e.g., 'Vivino'
  price?: number; // Estimated price in USD
  inCellar: boolean; // Whether the wine is in the user's cellar
  wineType: WineType; // Type of wine (red, white, etc.)
}

export type ResearchedData = Partial<Omit<WineEntry, 'id' | 'dateAdded' | 'rating'>>;


export interface FilterOptions {
  wineType?: WineType | 'all' | 'none';
  inCellar?: boolean | 'all';
}

export enum SortOption {
  DateAdded = 'dateAdded',
  Rating = 'rating',
  NameAZ = 'nameAZ',
  NameZA = 'nameZA',
}