import React, { useState, useEffect } from 'react';
import { Megaphone, X, Sparkles, Flame, ArrowRight } from 'lucide-react';

interface NoticeBannerProps {
  onQuickFilterLowest?: () => void;
}

export function NoticeBanner({ onQuickFilterLowest }: NoticeBannerProps) {
  const [isVisible, setIsVisible] = useState(() => {
    return sessionStorage.getItem('dismiss_notice_banner') !== 'true';
  });

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('dismiss_notice_banner', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white text-xs py-2 px-4 shadow-sm relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-2 w-2 relative flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          
          <div className="flex items-center gap-2 truncate">
            <span className="bg-amber-500 text-black text-[10px] font-black px-1.5 py-0.2 rounded font-mono uppercase tracking-wider">
              今日好康
            </span>
            <span className="text-gray-300 truncate">
              📢 寶寶分享站已更新！支援「60天歷史價格走勢」、「商品規格價格直接比對」與「即時降價提醒通知」
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {onQuickFilterLowest && (
            <button
              type="button"
              onClick={onQuickFilterLowest}
              className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 transition-colors"
            >
              <span>查看歷史最低特惠</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white p-1 transition-colors"
            aria-label="關閉公告"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
