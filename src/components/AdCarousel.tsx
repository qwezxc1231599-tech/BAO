import { useEffect, useRef, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { products } from '../data';
import { Product } from '../types';

interface AdCarouselProps {
  onView?: (product: Product) => void;
}

export function AdCarousel({ onView }: AdCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Pick 6 random products on mount
  const randomProducts = useMemo(() => {
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  }, []);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    
    // Auto scroll functionality
    const autoScrollInterval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // If we reached the end, scroll back to the beginning
        if (Math.ceil(scrollLeft + clientWidth) >= scrollWidth) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
      }
    }, 4000); // Change slide every 4 seconds

    return () => {
      window.removeEventListener('resize', checkScroll);
      clearInterval(autoScrollInterval);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative mb-8 group">
      <div className="flex items-center gap-2 mb-4 px-1">
        <Sparkles className="w-5 h-5 text-black" />
        <h2 className="text-lg font-black text-black uppercase tracking-wider">精選好物推薦</h2>
      </div>
      
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {randomProducts.map((product) => (
          <a 
            key={product.id} 
            href={product.affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onView && onView(product)}
            className="min-w-full sm:min-w-[calc(100%-2rem)] md:min-w-[calc(50%-1rem)] lg:min-w-[calc(33.333%-1rem)] snap-center bg-white border border-gray-200 overflow-hidden relative shrink-0 block transition-all hover:shadow-lg hover:border-gray-300 group/card"
          >
            <div className="flex h-[200px]">
              {/* Product Image */}
              <div className="w-2/5 shrink-0 bg-gray-50 overflow-hidden relative">
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover/card:scale-105"
                />
                <div className="absolute top-2 left-2 bg-[#ff2121] text-white text-[10px] font-bold px-1.5 py-0.5 tracking-wider uppercase shadow-sm">
                  熱銷推薦
                </div>
              </div>
              
              {/* Content */}
              <div className="w-3/5 p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-gray-900 font-bold mb-2 line-clamp-2 text-sm sm:text-base leading-snug">
                    {product.name}
                  </h3>
                  <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                    {product.category}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lg font-bold text-[#ff2121]">
                    ${product.price.toLocaleString()}
                  </span>
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-black text-white group-hover/card:bg-gray-800 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
      
      {/* Navigation Buttons */}
      <button 
        onClick={() => scroll('left')}
        className={`absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg border border-gray-100 flex items-center justify-center text-gray-800 transition-all z-20 ${canScrollLeft ? 'opacity-100 hover:bg-white hover:scale-110' : 'opacity-0 scale-95 pointer-events-none'} hidden sm:flex`}
        aria-label="上一頁"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button 
        onClick={() => scroll('right')}
        className={`absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg border border-gray-100 flex items-center justify-center text-gray-800 transition-all z-20 ${canScrollRight ? 'opacity-100 hover:bg-white hover:scale-110' : 'opacity-0 scale-95 pointer-events-none'} hidden sm:flex`}
        aria-label="下一頁"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
