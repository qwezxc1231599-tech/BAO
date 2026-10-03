/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, Video, Globe, Share2, Facebook, Link as LinkIcon, ChevronLeft, ArrowUp, ChevronDown, X, Bell, Megaphone, Flame, Sparkles, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { products } from './data';
import { ProductCard } from './components/ProductCard';
import { AdCarousel } from './components/AdCarousel';
import { VideoGeneratorModal } from './components/VideoGeneratorModal';
import { RecentlyViewed } from './components/RecentlyViewed';
import { RecommendedProducts } from './components/RecommendedProducts';
import { PriceAlertModal } from './components/PriceAlertModal';
import { PriceAlertsListModal } from './components/PriceAlertsListModal';
import { PriceAlertRecommendations } from './components/PriceAlertRecommendations';
import { PromotionKitModal } from './components/PromotionKitModal';
import { FloatingCompareBar } from './components/FloatingCompareBar';
import { CompareModal } from './components/CompareModal';
import { NoticeBanner } from './components/NoticeBanner';
import { CouponSection } from './components/CouponSection';
import { useCompare } from './CompareContext';
import { Category, Product } from './types';
import { useCurrency, Currency } from './CurrencyContext';
import { useFavorites } from './FavoritesContext';
import { usePriceAlerts } from './PriceAlertContext';
import { useLanguage, LANGUAGES, Language } from './LanguageContext';
import { useRecentlyViewed } from './useRecentlyViewed';
import { getProductPriceHistory } from './utils/priceHistory';

const CATEGORIES: Category[] = [
  '全部',
  '我的最愛',
  '降價追蹤',
  '3C與家電',
  '服飾與鞋包',
  '美妝與保健',
  '居家生活',
  '美食與零食',
  '汽機車與戶外',
  '其他',
];

const HOT_SEARCH_TAGS = ['底片相機', '免運', '理然', '托特包', '棒球外套', '包包'];

type SortOption = 'default' | 'price_asc' | 'price_desc' | 'sales_desc' | 'lowest_ever' | 'discount_desc';

