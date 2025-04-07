
// Mock API service to simulate real API calls
// In a production app, these would make actual API calls

// Mock currency conversion API (simulating freecurrencyapi.com)
export const fetchCurrencyRates = async (base: string): Promise<Record<string, number>> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock currency rates relative to base
  const mockRates: Record<string, Record<string, number>> = {
    "USD": {
      "EUR": 0.93,
      "GBP": 0.79,
      "JPY": 151.24,
      "CAD": 1.38,
      "AUD": 1.52,
      "CHF": 0.91,
      "CNY": 7.23,
      "INR": 83.34,
      "BRL": 5.16
    },
    "EUR": {
      "USD": 1.08,
      "GBP": 0.85,
      "JPY": 163.04,
      "CAD": 1.49,
      "AUD": 1.63,
      "CHF": 0.98,
      "CNY": 7.78,
      "INR": 89.69,
      "BRL": 5.56
    },
    "GBP": {
      "USD": 1.27,
      "EUR": 1.17,
      "JPY": 191.82,
      "CAD": 1.75,
      "AUD": 1.93,
      "CHF": 1.15,
      "CNY": 9.16,
      "INR": 105.52,
      "BRL": 6.54
    },
    // Add other base currencies here
    "JPY": {
      "USD": 0.0066,
      "EUR": 0.0061,
      "GBP": 0.0052,
      "CAD": 0.0091,
      "AUD": 0.01,
      "CHF": 0.006,
      "CNY": 0.048,
      "INR": 0.55,
      "BRL": 0.034
    }
  };
  
  // Get rates for the requested base currency
  const rates = mockRates[base] || {};
  
  // Add the base currency itself with rate 1
  return { ...rates, [base]: 1 };
};

// Mock LLM API for price detection
export const detectPriceFromImage = async (imageData: string): Promise<{
  detectedPrice: number;
  detectedCurrency: string | null;
  confidence: number;
}> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock response - in a real app this would call the LLM API
  return {
    detectedPrice: 29.99,
    detectedCurrency: Math.random() > 0.5 ? "USD" : null, // Randomly succeed or fail for demo
    confidence: 0.92
  };
};

// Convert currency using the fetched rates
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number => {
  if (fromCurrency === toCurrency) return amount;
  
  const rate = rates[toCurrency];
  if (!rate) throw new Error(`No conversion rate found for ${toCurrency}`);
  
  return amount * rate;
};
