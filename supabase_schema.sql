-- ==============================================================================
-- [유자를 품은 오란다&까부리] Supabase Database Schema & Initial Seed Data
-- ==============================================================================

-- 1. 원재료 테이블 (raw_materials)
CREATE TABLE IF NOT EXISTS public.raw_materials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    stock NUMERIC DEFAULT 0,
    unit TEXT NOT NULL,
    unit_price NUMERIC DEFAULT 0,
    sort_order NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 상품(낱개) 테이블 (products)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    stock NUMERIC DEFAULT 0,
    materials JSONB DEFAULT '[]'::jsonb,
    sort_order NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 완제품(세트) 테이블 (finished_goods)
CREATE TABLE IF NOT EXISTS public.finished_goods (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    set_type TEXT NOT NULL,
    price NUMERIC DEFAULT 0,
    stock NUMERIC DEFAULT 0,
    composition JSONB DEFAULT '[]'::jsonb,
    sort_order NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 재고 관리 기록 테이블 (inventory_logs)
CREATE TABLE IF NOT EXISTS public.inventory_logs (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    reason TEXT NOT NULL,
    changes JSONB DEFAULT '[]'::jsonb
);

-- 5. 현장 주문 테이블 (orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_date TIMESTAMPTZ DEFAULT NOW(),
    customer_name TEXT NOT NULL,
    phone TEXT,
    product_id TEXT,
    product_name TEXT NOT NULL,
    quantity NUMERIC DEFAULT 1,
    unit_price NUMERIC DEFAULT 0,
    total_price NUMERIC DEFAULT 0,
    status TEXT DEFAULT '주문 접수',
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 랜딩페이지 설정 테이블 (recipes/settings 겸용)
CREATE TABLE IF NOT EXISTS public.recipes (
    product_id TEXT PRIMARY KEY,
    materials JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) 비활성화 또는 누구나 접근 가능 허용 (익명 클라이언트 REST 호출용)
ALTER TABLE public.raw_materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.finished_goods DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes DISABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 초기 데이터 (Seed Data) 삽입
-- ==============================================================================

-- 1) 원재료 기본 데이터
INSERT INTO public.raw_materials (id, name, stock, unit, unit_price)
VALUES 
    ('mat_oranda_grain', '오란다 알갱이', 50.0, 'kg', 12000),
    ('mat_kkaburi_grain', '까부리 알갱이', 40.0, 'kg', 13500),
    ('mat_rice_syrup', '쌀조청', 60.0, 'kg', 8500),
    ('mat_yuzu_syrup', '고흥 생유자청', 45.0, 'kg', 18000),
    ('mat_pumpkin_seeds', '호박씨', 25.0, 'kg', 16000),
    ('mat_peanuts', '볶음 땅콩', 30.0, 'kg', 11000),
    ('mat_almonds', '아몬드 슬라이스', 20.0, 'kg', 22000),
    ('mat_sunflower_seeds', '해바라기씨', 25.0, 'kg', 14000),
    ('mat_vinyl_wrap', '개별 포장 비닐', 3000, '개', 35),
    ('mat_gift_box', '선물 패키지 박스', 450, '개', 1200),
    ('mat_shipping_box', '택배 포장 박스', 300, '개', 850)
ON CONFLICT (id) DO NOTHING;

-- 2) 상품(낱개) 기본 데이터
INSERT INTO public.products (id, name, stock, materials)
VALUES 
    ('prod_classic_single', '유자 오란다 낱개', 250, '[{"name": "오란다 알갱이"}, {"name": "쌀조청"}, {"name": "고흥 생유자청"}, {"name": "호박씨"}, {"name": "개별 포장 비닐"}]'::jsonb),
    ('prod_kkaburi_single', '유자 까부리 낱개', 180, '[{"name": "까부리 알갱이"}, {"name": "쌀조청"}, {"name": "고흥 생유자청"}, {"name": "볶음 땅콩"}, {"name": "개별 포장 비닐"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 3) 완제품(세트) 기본 데이터
INSERT INTO public.finished_goods (id, name, set_type, price, stock, composition)
VALUES 
    ('set_deundeun', '[든든세트] 고흥 유자품은 까부리와 오란다', '든든', 27540, 50, '[{"product_id": "prod_classic_single", "name": "유자 오란다 낱개", "qty": 9}, {"product_id": "prod_kkaburi_single", "name": "유자 까부리 낱개", "qty": 9}]'::jsonb),
    ('set_silsok', '[실속세트] 고흥 유자품은 까부리와 오란다', '실속', 18360, 30, '[{"product_id": "prod_classic_single", "name": "유자 오란다 낱개", "qty": 6}, {"product_id": "prod_kkaburi_single", "name": "유자 까부리 낱개", "qty": 6}]'::jsonb),
    ('set_mini', '[미니세트] 고흥 유자품은 까부리와 오란다', '미니', 9180, 15, '[{"product_id": "prod_classic_single", "name": "유자 오란다 낱개", "qty": 3}, {"product_id": "prod_kkaburi_single", "name": "유자 까부리 낱개", "qty": 3}]'::jsonb),
    ('set_single', '[낱개] 고흥 유자품은 까부리와 오란다', '낱개', 2000, 100, '[{"product_id": "prod_classic_single", "name": "유자 오란다 낱개", "qty": 1}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 4) 재고 관리 기록 기본 데이터 (샘플)
INSERT INTO public.inventory_logs (id, created_at, updated_at, reason, changes)
VALUES 
    ('log_init_01', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', '초기 재고 등록 및 정기 생산', '[{"category": "raw_materials", "name": "오란다 알갱이", "diff": -5, "unit": "kg"}, {"category": "finished_goods", "name": "든든세트", "diff": 15, "unit": "박스"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 5) 현장 주문 기본 데이터 (샘플)
INSERT INTO public.orders (id, order_date, customer_name, phone, product_id, product_name, quantity, status, memo)
VALUES 
    ('ord_sample_01', NOW() - INTERVAL '2 hours', '홍길동', '010-1234-5678', 'set_deundeun', '[든든세트] 고흥 유자품은 까부리와 오란다', 2, '주문 접수', '현장 수령 예정 (오후 3시)'),
    ('ord_sample_02', NOW() - INTERVAL '1 day', '이영희', '010-9876-5432', 'set_silsok', '[실속세트] 고흥 유자품은 까부리와 오란다', 1, '수령 완료', '현장 결제 완료')
ON CONFLICT (id) DO NOTHING;
