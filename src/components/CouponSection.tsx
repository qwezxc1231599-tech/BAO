import React, { useState } from 'react';
import { Ticket, Copy, Check, ExternalLink, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface CouponSectionProps {
  onCopySuccess: (msg: string) => void;
}

interface Coupon {
  code: string;
  title: string;
  desc: string;
  discount: string;
  tag: string;
  expiry: string;
  link: string;
  bgGradient: string;
}

const COUPONS: Coupon[] = [
  {
    code: 'SHOPEE88',
    title: '蝦皮全站 88 折優惠券',
    desc: '全站消費滿 NT$1,000 現折 NT$120',
    discount: '88折',
    tag: '限量現搶',
    expiry: '今日限定',
    link: 'https://shopee.tw/m/free-shipping',
    bgGradient: 'from-orange-500 to-amber-600',
  },
  {
    code: 'FREESHIP0',
    title: '超商取貨免運抵用券',
    desc: '7-11 / 全家 / 萊爾富 / OK 滿額免運',
    discount: '免運',
    tag: '人人有券',
    expiry: '23:59 截止',
    link: 'https://shopee.tw/m/free-shipping',
    bgGradient: 'from-emerald-500 to-teal-600',
  },
  {
    code: 'BABY100',
    title: '寶寶分享站專屬加碼券',
    desc: '精選母嬰生活、服飾與3C好物滿千折百',
    discount: '折$100',
    tag: '站長特惠',
    expiry: '本週有效',
    link: 'https://shopee.tw',
    bgGradient: 'from-purple-500 to-indigo-600',
  },
  {
    code: 'COUPANG60',
    title: '酷澎火箭速配專屬優惠',
    desc: '首購滿額現折 NT$60，最快隔日配達',
    discount: '折$60',
    tag: '新客專享',
    expiry: '限時領取',
    link: 'https://coupa.ng/cnLKK7',
    bgGradient: 'from-blue-500 to-cyan-600',
  },
];

export function CouponSection({ onCopySuccess }: CouponSectionProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    onCopySuccess(`已成功複製折扣碼【${code}】！結帳時貼上即可`);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  return (
    <div className="mb-8 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-2xl border border-amber-200/80 p-4 sm:p-5 shadow-sm transition-all">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-sm">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-gray-900">今日限定折價券與免運代碼</h3>
              <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" />
                天天領取
              </span>
            </div>
            <p className="text-xs text-gray-500">
              結帳前一鍵複製折扣代碼，立享折抵與全站免運
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold border border-gray-200 shadow-xs transition-colors shrink-0"
        >
          <span>{isExpanded ? '收合' : '展開優惠券 (4)'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Coupons grid */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4 pt-4 border-t border-amber-200/60 animate-in fade-in duration-200">
          {COUPONS.map((coupon) => {
            const isCopied = copiedCode === coupon.code;
            return (
              <div
                key={coupon.code}
                className="bg-white rounded-xl border border-amber-200 p-3 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Left decorative color bar */}
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b ${coupon.bgGradient}`} />

                <div className="pl-1.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                      {coupon.tag}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {coupon.expiry}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-gray-900 mb-1">{coupon.title}</h4>
                  <p className="text-[11px] text-gray-500 mb-3">{coupon.desc}</p>
                </div>

                <div className="pl-1.5 pt-2 border-t border-dashed border-gray-200 flex items-center justify-between gap-2">
                  <div className="font-mono text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-800 tracking-wider">
                    {coupon.code}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(coupon.code)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                        isCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>已複製</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>複製</span>
                        </>
                      )}
                    </button>

                    <a
                      href={coupon.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-gray-400 hover:text-black hover:bg-gray-100 rounded transition-colors"
                      title="前往領券頁"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
