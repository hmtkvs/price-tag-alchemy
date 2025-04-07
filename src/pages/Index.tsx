import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { Camera, RefreshCw, ArrowLeft } from "lucide-react";
import CameraCapture from '@/components/Camera';
import CurrencySelector from '@/components/CurrencySelector';
import AROverlay from '@/components/AROverlay';
import { detectPriceFromImage, fetchCurrencyRates, convertCurrency } from '@/services/apiService';

enum AppStep {
  WELCOME,
  CAMERA,
  CURRENCY_SELECT,
  PROCESSING,
  RESULT
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.WELCOME);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [sourceCurrency, setSourceCurrency] = useState<string>("");
  const [targetCurrency, setTargetCurrency] = useState<string>("USD");
  const [detectedPrice, setDetectedPrice] = useState<number | null>(null);
  const [convertedPrice, setConvertedPrice] = useState<number | null>(null);
  const [conversionRate, setConversionRate] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleImageCapture = async (imageData: string) => {
    setCapturedImage(imageData);
    setIsProcessing(true);
    setCurrentStep(AppStep.PROCESSING);
    
    try {
      // Call mock LLM API to detect price and currency
      const result = await detectPriceFromImage(imageData);
      setDetectedPrice(result.detectedPrice);
      
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

  const proceedToConversion = async (source: string, target: string, price: number) => {
    if (!source || !target || price === null) {
      toast.error("Missing required information for conversion");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Fetch currency rates
      const rates = await fetchCurrencyRates(source);
      
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

  const resetToCamera = () => {
    setCapturedImage(null);
    setDetectedPrice(null);
    setConvertedPrice(null);
    setCurrentStep(AppStep.CAMERA);
  };

  const resetToWelcome = () => {
    setCapturedImage(null);
    setDetectedPrice(null);
    setConvertedPrice(null);
    setSourceCurrency("");
    setTargetCurrency("USD");
    setCurrentStep(AppStep.WELCOME);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Price Tag Alchemy</h1>
        {currentStep !== AppStep.WELCOME && (
          <Button 
            variant="outline" 
            size="icon"
            onClick={resetToWelcome}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
      </header>
      
      {/* Main content */}
      <main className="flex-1 p-4 max-w-md mx-auto w-full">
        {currentStep === AppStep.WELCOME && (
          <div className="animate-fade-in flex flex-col items-center justify-center h-full">
            <div className="glass-panel p-8 mb-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Welcome to Price Tag Alchemy</h2>
              <p className="mb-6 text-muted-foreground">
                Transform price tags into your preferred currency with a snap of your camera.
              </p>
              <Button 
                onClick={() => setCurrentStep(AppStep.CAMERA)} 
                className="w-full"
                size="lg"
              >
                <Camera className="mr-2 h-5 w-5" />
                Get Started
              </Button>
            </div>
          </div>
        )}
        
        {currentStep === AppStep.CAMERA && (
          <CameraCapture onCapture={handleImageCapture} />
        )}
        
        {currentStep === AppStep.PROCESSING && (
          <div className="animate-fade-in flex flex-col items-center justify-center py-12">
            <RefreshCw className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-lg">Processing your image...</p>
          </div>
        )}
        
        {currentStep === AppStep.CURRENCY_SELECT && (
          <CurrencySelector 
            sourceCurrency={sourceCurrency}
            targetCurrency={targetCurrency}
            onSourceChange={setSourceCurrency}
            onTargetChange={setTargetCurrency}
            onContinue={handleCurrencySelectContinue}
          />
        )}
        
        {currentStep === AppStep.RESULT && capturedImage && detectedPrice !== null && convertedPrice !== null && (
          <div className="animate-fade-in">
            <AROverlay 
              originalImage={capturedImage}
              originalCurrency={sourceCurrency}
              targetCurrency={targetCurrency}
              originalPrice={detectedPrice}
              convertedPrice={convertedPrice}
              conversionRate={conversionRate}
            />
            
            <div className="mt-6 flex space-x-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setCurrentStep(AppStep.CURRENCY_SELECT)}
              >
                Change Currency
              </Button>
              <Button 
                className="flex-1"
                onClick={resetToCamera}
              >
                New Scan
              </Button>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground">
        <p>Price Tag Alchemy © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Index;
