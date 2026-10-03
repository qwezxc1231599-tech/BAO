import { useState, useEffect } from 'react';
import { Product } from './types';

const STORAGE_KEY = 'recently_viewed_products';
const CATEGORY_STORAGE_KEY = 'recently_viewed_categories';
const MAX_HISTORY = 10;
const MAX_CATEGORIES = 6;

export function useRecentlyViewed() {
  const [history, setHistory] = useState<Product[]>([]);
  const [recentCategories, setRecentCategories] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recently viewed history', e);
      }
    }

    const storedCats = localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (storedCats) {
      try {
        setRecentCategories(JSON.parse(storedCats));
      } catch (e) {
        console.error('Failed to parse recently viewed categories', e);
      }
    }
  }, []);

  const addViewedCategory = (category: string) => {
    if (!category || ['全部', '我的最愛', '降價追蹤'].includes(category)) return;
    setRecentCategories(prev => {
      const filtered = prev.filter(c => c !== category);
      const updated = [category, ...filtered].slice(0, MAX_CATEGORIES);
      try {
        localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const addViewedProduct = (product: Product) => {
    if (product.category) {
      addViewedCategory(product.category);
    }
    setHistory(prev => {
      // Remove if it already exists to put it at the front
      const filtered = prev.filter(p => p.id !== product.id);
      const newHistory = [product, ...filtered].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch (e) {
        console.error(e);
      }
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    setRecentCategories([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CATEGORY_STORAGE_KEY);
  };

  return { history, recentCategories, addViewedProduct, addViewedCategory, clearHistory };
}

