// ==============================================================================
// [유자를 품은 오란다&까부리] 공통 비즈니스 로직 및 Seed Data
// ==============================================================================

export const INITIAL_RAW_MATERIALS = [
  { id: 'mat_oranda_grain', name: '오란다 알갱이', stock: 50.0, unit: 'kg', unit_price: 12000 },
  { id: 'mat_kkaburi_grain', name: '까부리 알갱이', stock: 40.0, unit: 'kg', unit_price: 13500 },
  { id: 'mat_rice_syrup', name: '쌀조청', stock: 60.0, unit: 'kg', unit_price: 8500 },
  { id: 'mat_yuzu_syrup', name: '고흥 생유자청', stock: 45.0, unit: 'kg', unit_price: 18000 },
  { id: 'mat_pumpkin_seeds', name: '호박씨', stock: 25.0, unit: 'kg', unit_price: 16000 },
  { id: 'mat_peanuts', name: '볶음 땅콩', stock: 30.0, unit: 'kg', unit_price: 11000 },
  { id: 'mat_almonds', name: '아몬드 슬라이스', stock: 20.0, unit: 'kg', unit_price: 22000 },
  { id: 'mat_sunflower_seeds', name: '해바라기씨', stock: 25.0, unit: 'kg', unit_price: 14000 },
  { id: 'mat_vinyl_wrap', name: '개별 포장 비닐', stock: 3000, unit: '개', unit_price: 35 },
  { id: 'mat_gift_box', name: '선물 패키지 박스', stock: 450, unit: '개', unit_price: 1200 },
  { id: 'mat_shipping_box', name: '택배 포장 박스', stock: 300, unit: '개', unit_price: 850 }
];

export const INITIAL_PRODUCTS = [
  { 
    id: 'prod_classic_single', 
    name: '유자 오란다 낱개', 
    stock: 250, 
    materials: [
      { name: '오란다 알갱이' },
      { name: '쌀조청' },
      { name: '고흥 생유자청' },
      { name: '호박씨' },
      { name: '개별 포장 비닐' }
    ] 
  },
  { 
    id: 'prod_kkaburi_single', 
    name: '유자 까부리 낱개', 
    stock: 180, 
    materials: [
      { name: '까부리 알갱이' },
      { name: '쌀조청' },
      { name: '고흥 생유자청' },
      { name: '볶음 땅콩' },
      { name: '개별 포장 비닐' }
    ] 
  }
];

export const INITIAL_FINISHED_GOODS = [
  {
    id: 'set_deundeun',
    name: '[든든세트] 고흥 유자품은 까부리와 오란다',
    set_type: '든든',
    price: 27540,
    stock: 50,
    composition: [
      { product_id: 'prod_classic_single', name: '유자 오란다 낱개', qty: 9 },
      { product_id: 'prod_kkaburi_single', name: '유자 까부리 낱개', qty: 9 }
    ]
  },
  {
    id: 'set_silsok',
    name: '[실속세트] 고흥 유자품은 까부리와 오란다',
    set_type: '실속',
    price: 18360,
    stock: 30,
    composition: [
      { product_id: 'prod_classic_single', name: '유자 오란다 낱개', qty: 6 },
      { product_id: 'prod_kkaburi_single', name: '유자 까부리 낱개', qty: 6 }
    ]
  },
  {
    id: 'set_mini',
    name: '[미니세트] 고흥 유자품은 까부리와 오란다',
    set_type: '미니',
    price: 9180,
    stock: 15,
    composition: [
      { product_id: 'prod_classic_single', name: '유자 오란다 낱개', qty: 3 },
      { product_id: 'prod_kkaburi_single', name: '유자 까부리 낱개', qty: 3 }
    ]
  },
  {
    id: 'set_single',
    name: '[낱개] 고흥 유자품은 까부리와 오란다',
    set_type: '낱개',
    price: 2000,
    stock: 100,
    composition: [
      { product_id: 'prod_classic_single', name: '유자 오란다 낱개', qty: 1 }
    ]
  }
];

export const INITIAL_INVENTORY_LOGS = [
  {
    id: 'log_init_01',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    reason: '정기 생산 등록 (든든세트 및 실속세트)',
    changes: [
      { category: 'raw_materials', name: '오란다 알갱이', diff: -5.0, unit: 'kg' },
      { category: 'raw_materials', name: '쌀조청', diff: -3.0, unit: 'kg' },
      { category: 'finished_goods', name: '[든든세트] 고흥 유자품은 까부리와 오란다', diff: 15, unit: '박스' }
    ]
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'ord_sample_01',
    order_date: new Date(Date.now() - 7200000).toISOString(),
    customer_name: '홍길동',
    phone: '010-1234-5678',
    product_id: 'set_deundeun',
    product_name: '[든든세트] 고흥 유자품은 까부리와 오란다',
    unit_price: 27540,
    quantity: 2,
    total_price: 55080,
    status: '주문 접수',
    memo: '오후 3시 매장 방문 수령'
  },
  {
    id: 'ord_sample_02',
    order_date: new Date(Date.now() - 86400000).toISOString(),
    customer_name: '이영희',
    phone: '010-9876-5432',
    product_id: 'set_silsok',
    product_name: '[실속세트] 고흥 유자품은 까부리와 오란다',
    unit_price: 18360,
    quantity: 1,
    total_price: 18360,
    status: '수령 완료',
    memo: '현장 결제 완료'
  }
];

// 재고 상태 계산 헬퍼
export function getStockStatus(stock, minThreshold = 10, dangerThreshold = 0) {
  if (stock <= dangerThreshold) return { status: 'out_of_stock', label: '품절', color: '#C0392B', bg: '#FDEDEC' };
  if (stock <= minThreshold) return { status: 'low_stock', label: '부족', color: '#E67E22', bg: '#FEF5E7' };
  if (stock <= minThreshold * 2) return { status: 'caution', label: '주의', color: '#F39C12', bg: '#FEF9E7' };
  return { status: 'normal', label: '여유', color: '#2D6A4F', bg: '#D8F3DC' };
}

// 통화 포맷
export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '0원';
  return Number(amount).toLocaleString('ko-KR') + '원';
}

// 날짜 포맷
export function formatDateTime(isoString) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}
