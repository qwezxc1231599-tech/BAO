import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'TWD' | 'USD' | 'JPY';

interface Rates {
  TWD: number;
  USD: number;
  JPY: number;
}

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rates: Rates;
  convertPrice: (priceInTWD: number) => { value: number; symbol: string };
  isLoading: boolean;
}

const defaultRates: Rates = { TWD: 1, USD: 0.031, JPY: 4.7 };

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  TWD: 'NT$',
  USD: '$',
  JPY: '¥'
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('TWD');
  const [rates, setRates] = useState<Rates>(defaultRates);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    // Mock API call to fetch latest rates
    const fetchRates = async () => {
      setIsLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock response
        if (isMounted) {
          setRates({
            TWD: 1,
            USD: 0.032, // slightly updated mock rate
            JPY: 4.8    // slightly updated mock rate
          });
        }
      } catch (error) {
        console.error('Failed to fetch rates', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRates();

    return () => {
      isMounted = false;
    };
  }, []);

  const convertPrice = (priceInTWD: number) => {
    const rate = rates[currency] || 1;
    const value = priceInTWD * rate;
    
    return {
      value: currency === 'JPY' ? Math.round(value) : Number(value.toFixed(2)),
      symbol: CURRENCY_SYMBOLS[currency]
    };
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, convertPrice, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
