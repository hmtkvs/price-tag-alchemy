
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { Camera, RefreshCw, ArrowLeft, User, CircleDollarSign } from "lucide-react";
import CameraCapture from '@/components/Camera';
import CurrencySelector from '@/components/CurrencySelector';
import AROverlay from '@/components/AROverlay';
import LandingPage from '@/components/LandingPage';
import ItemComparison from '@/components/ItemComparison';
import { 
  detectPriceFromImage, 
  fetchCurrencyRates, 
  convertCurrency, 
  compareItemWithSimilar,
  savePurchase
} from '@/services/apiService';

enum AppStep {
  WELCOME,
  LANDING,
  CAMERA,
  CURRENCY_SELECT,
  PROCESSING,
  RESULT,
  COMPARING
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.LANDING);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [sourceCurrency, setSourceCurrency] = useState<string>("");
  const [targetCurrency, setTargetCurrency] = useState<string>("USD");
  const [detectedPrice, setDetectedPrice] = useState<number | null>(null);
  const [convertedPrice, setConvertedPrice] = useState<number | null>(null);
  const [conversionRate, setConversionRate] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLiveDetection, setIsLiveDetection] = useState<boolean>(false);
  const [productName, setProductName] = useState<string>("Unknown Product");
  const [productCategory, setProductCategory] = useState<string>("Unknown");
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);
  const [comparisons, setComparisons] = useState<any[]>([]);
  const [liveDetectionData, setLiveDetectionData] = useState<{
    image: string;
    price: number;
    currency: string;
    productName?: string;
  } | null>(null);
  
  const navigate = useNavigate();

  const handleImageCapture = async (imageData: string) => {
    setCapturedImage(imageData);
    setIsProcessing(true);
    setCurrentStep(AppStep.PROCESSING);
    
    try {
      // Call LLM API to detect price and currency
      const result = await detectPriceFromImage(imageData);
      setDetectedPrice(result.detectedPrice);
      
      // Set product details if available
      if (result.productName) {
        setProductName(result.productName);
      }
      
      if (result.productCategory) {
        setProductCategory(result.productCategory);
      }
      
      if (result.detectedCurrency) {
        setSourceCurrency(result.detectedCurrency);
        // If currency detected, go to conversion directly
        proceedToConversion(result.detectedCurrency, targetCurrency, result.detectedPrice);
      } else {
        // Ask user to select currency
        setCurrentStep(AppStep.CURRENCY_SELECT);
        toast("Please select the currency shown on the price tag");
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Error processing image. Please try again.");
      resetToCamera();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLivePriceDetection = useCallback(async (imageData: string) => {
    if (isProcessing) return; // Don't process if already processing
    
    try {
      // Quick check for price detection
      const result = await detectPriceFromImage(imageData);
      
      if (result.detectedPrice && result.detectedCurrency && result.confidence > 0.7) {
        // Show live AR overlay
        setLiveDetectionData({
          image: imageData,
          price: result.detectedPrice,
          currency: result.detectedCurrency,
          productName: result.productName
        });
        
        // Get conversion rate in background
        fetchCurrencyRates(result.detectedCurrency).then(rates => {
          const converted = convertCurrency(
            result.detectedPrice, 
            result.detectedCurrency, 
            targetCurrency, 
            rates
          );
          
          setLiveDetectionData(prev => prev ? {
            ...prev,
            convertedPrice: converted,
            convertedCurrency: targetCurrency,
            conversionRate: rates[targetCurrency]
          } : null);
        });
      }
    } catch (error) {
      console.error("Error in live detection:", error);
      // Don't show error to user for live detection
    }
  }, [isProcessing, targetCurrency]);

  const proceedToConversion = async (source: string, target: string, price: number) => {
    if (!source || !target || price === null) {
      toast.error("Missing required information for conversion");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Fetch currency rates
      const rates = await fetchCurrencyRates(source);
      
      if (!rates[target]) {
        throw new Error(`No conversion rate found for ${target}`);
      }
      
      // Calculate converted price
      const converted = convertCurrency(price, source, target, rates);
      setConvertedPrice(converted);
      setConversionRate(rates[target]);
      
      // Show results
      setCurrentStep(AppStep.RESULT);
    } catch (error) {
      console.error("Error converting currency:", error);
      toast.error("Error getting conversion rates. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCurrencySelectContinue = () => {
    if (detectedPrice !== null) {
      proceedToConversion(sourceCurrency, targetCurrency, detectedPrice);
    }
  };

  const handleSavePurchase = () => {
    if (!capturedImage || detectedPrice === null || convertedPrice === null) {
      toast.error("Missing purchase information");
      return;
    }
    
    try {
      const purchaseId = savePurchase({
        productName,
        originalPrice: detectedPrice,
        originalCurrency: sourceCurrency,
        convertedPrice,
        targetCurrency,
        imageUrl: capturedImage
      });
      
      toast.success("Purchase saved to your history");
    } catch (error) {
      console.error("Error saving purchase:", error);
      toast.error("Failed to save purchase");
    }
  };

  const handleCompareItem = async () => {
    if (!productName || detectedPrice === null) {
      toast.error("Product information not available for comparison");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const comparisonResults = await compareItemWithSimilar(
        productName,
        detectedPrice,
        sourceCurrency
      );
      
      setComparisons(comparisonResults);
      setIsComparisonOpen(true);
    } catch (error) {
      console.error("Error comparing item:", error);
      toast.error("Failed to compare prices");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetToCamera = () => {
    setCapturedImage(null);
    setDetectedPrice(null);
    setConvertedPrice(null);
    setLiveDetectionData(null);
    setProductName("Unknown Product");
    setProductCategory("Unknown");
    setCurrentStep(AppStep.CAMERA);
  };

  const resetToWelcome = () => {
    setCapturedImage(null);
    setDetectedPrice(null);
    setConvertedPrice(null);
    setSourceCurrency("");
    setTargetCurrency("USD");
    setLiveDetectionData(null);
    setProductName("Unknown Product");
    setProductCategory("Unknown");
    setCurrentStep(AppStep.LANDING);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - always visible except on landing page */}
      {currentStep !== AppStep.LANDING && (
        <header className="p-4 flex items-center justify-between backdrop-blur-md bg-background/80 border-b border-border/30 sticky top-0 z-50">
          <h1 className="text-2xl font-bold text-gradient-primary">Price Tag Alchemy</h1>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/profile')}
              className="rounded-full bg-white/10 border-white/20 hover:bg-white/20"
            >
              <User className="h-5 w-5" />
            </Button>
            {currentStep !== AppStep.WELCOME && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={resetToWelcome}
                className="rounded-full bg-white/10 border-white/20 hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
          </div>
        </header>
      )}
      
      {/* Main content */}
      <main className="flex-1">
        {currentStep === AppStep.LANDING && (
          <LandingPage onGetStarted={() => setCurrentStep(AppStep.CAMERA)} />
        )}
        
        {currentStep === AppStep.WELCOME && (
          <div className="animate-fade-in flex flex-col items-center justify-center h-full p-4 max-w-md mx-auto w-full">
            <div className="glass-panel p-8 mb-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Welcome to Price Tag Alchemy</h2>
              <p className="mb-6 text-muted-foreground">
                Transform price tags into your preferred currency with a snap of your camera.
              </p>
              <Button 
                onClick={() => setCurrentStep(AppStep.CAMERA)} 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl"
                size="lg"
              >
                <Camera className="mr-2 h-5 w-5" />
                Get Started
              </Button>
            </div>
          </div>
        )}
        
        {currentStep === AppStep.CAMERA && (
          <div className="p-4 max-w-md mx-auto w-full">
            <CameraCapture 
              onCapture={handleImageCapture} 
              onPriceDetected={handleLivePriceDetection}
              autoDetect={true}
            />
          </div>
        )}
        
        {currentStep === AppStep.PROCESSING && (
          <div className="animate-fade-in flex flex-col items-center justify-center py-12 p-4 max-w-md mx-auto w-full">
            <RefreshCw className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-lg">Processing your image...</p>
          </div>
        )}
        
        {currentStep === AppStep.CURRENCY_SELECT && (
          <div className="p-4 max-w-md mx-auto w-full">
            <CurrencySelector 
              sourceCurrency={sourceCurrency}
              targetCurrency={targetCurrency}
              onSourceChange={setSourceCurrency}
              onTargetChange={setTargetCurrency}
              onContinue={handleCurrencySelectContinue}
            />
          </div>
        )}
        
        {currentStep === AppStep.RESULT && capturedImage && detectedPrice !== null && convertedPrice !== null && (
          <div className="animate-fade-in p-4">
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold">{productName}</h2>
              {productCategory !== "Unknown" && (
                <p className="text-sm text-muted-foreground">{productCategory}</p>
              )}
            </div>
            
            <AROverlay 
              originalImage={capturedImage}
              originalCurrency={sourceCurrency}
              targetCurrency={targetCurrency}
              originalPrice={detectedPrice}
              convertedPrice={convertedPrice}
              conversionRate={conversionRate}
              productName={productName}
              onSavePurchase={handleSavePurchase}
              onCompareItem={handleCompareItem}
            />
            
            <div className="mt-6 flex space-x-4 max-w-md mx-auto">
              <Button 
                variant="outline" 
                className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/20"
                onClick={() => setCurrentStep(AppStep.CURRENCY_SELECT)}
              >
                Change Currency
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                onClick={resetToCamera}
              >
                New Scan
              </Button>
            </div>
          </div>
        )}
        
        {/* Live detection overlay */}
        {liveDetectionData && (
          <div className="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-md rounded-lg border border-white/20 p-3 shadow-xl z-40">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CircleDollarSign className="h-5 w-5 text-primary mr-2" />
                <div>
                  <div className="text-xs text-white/70">Detected Price:</div>
                  <div className="font-bold">
                    {liveDetectionData.price} {liveDetectionData.currency}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-xs"
                onClick={() => handleImageCapture(liveDetectionData.image)}
              >
                Capture Now
              </Button>
            </div>
          </div>
        )}
      </main>
      
      {/* Item comparison modal */}
      <ItemComparison
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        productName={productName}
        price={detectedPrice || 0}
        currency={sourceCurrency}
        comparisons={comparisons}
      />
    </div>
  );
};

export default Index;
