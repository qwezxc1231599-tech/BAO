import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Layers,
  ShoppingBag,
  Bell,
  Star,
  ExternalLink,
  Store,
  TrendingUp,
  TrendingDown,
  Award,
  Crown,
  Check,
  Copy,
  LineChart,
} from 'lucide-react';
import { useCompare } from '../CompareContext';
import { useCurrency } from '../CurrencyContext';
import { useLanguage } from '../LanguageContext';
import { Product } from '../types';
import { getProductPriceHistory } from '../utils/priceHistory';
import { PriceTrendChart } from './PriceTrendChart';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPriceAlert?: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
}

export function CompareModal({ isOpen, onClose, onOpenPriceAlert, onViewProduct }: CompareModalProps) {
  const { compareList, removeFromCompare, clearCompare, maxCompareItems } = useCompare();
  const { convertPrice } = useCurrency();
  const { t, getCategoryTranslation } = useLanguage();

  // Find lowest price and highest sales across items for comparative badges
  const analytics = useMemo(() => {
    if (compareList.length === 0) return { lowestPriceId: null, topSalesId: null, biggestDropId: null };

    let lowestPrice = Infinity;
    let lowestPriceId: string | null = null;
    let maxSales = -1;
    let topSalesId: string | null = null;
    let maxDiscount = -1;
    let biggestDropId: string | null = null;

    compareList.forEach((p) => {
      if (p.price < lowestPrice) {
        lowestPrice = p.price;
        lowestPriceId = p.id;
      }
      if (p.salesNum > maxSales) {
        maxSales = p.salesNum;
        topSalesId = p.id;
      }
      const history = getProductPriceHistory(p);
      if (history.discountFromMaxPercent > maxDiscount) {
        maxDiscount = history.discountFromMaxPercent;
        biggestDropId = p.id;
      }
    });

    return { lowestPriceId, topSalesId, biggestDropId };
  }, [compareList]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-gray-900 text-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <span>商品規格與價格直接比對</span>
                  <span className="text-xs bg-amber-400 text-black px-2 py-0.5 rounded-full font-mono font-bold">
                    {compareList.length} / {maxCompareItems}
                  </span>
                </h2>
                <p className="text-xs text-gray-400">
                  即時比較各商品價格走勢、歷史高低點與銷量排行
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearCompare}
                className="px-3 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium"
              >
                清空全部
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Table / Grid Container */}
          <div className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6">
            <div className="min-w-[680px]">
              {/* Product Cards Header Row */}
              <div className="grid grid-cols-[140px_repeat(auto-fit,minmax(200px,1fr))] gap-4 pb-4 border-b border-gray-200">
                <div className="font-bold text-xs text-gray-400 uppercase tracking-wider flex items-end pb-2">
                  對比項目
                </div>
                {compareList.map((product) => {
                  const isLowest = product.id === analytics.lowestPriceId;
                  const isTopSeller = product.id === analytics.topSalesId;
                  const isBiggestDrop = product.id === analytics.biggestDropId;

                  return (
                    <div key={product.id} className="relative bg-gray-50 rounded-xl p-3 border border-gray-200 flex flex-col justify-between">
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFromCompare(product.id)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="移除商品"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Comparative Badges */}
                      <div className="flex flex-wrap gap-1 mb-2 pr-6 min-h-[22px]">
                        {isLowest && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-600 text-white px-1.5 py-0.5 rounded shadow-sm">
                            <Crown className="w-3 h-3" />
                            <span>價格最低</span>
                          </span>
                        )}
                        {isTopSeller && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black bg-amber-500 text-black px-1.5 py-0.5 rounded shadow-sm">
                            <Award className="w-3 h-3" />
                            <span>銷量冠軍</span>
                          </span>
                        )}
                        {isBiggestDrop && !isLowest && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black bg-rose-600 text-white px-1.5 py-0.5 rounded shadow-sm">
                            <TrendingDown className="w-3 h-3" />
                            <span>降幅最大</span>
                          </span>
                        )}
                      </div>

                      {/* Thumbnail & Title */}
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 overflow-hidden flex-shrink-0">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              無圖
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold bg-black text-white px-1.5 py-0.5 rounded inline-block mb-1">
                            {getCategoryTranslation(product.category)}
                          </span>
                          <h4 className="text-xs font-bold text-gray-900 line-clamp-2" title={product.name}>
                            {product.name}
                          </h4>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-100 text-xs sm:text-sm">
                {/* 1. 當前售價 (Current Price) */}
                <div className="grid grid-cols-[140px_repeat(auto-fit,minmax(200px,1fr))] gap-4 py-3.5 items-center">
                  <div className="font-bold text-gray-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span>當前價格</span>
                  </div>
                  {compareList.map((product) => {
                    const { value, symbol } = convertPrice(product.price);
                    const isLowest = product.id === analytics.lowestPriceId;
                    return (
                      <div key={product.id} className="flex items-baseline gap-1">
                        <span className={`text-base sm:text-lg font-black ${isLowest ? 'text-emerald-600' : 'text-[#ff2121]'}`}>
                          {symbol} {value.toLocaleString()}
                        </span>
                        {isLowest && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 rounded ml-1">
                            最低
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 2. 60天歷史價格 (Historical Low / High) */}
                <div className="grid grid-cols-[140px_repeat(auto-fit,minmax(200px,1fr))] gap-4 py-3.5 items-center">
                  <div className="font-bold text-gray-700 flex items-center gap-1.5">
                    <LineChart className="w-4 h-4 text-amber-500" />
                    <span>60天歷史價格</span>
                  </div>
                  {compareList.map((product) => {
                    const history = getProductPriceHistory(product);
                    const { value: minValue, symbol } = convertPrice(history.minPrice);
                    const { value: maxValue } = convertPrice(history.maxPrice);

                    return (
                      <div key={product.id} className="space-y-1">
                        <div className="text-xs">
                          <span className="text-gray-500 mr-1">最低:</span>
                          <span className="font-bold text-emerald-700">{symbol} {minValue.toLocaleString()}</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-400 mr-1">最高:</span>
                          <span className="text-gray-400 line-through">{symbol} {maxValue.toLocaleString()}</span>
                        </div>
                        {history.isLowestEver ? (
                          <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded inline-block">
                            🔥 目前正處歷史最低點
                          </div>
                        ) : (
                          <div className="text-[10px] text-gray-500">
                            相比高點省 {history.discountFromMaxPercent}%
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 3. 走勢圖對比 (Price Trend Chart) */}
                <div className="grid grid-cols-[140px_repeat(auto-fit,minmax(200px,1fr))] gap-4 py-3.5 items-center">
                  <div className="font-bold text-gray-700 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span>60天價格曲線</span>
                  </div>
                  {compareList.map((product) => (
                    <div key={product.id} className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <PriceTrendChart
                        product={product}
                        height={90}
                        showDetails={false}
                      />
                    </div>
                  ))}
                </div>

                {/* 4. 銷售數量 (Sales Volume) */}
                <div className="grid grid-cols-[140px_repeat(auto-fit,minmax(200px,1fr))] gap-4 py-3.5 items-center">
                  <div className="font-bold text-gray-700 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span>累積銷量</span>
                  </div>
                  {compareList.map((product) => {
                    const isTopSeller = product.id === analytics.topSalesId;
                    return (
                      <div key={product.id} className="flex items-center gap-1">
                        <span className={`font-bold ${isTopSeller ? 'text-amber-700' : 'text-gray-800'}`}>
                          已售 {product.salesStr}
                        </span>
                        {isTopSeller && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1 rounded">
                            👑 銷量王
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 5. 來源門市 (Store) */}
                <div className="grid grid-cols-[140px_repeat(auto-fit,minmax(200px,1fr))] gap-4 py-3.5 items-center">
                  <div className="font-bold text-gray-700 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-purple-500" />
                    <span>販售賣場</span>
                  </div>
                  {compareList.map((product) => (
                    <div key={product.id} className="text-gray-700 font-medium truncate" title={product.store}>
                      {product.store}
                    </div>
                  ))}
                </div>

                {/* 6. 快捷操作 (Actions) */}
                <div className="grid grid-cols-[140px_repeat(auto-fit,minmax(200px,1fr))] gap-4 py-4 items-center">
                  <div className="font-bold text-gray-700">立即操作</div>
                  {compareList.map((product) => (
                    <div key={product.id} className="space-y-2">
                      <a
                        href={product.affiliateLink || product.productLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => onViewProduct && onViewProduct(product)}
                        className="flex items-center justify-center w-full px-3 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors uppercase tracking-wider shadow-sm"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                        <span>前往購買</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenPriceAlert) {
                            onOpenPriceAlert(product);
                          }
                        }}
                        className="flex items-center justify-center w-full px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-lg hover:bg-amber-100 transition-colors"
                      >
                        <Bell className="w-3.5 h-3.5 mr-1.5" />
                        <span>設降價通知</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500 flex-shrink-0">
            <span>💡 提示：點擊右上角「X」或直接在卡片上取消勾選即可移除比對商品。</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors"
            >
              關閉比對
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
