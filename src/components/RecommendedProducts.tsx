import { Sparkles, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { products } from '../data';

interface RecommendedProductsProps {
  history: Product[];
  onView?: (product: Product) => void;
}

export function RecommendedProducts({ history, onView }: RecommendedProductsProps) {
  if (history.length === 0) return null;

  // Simple recommendation logic:
  // 1. Get categories from history
  // 2. Find products in those categories that are not in history
  // 3. Take up to 4 products
  const historyIds = new Set(history.map(p => p.id));
  const historyCategories = new Set(history.map(p => p.category));
  
  const recommended = products
    .filter(p => historyCategories.has(p.category) && !historyIds.has(p.id))
    .slice(0, 4);

  if (recommended.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4 px-1">
        <Sparkles className="w-5 h-5 text-black" />
        <h2 className="text-lg font-black text-black uppercase tracking-wider">為您精選</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommended.map((product) => (
          <a
            key={product.id}
            href={product.affiliateLink || product.productLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onView && onView(product)}
            className="group block border border-transparent hover:border-gray-200 transition-colors bg-white hover:shadow-md"
          >
            <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
              {product.imageUrl && (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              )}
            </div>
            <div className="p-3">
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
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
