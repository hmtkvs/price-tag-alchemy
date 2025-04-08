
export interface Purchase {
  id: string;
  date: Date;
  productName: string;
  originalPrice: number;
  originalCurrency: string;
  convertedPrice: number;
  targetCurrency: string;
  imageUrl: string;
  labels: string[];
  location?: string;
  tripName?: string;
  isReceipt?: boolean;
  isMenu?: boolean;
  items?: Array<{
    name: string;
    price: number;
    currency: string;
  }>;
}

export type PurchaseWithoutId = Omit<Purchase, 'id' | 'date'> & { 
  date?: Date;
  productName: string;
};
