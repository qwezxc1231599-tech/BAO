import { useState, useEffect } from 'react';
import { Product } from './types';

const STORAGE_KEY = 'recently_viewed_products';
const MAX_HISTORY = 10;

export function useRecentlyViewed() {
  const [history, setHistory] = useState<Product[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recently viewed history', e);
      }
    }
  }, []);

  const addViewedProduct = (product: Product) => {
    setHistory(prev => {
      // Remove if it already exists to put it at the front
      const filtered = prev.filter(p => p.id !== product.id);
      const newHistory = [product, ...filtered].slice(0, MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { history, addViewedProduct, clearHistory };
}
