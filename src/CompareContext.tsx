import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from './types';

interface CompareContextType {
  compareList: Product[];
  addToCompare: (product: Product) => { success: boolean; reason?: 'limit_reached' | 'already_exists' };
  removeFromCompare: (productId: string) => void;
  toggleCompare: (product: Product) => { added: boolean; success: boolean };
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: (open: boolean) => void;
  maxCompareItems: number;
  compareNotice: string | null;
  setCompareNotice: (msg: string | null) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE = 4;
const STORAGE_KEY = 'compare_products_v1';

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareNotice, setCompareNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setCompareNotice(msg);
    setTimeout(() => {
      setCompareNotice((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList));
    } catch (e) {
      console.warn('Failed to save comparison list to localStorage', e);
    }
  }, [compareList]);

  const isInCompare = (productId: string) => {
    return compareList.some((p) => p.id === productId);
  };

  const addToCompare = (product: Product): { success: boolean; reason?: 'limit_reached' | 'already_exists' } => {
    if (isInCompare(product.id)) {
      return { success: false, reason: 'already_exists' };
    }
    if (compareList.length >= MAX_COMPARE) {
      showNotice(`最多只能同時對比 ${MAX_COMPARE} 項商品，請先取消其他項目！`);
      return { success: false, reason: 'limit_reached' };
    }
    setCompareList((prev) => [...prev, product]);
    showNotice(`已將「${product.name.slice(0, 12)}...」加入對比`);
    return { success: true };
  };

  const removeFromCompare = (productId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
  };

  const toggleCompare = (product: Product): { added: boolean; success: boolean } => {
    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
      showNotice(`已取消對比「${product.name.slice(0, 12)}...」`);
      return { added: false, success: true };
    } else {
      const res = addToCompare(product);
      return { added: res.success, success: res.success };
    }
  };

  const clearCompare = () => {
    setCompareList([]);
    setIsCompareModalOpen(false);
    showNotice('已清空所有對比商品');
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        isInCompare,
        clearCompare,
        isCompareModalOpen,
        setIsCompareModalOpen,
        maxCompareItems: MAX_COMPARE,
        compareNotice,
        setCompareNotice,
      }}
    >
      {children}
      {compareNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[110] bg-gray-900 text-white px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-md text-xs sm:text-sm font-medium flex items-center gap-2 border border-gray-700 animate-in fade-in slide-in-from-top duration-200">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>{compareNotice}</span>
        </div>
      )}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
