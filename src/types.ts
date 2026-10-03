export type Category = 
  | '全部'
  | '我的最愛'
  | '降價追蹤'
  | '3C與家電' 
  | '服飾與鞋包' 
  | '美妝與保健' 
  | '居家生活' 
  | '美食與零食' 
  | '汽機車與戶外' 
  | '其他';

export interface Product {
  id: string;
  name: string;
  price: number;
  salesStr: string;
  salesNum: number;
  store: string;
  productLink: string;
  affiliateLink: string;
  category: Category;
  imageUrl?: string | null;
  priceHistory?: { date: string; price: number }[];
}
