import React from 'react';
import { X, Bell, ExternalLink, Trash2, Edit3, ShoppingBag, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePriceAlerts } from '../PriceAlertContext';
import { useCurrency } from '../CurrencyContext';
import { useLanguage } from '../LanguageContext';
import { products } from '../data';
import { Product } from '../types';
import { PriceAlertRecommendations } from './PriceAlertRecommendations';

interface PriceAlertsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditAlert: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
}

export function PriceAlertsListModal({
  isOpen,
  onClose,
  onEditAlert,
  onViewProduct,
}: PriceAlertsListModalProps) {
  const { alertList, removePriceAlert } = usePriceAlerts();
  const { convertPrice } = useCurrency();
  const { t } = useLanguage();

  if (!isOpen) return null;

  // Map alertList to full product info
  const trackedItems = alertList.map((alert) => {
    const product = products.find((p) => p.id === alert.productId);
    return {
      alert,
      product,
    };
  }).filter((item): item is { alert: typeof item.alert; product: Product } => Boolean(item.product));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[88vh] my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 bg-gray-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Bell className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{t('myPriceAlerts')}</h2>
                <p className="text-xs text-gray-500">
                  共設定 {trackedItems.length} 個商品降價提醒
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 divide-y divide-gray-100">
            {trackedItems.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{t('noPriceAlerts')}</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
                  在任何商品卡片右上角點擊鈴鐺圖示，即可設定您期望的理想價格，降價時隨時掌握！
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-black text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                >
                  開始逛逛商品
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {trackedItems.map(({ alert, product }) => {
                  const isReached = product.price <= alert.targetPrice;
                  const currentConverted = convertPrice(product.price);
                  const targetConverted = convertPrice(alert.targetPrice);
                  const diff = product.price - alert.targetPrice;

                  return (
                    <div
                      key={product.id}
                      className="pt-4 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 border border-gray-200 flex-shrink-0">
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              {product.store}
                            </span>
                            {isReached ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3 h-3" />
                                {t('priceReached')}！
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                                <Clock className="w-3 h-3" />
                                {t('tracking')}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-1 mb-1.5" title={product.name}>
                            {product.name}
                          </h4>
                          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs">
                            <span className="text-gray-500">
                              目前: <strong className="text-[#ff2121]">{currentConverted.symbol}{currentConverted.value.toLocaleString()}</strong>
                            </span>
                            <span className="text-gray-500">
                              目標: <strong className="text-gray-900">{targetConverted.symbol}{targetConverted.value.toLocaleString()}</strong>
                            </span>
                            {!isReached && (
                              <span className="text-gray-400 text-[11px]">
                                (還差 NT$ {diff.toLocaleString()})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                        <button
                          onClick={() => onEditAlert(product)}
                          className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors text-xs flex items-center gap-1 font-medium"
                          title="修改提醒"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span className="sm:hidden">修改</span>
                        </button>
                        <button
                          onClick={() => removePriceAlert(product.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-xs flex items-center gap-1 font-medium"
                          title="刪除提醒"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="sm:hidden">刪除</span>
                        </button>
                        <a
                          href={product.affiliateLink || product.productLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => onViewProduct && onViewProduct(product)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors uppercase"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>購買</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Recommendations Based on Browsing History */}
            <PriceAlertRecommendations
              onSelectAlertProduct={(p) => onEditAlert(p)}
              onViewProduct={onViewProduct}
              excludeProductIds={trackedItems.map((item) => item.product.id)}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
