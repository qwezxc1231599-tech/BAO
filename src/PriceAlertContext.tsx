import React, { createContext, useContext, useState, useEffect } from 'react';

export interface PriceAlert {
  productId: string;
  targetPrice: number; // in TWD
  createdAt: number;
  email?: string;
}

interface PriceAlertContextType {
  alerts: Record<string, PriceAlert>;
  setPriceAlert: (productId: string, targetPrice: number, email?: string) => void;
  removePriceAlert: (productId: string) => void;
  getAlert: (productId: string) => PriceAlert | undefined;
  hasAlert: (productId: string) => boolean;
  alertList: PriceAlert[];
  totalAlerts: number;
}

const PriceAlertContext = createContext<PriceAlertContextType | undefined>(undefined);

export const PriceAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Record<string, PriceAlert>>(() => {
    try {
      const saved = localStorage.getItem('price_alerts');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('price_alerts', JSON.stringify(alerts));
    } catch (e) {
      console.error('Failed to save price alerts', e);
    }
  }, [alerts]);

  const setPriceAlert = (productId: string, targetPrice: number, email?: string) => {
    setAlerts((prev) => ({
      ...prev,
      [productId]: {
        productId,
        targetPrice,
        createdAt: prev[productId]?.createdAt || Date.now(),
        email: email?.trim() || undefined,
      },
    }));
  };

  const removePriceAlert = (productId: string) => {
    setAlerts((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  const getAlert = (productId: string) => alerts[productId];
  const hasAlert = (productId: string) => Boolean(alerts[productId]);
  const alertList = Object.values(alerts);
  const totalAlerts = alertList.length;

  return (
    <PriceAlertContext.Provider
      value={{
        alerts,
        setPriceAlert,
        removePriceAlert,
        getAlert,
        hasAlert,
        alertList,
        totalAlerts,
      }}
    >
      {children}
    </PriceAlertContext.Provider>
  );
};

export const usePriceAlerts = () => {
  const context = useContext(PriceAlertContext);
  if (context === undefined) {
    throw new Error('usePriceAlerts must be used within a PriceAlertProvider');
  }
  return context;
};
