import React, { useState, useMemo } from 'react';
import {
  X,
  Megaphone,
  Copy,
  Check,
  Share2,
  Sparkles,
  Flame,
  MessageCircle,
  Send,
  Video,
  ExternalLink,
  Tag,
  TrendingDown,
  Clock,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { products } from '../data';
import { getProductPriceHistory } from '../utils/priceHistory';

interface PromotionKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopySuccess?: (msg: string) => void;
}

type PromoTab = 'social_templates' | 'product_promos' | 'marketing_playbook';

export function PromotionKitModal({ isOpen, onClose, onCopySuccess }: PromotionKitModalProps) {
  const [activeTab, setActiveTab] = useState<PromoTab>('social_templates');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://selected-goods.web.app';

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      if (onCopySuccess) {
        onCopySuccess(`已複製 ${label} 文案！`);
      }
      setTimeout(() => setCopiedKey(null), 2500);
    });
  };

  // Selected product for product-specific promo generator
  const currentProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0];
  }, [selectedProductId]);

  const productSummary = useMemo(() => {
    if (!currentProduct) return null;
    return getProductPriceHistory(currentProduct);
  }, [currentProduct]);

  // General Social Media Promotional Templates
  const socialTemplates = useMemo(() => [
    {
      id: 'threads_ig',
      platform: 'Threads / Instagram',
      icon: '🔥',
      badge: '高互動引流',
      title: '痛點共鳴 + 神器推薦型',
      copy: `網購每次都怕買貴？我最近發現這個超強的「精選好物避坑神器」🛒✨

平常在各大電商比價比到眼花，這個網站直接幫你：
📉 60天歷史價格走勢圖：一秒識破假促銷，是不是真降價一清二楚！
🔔 降價目標提醒：設定你想買的預算，跌破目標立刻提醒～
🔥 即時標註「歷史最低價」與「限時下殺」，省荷包超有感！
🌍 即時匯率換算 + 一鍵快速下單

再也不用擔心剛下單隔天就降價了😭
真心建議大家收藏起來當購物常備工具包 👇
🔗 ${siteUrl}

#省錢攻略 #網購比價 #購物日常 #歷史價格 #避坑好物 #好物推薦`,
    },
    {
      id: 'line_share',
      platform: 'LINE 好友 / 團購家族群',
      icon: '💬',
      badge: '高點擊轉換',
      title: '親切短訊好康分享型',
      copy: `嗨大家！分享一個超實用的省錢購物好工具 🎁
這個網站整理了全網爆款精選好物，最厲害的是有「歷史價格走勢」跟「降價通知」！

👉 點進去就能看每樣東西過去60天有沒有買貴
👉 現省幾百塊、是不是歷史新低一眼看懂
👉 看到想買的還能直接設目標價提醒 🔔

朋友都在用了，買東西前先查一下不踩雷：
👇 點這裡直接逛
${siteUrl}`,
    },
    {
      id: 'dcard_ptt',
      platform: 'Dcard / PTT 購物板・省錢板',
      icon: '📝',
      badge: '深度真實種草',
      title: '真實生活實測評測型',
      copy: `【心得】發現一個超神的精選購物避坑站！歷史價格圖 + 降價追蹤超好用

每次各大電商造節促銷，到底是真的下殺還是先漲後折？
最近挖到這個「精選好物整理站」，介面乾淨沒有煩人彈窗，重點功能很打中我：

1. 走勢圖秒切換：點卡片上的「價格走勢」，Recharts 動態曲線圖直接告訴你近60天高低點。
2. 降價目標通知：想買又覺得貴？直接按鈴鐺設「-15%」或自訂目標價，達標直接亮徽章。
3. 多幣別即時換算：買海外或不同貨幣超方便。
4. 爆款嚴選：衣服、3C、美妝、居家都有分類整理，不用大海撈針。

推薦給跟我一樣買東西要精打細算的小資族們，當常備書籤很值得！
傳送門：${siteUrl}`,
    },
    {
      id: 'tiktok_reels',
      platform: 'TikTok / IG Reels 短影音口播',
      icon: '🎬',
      badge: '短影音爆款腳本',
      title: '30秒高轉化黃金口播腳本',
      copy: `【畫面：手機螢幕錄影展示網站，手指點擊「價格走勢」動畫】
口播（節奏明快）：
「你有沒有過剛買完東西，隔天就大特價的痛？！千萬別再當冤大頭了！
今天教你一招：打開這個網站，直接輸入你想找的爆款。
點一下『走勢』，60天的價格歷史清清楚楚，是真下殺還是假促銷一眼看穿！
看到喜歡的但想等更便宜？按右上角鈴鐺，設定你的目標預算，降價立馬提醒你！
點個人主頁連結/下方留言區，立馬收藏這個避坑神站！」`,
    },
  ], [siteUrl]);

  // Dynamic Product Specific Promo Copy
  const productPromoCopy = useMemo(() => {
    if (!currentProduct || !productSummary) return '';
    const discountText = productSummary.discountFromMaxPercent > 0
      ? `現省 ${productSummary.discountFromMaxPercent}%（省下 NT$${productSummary.savingsFromMax}）`
      : '超值特惠中';
    const lowestText = productSummary.isLowestEver ? '🔥 目前正是 60 天歷史最低價！入手最佳時機！' : `📉 歷史最低價曾達 NT$${productSummary.minPrice}`;
    const productLink = currentProduct.affiliateLink || currentProduct.productLink;

    return `【超值爆款降價快報 🚨】
👉 ${currentProduct.name}

💰 優惠價：NT$ ${currentProduct.price.toLocaleString()}
📊 價格狀況：${discountText}
${lowestText}
🏢 來源門市：${currentProduct.store}
🌟 銷量保證：已售出 ${currentProduct.salesStr}

歷史價格透明公開，不用擔心買貴！
立即點擊查看詳情與價格曲線 👇
${productLink}

更多超值好物即時監控：${siteUrl}`;
  }, [currentProduct, productSummary, siteUrl]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <span>宣傳推廣與行銷工具箱</span>
                  <span className="text-[10px] font-bold bg-amber-500 text-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    PROMO KIT
                  </span>
                </h2>
                <p className="text-xs text-gray-300">
                  一鍵生成多平台爆款文案、熱門單品帶貨帖與社群引流策略
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50 px-4 sm:px-6 pt-3 gap-2 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('social_templates')}
              className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'social_templates'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Share2 className="w-4 h-4 text-amber-500" />
              <span>多平台社群文案庫</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('product_promos')}
              className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'product_promos'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Flame className="w-4 h-4 text-red-500" />
              <span>單品爆款帶貨文案</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('marketing_playbook')}
              className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'marketing_playbook'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>引流與增長策略</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* TAB 1: SOCIAL MEDIA TEMPLATES */}
            {activeTab === 'social_templates' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>這些文案已針對各大演算法進行排版與 Hook 設計，點擊即可複製發布！</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        const url = encodeURIComponent(siteUrl);
                        window.open(`https://line.me/R/msg/text/?${url}`, '_blank');
                      }}
                      className="px-2.5 py-1 bg-[#00B900] text-white rounded text-[11px] font-bold hover:opacity-90 flex items-center gap-1"
                    >
                      LINE 分享
                    </button>
                    <button
                      onClick={() => {
                        const url = encodeURIComponent(siteUrl);
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                      }}
                      className="px-2.5 py-1 bg-[#1877F2] text-white rounded text-[11px] font-bold hover:opacity-90 flex items-center gap-1"
                    >
                      FB 分享
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {socialTemplates.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-all shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{item.icon}</span>
                          <span className="font-bold text-xs sm:text-sm text-gray-900">
                            {item.platform}
                          </span>
                          <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {item.badge}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.copy, item.id, item.platform)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            copiedKey === item.id
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-black text-white hover:bg-gray-800'
                          }`}
                        >
                          {copiedKey === item.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>已複製！</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>複製文案</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="text-[11px] text-gray-500 font-medium mb-2">
                        {item.title}
                      </div>

                      <pre className="p-3 bg-gray-50 rounded-lg text-xs text-gray-700 font-sans whitespace-pre-wrap leading-relaxed border border-gray-100 select-all">
                        {item.copy}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: PRODUCT-SPECIFIC PROMO GENERATOR */}
            {activeTab === 'product_promos' && (
              <div className="space-y-5">
                <div className="p-4 bg-gradient-to-r from-red-50 to-amber-50 rounded-xl border border-red-100">
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                    選擇要推廣的熱門爆款商品：
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {products.slice(0, 30).map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.category}] {p.name.slice(0, 35)}... (NT${p.price} · 銷量 {p.salesStr})
                      </option>
                    ))}
                  </select>
                </div>

                {currentProduct && productSummary && (
                  <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-4">
                    {/* Selected Product Preview */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                        {currentProduct.imageUrl ? (
                          <img
                            src={currentProduct.imageUrl}
                            alt={currentProduct.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Tag className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold bg-black text-white px-1.5 py-0.5 rounded">
                            {currentProduct.category}
                          </span>
                          {productSummary.isLowestEver && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              🔥 歷史最低
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-gray-800 truncate">
                          {currentProduct.name}
                        </h4>
                        <div className="text-xs font-bold text-[#ff2121] mt-0.5">
                          NT$ {currentProduct.price.toLocaleString()}
                          <span className="text-gray-400 font-normal ml-2 text-[10px]">
                            60天高 NT${productSummary.maxPrice} / 低 NT${productSummary.minPrice}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Auto Generated Pitch */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-red-500" />
                          <span>一鍵帶貨文案（附專屬連結）</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(productPromoCopy, 'product_promo', '爆款單品帶貨')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            copiedKey === 'product_promo'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-black text-white hover:bg-gray-800'
                          }`}
                        >
                          {copiedKey === 'product_promo' ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>已複製！</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>複製帶貨文案</span>
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="p-3 bg-gray-50 rounded-lg text-xs text-gray-700 font-sans whitespace-pre-wrap leading-relaxed border border-gray-100 select-all">
                        {productPromoCopy}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: MARKETING GROWTH PLAYBOOK */}
            {activeTab === 'marketing_playbook' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Strategy 1 */}
                  <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">
                      黃金發文時段策略
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <strong>中午 12:00 ~ 13:30</strong>（上班族午休摸魚逛網購）與 <strong>晚上 20:30 ~ 23:00</strong>（睡前滑手機購物高峰期）。週四至週日轉換率最佳。
                    </p>
                  </div>

                  {/* Strategy 2 */}
                  <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">
                      主打「避坑」比主打「便宜」更吸引人
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      現代消費者對單純促銷感到麻木，但對<strong>「有沒有被當盤子買貴」</strong>非常敏感！宣傳時著重強調<strong>「60天真實價格走勢，一秒識破假打折」</strong>，點閱率顯著提高 3 倍。
                    </p>
                  </div>

                  {/* Strategy 3 */}
                  <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">
                      LINE 好友與群組裂變玩法
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      遇到高折扣爆款（例如標記「歷史最低價」商品），截圖走勢圖發至 LINE 群組，附上一句「這款平常賣 800 今天跌到 400，大家快看」，點擊率破 70%。
                    </p>
                  </div>

                  {/* Strategy 4 */}
                  <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
                      4
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">
                      短影音實操：比價反差影片
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      錄製 15 秒手機畫面：前 3 秒特寫某商品的原價，手指滑動切換至網站走勢圖亮出大跌價，最後展示降價通知功能，快速引流個人首頁連結。
                    </p>
                  </div>
                </div>

                {/* Viral Hashtags */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                    流量密碼熱門 Hashtag 庫（可直接複製）：
                  </span>
                  <div className="p-3 bg-white rounded-lg border border-gray-200 text-xs text-gray-700 font-mono select-all">
                    #省錢攻略 #蝦皮好物 #避坑神器 #比價神器 #歷史價格 #限時特惠 #網購必買 #小資族省錢 #購物日常 #降價通知 #實用好物 #好物分享
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              網站連結：<span className="font-mono text-gray-700">{siteUrl}</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(siteUrl, 'direct_url', '網站連結')}
              className="px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>複製網站連結</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
