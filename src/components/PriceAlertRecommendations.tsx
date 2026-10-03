import React, { useState, useMemo } from 'react';
import { Sparkles, Bell, ShoppingBag, TrendingDown, Flame, ArrowRight, Store, ExternalLink } from 'lucide-react';
import { Product } from '../types';
import { products } from '../data';
import { useRecentlyViewed } from '../useRecentlyViewed';
import { usePriceAlerts } from '../PriceAlertContext';
import { useCurrency } from '../CurrencyContext';
import { useLanguage } from '../LanguageContext';
import { useCompare } from '../CompareContext';
import { getProductPriceHistory } from '../utils/priceHistory';

interface PriceAlertRecommendationsProps {
  onSelectAlertProduct: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
  excludeProductIds?: string[];
  currentProductCategory?: string;
  title?: string;
}

export function PriceAlertRecommendations({
  onSelectAlertProduct,
  onViewProduct,
  excludeProductIds = [],
  currentProductCategory,
  title,
}: PriceAlertRecommendationsProps) {
  const { history, recentCategories } = useRecentlyViewed();
  const { alertList } = usePriceAlerts();
  const { convertPrice } = useCurrency();
  const { t, getCategoryTranslation } = useLanguage();
  const { isInCompare, toggleCompare } = useCompare();

  // Determine browsed categories list
  const availableCategories = useMemo(() => {
    const set = new Set<string>();

    if (currentProductCategory) {
      set.add(currentProductCategory);
    }

    recentCategories.forEach((c) => {
      if (c && !['全部', '我的最愛', '降價追蹤'].includes(c)) set.add(c);
    });

    history.forEach((p) => {
      if (p.category && !['全部', '我的最愛', '降價追蹤'].includes(p.category)) set.add(p.category);
    });

    alertList.forEach((a) => {
      const match = products.find((p) => p.id === a.productId);
      if (match?.category && !['全部', '我的最愛', '降價追蹤'].includes(match.category)) {
        set.add(match.category);
      }
    });

    // Fallback if user is a brand new visitor
    if (set.size === 0) {
      set.add('3C與家電');
      set.add('美妝與保健');
      set.add('服飾與鞋包');
    }

    return Array.from(set);
  }, [currentProductCategory, recentCategories, history, alertList]);

  const [activeCategory, setActiveCategory] = useState<string>(
    currentProductCategory || availableCategories[0] || '3C與家電'
  );

  // Sync if available categories update and activeCategory isn't in it
  React.useEffect(() => {
    if (currentProductCategory) {
      setActiveCategory(currentProductCategory);
    } else if (!availableCategories.includes(activeCategory) && availableCategories.length > 0) {
      setActiveCategory(availableCategories[0]);
    }
  }, [currentProductCategory, availableCategories, activeCategory]);

  // Recommended products in the selected category
  const recommendedDeals = useMemo(() => {
    const list = products.filter((p) => {
      if (p.category !== activeCategory) return false;
      if (excludeProductIds.includes(p.id)) return false;
      return true;
    });

    // Sort by best discount & sales volume
    return list
      .map((p) => {
        const historySummary = getProductPriceHistory(p);
        const discountScore = historySummary.discountFromMaxPercent * 2;
        const salesScore = Math.min(p.salesNum / 100, 50);
        const lowestBonus = historySummary.isLowestEver ? 30 : 0;
        return {
          product: p,
          historySummary,
          score: discountScore + salesScore + lowestBonus,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((item) => ({ ...item.product, historySummary: item.historySummary }));
  }, [activeCategory, excludeProductIds]);

  if (recommendedDeals.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-amber-50/60 via-orange-50/40 to-white rounded-2xl border border-amber-200/80 p-4 sm:p-5 mt-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
              <span>{title || '根據瀏覽紀錄推薦'}</span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full uppercase">
                熱門降價
              </span>
            </h3>
            <p className="text-[11px] text-gray-500">
              根據您關注的「{getCategoryTranslation(activeCategory)}」類別，為您挑選降幅最大與高銷量商品
            </p>
          </div>
        </div>

        {/* Category Switcher Tabs if multiple browsed categories */}
        {availableCategories.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {availableCategories.slice(0, 4).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-white/80 text-gray-600 hover:bg-white hover:text-black border border-gray-200'
                }`}
              >
                {getCategoryTranslation(cat)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {recommendedDeals.map((product) => {
          const { value, symbol } = convertPrice(product.price);
          const historySummary = product.historySummary;
          const isCompared = isInCompare(product.id);

          return (
            <div
              key={product.id}
              className={`bg-white rounded-xl border p-3 flex flex-col justify-between transition-all hover:shadow-md relative group ${
                isCompared ? 'border-black ring-1 ring-black' : 'border-gray-200 hover:border-amber-400'
              }`}
            >
              <div>
                {/* Image and Badges */}
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 mb-2.5">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      {product.category}
                    </div>
                  )}

                  {/* Deal Badge Overlay */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {historySummary.isLowestEver ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded shadow-sm">
                        <Flame className="w-3 h-3 fill-current animate-pulse" />
                        <span>歷史最低</span>
                      </span>
                    ) : historySummary.discountFromMaxPercent >= 10 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black bg-orange-600 text-white px-2 py-0.5 rounded shadow-sm">
                        <TrendingDown className="w-3 h-3" />
                        <span>省 {historySummary.discountFromMaxPercent}%</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Add to compare toggle */}
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompare(product);
                      }}
                      className={`p-1.5 rounded-full backdrop-blur-md shadow-sm transition-all ${
                        isCompared
                          ? 'bg-black text-white'
                          : 'bg-white/90 text-gray-600 hover:bg-white hover:text-black'
                      }`}
                      title={isCompared ? '取消對比' : '加入對比'}
                    >
                      <span className="text-[10px] font-bold px-0.5">
                        {isCompared ? '✓ 對比中' : '+ 對比'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h4
                  className="text-xs font-bold text-gray-900 line-clamp-2 mb-1.5 min-h-[32px] group-hover:text-amber-700 transition-colors"
                  title={product.name}
                >
                  {product.name}
                </h4>

                {/* Store and Sales */}
                <div className="flex items-center justify-between text-[11px] text-gray-500 mb-2">
                  <span className="truncate max-w-[100px] flex items-center gap-1">
                    <Store className="w-3 h-3 flex-shrink-0" />
                    <span>{product.store}</span>
                  </span>
                  <span>已售 {product.salesStr}</span>
                </div>
              </div>

              {/* Price and CTA */}
              <div className="pt-2 border-t border-gray-100 mt-1">
                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-sm font-black text-[#ff2121]">
                    {symbol} {value.toLocaleString()}
                  </div>
                  {historySummary.savingsFromMax > 0 && (
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1 rounded">
                      省 NT${historySummary.savingsFromMax}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSelectAlertProduct(product)}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold rounded-lg transition-colors border border-amber-200"
                    title="設定降價提醒"
                  >
                    <Bell className="w-3 h-3 text-amber-600" />
                    <span>設提醒</span>
                  </button>

                  <a
                    href={product.affiliateLink || product.productLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onViewProduct && onViewProduct(product)}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 bg-black hover:bg-gray-800 text-white text-[11px] font-bold rounded-lg transition-colors"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>去購買</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
