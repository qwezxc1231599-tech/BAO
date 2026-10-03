import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { TrendingDown, TrendingUp, Bell, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { getProductPriceHistory } from '../utils/priceHistory';
import { useCurrency } from '../CurrencyContext';
import { useLanguage } from '../LanguageContext';

interface PriceTrendChartProps {
  product: Product;
  targetPrice?: number; // Optional user alert price to draw as ReferenceLine
  height?: number;
  showDetails?: boolean;
  onSetAlertWithPrice?: (price: number) => void;
  compact?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  convertPrice: (p: number) => { value: number; symbol: string };
  currentPrice: number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  convertPrice,
  currentPrice,
}) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    const priceVal = payload[0].value as number;
    const converted = convertPrice(priceVal);
    const diff = priceVal - currentPrice;

    return (
      <div className="bg-gray-900/95 text-white p-2.5 rounded-lg shadow-xl text-xs border border-gray-800 backdrop-blur-md pointer-events-none z-50">
        <div className="text-[10px] text-gray-400 font-medium mb-1">
          {dataPoint.fullDate || label}
        </div>
        <div className="flex items-baseline gap-1.5 font-bold">
          <span className="text-amber-400">{converted.symbol}{converted.value.toLocaleString()}</span>
          <span className="text-[10px] text-gray-400">(NT${priceVal})</span>
        </div>
        {diff !== 0 && (
          <div className={`text-[10px] font-medium mt-1 flex items-center gap-0.5 ${diff < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {diff < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
            <span>比現價 {diff < 0 ? '便宜' : '貴'} NT${Math.abs(diff)}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function PriceTrendChart({
  product,
  targetPrice,
  height = 90,
  showDetails = true,
  onSetAlertWithPrice,
  compact = false,
}: PriceTrendChartProps) {
  const { convertPrice } = useCurrency();
  const { t } = useLanguage();

  const summary = useMemo(() => {
    return getProductPriceHistory(product);
  }, [product]);

  const {
    history,
    minPrice,
    maxPrice,
    isLowestEver,
    suggestedAlertPrice,
    savingsFromMax,
  } = summary;

  const minConverted = convertPrice(minPrice);
  const maxConverted = convertPrice(maxPrice);
  const currentConverted = convertPrice(product.price);

  // Gradient IDs unique per product
  const gradientId = `priceGradient-${product.id}`;

  const yDomainMin = Math.max(0, Math.floor(minPrice * 0.9));
  const yDomainMax = Math.ceil(maxPrice * 1.08);

  return (
    <div className="w-full select-none">
      {/* Sparkline / Chart */}
      <div style={{ width: '100%', height }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={history}
            margin={{ top: 8, right: 8, left: 8, bottom: compact ? 2 : 16 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isLowestEver ? '#10b981' : '#f59e0b'} stopOpacity={0.35} />
                <stop offset="95%" stopColor={isLowestEver ? '#10b981' : '#f59e0b'} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            {!compact && (
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                tick={{ fontSize: 9, fill: '#9ca3af' }}
              />
            )}

            <YAxis
              domain={[yDomainMin, yDomainMax]}
              hide
            />

            <Tooltip
              content={
                <CustomTooltip
                  convertPrice={convertPrice}
                  currentPrice={product.price}
                />
              }
            />

            {/* Target Price alert line if set */}
            {typeof targetPrice === 'number' && targetPrice > 0 && (
              <ReferenceLine
                y={targetPrice}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{
                  value: `目標 NT$${targetPrice}`,
                  position: 'insideTopRight',
                  fill: '#d97706',
                  fontSize: 9,
                  fontWeight: 'bold',
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="price"
              stroke={isLowestEver ? '#10b981' : '#f59e0b'}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{
                r: 4,
                fill: isLowestEver ? '#10b981' : '#f59e0b',
                stroke: '#ffffff',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Chips & Insights */}
      {showDetails && (
        <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-1.5 text-[11px]">
          <div className="flex items-center justify-between text-gray-500">
            <span className="flex items-center gap-1 font-medium">
              <span>60天低:</span>
              <strong className="text-emerald-700">
                {minConverted.symbol}{minConverted.value.toLocaleString()}
              </strong>
            </span>
            <span className="flex items-center gap-1 font-medium">
              <span>60天高:</span>
              <span className="text-gray-600 line-through">
                {maxConverted.symbol}{maxConverted.value.toLocaleString()}
              </span>
            </span>
          </div>

          <div className="flex items-center justify-between gap-1">
            {isLowestEver ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                現為歷史最低，入手良機！
              </span>
            ) : savingsFromMax > 0 ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                <TrendingDown className="w-3 h-3 text-emerald-600" />
                距最高點已省 NT${savingsFromMax}
              </span>
            ) : null}

            {onSetAlertWithPrice && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSetAlertWithPrice(suggestedAlertPrice);
                }}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer ml-auto"
                title={`以歷史低點 NT$${suggestedAlertPrice} 設提醒`}
              >
                <Bell className="w-2.5 h-2.5 fill-current" />
                <span>建議目標 NT${suggestedAlertPrice}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
