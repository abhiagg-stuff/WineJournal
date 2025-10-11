export interface WineEntry {
  id: number;
  name: string;
  vintage: number;
  varietal: string;
  country: string;
  rating: number; // User's personal rating 1-10
  notes: string; // User's personal notes
  description?: string; // Sourced from research
  imageUrl: string;
  dateAdded: string; // ISO string
  publicRating?: number; // Public rating, e.g., 4.8
  reviewCount?: number; // Number of public reviews
  ratingSource?: string; // e.g., 'Vivino'
  price?: number; // Estimated price in USD
}

export type ResearchedData = Partial<Omit<WineEntry, 'id' | 'dateAdded' | 'rating'>>;


export enum SortOption {
  DateAdded = 'dateAdded',
  Rating = 'rating',
  NameAZ = 'nameAZ',
  NameZA = 'nameZA',
}