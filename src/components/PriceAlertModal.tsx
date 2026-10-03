import React, { useState, useEffect } from 'react';
import { X, Bell, Trash2, Check, AlertCircle, ArrowDownRight, Tag, LineChart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { usePriceAlerts } from '../PriceAlertContext';
import { useCurrency } from '../CurrencyContext';
import { useLanguage } from '../LanguageContext';
import { PriceTrendChart } from './PriceTrendChart';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAlertSet?: (msg: string) => void;
}

export function PriceAlertModal({ isOpen, onClose, product, onAlertSet }: PriceAlertModalProps) {
  const { getAlert, setPriceAlert, removePriceAlert } = usePriceAlerts();
  const { convertPrice } = useCurrency();
  const { t, getCategoryTranslation } = useLanguage();

  const [targetPrice, setTargetPrice] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const existingAlert = product ? getAlert(product.id) : undefined;

  useEffect(() => {
    if (isOpen && product) {
      if (existingAlert) {
        setTargetPrice(String(existingAlert.targetPrice));
        setEmail(existingAlert.email || '');
      } else {
        // Default target price to 10% off
        const defaultTarget = Math.round(product.price * 0.9);
        setTargetPrice(String(defaultTarget));
        setEmail('');
      }
      setErrorMsg('');
    }
  }, [isOpen, product, existingAlert]);

  if (!isOpen || !product) return null;

  const numericTarget = Number(targetPrice);
  const isValidNumber = !isNaN(numericTarget) && numericTarget > 0;
  const currentPriceConverted = convertPrice(product.price);
  const targetPriceConverted = isValidNumber ? convertPrice(numericTarget) : null;
  const discountAmount = isValidNumber ? Math.max(0, product.price - numericTarget) : 0;
  const discountPercent = isValidNumber && product.price > 0
    ? Math.round(((product.price - numericTarget) / product.price) * 100)
    : 0;

  const handleApplyPreset = (percent: number) => {
    const discounted = Math.round(product.price * (1 - percent / 100));
    setTargetPrice(String(discounted));
    setErrorMsg('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidNumber) {
      setErrorMsg(t('enterTargetPrice'));
      return;
    }

    setPriceAlert(product.id, Math.round(numericTarget), email);
    if (onAlertSet) {
      onAlertSet(t('alertSuccess'));
    }
    onClose();
  };

  const handleRemove = () => {
    removePriceAlert(product.id);
    if (onAlertSet) {
      onAlertSet(t('alertRemoved'));
    }
    onClose();
  };

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
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 bg-gray-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Bell className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {existingAlert ? t('editPriceAlert') : t('setPriceAlert')}
                </h2>
                <p className="text-xs text-gray-500">
                  {t('targetPriceHint')}
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

          {/* Form */}
          <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5">
            {/* Product Summary */}
            <div className="flex gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Tag className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  {getCategoryTranslation(product.category)} · {product.store}
                </span>
                <h3 className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2 mb-1.5" title={product.name}>
                  {product.name}
                </h3>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-gray-500">{t('currentPrice')}:</span>
                  <span className="text-sm sm:text-base font-bold text-[#ff2121]">
                    {currentPriceConverted.symbol}{currentPriceConverted.value.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-gray-400 font-normal">
                    (NT$ {product.price.toLocaleString()})
                  </span>
                </div>
              </div>
            </div>

            {/* Historical Price Trend with Interactive Target Price Line */}
            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                  <LineChart className="w-3.5 h-3.5 text-amber-600" />
                  <span>近 60 天價格走勢參考</span>
                </div>
                <span className="text-[10px] text-gray-400">
                  虛線為您設定的目標價格
                </span>
              </div>
              <PriceTrendChart
                product={product}
                targetPrice={isValidNumber ? numericTarget : undefined}
                height={85}
                showDetails={true}
                onSetAlertWithPrice={(price) => {
                  setTargetPrice(String(price));
                  setErrorMsg('');
                }}
              />
            </div>

            {/* Quick Discount Presets */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                {t('presetDiscount')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '-5%', percent: 5 },
                  { label: '-10%', percent: 10 },
                  { label: '-15%', percent: 15 },
                  { label: '-20%', percent: 20 },
                ].map((preset) => {
                  const targetVal = Math.round(product.price * (1 - preset.percent / 100));
                  const isSelected = numericTarget === targetVal;
                  return (
                    <button
                      key={preset.percent}
                      type="button"
                      onClick={() => handleApplyPreset(preset.percent)}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all text-center ${
                        isSelected
                          ? 'bg-black text-white border-black shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <span className="block">{preset.label}</span>
                      <span className="text-[10px] font-normal opacity-80 block">NT${targetVal}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Price Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t('targetPrice')} (NT$)
                </label>
                {isValidNumber && targetPriceConverted && (
                  <span className="text-xs text-gray-500 font-medium">
                    約合 {targetPriceConverted.symbol}{targetPriceConverted.value.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="relative rounded-lg overflow-hidden border border-gray-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-colors">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-sm font-bold">
                  NT$
                </div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={targetPrice}
                  onChange={(e) => {
                    setTargetPrice(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder={String(Math.round(product.price * 0.9))}
                  className="block w-full pl-12 pr-4 py-2.5 text-sm font-bold text-gray-900 focus:outline-none"
                  autoFocus
                />
              </div>

              {/* Savings Calculation Preview */}
              {isValidNumber && discountPercent > 0 && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-md">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>
                    {t('estimatedSavings')} NT$ {discountAmount.toLocaleString()} (-{discountPercent}%)
                  </span>
                </div>
              )}

              {isValidNumber && numericTarget >= product.price && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-md">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>目標價格已達到或高於目前價格，隨時可入手！</span>
                </div>
              )}

              {errorMsg && (
                <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errorMsg}
                </p>
              )}
            </div>

            {/* Email input (optional) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {t('emailOptional')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                我們會在價格達到目標價時提醒您，且不會向您發送任何垃圾信件。
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-gray-100">
              {existingAlert ? (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('removeAlert')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-black rounded-lg transition-colors"
                >
                  取消
                </button>
              )}

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-xs font-bold uppercase tracking-wider shadow-sm ml-auto"
              >
                <Check className="w-4 h-4" />
                {t('saveAlert')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
