import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, Trash2, Scale, Layers, Image as ImageIcon } from 'lucide-react';
import { useCompare } from '../CompareContext';
import { useCurrency } from '../CurrencyContext';
import { useLanguage } from '../LanguageContext';

export function FloatingCompareBar() {
  const {
    compareList,
    removeFromCompare,
    clearCompare,
    setIsCompareModalOpen,
    maxCompareItems,
  } = useCompare();

  const { convertPrice } = useCurrency();
  const { t } = useLanguage();

  if (compareList.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl bg-gray-900/95 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 p-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3"
      >
        {/* Left: Summary info & Thumbnails */}
        <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold flex items-center gap-1.5">
                <span>商品對比</span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded font-mono">
                  {compareList.length}/{maxCompareItems}
                </span>
              </div>
              <div className="text-[10px] text-gray-400">
                {compareList.length >= 2 ? '可立即進行多維度分析' : '再加 1 項即可開始比對'}
              </div>
            </div>
          </div>

          {/* Product Thumbnails */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            {compareList.map((product) => {
              const { value, symbol } = convertPrice(product.price);
              return (
                <div
                  key={product.id}
                  className="relative group w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden flex-shrink-0"
                  title={`${product.name} (${symbol}${value.toLocaleString()})`}
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  )}

                  {/* Remove Button on thumbnail */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromCompare(product.id);
                    }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-90 hover:opacity-100 hover:scale-110 transition-all shadow-sm"
                    title="移除此商品"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {/* Empty slot placeholder */}
            {Array.from({ length: maxCompareItems - compareList.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center text-gray-600 text-[11px] font-bold flex-shrink-0"
                title="可再加入商品"
              >
                +
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={clearCompare}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs flex items-center gap-1"
            title="清空對比清單"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden md:inline">清空</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCompareModalOpen(true)}
            disabled={compareList.length < 2}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-md ${
              compareList.length >= 2
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-300 hover:to-amber-400 cursor-pointer'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-75'
            }`}
          >
            <span>開始對比</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
