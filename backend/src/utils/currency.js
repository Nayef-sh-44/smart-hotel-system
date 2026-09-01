// Base currency is ALWAYS USD
export const SUPPORTED_CURRENCIES = ['USD', 'EUR'];

export const convertFromUSD = (amountInUSD, targetCurrency) => {
  const num = Number(amountInUSD);
  if (isNaN(num)) return 0;
  
  if (targetCurrency === 'EUR') {
    // 1 EUR = 1.10 USD => 1 USD = 1 / 1.10 EUR
    return num / 1.10;
  }
  
  // Default is USD
  return num;
};

export const convertToUSD = (amount, sourceCurrency) => {
  const num = Number(amount);
  if (isNaN(num)) return 0;
  
  if (sourceCurrency === 'EUR') {
    return num * 1.10;
  }
  
  // Default is already USD
  return num;
};
