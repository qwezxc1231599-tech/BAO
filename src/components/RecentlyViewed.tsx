import { Clock, Trash2, ChevronRight } from 'lucide-react';
import { Product } from '../types';

interface RecentlyViewedProps {
  history: Product[];
  onClear: () => void;
  onView?: (product: Product) => void;
}

export function RecentlyViewed({ history, onClear, onView }: RecentlyViewedProps) {
  if (history.length === 0) return null;

  return (
    <div className="mt-12 mb-8 bg-white border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-black text-black uppercase tracking-wider">最近瀏覽</h2>
        </div>
        <button 
          onClick={onClear}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors font-medium"
        >
          <Trash2 className="w-4 h-4" />
          清除紀錄
        </button>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar">
        {history.map((product) => (
          <a
            key={product.id}
            href={product.affiliateLink || product.productLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onView && onView(product)}
            className="flex-shrink-0 w-36 sm:w-44 group block border border-transparent hover:border-gray-200 transition-colors p-2"
          >
            <div className="relative aspect-square w-full bg-gray-100 overflow-hidden mb-3">
              {product.imageUrl && (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              )}
            </div>
            <h3 className="text-xs text-gray-800 line-clamp-2 mb-2" title={product.name}>
              {product.name}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#ff2121]">
                ${product.price.toLocaleString()}
              </span>
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors text-gray-500">
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
