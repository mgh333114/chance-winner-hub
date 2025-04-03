import { useEffect, useState } from 'react';

export type CurrencyInfo = {
  code: string;
  symbol: string;
  name: string;
  format: (amount: number) => string;
};

const defaultCurrency: CurrencyInfo = {
  code: 'KES',
  symbol: 'KSh',
  name: 'Kenyan Shilling',
  format: (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
};

// Map of country codes to currency info
const currencyMap: Record<string, CurrencyInfo> = {
  KE: {
    code: 'KES',
    symbol: 'KSh',
    name: 'Kenyan Shilling',
    format: (amount: number) => {
      return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    }
  },
  US: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    format: (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    }
  },
  GB: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    format: (amount: number) => {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    }
  },
  EU: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    format: (amount: number) => {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    }
  },
  JP: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    format: (amount: number) => {
      return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
  },
  AU: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    format: (amount: number) => {
      return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    }
  },
  CA: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    format: (amount: number) => {
      return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    }
  }
};

export const useCurrency = () => {
  const [currencyInfo, setCurrencyInfo] = useState<CurrencyInfo>(defaultCurrency);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectUserCurrency = async () => {
      try {
        // Always default to Kenyan Shilling regardless of location
        setCurrencyInfo(currencyMap.KE || defaultCurrency);
        setIsLoading(false);
      } catch (error) {
        console.error('Error detecting user currency:', error);
        // Fall back to Kenyan Shilling
        setCurrencyInfo(defaultCurrency);
        setIsLoading(false);
      }
    };

    detectUserCurrency();
  }, []);

  return {
    currencyInfo,
    isLoading,
    formatCurrency: (amount: number) => currencyInfo.format(amount)
  };
};
