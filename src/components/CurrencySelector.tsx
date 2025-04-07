
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CurrencySelectorProps {
  sourceCurrency: string;
  targetCurrency: string;
  onSourceChange: (currency: string) => void;
  onTargetChange: (currency: string) => void;
  onContinue: () => void;
  className?: string;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  sourceCurrency,
  targetCurrency,
  onSourceChange,
  onTargetChange,
  onContinue,
  className
}) => {
  const currencies = [
    { value: "USD", label: "US Dollar (USD)" },
    { value: "EUR", label: "Euro (EUR)" },
    { value: "GBP", label: "British Pound (GBP)" },
    { value: "JPY", label: "Japanese Yen (JPY)" },
    { value: "CAD", label: "Canadian Dollar (CAD)" },
    { value: "AUD", label: "Australian Dollar (AUD)" },
    { value: "CHF", label: "Swiss Franc (CHF)" },
    { value: "CNY", label: "Chinese Yuan (CNY)" },
    { value: "INR", label: "Indian Rupee (INR)" },
    { value: "BRL", label: "Brazilian Real (BRL)" },
  ];

  return (
    <div className={cn("w-full animate-fade-in", className)}>
      <div className="glass-panel p-5">
        <h2 className="text-xl font-semibold mb-4 text-center">Currency Selection</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Source Currency</label>
            <Select value={sourceCurrency} onValueChange={onSourceChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select source currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-center">
            <ArrowRight className="text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Currency</label>
            <Select value={targetCurrency} onValueChange={onTargetChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select target currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            className="w-full mt-4" 
            disabled={!sourceCurrency || !targetCurrency}
            onClick={onContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CurrencySelector;
