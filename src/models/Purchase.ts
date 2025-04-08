
export interface Purchase {
  id: string;
  date: Date;
  productName: string; // Changed from optional to required
  originalPrice: number;
  originalCurrency: string;
  convertedPrice: number;
  targetCurrency: string;
  imageUrl: string;
  labels: string[];
}

export type PurchaseWithoutId = Omit<Purchase, 'id' | 'date'> & { 
  date?: Date;
  productName: string; // Ensuring productName is required here too
};
