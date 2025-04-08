
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
  restaurantName?: string; // For menu scanning
  storeName?: string; // For receipt scanning
  transactionId?: string; // For receipt tracking
  items?: Array<{
    name: string;
    price: number;
    currency: string;
    quantity?: number;
    category?: string; // For menu categorization
    description?: string; // For menu item descriptions
  }>;
  tax?: number; // For receipts
  total?: number; // For receipt totals
  paymentMethod?: string; // For receipts
}

export type PurchaseWithoutId = Omit<Purchase, 'id' | 'date'> & { 
  date?: Date;
  productName: string;
};
