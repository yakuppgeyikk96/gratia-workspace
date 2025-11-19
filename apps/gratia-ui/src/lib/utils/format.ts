/**
 * Formats a price value with currency symbol
 * @param price - The price value to format
 * @param currency - The currency code (USD, EUR, TRY, etc.)
 * @returns Formatted price string
 */
export const formatPrice = (
  price: number,
  currency: string = "USD"
): string => {
  const currencySymbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    TRY: "₺",
  };

  const symbol = currencySymbols[currency] || "$";

  if (currency === "TRY") {
    return `${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${symbol}`;
  }

  return `${symbol}${price.toFixed(2)}`;
};