const FloatingAds = () => {
  return (
    <div className="fixed right-2 md:right-4 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-4">
      <div className="shadow-xl rounded-lg overflow-hidden bg-white w-[120px] h-[240px]">
        <iframe 
          src="https://coupa.ng/cnLT4I" 
          width="120" 
          height="240" 
          frameBorder="0" 
          scrolling="no" 
          referrerPolicy="unsafe-url"
          // @ts-ignore
          browsingtopics="true"
        />
      </div>
      <div className="shadow-xl rounded-lg overflow-hidden bg-white w-[120px] h-[240px]">
        <iframe 
          src="https://coupa.ng/cnLUHu" 
          width="120" 
          height="240" 
          frameBorder="0" 
          scrolling="no" 
          referrerPolicy="unsafe-url"
          // @ts-ignore
          browsingtopics="true"
        />
      </div>
    </div>
  );
};

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('全部');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Price alert modals state
  const [selectedAlertProduct, setSelectedAlertProduct] = useState<Product | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isAlertsListOpen, setIsAlertsListOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  
  const { isCompareModalOpen, setIsCompareModalOpen } = useCompare();
  const { currency, setCurrency, isLoading } = useCurrency();
  const { favorites } = useFavorites();
  const { hasAlert, totalAlerts } = usePriceAlerts();
  const { language, setLanguage, t, getCategoryTranslation } = useLanguage();
  const { history, recentCategories, addViewedProduct, addViewedCategory, clearHistory } = useRecentlyViewed();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by Category
    if (activeCategory === '我的最愛') {
      result = result.filter((p) => favorites.includes(p.id));
    } else if (activeCategory === '降價追蹤') {
      result = result.filter((p) => hasAlert(p.id));
    } else if (activeCategory !== '全部') {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.store.toLowerCase().includes(lowerQuery)
      );
    }

    // Filter by Price Range
    result = result.filter((p) => p.price <= maxPrice);

    // Sort
    switch (sortOption) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'sales_desc':
        result.sort((a, b) => b.salesNum - a.salesNum);
        break;
      case 'lowest_ever':
        result.sort((a, b) => {
          const aIsLow = getProductPriceHistory(a).isLowestEver ? 1 : 0;
          const bIsLow = getProductPriceHistory(b).isLowestEver ? 1 : 0;
          if (bIsLow !== aIsLow) return bIsLow - aIsLow;
          return getProductPriceHistory(b).discountFromMaxPercent - getProductPriceHistory(a).discountFromMaxPercent;
        });
        break;
      case 'discount_desc':
        result.sort((a, b) => {
          return getProductPriceHistory(b).discountFromMaxPercent - getProductPriceHistory(a).discountFromMaxPercent;
        });
        break;
      case 'default':
      default:
        // Keep original order
        break;
    }

    return result;
  }, [searchQuery, activeCategory, sortOption, maxPrice, favorites, hasAlert]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Mobile Search Modal */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex items-center p-4 border-b border-gray-200 gap-3">
            <button 
              onClick={() => setIsMobileSearchOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="flex-1 flex rounded-lg overflow-hidden bg-gray-100 border border-gray-200 focus-within:border-black">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="block w-full pl-3 pr-2 py-2.5 leading-5 bg-transparent placeholder-gray-400 text-black focus:outline-none focus:ring-0 sm:text-sm font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-2 text-gray-400 hover:text-black"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(false)}
                className="flex items-center justify-center px-4 bg-black hover:bg-gray-800 transition-colors"
              >
                <Search className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-6">
            {/* Hot Tags */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1 uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
                <span>熱門搜尋</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {HOT_SEARCH_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchQuery(tag);
                      setIsMobileSearchOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-amber-50 hover:border-amber-300 transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Categories */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">熱門分類</h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      setActiveCategory(category);
                      setIsMobileSearchOpen(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${
                      activeCategory === category
                        ? 'bg-black text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {getCategoryTranslation(category)}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Currency & Language Options */}
            <div className="pt-4 border-t border-gray-200 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">顯示幣別</h3>
                <div className="grid grid-cols-3 gap-2">
                  {(['TWD', 'USD', 'JPY'] as Currency[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        currency === c
                          ? 'bg-black text-white border-black shadow-sm'
                          : 'bg-white border-gray-200 text-gray-700'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">選擇語言</h3>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`py-2 px-3 text-xs font-bold rounded-lg border text-left transition-all ${
                        language === lang.code
                          ? 'bg-black text-white border-black shadow-sm'
                          : 'bg-white border-gray-200 text-gray-700'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Announcement Bar */}
      <NoticeBanner onQuickFilterLowest={() => setSortOption('lowest_ever')} />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-shrink-0 flex items-center gap-3">
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('全部');
                  setSortOption('default');
                }}
                className="hover:opacity-80 transition-opacity focus:outline-none flex items-center gap-2 text-left"
              >
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-black">
                    寶寶分享站
                  </h1>
                  <span className="text-[10px] text-gray-400 font-medium block -mt-1 hidden sm:block">
                    嚴選好物與限時特惠指南
                  </span>
                </div>
              </button>
            </div>

            <div className="hidden md:flex flex-1 max-w-2xl w-full flex-col gap-1.5 items-end">
              <div className="w-full flex items-center justify-end gap-3">
                <div className="flex-1 flex rounded-lg overflow-hidden bg-gray-100 border border-transparent focus-within:border-black focus-within:bg-white transition-all shadow-xs">
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-3.5 pr-2 py-2 leading-5 bg-transparent placeholder-gray-400 text-black focus:outline-none focus:ring-0 sm:text-sm font-medium"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="px-2 text-gray-400 hover:text-black transition-colors"
                      title="清除搜尋"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    className="flex items-center justify-center px-4 bg-black hover:bg-gray-800 transition-colors"
                  >
                    <Search className="h-4 w-4 text-white" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 shrink-0 relative">
                    {(['TWD', 'USD', 'JPY'] as Currency[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => setCurrency(c)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                          currency === c
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                    {isLoading && (
                      <div className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-500"></span>
                      </div>
                    )}
                  </div>

                  <div className="relative group shrink-0">
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1.5 cursor-pointer hover:bg-gray-200 transition-colors">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-medium text-gray-700 uppercase">{language.split('-')[0]}</span>
                    </div>
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 border border-gray-100">
                      <div className="py-1">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                              language === lang.code ? 'text-black font-bold' : 'text-gray-700'
                            }`}
                          >
                            {lang.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative group shrink-0">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-xs text-xs font-medium">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>分享</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 border border-gray-100">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          const url = encodeURIComponent(window.location.href);
                          window.open(`https://line.me/R/msg/text/?${url}`, '_blank');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <span className="w-5 h-5 flex items-center justify-center bg-[#00B900] text-white rounded-full text-[10px] font-bold">L</span>
                        分享至 LINE
                      </button>
                      <button
                        onClick={() => {
                          const url = encodeURIComponent(window.location.href);
                          window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Facebook className="w-5 h-5 text-[#1877F2]" />
                        分享至 Facebook
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          showToast('已成功複製連結！');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <LinkIcon className="w-5 h-5 text-gray-500" />
                        複製連結
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price Alerts List Button */}
                <button
                  onClick={() => setIsAlertsListOpen(true)}
                  className="relative flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-xs text-xs font-medium shrink-0"
                  title={t('myPriceAlerts')}
                  aria-label={t('myPriceAlerts')}
                >
                  <Bell className="w-3.5 h-3.5 text-gray-700" />
                  <span className="hidden lg:inline">{t('priceAlert')}</span>
                  {totalAlerts > 0 && (
                    <span className="flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-amber-500 rounded-full animate-pulse">
                      {totalAlerts}
                    </span>
                  )}
                </button>

                {/* Promotion Kit Button */}
                <button
                  onClick={() => setIsPromoModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-xs text-xs font-bold shrink-0"
                  title="宣傳推廣與行銷工具箱"
                >
                  <Megaphone className="w-3.5 h-3.5 text-white" />
                  <span>推廣文案包</span>
                </button>
              </div>

              {/* Hot search tags */}
              <div className="w-full flex items-center gap-1.5 text-xs overflow-x-auto scrollbar-none">
                <span className="font-bold text-amber-600 flex items-center gap-1 shrink-0 text-[11px]">
                  <Flame className="w-3 h-3 fill-current" /> 熱搜:
                </span>
                {HOT_SEARCH_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSearchQuery(tag)}
                    className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-amber-100 hover:text-amber-900 text-gray-600 transition-colors text-[11px] font-medium shrink-0"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Header Buttons */}
            <div className="flex md:hidden items-center gap-1">
              <button
                onClick={() => setIsPromoModalOpen(true)}
                className="p-2 text-amber-600 hover:text-amber-700 transition-colors"
                title="推廣文案包"
                aria-label="推廣文案包"
              >
                <Megaphone className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsAlertsListOpen(true)}
                className="relative p-2 text-gray-800 hover:text-black transition-colors"
                aria-label={t('myPriceAlerts')}
              >
                <Bell className="h-5 w-5" />
                {totalAlerts > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-3.5 h-3.5 px-0.5 text-[9px] font-bold text-white bg-amber-500 rounded-full">
                    {totalAlerts}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setIsMobileSearchOpen(true)}
                className="p-2 text-gray-800 hover:text-black transition-colors"
              >
                <Search className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Categories Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
          <div className="flex space-x-8 overflow-x-auto py-1 scrollbar-hide">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  addViewedCategory(category);
                }}
                className={`whitespace-nowrap pb-3 text-sm font-bold uppercase tracking-wide transition-all border-b-[3px] ${
                  activeCategory === category
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-black'
                }`}
              >
                {getCategoryTranslation(category)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Horizontal Ad Carousel */}
        <AdCarousel onView={addViewedProduct} />

        {/* Today's Exclusive Coupons & Promo Codes */}
        <CouponSection onCopySuccess={showToast} />

        {/* Coupang Banners */}
        <div className="flex flex-col gap-4 justify-center mb-8 w-full overflow-hidden rounded-lg">
          <a href="https://coupa.ng/cnLKK7" target="_blank" rel="noreferrer noopener" className="block mx-auto max-w-full hover:opacity-90 transition-opacity">
            <img 
              src="https://ads-partners.tw.coupang.com/banners/553?trackingCode=AF1566395&subId=&traceId=V0-301-5222e6626281f533-I553&w=728&h=90" 
              alt="Coupang Banner" 
              className="max-w-full h-auto object-contain mx-auto rounded-lg shadow-sm"
            />
          </a>
          <a href="https://coupa.ng/cnLKPR" target="_blank" rel="noreferrer noopener" className="block mx-auto max-w-full hover:opacity-90 transition-opacity">
            <img 
              src="https://ads-partners.tw.coupang.com/banners/554?trackingCode=AF1566395&subId=&traceId=V0-301-36754897c8e40c54-I554&w=728&h=90" 
              alt="Coupang Banner 2" 
              className="max-w-full h-auto object-contain mx-auto rounded-lg shadow-sm"
            />
          </a>
          <iframe 
            src="https://coupa.ng/cnLKYD" 
            width="100%" 
            height="75" 
            frameBorder="0" 
            scrolling="no" 
            referrerPolicy="unsafe-url"
            className="max-w-[728px] mx-auto rounded-lg shadow-sm border-0"
            // @ts-ignore
            browsingtopics="true"
          />
        </div>

        {/* Quick Sorting & Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-black text-gray-900 tracking-wide">
              {getCategoryTranslation(activeCategory)}
            </h2>
            <span className="text-xs font-mono font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
              {filteredAndSortedProducts.length} 件好物
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Sort Tabs */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 text-xs shadow-2xs overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setSortOption('default')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  sortOption === 'default'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                預設推薦
              </button>
              <button
                type="button"
                onClick={() => setSortOption('sales_desc')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  sortOption === 'sales_desc'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
                <span>最熱銷</span>
              </button>
              <button
                type="button"
                onClick={() => setSortOption('lowest_ever')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  sortOption === 'lowest_ever'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>歷史新低</span>
              </button>
              <button
                type="button"
                onClick={() => setSortOption('discount_desc')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  sortOption === 'discount_desc'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                最大折扣
              </button>
              <button
                type="button"
                onClick={() => setSortOption('price_asc')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  sortOption === 'price_asc'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                價格低到高
              </button>
            </div>

            <button
              onClick={() => setIsFilterPanelOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-gray-300 rounded-xl bg-white hover:bg-gray-50 text-gray-700 shadow-2xs transition-colors shrink-0"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-gray-500" />
              <span>進階篩選</span>
            </button>
          </div>
        </div>

        <RecommendedProducts 
          history={history} 
          onView={addViewedProduct} 
        />

        {/* When in Price Tracking mode, show Browsing-History Recommended section */}
        {activeCategory === '降價追蹤' && (
          <div className="mb-8">
            <PriceAlertRecommendations
              onSelectAlertProduct={(p) => {
                setSelectedAlertProduct(p);
                setIsAlertModalOpen(true);
              }}
              onViewProduct={addViewedProduct}
              excludeProductIds={filteredAndSortedProducts.map((p) => p.id)}
              title="降價追蹤推薦 · 根據瀏覽紀錄推薦"
            />
          </div>
        )}

        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onView={addViewedProduct}
                onOpenPriceAlert={(p) => {
                  setSelectedAlertProduct(p);
                  setIsAlertModalOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">{t('noProductsFound', { searchQuery: searchQuery || '' })}</h3>
            <p className="text-gray-500">{t('tryOtherTerms')}</p>
          </div>
        )}

        <RecentlyViewed 
          history={history} 
          onClear={clearHistory} 
          onView={addViewedProduct} 
        />
      </main>

      {/* Mobile Floating Action Button */}
      <button 
        onClick={() => setIsVideoModalOpen(true)}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full shadow-lg shadow-gray-200 flex items-center justify-center hover:bg-gray-800 transition-colors z-40"
      >
        <Video className="w-6 h-6" />
      </button>

      <FloatingAds />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-[5.5rem] right-6 sm:bottom-8 sm:right-8 w-12 h-12 bg-white text-gray-700 rounded-full shadow-lg shadow-gray-200/50 flex items-center justify-center hover:bg-gray-50 hover:-translate-y-1 transition-all z-50 border border-gray-100"
          aria-label="回到頂部"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}

      {/* Filter and Sort Side Drawer */}
      <AnimatePresence>
        {isFilterPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterPanelOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-[70] flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-black text-black uppercase tracking-wider">篩選與排序</h3>
                <button
                  onClick={() => setIsFilterPanelOpen(false)}
                  className="p-2 -mr-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                {/* 排序 */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">排序方式</h4>
                  <div className="space-y-3">
                    {[
                      { value: 'default', label: t('sortDefault') },
                      { value: 'sales_desc', label: t('sortSalesDesc') },
                      { value: 'lowest_ever', label: '歷史新低特惠' },
                      { value: 'discount_desc', label: '折扣幅度最大' },
                      { value: 'price_asc', label: t('sortPriceAsc') },
                      { value: 'price_desc', label: t('sortPriceDesc') }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center group cursor-pointer">
                        <div className="relative flex items-center justify-center w-5 h-5 border border-gray-300 rounded-full bg-white peer-checked:border-black peer-checked:bg-black transition-all">
                          <input
                            type="radio"
                            name="sort"
                            value={option.value}
                            checked={sortOption === option.value}
                            onChange={(e) => setSortOption(e.target.value as SortOption)}
                            className="absolute opacity-0 w-full h-full cursor-pointer peer"
                          />
                          {sortOption === option.value && (
                            <div className="w-2.5 h-2.5 rounded-full bg-black"></div>
                          )}
                        </div>
                        <span className={`ml-3 text-sm transition-colors ${sortOption === option.value ? 'font-bold text-black' : 'text-gray-600 group-hover:text-black'}`}>
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 價格篩選 */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">價格上限</h4>
                    <span className="text-sm font-bold text-[#ff2121]">${maxPrice.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 px-1">
                    <input 
                      type="range" 
                      min="100" 
                      max="10000" 
                      step="100" 
                      value={maxPrice} 
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-black"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500 font-medium">
                    <span>$100</span>
                    <span>$10,000+</span>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-4">
                <button
                  onClick={() => {
                    setSortOption('default');
                    setMaxPrice(10000);
                    showToast('已重設篩選條件');
                  }}
                  className="flex-1 py-3 px-4 bg-white border border-gray-300 text-gray-700 text-sm font-bold uppercase tracking-wider hover:bg-gray-50 hover:text-black transition-colors text-center"
                >
                  清除重設
                </button>
                <button
                  onClick={() => setIsFilterPanelOpen(false)}
                  className="flex-1 py-3 px-4 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors text-center"
                >
                  套用結果
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Video Generator Modal */}
      <VideoGeneratorModal 
        isOpen={isVideoModalOpen} 
        onClose={() => setIsVideoModalOpen(false)} 
      />

      {/* Price Alert Setting Modal */}
      <PriceAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        product={selectedAlertProduct}
        onAlertSet={showToast}
      />

      {/* Tracked Price Alerts List Modal */}
      <PriceAlertsListModal
        isOpen={isAlertsListOpen}
        onClose={() => setIsAlertsListOpen(false)}
        onEditAlert={(p) => {
          setSelectedAlertProduct(p);
          setIsAlertModalOpen(true);
        }}
        onViewProduct={addViewedProduct}
      />

      {/* Promotion Kit Modal */}
      <PromotionKitModal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
        onCopySuccess={showToast}
      />

      {/* Floating Product Comparison Bar */}
      <FloatingCompareBar />

      {/* Product Comparison Modal */}
      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onOpenPriceAlert={(p) => {
          setSelectedAlertProduct(p);
          setIsAlertModalOpen(true);
        }}
        onViewProduct={addViewedProduct}
      />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-gray-900/90 text-white px-6 py-3 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
