import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'zh-TW' | 'en' | 'id' | 'vi' | 'ja' | 'ko';

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'en', label: 'English' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
];

const translations = {
  'zh-TW': {
    title: '優選商品推薦',
    subtitle: '快速找到您想要的精選好物',
    searchPlaceholder: '搜尋商品名稱或商店...',
    currencyLoading: '匯率載入中...',
    noProductsFound: '找不到符合「{searchQuery}」的商品',
    tryOtherTerms: '請嘗試其他搜尋詞或分類',
    disclaimer: '免責聲明：本網站僅提供商品整理與推薦，實際商品價格與庫存以各購物平台為主。',
    affiliateDisclosure: '本網站包含推廣連結，當您透過連結購買商品時，我們可能會獲得微薄分潤，但這不會影響您的購買價格。',
    sortDefault: '預設排序',
    sortPriceAsc: '價格：由低到高',
    sortPriceDesc: '價格：由高到低',
    sortSalesDesc: '銷量：由高到低',
    catAll: '全部',
    catFavorites: '我的最愛',
    cat3C: '3C與家電',
    catClothing: '服飾與鞋包',
    catBeauty: '美妝與保健',
    catHome: '居家生活',
    catFood: '美食與零食',
    catAutoOutdoor: '汽機車與戶外',
    catOther: '其他',
    generateVideo: 'AI 影片生成',
    copyAffiliate: '複製推廣連結',
    copySuccess: '複製成功',
    copiedToast: '已複製推廣連結！',
    clickLink: '點選此連結',
    salesStr: '已售',
    priceAlert: '降價提醒',
    setPriceAlert: '設定降價提醒',
    editPriceAlert: '修改降價提醒',
    targetPrice: '目標價格',
    currentPrice: '當前價格',
    saveAlert: '儲存提醒',
    removeAlert: '取消提醒',
    alertSuccess: '已成功設定降價提醒！',
    alertRemoved: '已取消降價提醒',
    myPriceAlerts: '降價追蹤清單',
    noPriceAlerts: '尚未設定任何降價提醒',
    presetDiscount: '快速折扣設定',
    targetPriceHint: '當商品價格達到或低於目標價時將提醒您',
    enterTargetPrice: '請輸入有效的目標價格',
    emailOptional: '通知信箱（選填）',
    estimatedSavings: '預計省下',
    priceReached: '已達標',
    tracking: '追蹤中',
    hotDeal: '熱銷爆款',
    limitedTime: '限時下殺',
    allTimeLowBadge: '歷史新低',
    significantDrop: '大降價',
    trendingBadge: '熱門排行',
  },
  'en': {
    title: 'Selected Recommendations',
    subtitle: 'Quickly find the selected goods you want',
    searchPlaceholder: 'Search for product name or store...',
    currencyLoading: 'Loading exchange rates...',
    noProductsFound: 'No products found matching "{searchQuery}"',
    tryOtherTerms: 'Please try other search terms or categories',
    disclaimer: 'Disclaimer: This website only provides product sorting and recommendations. Actual product prices and inventory are subject to the shopping platforms.',
    affiliateDisclosure: 'This website contains affiliate links. When you purchase products through the links, we may earn a small commission, but this will not affect your purchase price.',
    sortDefault: 'Default Sorting',
    sortPriceAsc: 'Price: Low to High',
    sortPriceDesc: 'Price: High to Low',
    sortSalesDesc: 'Sales: High to Low',
    catAll: 'All',
    catFavorites: 'Favorites',
    cat3C: '3C & Home Appliances',
    catClothing: 'Clothing & Bags',
    catBeauty: 'Beauty & Health',
    catHome: 'Home & Life',
    catFood: 'Food & Snacks',
    catAutoOutdoor: 'Auto & Outdoor',
    catOther: 'Other',
    generateVideo: 'AI Video',
    copyAffiliate: 'Copy Affiliate Link',
    copySuccess: 'Copied Successfully',
    copiedToast: 'Affiliate link copied!',
    clickLink: 'Click this link',
    salesStr: 'Sold',
    priceAlert: 'Price Alert',
    setPriceAlert: 'Set Price Alert',
    editPriceAlert: 'Edit Price Alert',
    targetPrice: 'Target Price',
    currentPrice: 'Current Price',
    saveAlert: 'Save Alert',
    removeAlert: 'Remove Alert',
    alertSuccess: 'Price alert set successfully!',
    alertRemoved: 'Price alert removed',
    myPriceAlerts: 'Price Alerts',
    noPriceAlerts: 'No price alerts set yet',
    presetDiscount: 'Quick Presets',
    targetPriceHint: 'We will alert you when price drops to or below target',
    enterTargetPrice: 'Please enter a valid target price',
    emailOptional: 'Notification Email (optional)',
    estimatedSavings: 'Estimated Savings',
    priceReached: 'Target Reached',
    tracking: 'Tracking',
    hotDeal: 'Hot Deal',
    limitedTime: 'Limited Time',
    allTimeLowBadge: 'All-Time Low',
    significantDrop: 'Price Drop',
    trendingBadge: 'Trending',
  },
  'id': {
    title: 'Rekomendasi Pilihan',
    subtitle: 'Temukan barang pilihan yang Anda inginkan dengan cepat',
    searchPlaceholder: 'Cari nama produk atau toko...',
    currencyLoading: 'Memuat nilai tukar...',
    noProductsFound: 'Tidak ada produk yang cocok dengan "{searchQuery}"',
    tryOtherTerms: 'Silakan coba istilah pencarian atau kategori lain',
    disclaimer: 'Penafian: Situs web ini hanya menyediakan penyortiran dan rekomendasi produk. Harga dan inventaris produk yang sebenarnya tunduk pada platform belanja.',
    affiliateDisclosure: 'Situs web ini berisi tautan afiliasi. Saat Anda membeli produk melalui tautan, kami mungkin mendapatkan sedikit komisi, tetapi ini tidak akan memengaruhi harga pembelian Anda.',
    sortDefault: 'Penyortiran Default',
    sortPriceAsc: 'Harga: Rendah ke Tinggi',
    sortPriceDesc: 'Harga: Tinggi ke Rendah',
    sortSalesDesc: 'Penjualan: Tinggi ke Rendah',
    catAll: 'Semua',
    catFavorites: 'Favorit',
    cat3C: 'Elektronik & Peralatan',
    catClothing: 'Pakaian & Tas',
    catBeauty: 'Kecantikan & Kesehatan',
    catHome: 'Rumah & Kehidupan',
    catFood: 'Makanan & Camilan',
    catAutoOutdoor: 'Otomotif & Luar Ruangan',
    catOther: 'Lainnya',
    generateVideo: 'Video AI',
    copyAffiliate: 'Salin Tautan Afiliasi',
    copySuccess: 'Berhasil Disalin',
    copiedToast: 'Tautan afiliasi disalin!',
    clickLink: 'Klik tautan ini',
    salesStr: 'Terjual',
    priceAlert: 'Pengingat Harga',
    setPriceAlert: 'Pasang Pengingat Harga',
    editPriceAlert: 'Ubah Pengingat Harga',
    targetPrice: 'Harga Target',
    currentPrice: 'Harga Saat Ini',
    saveAlert: 'Simpan Pengingat',
    removeAlert: 'Hapus Pengingat',
    alertSuccess: 'Pengingat harga berhasil diatur!',
    alertRemoved: 'Pengingat harga dihapus',
    myPriceAlerts: 'Daftar Pengingat Harga',
    noPriceAlerts: 'Belum ada pengingat harga yang diatur',
    presetDiscount: 'Preset Cepat',
    targetPriceHint: 'Kami akan memberi tahu saat harga turun ke atau di bawah target',
    enterTargetPrice: 'Silakan masukkan harga target yang valid',
    emailOptional: 'Email Notifikasi (opsional)',
    estimatedSavings: 'Estimasi Penghematan',
    priceReached: 'Target Tercapai',
    tracking: 'Melacak',
    hotDeal: 'Promo Heboh',
    limitedTime: 'Waktu Terbatas',
    allTimeLowBadge: 'Harga Terendah',
    significantDrop: 'Diskon Besar',
    trendingBadge: 'Sedang Tren',
  },
  'vi': {
    title: 'Sản phẩm đề xuất',
    subtitle: 'Nhanh chóng tìm thấy những món đồ được chọn lọc mà bạn muốn',
    searchPlaceholder: 'Tìm kiếm tên sản phẩm hoặc cửa hàng...',
    currencyLoading: 'Đang tải tỷ giá...',
    noProductsFound: 'Không tìm thấy sản phẩm nào phù hợp với "{searchQuery}"',
    tryOtherTerms: 'Vui lòng thử các từ khóa hoặc danh mục khác',
    disclaimer: 'Tuyên bố miễn trừ trách nhiệm: Trang web này chỉ cung cấp việc sắp xếp và đề xuất sản phẩm. Giá sản phẩm thực tế và hàng tồn kho tùy thuộc vào nền tảng mua sắm.',
    affiliateDisclosure: 'Trang web này chứa các liên kết liên kết. Khi bạn mua sản phẩm thông qua các liên kết, chúng tôi có thể nhận được một khoản hoa hồng nhỏ, nhưng điều này sẽ không ảnh hưởng đến giá mua của bạn.',
    sortDefault: 'Sắp xếp mặc định',
    sortPriceAsc: 'Giá: Thấp đến Cao',
    sortPriceDesc: 'Giá: Cao đến Thấp',
    sortSalesDesc: 'Doanh số: Cao đến Thấp',
    catAll: 'Tất cả',
    catFavorites: 'Yêu thích',
    cat3C: 'Điện tử & Gia dụng',
    catClothing: 'Quần áo & Túi xách',
    catBeauty: 'Làm đẹp & Sức khỏe',
    catHome: 'Nhà cửa & Đời sống',
    catFood: 'Thực phẩm & Đồ ăn nhẹ',
    catAutoOutdoor: 'Ô tô & Ngoài trời',
    catOther: 'Khác',
    generateVideo: 'Video AI',
    copyAffiliate: 'Sao chép liên kết',
    copySuccess: 'Sao chép thành công',
    copiedToast: 'Đã sao chép liên kết liên kết!',
    clickLink: 'Nhấp vào liên kết này',
    salesStr: 'Đã bán',
    priceAlert: 'Báo giảm giá',
    setPriceAlert: 'Đặt báo giảm giá',
    editPriceAlert: 'Sửa báo giảm giá',
    targetPrice: 'Giá mục tiêu',
    currentPrice: 'Giá hiện tại',
    saveAlert: 'Lưu báo giá',
    removeAlert: 'Hủy báo giá',
    alertSuccess: 'Đã đặt báo giảm giá thành công!',
    alertRemoved: 'Đã hủy báo giảm giá',
    myPriceAlerts: 'Danh sách theo dõi giá',
    noPriceAlerts: 'Chưa có thông báo giá nào',
    presetDiscount: 'Cài đặt nhanh',
    targetPriceHint: 'Chúng tôi sẽ thông báo khi giá giảm bằng hoặc dưới mục tiêu',
    enterTargetPrice: 'Vui lòng nhập giá mục tiêu hợp lệ',
    emailOptional: 'Email thông báo (tùy chọn)',
    estimatedSavings: 'Tiết kiệm ước tính',
    priceReached: 'Đã đạt mục tiêu',
    tracking: 'Đang theo dõi',
    hotDeal: 'Sản phẩm Hot',
    limitedTime: 'Có hạn giờ',
    allTimeLowBadge: 'Đáy lịch sử',
    significantDrop: 'Giảm giá sâu',
    trendingBadge: 'Thịnh hành',
  },
  'ja': {
    title: 'おすすめ商品',
    subtitle: '欲しい厳選された商品をすぐに見つける',
    searchPlaceholder: '商品名や店舗を検索...',
    currencyLoading: '為替レートを読み込み中...',
    noProductsFound: '「{searchQuery}」に一致する商品は見つかりませんでした',
    tryOtherTerms: '他の検索用語またはカテゴリをお試しください',
    disclaimer: '免責事項：このウェブサイトは商品の整理とおすすめのみを提供しています。実際の商品価格と在庫は各ショッピングプラットフォームに基づいています。',
    affiliateDisclosure: 'このウェブサイトにはアフィリエイトリンクが含まれています。リンクを通じて商品を購入すると、少額の報酬を得る場合がありますが、購入価格には影響しません。',
    sortDefault: 'デフォルトの並べ替え',
    sortPriceAsc: '価格：安い順',
    sortPriceDesc: '価格：高い順',
    sortSalesDesc: '売上：多い順',
    catAll: 'すべて',
    catFavorites: 'お気に入り',
    cat3C: '3C・家電',
    catClothing: '衣類・バッグ',
    catBeauty: '美容・健康',
    catHome: 'ホーム・ライフ',
    catFood: '食品・スナック',
    catAutoOutdoor: '自動車・アウトドア',
    catOther: 'その他',
    generateVideo: 'AI 動画',
    copyAffiliate: 'アフィリエイトリンクをコピー',
    copySuccess: 'コピーに成功しました',
    copiedToast: 'アフィリエイトリンクをコピーしました！',
    clickLink: 'このリンクをクリック',
    salesStr: '販売数',
    priceAlert: '値下げ通知',
    setPriceAlert: '値下げ通知を設定',
    editPriceAlert: '値下げ通知を変更',
    targetPrice: '目標価格',
    currentPrice: '現在の価格',
    saveAlert: '通知を保存',
    removeAlert: '通知を解除',
    alertSuccess: '値下げ通知を設定しました！',
    alertRemoved: '値下げ通知を解除しました',
    myPriceAlerts: '価格追跡リスト',
    noPriceAlerts: '設定済みの通知はありません',
    presetDiscount: 'クイック設定',
    targetPriceHint: '目標価格以下になった際にお知らせします',
    enterTargetPrice: '有効な目標価格を入力してください',
    emailOptional: '通知用メールアドレス（任意）',
    estimatedSavings: '予想節約額',
    priceReached: '目標達成',
    tracking: '追跡中',
    hotDeal: '目玉商品',
    limitedTime: '期間限定',
    allTimeLowBadge: '過去最安値',
    significantDrop: '大幅値下げ',
    trendingBadge: '人気急上昇',
  },
  'ko': {
    title: '추천 상품',
    subtitle: '원하는 엄선된 상품을 빠르게 찾으세요',
    searchPlaceholder: '상품명 또는 상점 검색...',
    currencyLoading: '환율을 불러오는 중...',
    noProductsFound: '"{searchQuery}"와 일치하는 상품을 찾을 수 없습니다',
    tryOtherTerms: '다른 검색어나 카테고리를 시도해 주세요',
    disclaimer: '면책 조항: 이 웹사이트는 상품 정리 및 추천만 제공합니다. 실제 상품 가격 및 재고는 각 쇼핑 플랫폼에 따릅니다.',
    affiliateDisclosure: '이 웹사이트에는 제휴사 링크가 포함되어 있습니다. 링크를 통해 상품을 구매하면 소액의 수수료를 받을 수 있지만 구매 가격에는 영향을 미치지 않습니다.',
    sortDefault: '기본 정렬',
    sortPriceAsc: '가격: 낮은 순',
    sortPriceDesc: '가격: 높은 순',
    sortSalesDesc: '판매: 많은 순',
    catAll: '전체',
    catFavorites: '즐겨찾기',
    cat3C: '전자제품 및 가전',
    catClothing: '의류 및 가방',
    catBeauty: '뷰티 및 건강',
    catHome: '홈 및 라이프',
    catFood: '식품 및 스낵',
    catAutoOutdoor: '자동차 및 아웃도어',
    catOther: '기타',
    generateVideo: 'AI 비디오',
    copyAffiliate: '제휴 링크 복사',
    copySuccess: '복사 성공',
    copiedToast: '제휴 링크가 복사되었습니다!',
    clickLink: '이 링크 클릭',
    salesStr: '판매',
    priceAlert: '가격 하락 알림',
    setPriceAlert: '가격 알림 설정',
    editPriceAlert: '가격 알림 수정',
    targetPrice: '목표 가격',
    currentPrice: '현재 가격',
    saveAlert: '알림 저장',
    removeAlert: '알림 삭제',
    alertSuccess: '가격 알림이 설정되었습니다!',
    alertRemoved: '가격 알림이 삭제되었습니다',
    myPriceAlerts: '가격 추적 목록',
    noPriceAlerts: '설정된 가격 알림이 없습니다',
    presetDiscount: '빠른 할인 설정',
    targetPriceHint: '목표 가격 이하로 떨어지면 알려드립니다',
    enterTargetPrice: '올바른 목표 가격을 입력해주세요',
    emailOptional: '알림 이메일 (선택)',
    estimatedSavings: '예상 절약액',
    priceReached: '목표 달성',
    tracking: '추적 중',
    hotDeal: '핫딜',
    limitedTime: '한정 특가',
    allTimeLowBadge: '역대 최저가',
    significantDrop: '대폭 할인',
    trendingBadge: '인기 급상승',
  }
};

type TranslationKey = keyof typeof translations['zh-TW'];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
  getCategoryTranslation: (cat: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('app_language') as Language;
      return saved && Object.keys(translations).includes(saved) ? saved : 'zh-TW';
    } catch (e) {
      return 'zh-TW';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: TranslationKey, params?: Record<string, string>) => {
    let text = translations[language][key] || translations['zh-TW'][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  };

  const getCategoryTranslation = (cat: string) => {
    switch (cat) {
      case '全部': return t('catAll');
      case '我的最愛': return t('catFavorites');
      case '降價追蹤': return t('myPriceAlerts');
      case '3C與家電': return t('cat3C');
      case '服飾與鞋包': return t('catClothing');
      case '美妝與保健': return t('catBeauty');
      case '居家生活': return t('catHome');
      case '美食與零食': return t('catFood');
      case '汽機車與戶外': return t('catAutoOutdoor');
      case '其他': return t('catOther');
      default: return cat;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getCategoryTranslation }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
