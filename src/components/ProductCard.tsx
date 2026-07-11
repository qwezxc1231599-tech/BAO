import { useState } from 'react';
import { ExternalLink, ShoppingBag, TrendingUp, Store, Image as ImageIcon, Star, Copy, Check } from 'lucide-react';
import { Product } from '../types';
import { useCurrency } from '../CurrencyContext';
import { useFavorites } from '../FavoritesContext';
import { useLanguage } from '../LanguageContext';

interface ProductCardProps {
  product: Product;
  onView?: (product: Product) => void;
}

export function ProductCard({ product, onView }: ProductCardProps) {
  const { convertPrice } = useCurrency();
  const { value, symbol } = convertPrice(product.price);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t, getCategoryTranslation } = useLanguage();
  const [isCopied, setIsCopied] = useState(false);

  const favorite = isFavorite(product.id);

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
      <div className="flex flex-col bg-white border border-transparent overflow-hidden hover:border-gray-200 hover:shadow-lg transition-all duration-300 relative group">
        <button 
          onClick={() => toggleFavorite(product.id)}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 shadow-sm hover:bg-white transition-colors"
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star 
            className={`w-5 h-5 ${favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} 
          />
        </button>
        <div className="relative aspect-[3/4] w-full bg-gray-100 overflow-hidden">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
              <span className="text-xs font-medium tracking-wider">{getCategoryTranslation(product.category)}</span>
            </div>
          )}
        </div>

        <div className="p-3 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2 gap-2">
            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold bg-black text-white uppercase tracking-wider">
              {getCategoryTranslation(product.category)}
            </span>
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

          <div className="flex items-baseline mb-3">
            <span className="text-sm font-bold text-[#ff2121] mr-1">{symbol}</span>
            <span className="text-lg font-bold text-[#ff2121]">{value.toLocaleString()}</span>
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

