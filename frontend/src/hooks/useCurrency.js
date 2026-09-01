import { useAuth } from '../context/AuthContext.jsx';

export const SUPPORTED_CURRENCIES = ['USD', 'EUR'];

export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€'
};

// All prices in the database are USD.
export function convertFromUSD(amountInUSD, targetCurrency) {
  if (!amountInUSD && amountInUSD !== 0) return 0;
  const num = Number(amountInUSD);
  
  if (targetCurrency === 'EUR') {
    return num / 1.10;
  }
  
  return num; // USD
}

export function convertToUSD(amount, sourceCurrency) {
  if (!amount && amount !== 0) return 0;
  const num = Number(amount);
  
  if (sourceCurrency === 'EUR') {
    return num * 1.10;
  }
  
  return num; // Already USD
}

export function useCurrency() {
  const { user } = useAuth();
  // User's display currency, default to USD
  const currency = user?.preferred_currency === 'EUR' ? 'EUR' : 'USD';
  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  // Format a database USD price to the user's display currency
  const formatPrice = (priceInUSD) => {
    if (!priceInUSD && priceInUSD !== 0) return '';
    const num = Number(priceInUSD);
    const priceInUserCurrency = convertFromUSD(num, currency);
    return priceInUserCurrency.toFixed(0);
  };

  return { currency, symbol, formatPrice, convertFromUSD, convertToUSD };
}
