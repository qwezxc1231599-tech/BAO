import { Product } from '../types';

export interface PricePoint {
  date: string;
  price: number;
  fullDate: string;
}

export interface PriceHistorySummary {
  history: PricePoint[];
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  currentPrice: number;
  isLowestEver: boolean;
  savingsFromMax: number;
  discountFromMaxPercent: number;
  suggestedAlertPrice: number;
}

// Simple deterministic hash based on product id
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getProductPriceHistory(product: Product): PriceHistorySummary {
  if (product.priceHistory && product.priceHistory.length > 0) {
    const history = product.priceHistory.map((pt) => ({
      date: pt.date,
      price: pt.price,
      fullDate: pt.date,
    }));
    const prices = history.map((h) => h.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const currentPrice = product.price;

    return {
      history,
      minPrice,
      maxPrice,
      avgPrice,
      currentPrice,
      isLowestEver: currentPrice <= minPrice,
      savingsFromMax: Math.max(0, maxPrice - currentPrice),
      discountFromMaxPercent: maxPrice > 0 ? Math.round(((maxPrice - currentPrice) / maxPrice) * 100) : 0,
      suggestedAlertPrice: Math.round(minPrice * 0.95),
    };
  }

  // Generate deterministic realistic 60-day history
  const seed = hashString(product.id || product.name);
  const currentPrice = product.price;

  // Multipliers relative to currentPrice for 8 data points:
  // Points: ~60d, ~45d, ~35d, ~25d, ~18d, ~10d, ~4d, Today
  const variance = (seed % 15) / 100; // 0.00 to 0.14
  const hasFlashSale = (seed % 3) === 0;

  // Construct realistic curve: products are typically at normal MSRP or slight discount
  const baseMultiplier = 1.08 + variance; // typically started 8% - 22% higher
  const rawMultipliers = [
    baseMultiplier,
    baseMultiplier - 0.02,
    baseMultiplier + ((seed % 5) - 2) * 0.02,
    hasFlashSale ? 0.94 : baseMultiplier - 0.05,
    baseMultiplier - 0.03,
    1.03 + (seed % 4) * 0.02,
    1.01 + (seed % 3) * 0.01,
    1.0, // today is exactly 1.0x currentPrice
  ];

  const now = new Date();
  const dayOffsets = [60, 45, 35, 25, 18, 10, 4, 0];

  const history: PricePoint[] = rawMultipliers.map((mult, idx) => {
    const d = new Date(now.getTime() - dayOffsets[idx] * 24 * 60 * 60 * 1000);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dateStr = `${month}/${day < 10 ? '0' : ''}${day}`;
    const fullDate = `${d.getFullYear()}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
    
    // Calculate rounded price
    let pointPrice = Math.round(currentPrice * mult);
    if (idx === rawMultipliers.length - 1) {
      pointPrice = currentPrice;
    }

    return {
      date: dateStr,
      price: pointPrice,
      fullDate,
    };
  });

  const prices = history.map((h) => h.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const isLowestEver = currentPrice <= minPrice;
  const savingsFromMax = Math.max(0, maxPrice - currentPrice);
  const discountFromMaxPercent = maxPrice > 0 ? Math.round(((maxPrice - currentPrice) / maxPrice) * 100) : 0;
  
  // Suggested alert price: if currently at lowest, recommend 5% lower; otherwise recommend the historical lowest
  const suggestedAlertPrice = isLowestEver 
    ? Math.round(currentPrice * 0.92)
    : minPrice;

  return {
    history,
    minPrice,
    maxPrice,
    avgPrice,
    currentPrice,
    isLowestEver,
    savingsFromMax,
    discountFromMaxPercent,
    suggestedAlertPrice,
  };
}
