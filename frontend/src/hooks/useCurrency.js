import { useAuth } from '../context/AuthContext.jsx';

const EUR_TO_USD_RATE = 1.10; // Simple assumed exchange rate

export function useCurrency() {
  const { user } = useAuth();
  const currency = user?.preferred_currency || 'EUR';
  const symbol = currency === 'USD' ? '$' : '€';

  const formatPrice = (priceInEur) => {
    if (!priceInEur && priceInEur !== 0) return '';
    const num = Number(priceInEur);
    if (currency === 'USD') {
      return (num * EUR_TO_USD_RATE).toFixed(0);
    }
    return num.toFixed(0);
  };

  const toEur = (priceInDisplayCurrency) => {
    if (!priceInDisplayCurrency && priceInDisplayCurrency !== 0) return '';
    const num = Number(priceInDisplayCurrency);
    if (currency === 'USD') {
      return (num / EUR_TO_USD_RATE).toFixed(2);
    }
    return num.toString();
  };

  return { currency, symbol, formatPrice, toEur };
}
