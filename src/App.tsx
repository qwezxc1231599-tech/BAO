/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, Video, Globe, Share2, Facebook, Link as LinkIcon, ChevronLeft, ArrowUp, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { products } from './data';
import { ProductCard } from './components/ProductCard';
import { AdCarousel } from './components/AdCarousel';
import { VideoGeneratorModal } from './components/VideoGeneratorModal';
import { RecentlyViewed } from './components/RecentlyViewed';
import { RecommendedProducts } from './components/RecommendedProducts';
import { Category } from './types';
import { useCurrency, Currency } from './CurrencyContext';
import { useFavorites } from './FavoritesContext';
import { useLanguage, LANGUAGES, Language } from './LanguageContext';
import { useRecentlyViewed } from './useRecentlyViewed';

const CATEGORIES: Category[] = [
  '全部',
  '我的最愛',
  '3C與家電',
  '服飾與鞋包',
  '美妝與保健',
  '居家生活',
  '美食與零食',
  '汽機車與戶外',
  '其他',
];

type SortOption = 'default' | 'price_asc' | 'price_desc' | 'sales_desc';

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
  
  const { currency, setCurrency, isLoading } = useCurrency();
  const { favorites } = useFavorites();
  const { language, setLanguage, t, getCategoryTranslation } = useLanguage();
  const { history, addViewedProduct, clearHistory } = useRecentlyViewed();

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
      case 'default':
      default:
        // Keep original order
        break;
    }

    return result;
  }, [searchQuery, activeCategory, sortOption, maxPrice, favorites]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Mobile Search Modal */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex flex-col h-full">
            <div className="flex items-center p-4 border-b border-gray-200 gap-3">
              <button 
                onClick={() => setIsMobileSearchOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <div className="flex-1 flex rounded-sm overflow-hidden bg-[#f5f5f5]">
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="block w-full pl-4 pr-3 py-2.5 leading-5 bg-transparent placeholder-gray-500 text-black focus:outline-none focus:ring-0 sm:text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="flex items-center justify-center px-5 bg-black hover:bg-gray-800 transition-colors"
                >
                  <Search className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
               <div className="mb-4">
                 <h3 className="text-sm font-bold text-gray-700 mb-3">熱門分類</h3>
                 <div className="flex flex-wrap gap-2">
                   {CATEGORIES.map(category => (
                     <button
                       key={category}
                       onClick={() => {
                         setActiveCategory(category);
                         setIsMobileSearchOpen(false);
                       }}
                       className={`px-4 py-2 rounded-sm text-sm font-bold uppercase transition-colors ${
                         activeCategory === category
                           ? 'bg-black text-white border border-black'
                           : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-black'
                       }`}
                     >
                       {getCategoryTranslation(category)}
                     </button>
                   ))}
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-shrink-0 flex items-center gap-3">
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('全部');
                  setSortOption('default');
                }}
                className="hover:opacity-80 transition-opacity focus:outline-none flex items-center"
              >
                <h1 className="text-3xl font-black tracking-widest text-black uppercase">
                  FASHION
                </h1>
              </button>
            </div>
            <div className="hidden md:flex flex-1 max-w-2xl w-full items-center justify-end gap-6">
              <div className="flex-1 flex rounded-sm overflow-hidden bg-[#f5f5f5] border border-transparent focus-within:border-gray-300 transition-colors">
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-4 pr-3 py-2.5 leading-5 bg-transparent placeholder-gray-500 text-black focus:outline-none focus:ring-0 sm:text-sm font-medium"
                />
                <button
                  type="button"
                  className="flex items-center justify-center px-6 bg-black hover:bg-gray-800 transition-colors"
                >
                  <Search className="h-5 w-5 text-white" />
                </button>
              </div>
              
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 shrink-0 relative">
                  {(['TWD', 'USD', 'JPY'] as Currency[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
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
                <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm text-sm font-medium">
                  <Share2 className="w-4 h-4" />
                  分享
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
                        setIsFilterPanelOpen(false); // also hide if needed, but this is for share dropdown
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <LinkIcon className="w-5 h-5 text-gray-500" />
                      複製連結
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsVideoModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-sm hover:bg-gray-800 transition-colors shadow-sm text-sm font-bold uppercase shrink-0"
              >
                <Video className="w-4 h-4" />
                {t('generateVideo')}
              </button>
            </div>

            {/* Mobile Search Button */}
            <div className="flex md:hidden items-center gap-2">
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
                onClick={() => setActiveCategory(category)}
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

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-lg font-medium text-gray-900">
            {getCategoryTranslation(activeCategory)} ({filteredAndSortedProducts.length})
          </h2>
          <div>
            <button
              onClick={() => setIsFilterPanelOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-base border border-gray-300 sm:text-sm rounded-sm shadow-sm bg-white cursor-pointer hover:bg-gray-50 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-700">篩選與排序</span>
            </button>
          </div>
        </div>

        <RecommendedProducts 
          history={history} 
          onView={addViewedProduct} 
        />

        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} onView={addViewedProduct} />
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
                      { value: 'price_asc', label: t('sortPriceAsc') },
                      { value: 'price_desc', label: t('sortPriceDesc') },
                      { value: 'sales_desc', label: t('sortSalesDesc') }
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
