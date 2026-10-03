import { useState, useMemo } from 'react';
import { ExternalLink, ShoppingBag, TrendingUp, Store, Image as ImageIcon, Star, Copy, Check, Bell, LineChart, ChevronDown, Flame, Zap, Crown, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { useCurrency } from '../CurrencyContext';
import { useFavorites } from '../FavoritesContext';
import { usePriceAlerts } from '../PriceAlertContext';
import { useLanguage } from '../LanguageContext';
import { useCompare } from '../CompareContext';
import { PriceTrendChart } from './PriceTrendChart';
import { getProductPriceHistory } from '../utils/priceHistory';

interface ProductCardProps {
  product: Product;
  onView?: (product: Product) => void;
  onOpenPriceAlert?: (product: Product) => void;
}

export function ProductCard({ product, onView, onOpenPriceAlert }: ProductCardProps) {
  const { convertPrice } = useCurrency();
  const { value, symbol } = convertPrice(product.price);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getAlert } = usePriceAlerts();
  const { isInCompare, toggleCompare } = useCompare();
  const { t, getCategoryTranslation } = useLanguage();
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'image' | 'trend'>('image');

  const favorite = isFavorite(product.id);
  const alert = getAlert(product.id);
  const isCompared = isInCompare(product.id);
  const [imgError, setImgError] = useState(false);
  const historySummary = useMemo(() => getProductPriceHistory(product), [product]);

  // Determine 'Hot Deal' or 'Limited Time' badge overlay
  const dealBadge = useMemo(() => {
    // 1. All-time low with significant price drop
    if (historySummary.isLowestEver && historySummary.discountFromMaxPercent >= 10) {
      return {
        type: 'limited',
        label: `${t('limitedTime')} -${historySummary.discountFromMaxPercent}%`,
        icon: 'flame',
        badgeClass: 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white shadow-lg ring-1 ring-white/30',
      };
    }

    // 2. Significant price drop (>= 12% off 60-day high)
    if (historySummary.discountFromMaxPercent >= 12) {
      return {
        type: 'drop',
        label: `${t('significantDrop')} -${historySummary.discountFromMaxPercent}%`,
        icon: 'flame',
        badgeClass: 'bg-gradient-to-r from-rose-600 to-orange-500 text-white shadow-md ring-1 ring-white/20',
      };
    }

    // 3. High-volume trending or hot deal
    if (product.salesNum >= 1000) {
      const isMega = product.salesNum >= 5000;
      return {
        type: 'trending',
        label: isMega ? `${t('hotDeal')} · ${product.salesStr}` : `${t('trendingBadge')} · ${product.salesStr}`,
        icon: isMega ? 'crown' : 'zap',
        badgeClass: isMega
          ? 'bg-gradient-to-r from-amber-500 via-rose-600 to-red-600 text-white shadow-md ring-1 ring-white/20'
          : 'bg-gray-900/95 text-amber-300 shadow-md ring-1 ring-amber-400/40 backdrop-blur-md',
      };
    }

    // 4. Any historical lowest price
    if (historySummary.isLowestEver) {
      return {
        type: 'lowest',
        label: t('allTimeLowBadge'),
        icon: 'sparkles',
        badgeClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md ring-1 ring-white/20',
      };
    }

    return null;
  }, [historySummary, product.salesNum, product.salesStr, t]);

  const handleCopyLink = () => {
    if (onView) onView(product);
    const link = product.affiliateLink || product.productLink;
    navigator.clipboard.writeText(link).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <>
      <div className={`flex flex-col bg-white border overflow-hidden transition-all duration-300 relative group ${isCompared ? 'border-black ring-1 ring-black shadow-md' : 'border-transparent hover:border-gray-200 hover:shadow-lg'}`}>
        {/* Top Left View Switcher Tabs */}
        <div className="absolute top-3 left-3 z-20 flex items-center bg-white/95 backdrop-blur-md rounded-lg p-0.5 shadow-sm border border-gray-200/80 text-[11px]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab('image');
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
              activeTab === 'image'
                ? 'bg-black text-white font-bold shadow-sm'
                : 'text-gray-500 hover:text-black hover:bg-gray-100'
            }`}
            title="檢視商品圖片"
          >
            <ImageIcon className="w-3 h-3" />
            <span>圖片</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab('trend');
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
              activeTab === 'trend'
                ? 'bg-black text-white font-bold shadow-sm'
                : 'text-gray-500 hover:text-black hover:bg-gray-100'
            }`}
            title="檢視歷史價格走勢圖"
          >
            <LineChart className="w-3 h-3" />
            <span>走勢</span>
            {historySummary.isLowestEver && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            )}
          </button>
        </div>

        {/* Top Right Action Icons */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
          <button 
            onClick={() => toggleFavorite(product.id)}
            className="p-2 rounded-full bg-white/90 shadow-sm hover:bg-white transition-colors"
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star 
              className={`w-4 h-4 ${favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} 
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenPriceAlert) onOpenPriceAlert(product);
            }}
            className={`p-2 rounded-full shadow-sm transition-all ${
              alert
                ? 'bg-amber-500 text-white hover:bg-amber-600 ring-2 ring-amber-300/50'
                : 'bg-white/90 text-gray-400 hover:text-black hover:bg-white'
            }`}
            aria-label={alert ? t('editPriceAlert') : t('setPriceAlert')}
            title={alert ? `${t('priceAlert')}: NT$ ${alert.targetPrice}` : t('setPriceAlert')}
          >
            <Bell className={`w-4 h-4 ${alert ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Media Container: Image vs Price Trend Chart */}
        <div className="relative aspect-[3/4] w-full bg-gray-100 overflow-hidden">
          {activeTab === 'image' ? (
            <>
              {product.imageUrl && !imgError ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                  <ImageIcon className="w-10 h-10 mb-2 opacity-40 text-gray-500" />
                  <span className="text-xs font-bold tracking-wider text-gray-600">{getCategoryTranslation(product.category)}</span>
                  <span className="text-[10px] text-gray-400 mt-1 max-w-[140px] truncate">{product.store}</span>
                </div>
              )}

              {/* Hot Deal / Limited Time Badge Overlay */}
              {dealBadge && (
                <div className={`absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${dealBadge.badgeClass} transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg pointer-events-none`}>
                  {dealBadge.icon === 'flame' && (
                    <Flame className="w-3.5 h-3.5 fill-current text-yellow-300 animate-pulse flex-shrink-0" />
                  )}
                  {dealBadge.icon === 'zap' && (
                    <Zap className="w-3.5 h-3.5 fill-current text-yellow-300 flex-shrink-0" />
                  )}
                  {dealBadge.icon === 'crown' && (
                    <Crown className="w-3.5 h-3.5 fill-current text-amber-200 flex-shrink-0" />
                  )}
                  {dealBadge.icon === 'sparkles' && (
                    <Sparkles className="w-3.5 h-3.5 text-emerald-200 flex-shrink-0" />
                  )}
                  <span className="truncate max-w-[170px] drop-shadow-sm">{dealBadge.label}</span>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full p-3 pt-12 flex flex-col justify-between bg-gradient-to-b from-gray-50 to-white">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                    60天歷史價格
                  </span>
                  {historySummary.isLowestEver ? (
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                      🔥 現為歷史最低
                    </span>
                  ) : (
                    <span className="text-[9px] text-gray-500 font-medium">
                      省 NT${historySummary.savingsFromMax}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline justify-between text-xs mb-1">
                  <span className="text-emerald-700 font-bold">
                    低: NT${historySummary.minPrice}
                  </span>
                  <span className="text-gray-400 line-through">
                    高: NT${historySummary.maxPrice}
                  </span>
                </div>
              </div>

              {/* Recharts interactive area */}
              <div className="flex-1 w-full my-auto flex items-center justify-center min-h-[110px]">
                <PriceTrendChart
                  product={product}
                  targetPrice={alert?.targetPrice}
                  height={130}
                  showDetails={false}
                />
              </div>

              {/* Fast Alert CTA */}
              <div className="mt-1 pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                  {alert ? `目標 NT$${alert.targetPrice}` : `建議 NT$${historySummary.suggestedAlertPrice}`}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenPriceAlert) onOpenPriceAlert(product);
                  }}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded transition-colors flex-shrink-0"
                >
                  <Bell className="w-2.5 h-2.5 fill-current" />
                  <span>{alert ? '修改提醒' : '設目標價'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-2 gap-2">
            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold bg-black text-white uppercase tracking-wider">
              {getCategoryTranslation(product.category)}
            </span>

            {/* Compare Checkbox */}
            <label
              className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] text-gray-500 hover:text-black select-none transition-colors group/compare"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={isCompared}
                onChange={() => toggleCompare(product)}
                className="w-3.5 h-3.5 rounded border-gray-300 text-black focus:ring-0 accent-black cursor-pointer"
              />
              <span className={`text-[11px] transition-colors ${isCompared ? 'text-black font-bold' : 'group-hover/compare:text-gray-900'}`}>
                {isCompared ? '已加入對比' : '加入對比'}
              </span>
            </label>
          </div>
          
          <h3 className="text-xs text-gray-800 line-clamp-2 mb-2 flex-1" title={product.name}>
            {product.name}
          </h3>
          
          <div className="space-y-1 mb-3">
            <div className="flex items-center text-[11px] text-gray-500 line-clamp-1" title={product.store}>
              <Store className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{product.store}</span>
            </div>
            <div className="flex items-center text-[11px] text-gray-500">
              <TrendingUp className="w-3 h-3 mr-1 flex-shrink-0" />
              {t('salesStr')} {product.salesStr}
            </div>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline">
              <span className="text-sm font-bold text-[#ff2121] mr-1">{symbol}</span>
              <span className="text-lg font-bold text-[#ff2121]">{value.toLocaleString()}</span>
            </div>
            {alert && (
              <div className="flex items-center">
                {product.price <= alert.targetPrice ? (
                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    🎉 {t('priceReached')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                    <Bell className="w-2.5 h-2.5 fill-current" />
                    <span>NT${alert.targetPrice}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Quick Tab Toggle Link */}
          <div className="flex items-center justify-between text-[11px] mb-3 text-gray-500">
            <button
              type="button"
              onClick={() => setActiveTab((prev) => (prev === 'image' ? 'trend' : 'image'))}
              className="inline-flex items-center gap-1 hover:text-black transition-colors font-medium text-gray-600"
            >
              <LineChart className="w-3 h-3 text-amber-600" />
              <span>{activeTab === 'image' ? '查看價格走勢' : '切換回商品圖片'}</span>
            </button>
            {historySummary.isLowestEver ? (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                歷史最低
              </span>
            ) : (
              <span className="text-[10px] text-gray-400">
                低 NT${historySummary.minPrice}
              </span>
            )}
          </div>

          <div className="mt-auto space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
            <a
              href={product.affiliateLink || product.productLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onView && onView(product)}
              className="flex items-center justify-center w-full px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-black hover:bg-gray-800 transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5 mr-2" />
              {t('clickLink')}
            </a>
            <button
              onClick={handleCopyLink}
              className={`flex items-center justify-center w-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                isCopied 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-white text-black border border-black hover:bg-gray-50'
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {t('copySuccess')}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  {t('copyAffiliate')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {isCopied && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300">
          <div className="bg-green-500/20 p-1 rounded-full">
            <Check className="w-4 h-4 text-green-400" />
          </div>
          <span className="text-sm font-medium">{t('copiedToast')}</span>
        </div>
      )}
    </>
  );
}

