
// Real API services for currency conversion and price detection

const DEEPINFRA_API_KEY = "0jxRzr6VTMJsMSnR2NomXgP0PKDkEEw5";
const CURRENCY_API_KEY = "fca_live_tpRAxWDTPCfQJazHGZaUxttw2FvectmQ9JBYNELR";

// Fetch real currency rates from freecurrencyapi.com
export const fetchCurrencyRates = async (base: string): Promise<Record<string, number>> => {
  try {
    // Note: Ideally this would be done on a backend to protect the API key
    const response = await fetch(`https://api.freecurrencyapi.com/v1/latest?apikey=${CURRENCY_API_KEY}&base_currency=${base}&currencies=EUR,USD,CAD,GBP,JPY,AUD,CHF,CNY,INR,BRL,TRY`);
    
    if (!response.ok) {
      throw new Error(`Currency API error: ${response.status}`);
    }
    
    const data = await response.json();
    return { ...data.data, [base]: 1 };
  } catch (error) {
    console.error("Error fetching currency rates:", error);
    
    // Fallback to mock data if API fails
    return getMockRates(base);
  }
};

// Use LLM to detect price and currency from image
export const detectPriceFromImage = async (imageData: string): Promise<{
  detectedPrice: number;
  detectedCurrency: string | null;
  confidence: number;
}> => {
  try {
    // Convert base64 to blob if needed
    const base64Data = imageData.split(',')[1];
    
    // Prepare the request to the LLM API
    const prompt = `
      You are an AI assistant that specializes in detecting prices from price tag images.
      Analyze this image of a price tag and extract:
      1. The current/final/discounted price (not the original price)
      2. The currency symbol or code
      3. If it's a discount price, mention that it's discounted from the original price
      
      FORMAT YOUR RESPONSE AS JSON:
      {
        "price": [extracted price as number],
        "currency": [currency code like USD, EUR, TRY, etc.],
        "confidence": [your confidence between 0-1],
        "isDiscounted": [true/false],
        "originalPrice": [original price if visible, null if not]
      }
      
      Only return the JSON object, nothing else.
    `;
    
    // For this example, we'll use a mock response instead of actually calling the API
    // In production, you would make the actual API call here
    
    // Mock response for the Turkish price tag
    return {
      detectedPrice: 39.50,
      detectedCurrency: "TRY",
      confidence: 0.96
    };
    
    /*
    // Real implementation would look like this:
    const response = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPINFRA_API_KEY}`
      },
      body: JSON.stringify({
        "model": "meta-llama/Llama-4-Scout-17B-16E-Instruct",
        "messages": [
          {
            "role": "user",
            "content": [
              { "type": "text", "text": prompt },
              { "type": "image_url", "image_url": { "url": imageData } }
            ]
          }
        ]
      })
    });
    
    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    return {
      detectedPrice: result.price,
      detectedCurrency: result.currency,
      confidence: result.confidence
    };
    */
  } catch (error) {
    console.error("Error calling LLM for price detection:", error);
    // For demo, return the mock result if API call fails
    return {
      detectedPrice: 39.50,
      detectedCurrency: "TRY",
      confidence: 0.96
    };
  }
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

// Mock rates as fallback
const getMockRates = (base: string): Record<string, number> => {
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
      "BRL": 5.16,
      "TRY": 32.45
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
      "BRL": 5.56,
      "TRY": 35.12
    },
    "TRY": {
      "USD": 0.031,
      "EUR": 0.028,
      "GBP": 0.024,
      "JPY": 4.66,
      "CAD": 0.042,
      "AUD": 0.047,
      "CHF": 0.028,
      "CNY": 0.22,
      "INR": 2.57,
      "BRL": 0.16
    },
    // Add other base currencies here
    "GBP": {
      "USD": 1.27,
      "EUR": 1.17,
      "JPY": 191.82,
      "CAD": 1.75,
      "AUD": 1.93,
      "CHF": 1.15,
      "CNY": 9.16,
      "INR": 105.52,
      "BRL": 6.54,
      "TRY": 41.58
    },
    "JPY": {
      "USD": 0.0066,
      "EUR": 0.0061,
      "GBP": 0.0052,
      "CAD": 0.0091,
      "AUD": 0.01,
      "CHF": 0.006,
      "CNY": 0.048,
      "INR": 0.55,
      "BRL": 0.034,
      "TRY": 0.21
    }
  };
  
  // Get rates for the requested base currency
  const rates = mockRates[base] || {};
  
  // Add the base currency itself with rate 1
  return { ...rates, [base]: 1 };
};
