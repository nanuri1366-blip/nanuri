"use client";

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import DataTable from '../../components/common/DataTable';
import ModalPopup from '../../components/common/ModalPopup';
import StockBadge from '../../components/common/StockBadge';
import { formatCurrency, formatDateTime } from '../../lib/inventoryCommon';
import { 
  ShoppingCart, 
  Package, 
  Layers, 
  Boxes, 
  History, 
  Calculator, 
  Globe, 
  LogOut, 
  Lock, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  RotateCw,
  Save,
  ArrowRight,
  Sliders,
  DollarSign,
  Download,
  Calendar,
  ChevronUp,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import './admin.css';

// Default Landing Settings for fallback
const defaultLandingSettings = {
  popups: [
    {
      id: "popup_1",
      enabled: false,
      title: "공지사항",
      content: "유자를 품은 오란다&까부리 홈페이지를 방문해 주셔서 감사합니다. 현재 단체 주문은 스마트스토어 또는 고객센터로 직접 문의 주시면 친절하게 안내해 드리겠습니다.",
      image: "",
      link: "https://smartstore.naver.com/kkaburioranda",
      linkText: "자세히 보기"
    }
  ],
  popup: {
    enabled: false,
    title: "공지사항",
    content: "유자를 품은 오란다&까부리 홈페이지를 방문해 주셔서 감사합니다. 현재 단체 주문은 스마트스토어 또는 고객센터로 직접 문의 주시면 친절하게 안내해 드리겠습니다.",
    image: "",
    link: "https://smartstore.naver.com/kkaburioranda",
    linkText: "자세히 보기"
  },
  hero: {
    badge: "PREMIUM HANDMADE DESSERT",
    title: "바삭함 속에 피어나는\n싱그러운 유자 향",
    subtitle: "100% 고흥 유자로 담근 유자청과 쌀엿조청의 황금 비율로 탄생한\n끈적임 없고 바삭한 프리미엄 수제 오란다&까부리입니다.",
    image: "images/yuzu_oranda_hero.png",
    ctaText: "스마트스토어로 구매하기",
    ctaLink: "https://smartstore.naver.com/kkaburioranda/products/12823083471",
    storyLinkText: "스토리 읽어보기"
  },
  brandStory: {
    subtitle: "BRAND STORY",
    title: "자연에서 온 상큼함과\n전통의 만남",
    sectionTitle: "딱딱하고 끈적이는 오란다는 잊으세요.",
    body1: "우리는 오란다를 먹을 때 입천장이 아프거나 이가 끈적여 불편했던 기억에서 출발했습니다. 어떻게 하면 남녀노소 누구나 가볍고 맛있게 한과를 즐길 수 있을까 고민했습니다.",
    body2: "남해안의 따뜻한 햇살을 머금고 자란 100% 국산 유자를 엄선하여 즙을 내고 껍질을 잘게 다져 넣었습니다. 가마솥에 푹 고아낸 쌀조청에 상큼한 유자청을 배합해 한 입 베어 물면 바삭하게 부서지며 향긋한 유자향이 입안 가득 번집니다.",
    featureBadge: "100% 국산 천연 유자",
    featureDesc: "인공 향료나 보존료 없이 오직 진짜 유자만을 가득 담았습니다.",
    image: "images/yuzu_classic_oranda.png"
  },
  products: {
    deundeun: {
      name: "[든든세트] 고흥 유자품은 까부리와 오란다",
      desc: "오란다/까부리 선택식 (18개입). 넉넉하게 채워 온 가족이 함께 먹기 좋은 프리미엄 든든세트.",
      originalPrice: 30600,
      price: 27540,
      unit: "(18개입 / 1박스)",
      badge: "Best",
      url: "https://smartstore.naver.com/kkaburioranda/products/12823083471",
      image: "https://shop-phinf.pstatic.net/20251214_20/1765696482005znToa_PNG/18622543421055178_1644104875.png?type=o1000"
    },
    silsok: {
      name: "[실속세트] 고흥 유자품은 까부리와 오란다",
      desc: "오란다/까부리 선택식 (12개입). 부담 없는 가격과 실속 있는 구성으로 간식용 선물로 가장 추천하는 세트.",
      originalPrice: 20400,
      price: 18360,
      unit: "(12개입 / 1박스)",
      badge: "추천",
      url: "https://smartstore.naver.com/kkaburioranda/products/12823080166",
      image: "https://shop-phinf.pstatic.net/20251214_20/1765696482005znToa_PNG/18622543421055178_1644104875.png?type=o1000"
    },
    mini: {
      name: "[미니세트] 고흥 유자품은 까부리와 오란다",
      desc: "오란다/까부리 선택식 (6개입). 답례품 및 가벼운 체험용으로 안성맞춤인 미니 구성 세트.",
      originalPrice: 10200,
      price: 9180,
      unit: "(6개입 / 1박스)",
      badge: "인기",
      url: "https://smartstore.naver.com/kkaburioranda/products/12823072673",
      image: "https://shop-phinf.pstatic.net/20251214_20/1765696482005znToa_PNG/18622543421055178_1644104875.png?type=o1000"
    },
    natgae: {
      name: "[낱개] 고흥 유자품은 까부리와 오란다",
      desc: "개별 시식용 오란다 / 까부리 낱개 구성. 가볍게 맛보고 싶을 때 추천하는 싱글 메뉴.",
      originalPrice: 2200,
      price: 2000,
      unit: "(1개입)",
      badge: "낱개",
      url: "https://smartstore.naver.com/kkaburioranda/products/12701706707",
      image: "https://shop-phinf.pstatic.net/20251214_20/1765696482005znToa_PNG/18622543421055178_1644104875.png?type=o1000"
    }
  }
};

// Image Field Editor with URL input and File Upload preview
function ImageFieldEditor({ label, value, onChange, placeholder = "이미지 URL 또는 PC 파일 업로드" }) {
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('이미지 파일 용량은 3MB 이내로 권장합니다.');
      }
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
      <label style={{ fontSize: '13px', fontWeight: '700', color: '#2B2A27' }}>{label}</label>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{
          width: '74px',
          height: '74px',
          borderRadius: '8px',
          border: '1.5px solid #EAE8E3',
          backgroundColor: '#FAF9F6',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {value ? (
            <img src={value} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '11px', color: '#A09E9B', textAlign: 'center' }}>미등록</span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
          />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: '#FAF6EE',
              border: '1px solid #EAE8E3',
              fontSize: '12px',
              fontWeight: '700',
              color: '#2B2A27',
              cursor: 'pointer'
            }}>
              <span>📁 PC 사진 업로드</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                style={{ background: 'none', border: 'none', fontSize: '12px', color: '#C0392B', cursor: 'pointer', textDecoration: 'underline' }}
              >
                초기화
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  // 1. Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [gatePassword, setGatePassword] = useState('');
  const [showGateError, setShowGateError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 2. Active Tab State
  // 5대 핵심 메뉴: 'orders', 'finished', 'products', 'raw', 'logs'
  // 부가 기능: 'pricing', 'landing'
  const [activeTab, setActiveTab] = useState('orders');

  // 3. Core Entities State (DB)
  const [orders, setOrders] = useState([]);
  const [finishedGoods, setFinishedGoods] = useState([]);
  const [products, setProducts] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [landingSettings, setLandingSettings] = useState(defaultLandingSettings);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 4. Modal States
  // 4.1 Order Modal
  const [orderModal, setOrderModal] = useState({ isOpen: false, isEdit: false, data: null });
  // 4.2 Finished Good Modal
  const [finishedModal, setFinishedModal] = useState({ isOpen: false, isEdit: false, data: null });
  // 4.3 Product Modal
  const [productModal, setProductModal] = useState({ isOpen: false, isEdit: false, data: null });
  // 4.4 Raw Material Modal
  const [rawModal, setRawModal] = useState({ isOpen: false, isEdit: false, data: null });
  // 4.5 Inventory Log Modal
  const [logModal, setLogModal] = useState({ isOpen: false, data: null });

  // 4.6 Order Date Range Filter State
  const [orderDateRange, setOrderDateRange] = useState('all'); // 'all' | 'today' | '7d' | '30d' | 'custom'
  const [orderStartDate, setOrderStartDate] = useState('');
  const [orderEndDate, setOrderEndDate] = useState('');

  // 5. Pricing Calculator State
  const [calcSelectedGoodId, setCalcSelectedGoodId] = useState('');
  const [calcRecipeItems, setCalcRecipeItems] = useState([]);
  const [calcCustomSalePrice, setCalcCustomSalePrice] = useState(0);
  const [calcTargetMargin, setCalcTargetMargin] = useState(40);

  // Load All Data
  const loadAll = async () => {
    setIsRefreshing(true);
    try {
      const [ordList, goodsList, prodList, matsList, logsList, land] = await Promise.all([
        supabase.getOrders(),
        supabase.getFinishedGoods(),
        supabase.getProducts(),
        supabase.getRawMaterials(),
        supabase.getInventoryLogs(),
        supabase.getLandingSettings()
      ]);
      setOrders(ordList || []);
      setFinishedGoods(goodsList || []);
      setProducts(prodList || []);
      setRawMaterials(matsList || []);
      setInventoryLogs(logsList || []);
      if (land) {
        const mergedPopups = Array.isArray(land.popups) && land.popups.length > 0
          ? land.popups
          : (land.popup ? [{ id: 'popup_1', ...defaultLandingSettings.popups[0], ...land.popup }] : defaultLandingSettings.popups);

        setLandingSettings({
          ...defaultLandingSettings,
          ...land,
          popups: mergedPopups,
          popup: { ...defaultLandingSettings.popup, ...(land.popup || {}) },
          hero: { ...defaultLandingSettings.hero, ...(land.hero || {}) },
          brandStory: { ...defaultLandingSettings.brandStory, ...(land.brandStory || {}) },
          products: {
            deundeun: { ...defaultLandingSettings.products.deundeun, ...(land.products?.deundeun || {}) },
            silsok: { ...defaultLandingSettings.products.silsok, ...(land.products?.silsok || {}) },
            mini: { ...defaultLandingSettings.products.mini, ...(land.products?.mini || {}) },
            natgae: { ...defaultLandingSettings.products.natgae, ...(land.products?.natgae || {}) }
          }
        });
      }

      if (goodsList && goodsList.length > 0 && !calcSelectedGoodId) {
        setCalcSelectedGoodId(goodsList[0].id);
        setCalcCustomSalePrice(goodsList[0].price || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Reordering handler for raw materials, products, and finished goods
  const handleMoveItem = async (category, index, direction) => {
    let list, setList;
    if (category === 'finished_goods') {
      list = [...finishedGoods];
      setList = setFinishedGoods;
    } else if (category === 'products') {
      list = [...products];
      setList = setProducts;
    } else if (category === 'raw_materials') {
      list = [...rawMaterials];
      setList = setRawMaterials;
    } else {
      return;
    }

    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    setList(list);
    await supabase.reorderItems(category, list);
  };

  // Filter orders by date range
  const filteredOrdersByDate = useMemo(() => {
    if (orderDateRange === 'all') return orders;
    const now = new Date();

    return orders.filter(ord => {
      const dateStr = ord.order_date || ord.created_at;
      if (!dateStr) return true;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return true;

      if (orderDateRange === 'today') {
        return d.toDateString() === now.toDateString();
      }
      if (orderDateRange === '7d') {
        const diffDays = (now - d) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (orderDateRange === '30d') {
        const diffDays = (now - d) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 30;
      }
      if (orderDateRange === 'custom') {
        if (orderStartDate) {
          const start = new Date(orderStartDate + 'T00:00:00');
          if (d < start) return false;
        }
        if (orderEndDate) {
          const end = new Date(orderEndDate + 'T23:59:59');
          if (d > end) return false;
        }
        return true;
      }
      return true;
    });
  }, [orders, orderDateRange, orderStartDate, orderEndDate]);

  // Export orders to Excel (CSV with UTF-8 BOM)
  const handleExportOrdersToExcel = (dataToExport) => {
    if (!dataToExport || dataToExport.length === 0) {
      alert('내보낼 주문 내역이 없습니다.');
      return;
    }

    const headers = [
      '주문일시',
      '주문자명',
      '연락처',
      '주문상품',
      '수량',
      '주문단가(원)',
      '합계금액(원)',
      '진행상태',
      '메모'
    ];

    const rows = dataToExport.map(ord => {
      const good = finishedGoods.find(g => g.name === ord.product_name || g.id === ord.product_id);
      const unitPrice = ord.unit_price !== undefined ? ord.unit_price : (good ? good.price : 0);
      const totalPrice = ord.total_price !== undefined ? ord.total_price : (unitPrice * (ord.quantity || 1));

      return [
        formatDateTime(ord.order_date || ord.created_at),
        ord.customer_name || '',
        ord.phone || '',
        ord.product_name || '',
        ord.quantity || 1,
        unitPrice,
        totalPrice,
        ord.status || '주문 접수',
        (ord.memo || '').replace(/"/g, '""')
      ];
    });

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(r => r.map(field => `"${field}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    link.href = url;
    link.setAttribute('download', `유자오란다_주문내역_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    setIsMounted(true);
    const auth = sessionStorage.getItem('yuzu_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    loadAll();
  }, []);

  // Sync pricing items when selected good changes
  useEffect(() => {
    if (!calcSelectedGoodId || finishedGoods.length === 0) return;
    const targetGood = finishedGoods.find(g => g.id === calcSelectedGoodId);
    if (!targetGood) return;
    setCalcCustomSalePrice(targetGood.price || 0);

    // Build dynamic recipe based on raw materials
    const saved = localStorage.getItem(`yuzu_calc_${calcSelectedGoodId}`);
    if (saved) {
      try {
        setCalcRecipeItems(JSON.parse(saved));
        return;
      } catch (e) {}
    }

    // Default dynamic recipe from DB raw materials
    const defaultRecipe = rawMaterials.slice(0, 6).map(m => ({
      id: m.id,
      name: m.name,
      unitPrice: m.unit_price || 10000,
      qty: 0.1, // 100g
      unit: m.unit || 'kg'
    }));
    setCalcRecipeItems(defaultRecipe);
  }, [calcSelectedGoodId, finishedGoods, rawMaterials]);

  // Auth Handler
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (gatePassword === 'yuzu1234') {
      sessionStorage.setItem('yuzu_admin_auth', 'true');
      setIsAuthenticated(true);
      setShowGateError(false);
    } else {
      setShowGateError(true);
    }
  };

  // --------------------------------------------------------------------------
  // ORDER ACTIONS
  // --------------------------------------------------------------------------
  const handleOpenAddOrder = () => {
    const firstGood = finishedGoods[0];
    const initialPrice = firstGood?.price || 20000;
    setOrderModal({
      isOpen: true,
      isEdit: false,
      data: {
        customer_name: '',
        phone: '',
        product_id: firstGood?.id || '',
        product_name: firstGood?.name || '',
        unit_price: initialPrice,
        quantity: 1,
        total_price: initialPrice,
        status: '주문 접수',
        memo: ''
      }
    });
  };

  const handleOpenEditOrder = (ord) => {
    const good = finishedGoods.find(g => g.name === ord.product_name || g.id === ord.product_id);
    const unitPrice = ord.unit_price !== undefined ? ord.unit_price : (good ? good.price : 20000);
    const qty = ord.quantity || 1;
    const totalPrice = ord.total_price !== undefined ? ord.total_price : (unitPrice * qty);
    setOrderModal({
      isOpen: true,
      isEdit: true,
      data: { 
        ...ord,
        unit_price: unitPrice,
        quantity: qty,
        total_price: totalPrice
      }
    });
  };

  const handleSaveOrder = async () => {
    const { isEdit, data } = orderModal;
    if (!data.customer_name?.trim()) {
      alert('주문자명을 입력해 주세요.');
      return;
    }
    if (!data.quantity || data.quantity < 1) {
      alert('올바른 수량을 입력해 주세요.');
      return;
    }

    const unitPrice = parseFloat(data.unit_price) || 0;
    const qty = parseInt(data.quantity, 10) || 1;
    const orderData = {
      ...data,
      unit_price: unitPrice,
      quantity: qty,
      total_price: unitPrice * qty
    };

    if (isEdit) {
      await supabase.updateOrder(orderData.id, orderData);
    } else {
      await supabase.addOrder(orderData);
    }
    setOrderModal({ isOpen: false, isEdit: false, data: null });
    await loadAll();
  };

  const handleDeleteOrder = async (id) => {
    if (!confirm('이 주문을 삭제하시겠습니까?')) return;
    await supabase.deleteOrder(id);
    await loadAll();
  };

  const handleToggleOrderStatus = async (ord) => {
    const flow = ['주문 접수', '상품 준비', '수령 완료', '취소'];
    const currentIdx = flow.indexOf(ord.status);
    const nextStatus = flow[(currentIdx + 1) % flow.length];
    await supabase.updateOrder(ord.id, { status: nextStatus });
    await loadAll();
  };

  // --------------------------------------------------------------------------
  // FINISHED GOODS ACTIONS
  // --------------------------------------------------------------------------
  const handleOpenAddFinished = () => {
    setFinishedModal({
      isOpen: true,
      isEdit: false,
      data: {
        id: `set_${Date.now()}`,
        name: '',
        set_type: '든든',
        price: 25000,
        stock: 0,
        composition: []
      }
    });
  };

  const handleSaveFinished = async () => {
    const { isEdit, data } = finishedModal;
    if (!data.name?.trim()) {
      alert('세트 이름을 입력해 주세요.');
      return;
    }

    if (isEdit) {
      await supabase.updateFinishedGood(data.id, data);
    } else {
      const list = [...finishedGoods, data];
      await supabase.saveFinishedGoods(list);
    }
    setFinishedModal({ isOpen: false, isEdit: false, data: null });
    await loadAll();
  };

  const handleDeleteFinished = async (id) => {
    if (!confirm('이 완제품을 삭제하시겠습니까?')) return;
    await supabase.deleteFinishedGood(id);
    await loadAll();
  };

  // --------------------------------------------------------------------------
  // PRODUCTS ACTIONS
  // --------------------------------------------------------------------------
  const handleOpenAddProduct = () => {
    setProductModal({
      isOpen: true,
      isEdit: false,
      data: {
        id: `prod_${Date.now()}`,
        name: '',
        stock: 0,
        materials: []
      }
    });
  };

  const handleSaveProduct = async () => {
    const { isEdit, data } = productModal;
    if (!data.name?.trim()) {
      alert('상품명을 입력해 주세요.');
      return;
    }

    if (isEdit) {
      await supabase.updateProduct(data.id, data);
    } else {
      const list = [...products, data];
      await supabase.saveProducts(list);
    }
    setProductModal({ isOpen: false, isEdit: false, data: null });
    await loadAll();
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('이 상품을 삭제하시겠습니까?')) return;
    await supabase.deleteProduct(id);
    await loadAll();
  };

  // --------------------------------------------------------------------------
  // RAW MATERIALS ACTIONS (단가/금액 필드 미노출)
  // --------------------------------------------------------------------------
  const handleOpenAddRaw = () => {
    setRawModal({
      isOpen: true,
      isEdit: false,
      data: {
        id: `mat_${Date.now()}`,
        name: '',
        stock: 0,
        unit: 'kg',
        unit_price: 10000 // default internal
      }
    });
  };

  const handleSaveRaw = async () => {
    const { isEdit, data } = rawModal;
    if (!data.name?.trim()) {
      alert('원재료명을 입력해 주세요.');
      return;
    }

    if (isEdit) {
      await supabase.updateRawMaterial(data.id, {
        name: data.name,
        stock: parseFloat(data.stock) || 0,
        unit: data.unit
      });
    } else {
      const list = [...rawMaterials, data];
      await supabase.saveRawMaterials(list);
    }
    setRawModal({ isOpen: false, isEdit: false, data: null });
    await loadAll();
  };

  const handleDeleteRaw = async (id) => {
    if (!confirm('이 원재료를 삭제하시겠습니까?')) return;
    await supabase.deleteRawMaterial(id);
    await loadAll();
  };

  // --------------------------------------------------------------------------
  // INVENTORY LOGS ACTIONS
  // --------------------------------------------------------------------------
  const handleDeleteLog = async (id) => {
    if (!confirm('이 변경 기록을 삭제하시겠습니까? (재고량은 유지되고 기록만 삭제됩니다)')) return;
    await supabase.deleteInventoryLog(id);
    setLogModal({ isOpen: false, data: null });
    await loadAll();
  };

  // --------------------------------------------------------------------------
  // PRICING CALCULATOR LOGIC (하드코딩 없음, DB 연동)
  // --------------------------------------------------------------------------
  const totalCost = useMemo(() => {
    return Math.round(
      calcRecipeItems.reduce((acc, item) => acc + ((item.unitPrice || 0) * (item.qty || 0)), 0)
    );
  }, [calcRecipeItems]);

  const marginAmount = calcCustomSalePrice - totalCost;
  const marginPercent = calcCustomSalePrice > 0 ? Math.round((marginAmount / calcCustomSalePrice) * 100) : 0;
  const suggestedPrice = calcTargetMargin < 100 ? Math.round(totalCost / (1 - (calcTargetMargin / 100)) / 100) * 100 : 0;

  const handleSaveRecipe = () => {
    localStorage.setItem(`yuzu_calc_${calcSelectedGoodId}`, JSON.stringify(calcRecipeItems));
    alert('단가 레시피가 성공적으로 보관되었습니다.');
  };

  // --------------------------------------------------------------------------
  // LANDING SETTINGS SAVE
  // --------------------------------------------------------------------------
  const handleSaveLanding = async () => {
    const primaryPopup = Array.isArray(landingSettings.popups) && landingSettings.popups.length > 0
      ? landingSettings.popups[0]
      : (landingSettings.popup || defaultLandingSettings.popup);

    const payload = {
      ...landingSettings,
      popup: primaryPopup
    };
    await supabase.updateLandingSettings(payload);
    alert('랜딩페이지 설정이 저장되었습니다.');
  };

  // 1. Gate Screen
  if (!isMounted || !isAuthenticated) {
    return (
      <div className="auth-gate-backdrop">
        <div className="auth-gate-card">
          <div className="auth-gate-icon">
            <Lock size={28} />
          </div>
          <h2>관리자 전용 대시보드</h2>
          <p>
            유자품은 오란다&까부리 통합 관리 시스템입니다.<br />
            비밀번호를 입력하여 입장해 주세요.
          </p>
          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              type="password" 
              value={gatePassword}
              onChange={(e) => setGatePassword(e.target.value)}
              placeholder="관리자 암호 (기본값: yuzu1234)" 
              autoFocus
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: showGateError ? '1.5px solid #C0392B' : '1.5px solid #EAE8E3',
                fontSize: '15px',
                outline: 'none',
                textAlign: 'center'
              }}
            />
            {showGateError && (
              <span style={{ fontSize: '13px', color: '#C0392B', fontWeight: '700' }}>
                비밀번호가 올바르지 않습니다.
              </span>
            )}
            <button 
              type="submit" 
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#2D6A4F',
                color: 'white',
                border: 'none',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer'
              }}
            >
              대시보드 입장
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-en">YUZU ADMIN</span>
          <div style={{ fontSize: '12px', color: '#6B6862', marginTop: '4px' }}>
            통합 관리 시스템
          </div>
        </div>

        <nav className="sidebar-menu">
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#6B6862', padding: '0 16px 8px', letterSpacing: '0.5px' }}>
            CORE MANAGEMENT
          </div>

          <button 
            className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingCart size={18} />
            <span>주문 관리</span>
            <span style={{ marginLeft: 'auto', fontSize: '11px', opacity: 0.8, backgroundColor: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '10px' }}>
              {orders.length}
            </span>
          </button>

          <button 
            className={`sidebar-link ${activeTab === 'raw' ? 'active' : ''}`}
            onClick={() => setActiveTab('raw')}
          >
            <Boxes size={18} />
            <span>1. 원재료 관리</span>
            <span style={{ marginLeft: 'auto', fontSize: '11px', opacity: 0.8, backgroundColor: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '10px' }}>
              {rawMaterials.length}
            </span>
          </button>

          <button 
            className={`sidebar-link ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Layers size={18} />
            <span>2. 상품(낱개) 관리</span>
            <span style={{ marginLeft: 'auto', fontSize: '11px', opacity: 0.8, backgroundColor: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '10px' }}>
              {products.length}
            </span>
          </button>

          <button 
            className={`sidebar-link ${activeTab === 'finished' ? 'active' : ''}`}
            onClick={() => setActiveTab('finished')}
          >
            <Package size={18} />
            <span>3. 완제품 관리</span>
            <span style={{ marginLeft: 'auto', fontSize: '11px', opacity: 0.8, backgroundColor: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '10px' }}>
              {finishedGoods.length}
            </span>
          </button>

          <button 
            className={`sidebar-link ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <History size={18} />
            <span>4. 변경 내역 (감사)</span>
            <span style={{ marginLeft: 'auto', fontSize: '11px', opacity: 0.8, backgroundColor: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '10px' }}>
              {inventoryLogs.length}
            </span>
          </button>

          <div style={{ fontSize: '11px', fontWeight: '800', color: '#6B6862', padding: '16px 16px 8px', letterSpacing: '0.5px' }}>
            SUB UTILITIES
          </div>

          <button 
            className={`sidebar-link ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => setActiveTab('pricing')}
          >
            <Calculator size={18} />
            <span>단가 계산기</span>
          </button>

          <button 
            className={`sidebar-link ${activeTab === 'landing' ? 'active' : ''}`}
            onClick={() => setActiveTab('landing')}
          >
            <Globe size={18} />
            <span>랜딩페이지 설정</span>
          </button>
        </nav>

        <div className="sidebar-footer" style={{ padding: '20px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button 
            onClick={() => {
              sessionStorage.removeItem('yuzu_admin_auth');
              setIsAuthenticated(false);
            }}
            className="sidebar-link" 
            style={{ color: '#E74C3C' }}
          >
            <LogOut size={18} />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content" style={{ flexGrow: 1, backgroundColor: '#F8F7F4', minHeight: '100vh', padding: '28px 36px', overflowY: 'auto' }}>
        
        {/* ==================================================================== */}
        {/* TAB 1: ORDERS (주문 테이블)                                          */}
        {/* ==================================================================== */}
        {activeTab === 'orders' && (
          <DataTable
            title="주문 관리"
            subtitle="매장 및 현장에서 직접 접수된 완제품 주문을 등록하고 상태를 관리합니다."
            data={filteredOrdersByDate}
            searchKeys={['customer_name', 'phone', 'product_name', 'memo']}
            searchPlaceholder="주문자명, 연락처, 상품명 검색..."
            filterKey="status"
            filterOptions={[
              { label: '전체 주문 상태', value: 'all' },
              { label: '주문 접수', value: '주문 접수' },
              { label: '상품 준비', value: '상품 준비' },
              { label: '수령 완료', value: '수령 완료' },
              { label: '취소', value: '취소' }
            ]}
            sortOptions={[
              { label: '최신 주문순', key: 'order_date', dir: 'desc' },
              { label: '과거 주문순', key: 'order_date', dir: 'asc' },
              { label: '주문자 가나다순', key: 'customer_name', dir: 'asc' },
              { label: '수량 많은순', key: 'quantity', dir: 'desc' }
            ]}
            onAdd={handleOpenAddOrder}
            addButtonText="현장 주문 등록"
            onRefresh={loadAll}
            isRefreshing={isRefreshing}
            extraHeaderActions={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#FAF6EE',
                  border: '1px solid #EAE8E3',
                  borderRadius: '8px',
                  padding: '3px',
                  gap: '2px'
                }}>
                  {[
                    { label: '전체', val: 'all' },
                    { label: '오늘', val: 'today' },
                    { label: '최근 7일', val: '7d' },
                    { label: '최근 30일', val: '30d' },
                    { label: '직접 지정', val: 'custom' }
                  ].map(b => (
                    <button
                      key={b.val}
                      type="button"
                      onClick={() => setOrderDateRange(b.val)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        backgroundColor: orderDateRange === b.val ? '#2D6A4F' : 'transparent',
                        color: orderDateRange === b.val ? '#FFFFFF' : '#6B6862',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>

                {orderDateRange === 'custom' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="date"
                      value={orderStartDate}
                      onChange={(e) => setOrderStartDate(e.target.value)}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid #EAE8E3',
                        fontSize: '12px',
                        backgroundColor: '#FFFFFF'
                      }}
                    />
                    <span style={{ fontSize: '12px', color: '#8C8983' }}>~</span>
                    <input
                      type="date"
                      value={orderEndDate}
                      onChange={(e) => setOrderEndDate(e.target.value)}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid #EAE8E3',
                        fontSize: '12px',
                        backgroundColor: '#FFFFFF'
                      }}
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleExportOrdersToExcel(filteredOrdersByDate)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #2D6A4F',
                    backgroundColor: '#FAFDFB',
                    color: '#2D6A4F',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="현재 필터링된 주문 내역을 엑셀(CSV) 파일로 다운로드합니다"
                >
                  <Download size={15} />
                  <span>엑셀 내보내기</span>
                </button>
              </div>
            }
            columns={[
              {
                key: 'order_date',
                label: '주문 일시',
                width: '140px',
                render: (val) => <span style={{ fontSize: '13px', color: '#6B6862' }}>{formatDateTime(val)}</span>
              },
              {
                key: 'customer_name',
                label: '주문자명',
                width: '110px',
                render: (val) => <strong style={{ color: '#2B2A27' }}>{val}</strong>
              },
              {
                key: 'phone',
                label: '연락처',
                width: '130px',
                render: (val) => <span style={{ color: '#6B6862', fontSize: '13px' }}>{val || '-'}</span>
              },
              {
                key: 'product_name',
                label: '주문 상품(완제품)',
                render: (val) => <span style={{ fontWeight: '700', color: '#2B2A27' }}>{val}</span>
              },
              {
                key: 'quantity',
                label: '수량',
                align: 'center',
                width: '80px',
                render: (val) => <span style={{ fontWeight: '800' }}>{val}개</span>
              },
              {
                key: 'total_price',
                label: '합계 금액 (주문시점 고정)',
                align: 'right',
                width: '150px',
                render: (_, row) => {
                  let total = row.total_price;
                  if (total === undefined || total === null) {
                    if (row.unit_price !== undefined && row.unit_price !== null) {
                      total = Number(row.unit_price) * (row.quantity || 1);
                    } else {
                      const good = finishedGoods.find(g => g.name === row.product_name || g.id === row.product_id);
                      const price = good ? good.price : 20000;
                      total = price * (row.quantity || 1);
                    }
                  }
                  return (
                    <div>
                      <strong style={{ color: '#2D6A4F', fontSize: '15px' }}>
                        {formatCurrency(total)}
                      </strong>
                      {row.unit_price ? (
                        <div style={{ fontSize: '11px', color: '#8C6F3E', marginTop: '2px' }}>
                          단가: {formatCurrency(row.unit_price)}
                        </div>
                      ) : null}
                    </div>
                  );
                }
              },
              {
                key: 'status',
                label: '주문 상태 (클릭 변경)',
                align: 'center',
                width: '130px',
                render: (val, row) => {
                  let bg = '#FEF9E7';
                  let color = '#F39C12';
                  if (val === '수령 완료') { bg = '#D8F3DC'; color = '#2D6A4F'; }
                  else if (val === '상품 준비') { bg = '#EBF5FB'; color = '#2980B9'; }
                  else if (val === '취소') { bg = '#FDEDEC'; color = '#C0392B'; }

                  return (
                    <button
                      onClick={() => handleToggleOrderStatus(row)}
                      title="클릭하여 다음 상태로 즉시 변경"
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        border: `1px solid ${color}44`,
                        backgroundColor: bg,
                        color,
                        fontWeight: '800',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {val}
                    </button>
                  );
                }
              },
              {
                key: 'memo',
                label: '메모',
                render: (val) => <span style={{ fontSize: '13px', color: '#6B6862' }}>{val || '-'}</span>
              },
              {
                key: 'actions',
                label: '관리',
                align: 'center',
                width: '100px',
                render: (_, row) => (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenEditOrder(row)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6862', padding: '4px' }}
                      title="수정"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(row.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0392B', padding: '4px' }}
                      title="삭제"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )
              }
            ]}
          />
        )}

        {/* ==================================================================== */}
        {/* TAB 2: FINISHED GOODS (완제품 관리 테이블)                           */}
        {/* ==================================================================== */}
        {activeTab === 'finished' && (
          <DataTable
            title="완제품(세트) 관리"
            subtitle="소비자에게 판매되는 최종 세트 상품 구성 및 판매가, 재고량을 관리합니다."
            data={finishedGoods}
            searchKeys={['name', 'set_type']}
            searchPlaceholder="완제품 세트명, 세트 구분 검색..."
            sortOptions={[
              { label: '설정순 (기본)', key: '_order', dir: 'asc' },
              { label: '세트명순', key: 'name', dir: 'asc' },
              { label: '가격 높은순', key: 'price', dir: 'desc' },
              { label: '가격 낮은순', key: 'price', dir: 'asc' },
              { label: '재고 많은순', key: 'stock', dir: 'desc' }
            ]}
            onAdd={handleOpenAddFinished}
            addButtonText="완제품 세트 등록"
            onRefresh={loadAll}
            isRefreshing={isRefreshing}
            columns={[
              {
                key: '_order_move',
                label: '순서',
                width: '76px',
                align: 'center',
                render: (_, row) => {
                  const idx = finishedGoods.findIndex(g => g.id === row.id);
                  return (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleMoveItem('finished_goods', idx, -1); }}
                        disabled={idx <= 0}
                        style={{
                          border: '1px solid #D6D3CC',
                          backgroundColor: idx <= 0 ? '#F5F4F0' : '#FFFFFF',
                          color: idx <= 0 ? '#C0BDB7' : '#2B2A27',
                          cursor: idx <= 0 ? 'not-allowed' : 'pointer',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '800',
                          lineHeight: 1
                        }}
                        title="위로 이동"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleMoveItem('finished_goods', idx, 1); }}
                        disabled={idx >= finishedGoods.length - 1}
                        style={{
                          border: '1px solid #D6D3CC',
                          backgroundColor: idx >= finishedGoods.length - 1 ? '#F5F4F0' : '#FFFFFF',
                          color: idx >= finishedGoods.length - 1 ? '#C0BDB7' : '#2B2A27',
                          cursor: idx >= finishedGoods.length - 1 ? 'not-allowed' : 'pointer',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '800',
                          lineHeight: 1
                        }}
                        title="아래로 이동"
                      >
                        ▼
                      </button>
                    </div>
                  );
                }
              },
              {
                key: 'name',
                label: '세트 상품명',
                render: (val, row) => (
                  <div>
                    <strong style={{ fontSize: '15px', color: '#2B2A27' }}>{val}</strong>
                    <div style={{ fontSize: '12px', color: '#8C6F3E', marginTop: '2px' }}>
                      구분: {row.set_type}세트
                    </div>
                  </div>
                )
              },
              {
                key: 'price',
                label: '판매 금액',
                align: 'right',
                width: '140px',
                render: (val) => <strong style={{ fontSize: '15px', color: '#2D6A4F' }}>{formatCurrency(val)}</strong>
              },
              {
                key: 'stock',
                label: '현재 완제품 재고',
                align: 'center',
                width: '160px',
                render: (val) => <StockBadge stock={val} unit="박스" minThreshold={15} />
              },
              {
                key: 'composition',
                label: '상품 세부 구성',
                render: (val) => {
                  if (!val || !Array.isArray(val) || val.length === 0) return <span style={{ color: '#A09E9B' }}>구성 정보 없음</span>;
                  return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {val.map((c, i) => (
                        <span key={i} style={{ backgroundColor: '#FAF6EE', border: '1px solid #EAE8E3', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', color: '#55524E' }}>
                          {c.name}: <strong>{c.qty}개</strong>
                        </span>
                      ))}
                    </div>
                  );
                }
              },
              {
                key: 'actions',
                label: '수정/삭제',
                align: 'center',
                width: '100px',
                render: (_, row) => (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <button
                      onClick={() => setFinishedModal({ isOpen: true, isEdit: true, data: { ...row } })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6862', padding: '4px' }}
                      title="팝업 수정"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteFinished(row.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0392B', padding: '4px' }}
                      title="삭제"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )
              }
            ]}
          />
        )}

        {/* ==================================================================== */}
        {/* TAB 3: PRODUCTS (상품 낱개 관리 테이블)                              */}
        {/* ==================================================================== */}
        {activeTab === 'products' && (
          <DataTable
            title="상품(낱개) 관리"
            subtitle="가공 및 생산되는 낱개 단위 상품과 포함 원재료 목록을 관리합니다."
            data={products}
            searchKeys={['name']}
            searchPlaceholder="상품명 검색..."
            sortOptions={[
              { label: '설정순 (기본)', key: '_order', dir: 'asc' },
              { label: '상품명순', key: 'name', dir: 'asc' },
              { label: '재고 많은순', key: 'stock', dir: 'desc' },
              { label: '재고 적은순', key: 'stock', dir: 'asc' }
            ]}
            onAdd={handleOpenAddProduct}
            addButtonText="신규 상품 등록"
            onRefresh={loadAll}
            isRefreshing={isRefreshing}
            columns={[
              {
                key: '_order_move',
                label: '순서',
                width: '76px',
                align: 'center',
                render: (_, row) => {
                  const idx = products.findIndex(p => p.id === row.id);
                  return (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleMoveItem('products', idx, -1); }}
                        disabled={idx <= 0}
                        style={{
                          border: '1px solid #D6D3CC',
                          backgroundColor: idx <= 0 ? '#F5F4F0' : '#FFFFFF',
                          color: idx <= 0 ? '#C0BDB7' : '#2B2A27',
                          cursor: idx <= 0 ? 'not-allowed' : 'pointer',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '800',
                          lineHeight: 1
                        }}
                        title="위로 이동"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleMoveItem('products', idx, 1); }}
                        disabled={idx >= products.length - 1}
                        style={{
                          border: '1px solid #D6D3CC',
                          backgroundColor: idx >= products.length - 1 ? '#F5F4F0' : '#FFFFFF',
                          color: idx >= products.length - 1 ? '#C0BDB7' : '#2B2A27',
                          cursor: idx >= products.length - 1 ? 'not-allowed' : 'pointer',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '800',
                          lineHeight: 1
                        }}
                        title="아래로 이동"
                      >
                        ▼
                      </button>
                    </div>
                  );
                }
              },
              {
                key: 'name',
                label: '상품명',
                render: (val) => <strong style={{ fontSize: '15px', color: '#2B2A27' }}>{val}</strong>
              },
              {
                key: 'stock',
                label: '현재 낱개 재고량',
                align: 'center',
                width: '160px',
                render: (val) => <StockBadge stock={val} unit="개" minThreshold={50} />
              },
              {
                key: 'materials',
                label: '포함 원재료 목록 (단순기록용 참조)',
                render: (val) => {
                  if (!val || !Array.isArray(val) || val.length === 0) return <span style={{ color: '#A09E9B' }}>등록된 원재료 없음</span>;
                  return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {val.map((m, i) => (
                        <span key={i} style={{ backgroundColor: '#FAF9F6', border: '1px solid #EAE8E3', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                          {m.name}
                        </span>
                      ))}
                    </div>
                  );
                }
              },
              {
                key: 'actions',
                label: '수정/삭제',
                align: 'center',
                width: '100px',
                render: (_, row) => (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <button
                      onClick={() => setProductModal({ isOpen: true, isEdit: true, data: { ...row } })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6862', padding: '4px' }}
                      title="팝업 수정"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(row.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0392B', padding: '4px' }}
                      title="삭제"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )
              }
            ]}
          />
        )}

        {/* ==================================================================== */}
        {/* TAB 4: RAW MATERIALS (원재료 관리 테이블 - 금액/단가 비노출)          */}
        {/* ==================================================================== */}
        {activeTab === 'raw' && (
          <DataTable
            title="원재료 관리"
            subtitle="오란다/까부리 제조에 투입되는 원부자재 목록 및 재고 단위를 관리합니다."
            data={rawMaterials}
            searchKeys={['name', 'unit']}
            searchPlaceholder="원재료명, 단위 검색..."
            sortOptions={[
              { label: '설정순 (기본)', key: '_order', dir: 'asc' },
              { label: '원재료명순', key: 'name', dir: 'asc' },
              { label: '재고 많은순', key: 'stock', dir: 'desc' },
              { label: '재고 적은순', key: 'stock', dir: 'asc' }
            ]}
            onAdd={handleOpenAddRaw}
            addButtonText="신규 원재료 등록"
            onRefresh={loadAll}
            isRefreshing={isRefreshing}
            columns={[
              {
                key: '_order_move',
                label: '순서',
                width: '76px',
                align: 'center',
                render: (_, row) => {
                  const idx = rawMaterials.findIndex(m => m.id === row.id);
                  return (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleMoveItem('raw_materials', idx, -1); }}
                        disabled={idx <= 0}
                        style={{
                          border: '1px solid #D6D3CC',
                          backgroundColor: idx <= 0 ? '#F5F4F0' : '#FFFFFF',
                          color: idx <= 0 ? '#C0BDB7' : '#2B2A27',
                          cursor: idx <= 0 ? 'not-allowed' : 'pointer',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '800',
                          lineHeight: 1
                        }}
                        title="위로 이동"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleMoveItem('raw_materials', idx, 1); }}
                        disabled={idx >= rawMaterials.length - 1}
                        style={{
                          border: '1px solid #D6D3CC',
                          backgroundColor: idx >= rawMaterials.length - 1 ? '#F5F4F0' : '#FFFFFF',
                          color: idx >= rawMaterials.length - 1 ? '#C0BDB7' : '#2B2A27',
                          cursor: idx >= rawMaterials.length - 1 ? 'not-allowed' : 'pointer',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '800',
                          lineHeight: 1
                        }}
                        title="아래로 이동"
                      >
                        ▼
                      </button>
                    </div>
                  );
                }
              },
              {
                key: 'name',
                label: '원재료명',
                render: (val) => <strong style={{ fontSize: '15px', color: '#2B2A27' }}>{val}</strong>
              },
              {
                key: 'stock',
                label: '현재고',
                align: 'center',
                width: '180px',
                render: (val, row) => <StockBadge stock={val} unit={row.unit} minThreshold={20} />
              },
              {
                key: 'unit',
                label: '재고 단위',
                align: 'center',
                width: '120px',
                render: (val) => <span style={{ fontWeight: '700', color: '#8C6F3E', backgroundColor: '#FFEFA6', padding: '2px 10px', borderRadius: '4px', fontSize: '12px' }}>{val}</span>
              },
              {
                key: 'actions',
                label: '수정/삭제',
                align: 'center',
                width: '100px',
                render: (_, row) => (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <button
                      onClick={() => setRawModal({ isOpen: true, isEdit: true, data: { ...row } })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6862', padding: '4px' }}
                      title="팝업 수정"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteRaw(row.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0392B', padding: '4px' }}
                      title="삭제"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )
              }
            ]}
          />
        )}

        {/* ==================================================================== */}
        {/* TAB 5: INVENTORY LOGS (변경 내역 테이블)                             */}
        {/* ==================================================================== */}
        {activeTab === 'logs' && (
          <DataTable
            title="재고 관리 기록 (감사 이력)"
            subtitle="원재료, 상품, 완제품의 모든 생산/조정/입출고 변경 내역과 사유를 추적합니다."
            data={inventoryLogs}
            searchKeys={['reason', 'changes']}
            searchPlaceholder="변경 사유 또는 변경된 품목명 검색..."
            sortOptions={[
              { label: '최신 기록순', key: 'created_at', dir: 'desc' },
              { label: '과거 기록순', key: 'created_at', dir: 'asc' }
            ]}
            onRefresh={loadAll}
            isRefreshing={isRefreshing}
            columns={[
              {
                key: 'created_at',
                label: '변경 생성 일시',
                width: '160px',
                render: (val) => <span style={{ fontSize: '13px', color: '#6B6862' }}>{formatDateTime(val)}</span>
              },
              {
                key: 'reason',
                label: '변경 사유',
                width: '260px',
                render: (val) => <strong style={{ color: '#2B2A27', fontSize: '14px' }}>{val}</strong>
              },
              {
                key: 'changes',
                label: '세부 변경 내역',
                render: (val) => {
                  if (!val || !Array.isArray(val)) return '-';
                  return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {val.map((c, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '12px',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: c.diff > 0 ? '#E8F5E9' : '#FDEDEC',
                            color: c.diff > 0 ? '#2D6A4F' : '#C0392B',
                            border: `1px solid ${c.diff > 0 ? '#A3D9C9' : '#F5B7B1'}`
                          }}
                        >
                          {c.name}: {c.diff > 0 ? `+${c.diff}` : c.diff} {c.unit}
                        </span>
                      ))}
                    </div>
                  );
                }
              },
              {
                key: 'actions',
                label: '상세/관리',
                align: 'center',
                width: '100px',
                render: (_, row) => (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <button
                      onClick={() => setLogModal({ isOpen: true, data: { ...row } })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6862', padding: '4px' }}
                      title="상세 보기 및 사유 수정"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteLog(row.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0392B', padding: '4px' }}
                      title="기록 삭제"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )
              }
            ]}
          />
        )}

        {/* ==================================================================== */}
        {/* SUB TAB: PRICING CALCULATOR (단가 계산기 - 하드코딩 제거)            */}
        {/* ==================================================================== */}
        {activeTab === 'pricing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #EAE8E3',
              boxShadow: '0 4px 20px rgba(180, 160, 120, 0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#2B2A27', margin: 0 }}>
                    원가 및 단가 계산기 (부가 기능)
                  </h2>
                  <p style={{ fontSize: '13px', color: '#6B6862', margin: '4px 0 0 0' }}>
                    원재료 데이터베이스와 실시간 연동되어 마진율과 소요 원가를 시뮬레이션합니다.
                  </p>
                </div>
                
                {/* Product Select */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '700', color: '#2B2A27' }}>대상 완제품:</label>
                  <select
                    value={calcSelectedGoodId}
                    onChange={(e) => setCalcSelectedGoodId(e.target.value)}
                    style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #EAE8E3', fontWeight: '700' }}
                  >
                    {finishedGoods.map(g => (
                      <option key={g.id} value={g.id}>{g.name} ({g.set_type})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Summary KPIs */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{ backgroundColor: '#FAF6EE', padding: '16px', borderRadius: '12px', border: '1px solid #EAE8E3' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#8C6F3E' }}>총 소요 원가 (개당)</span>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#2B2A27', marginTop: '4px' }}>
                    {formatCurrency(totalCost)}
                  </div>
                </div>

                <div style={{ backgroundColor: '#FAF9F6', padding: '16px', borderRadius: '12px', border: '1px solid #EAE8E3' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#6B6862' }}>설정 판매가</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <input
                      type="number"
                      value={calcCustomSalePrice}
                      onChange={(e) => setCalcCustomSalePrice(parseFloat(e.target.value) || 0)}
                      style={{ fontSize: '20px', fontWeight: '800', width: '130px', padding: '2px 8px', border: '1px solid #EAE8E3', borderRadius: '6px' }}
                    />
                    <span style={{ fontSize: '16px', fontWeight: '700' }}>원</span>
                  </div>
                </div>

                <div style={{ backgroundColor: marginPercent >= 40 ? '#D8F3DC' : '#FEF9E7', padding: '16px', borderRadius: '12px', border: '1px solid #EAE8E3' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: marginPercent >= 40 ? '#2D6A4F' : '#F39C12' }}>
                    마진액 및 마진율
                  </span>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: marginPercent >= 40 ? '#2D6A4F' : '#F39C12', marginTop: '4px' }}>
                    {marginPercent}% <span style={{ fontSize: '14px', fontWeight: '600' }}>({formatCurrency(marginAmount)})</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#FAF6EE', padding: '16px', borderRadius: '12px', border: '1px solid #EAE8E3' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#8C6F3E' }}>목표 마진 {calcTargetMargin}% 기준 권장가</span>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#2D6A4F', marginTop: '4px' }}>
                    {formatCurrency(suggestedPrice)}
                  </div>
                </div>
              </div>

              {/* Recipe Items Table */}
              <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 12px 0' }}>
                투입 원재료 배합비율 (실시간 수정 가능)
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#FAF6EE', borderBottom: '1px solid #EAE8E3', color: '#6B6862' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>항목명 (직접수정)</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', width: '220px' }}>단위당 가격 및 단위</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', width: '160px' }}>투입 소요량</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', width: '140px' }}>환산 원가</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', width: '70px' }}>삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {calcRecipeItems.map((item, idx) => {
                    const rowCost = Math.round((item.unitPrice || 0) * (item.qty || 0));
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #F0EEE9' }}>
                        <td style={{ padding: '10px 14px' }}>
                          <input
                            type="text"
                            value={item.name || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCalcRecipeItems(prev => prev.map((it, i) => i === idx ? { ...it, name: val } : it));
                            }}
                            placeholder="항목명 (예: 오란다 알갱이, 박스비 등)"
                            style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontWeight: '700', fontSize: '13px' }}
                          />
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <input
                              type="number"
                              value={item.unitPrice !== undefined ? item.unitPrice : 0}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setCalcRecipeItems(prev => prev.map((it, i) => i === idx ? { ...it, unitPrice: val } : it));
                              }}
                              style={{ width: '90px', padding: '4px 8px', textAlign: 'right', border: '1px solid #EAE8E3', borderRadius: '6px', fontSize: '13px' }}
                            />
                            <span style={{ fontSize: '12px', color: '#6B6862' }}>원 /</span>
                            <input
                              type="text"
                              value={item.unit || 'kg'}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCalcRecipeItems(prev => prev.map((it, i) => i === idx ? { ...it, unit: val } : it));
                              }}
                              placeholder="단위"
                              style={{ width: '55px', padding: '4px 6px', textAlign: 'center', border: '1px solid #EAE8E3', borderRadius: '6px', fontSize: '13px' }}
                            />
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <input
                              type="number"
                              step="0.01"
                              value={item.qty !== undefined ? item.qty : 0}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setCalcRecipeItems(prev => prev.map((it, i) => i === idx ? { ...it, qty: val } : it));
                              }}
                              style={{ width: '80px', padding: '4px 8px', textAlign: 'right', border: '1px solid #EAE8E3', borderRadius: '6px', fontSize: '13px' }}
                            />
                            <span style={{ fontSize: '12px', color: '#6B6862', minWidth: '24px' }}>{item.unit || 'kg'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '800', color: '#2D6A4F' }}>
                          {formatCurrency(rowCost)}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <button
                            onClick={() => setCalcRecipeItems(prev => prev.filter((_, i) => i !== idx))}
                            style={{ background: 'none', border: 'none', color: '#C0392B', cursor: 'pointer', padding: '4px' }}
                            title="항목 제거"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <button
                  onClick={() => {
                    setCalcRecipeItems(prev => [
                      ...prev,
                      {
                        id: `calc_item_${Date.now()}`,
                        name: '새 원부자재/항목',
                        unitPrice: 10000,
                        qty: 0.1,
                        unit: 'kg'
                      }
                    ]);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #EAE8E3', backgroundColor: '#FAF6EE', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}
                >
                  <Plus size={14} /> <span>원재료 투입 추가</span>
                </button>

                <button
                  onClick={handleSaveRecipe}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#2D6A4F', color: '#FFFFFF', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
                >
                  <Save size={16} /> <span>단가 설정 보관</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* SUB TAB: LANDING SETTINGS (독립 보존된 랜딩페이지 실시간 설정)        */}
        {/* ==================================================================== */}
        {activeTab === 'landing' && (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid #EAE8E3',
            boxShadow: '0 4px 20px rgba(180, 160, 120, 0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#2B2A27', margin: 0 }}>
                  랜딩페이지 설정 (소비자 노출 관리)
                </h2>
                <p style={{ fontSize: '13px', color: '#6B6862', margin: '4px 0 0 0' }}>
                  독립 유지되는 메인 랜딩페이지의 공지 팝업 및 헤더 문구를 실시간 변경합니다.
                </p>
              </div>
              <button
                onClick={handleSaveLanding}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#2D6A4F',
                  color: '#FFFFFF',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                <Save size={16} /> <span>랜딩 설정 저장</span>
              </button>
            </div>

            {/* Section 1: Multi-Popup Settings */}
            <div style={{ border: '1px solid #EAE8E3', borderRadius: '14px', padding: '22px', marginBottom: '22px', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <strong style={{ fontSize: '17px', color: '#2B2A27' }}>1. 공지사항 팝업 관리 (다중 팝업 지원)</strong>
                  <p style={{ fontSize: '13px', color: '#6B6862', margin: '4px 0 0 0' }}>
                    여러 개의 팝업을 등록할 수 있으며, 활성화된 팝업들은 메인 랜딩에서 슬라이더(캐러셀)로 넘겨볼 수 있습니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLandingSettings(prev => {
                    const currentPopups = Array.isArray(prev.popups) && prev.popups.length > 0
                      ? prev.popups
                      : (prev.popup ? [{ id: 'popup_1', ...defaultLandingSettings.popups[0], ...prev.popup }] : defaultLandingSettings.popups);
                    return {
                      ...prev,
                      popups: [
                        ...currentPopups,
                        {
                          id: `popup_${Date.now()}`,
                          enabled: true,
                          title: '새 공지사항',
                          content: '공지 내용을 입력하세요.',
                          image: '',
                          link: 'https://smartstore.naver.com/kkaburioranda',
                          linkText: '자세히 보기'
                        }
                      ]
                    };
                  })}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #2D6A4F',
                    backgroundColor: '#FAFDFB',
                    color: '#2D6A4F',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={15} /> <span>새 팝업 추가</span>
                </button>
              </div>

              {/* Popups List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(() => {
                  const popupsList = Array.isArray(landingSettings.popups) && landingSettings.popups.length > 0
                    ? landingSettings.popups
                    : (landingSettings.popup ? [{ id: 'popup_1', ...defaultLandingSettings.popups[0], ...landingSettings.popup }] : defaultLandingSettings.popups);

                  return popupsList.map((pop, pIdx) => (
                    <div 
                      key={pop.id || pIdx} 
                      style={{ 
                        border: '1px solid #EAE8E3', 
                        borderRadius: '10px', 
                        padding: '16px', 
                        backgroundColor: '#FAF9F6' 
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ 
                            backgroundColor: '#2D6A4F', 
                            color: '#FFFFFF', 
                            fontWeight: '800', 
                            fontSize: '12px', 
                            padding: '2px 8px', 
                            borderRadius: '12px' 
                          }}>
                            팝업 #{pIdx + 1}
                          </span>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>
                            <input
                              type="checkbox"
                              checked={pop.enabled || false}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setLandingSettings(prev => {
                                  const list = Array.isArray(prev.popups) && prev.popups.length > 0
                                    ? [...prev.popups]
                                    : (prev.popup ? [{ id: 'popup_1', ...defaultLandingSettings.popups[0], ...prev.popup }] : [...defaultLandingSettings.popups]);
                                  list[pIdx] = { ...list[pIdx], enabled: checked };
                                  return { ...prev, popups: list, popup: list[0] };
                                });
                              }}
                            />
                            <span>팝업 노출 활성화</span>
                          </label>
                        </div>

                        {popupsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (!confirm(`팝업 #${pIdx + 1}을(를) 삭제하시겠습니까?`)) return;
                              setLandingSettings(prev => {
                                const list = (prev.popups || []).filter((_, idx) => idx !== pIdx);
                                return { ...prev, popups: list, popup: list[0] || defaultLandingSettings.popup };
                              });
                            }}
                            style={{ background: 'none', border: 'none', color: '#C0392B', cursor: 'pointer', padding: '4px' }}
                            title="팝업 삭제"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#55524E' }}>
                            팝업 제목
                          </label>
                          <input
                            type="text"
                            value={pop.title || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setLandingSettings(prev => {
                                const list = [...(prev.popups || popupsList)];
                                list[pIdx] = { ...list[pIdx], title: val };
                                return { ...prev, popups: list, popup: list[0] };
                              });
                            }}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#55524E' }}>
                            자세히 보기 링크 URL (선택)
                          </label>
                          <input
                            type="text"
                            value={pop.link || ''}
                            placeholder="https://smartstore.naver.com/..."
                            onChange={(e) => {
                              const val = e.target.value;
                              setLandingSettings(prev => {
                                const list = [...(prev.popups || popupsList)];
                                list[pIdx] = { ...list[pIdx], link: val };
                                return { ...prev, popups: list, popup: list[0] };
                              });
                            }}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#55524E' }}>
                            링크 버튼 문구
                          </label>
                          <input
                            type="text"
                            value={pop.linkText || '자세히 보기'}
                            placeholder="자세히 보기"
                            onChange={(e) => {
                              const val = e.target.value;
                              setLandingSettings(prev => {
                                const list = [...(prev.popups || popupsList)];
                                list[pIdx] = { ...list[pIdx], linkText: val };
                                return { ...prev, popups: list, popup: list[0] };
                              });
                            }}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#55524E' }}>
                          공지 본문 내용
                        </label>
                        <textarea
                          rows={3}
                          value={pop.content || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLandingSettings(prev => {
                              const list = [...(prev.popups || popupsList)];
                              list[pIdx] = { ...list[pIdx], content: val };
                              return { ...prev, popups: list, popup: list[0] };
                            });
                          }}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                        />
                      </div>

                      <ImageFieldEditor
                        label={`팝업 #${pIdx + 1} 첨부 이미지 (선택)`}
                        value={pop.image || ''}
                        onChange={(img) => {
                          setLandingSettings(prev => {
                            const list = [...(prev.popups || popupsList)];
                            list[pIdx] = { ...list[pIdx], image: img };
                            return { ...prev, popups: list, popup: list[0] };
                          });
                        }}
                        placeholder="공지 이미지 URL 또는 PC 사진 업로드"
                      />
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Section 2: Hero Copy, Links & Image Settings */}
            <div style={{ border: '1px solid #EAE8E3', borderRadius: '14px', padding: '22px', marginBottom: '22px', backgroundColor: '#FFFFFF' }}>
              <strong style={{ fontSize: '17px', color: '#2B2A27', display: 'block', marginBottom: '14px' }}>
                2. 메인 배너 (Hero Section) 설정
              </strong>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#55524E' }}>
                    상단 배지 문구
                  </label>
                  <input
                    type="text"
                    value={landingSettings.hero?.badge || ''}
                    onChange={(e) => setLandingSettings(prev => ({
                      ...prev,
                      hero: { ...prev.hero, badge: e.target.value }
                    }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#55524E' }}>
                    구매 버튼 문구
                  </label>
                  <input
                    type="text"
                    value={landingSettings.hero?.ctaText || ''}
                    onChange={(e) => setLandingSettings(prev => ({
                      ...prev,
                      hero: { ...prev.hero, ctaText: e.target.value }
                    }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#55524E' }}>
                    구매 버튼 링크 URL
                  </label>
                  <input
                    type="text"
                    value={landingSettings.hero?.ctaLink || ''}
                    onChange={(e) => setLandingSettings(prev => ({
                      ...prev,
                      hero: { ...prev.hero, ctaLink: e.target.value }
                    }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#55524E' }}>
                    스토리 링크 문구
                  </label>
                  <input
                    type="text"
                    value={landingSettings.hero?.storyLinkText || ''}
                    onChange={(e) => setLandingSettings(prev => ({
                      ...prev,
                      hero: { ...prev.hero, storyLinkText: e.target.value }
                    }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#55524E' }}>
                    메인 타이틀
                  </label>
                  <textarea
                    rows={2}
                    value={landingSettings.hero?.title || ''}
                    onChange={(e) => setLandingSettings(prev => ({
                      ...prev,
                      hero: { ...prev.hero, title: e.target.value }
                    }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#55524E' }}>
                    서브 타이틀 설명
                  </label>
                  <textarea
                    rows={2}
                    value={landingSettings.hero?.subtitle || ''}
                    onChange={(e) => setLandingSettings(prev => ({
                      ...prev,
                      hero: { ...prev.hero, subtitle: e.target.value }
                    }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                  />
                </div>
              </div>

              <ImageFieldEditor
                label="메인 히어로 대표 사진"
                value={landingSettings.hero?.image || 'images/yuzu_oranda_hero.png'}
                onChange={(img) => setLandingSettings(prev => ({
                  ...prev,
                  hero: { ...prev.hero, image: img }
                }))}
                placeholder="메인 비주얼 이미지 URL 또는 PC 사진 업로드"
              />
            </div>

            {/* Section 3: Brand Story Copy & Image Settings */}
            <div style={{ border: '1px solid #EAE8E3', borderRadius: '14px', padding: '22px', marginBottom: '22px', backgroundColor: '#FFFFFF' }}>
              <strong style={{ fontSize: '17px', color: '#2B2A27', display: 'block', marginBottom: '14px' }}>
                3. 브랜드 스토리 (Brand Story) 설정
              </strong>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#55524E' }}>
                    서브타이틀
                  </label>
                  <input
                    type="text"
                    value={landingSettings.brandStory?.subtitle || ''}
                    onChange={(e) => setLandingSettings(prev => ({
                      ...prev,
                      brandStory: { ...prev.brandStory, subtitle: e.target.value }
                    }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#55524E' }}>
                    강조 특장점 배지 문구
                  </label>
                  <input
                    type="text"
                    value={landingSettings.brandStory?.featureBadge || ''}
                    onChange={(e) => setLandingSettings(prev => ({
                      ...prev,
                      brandStory: { ...prev.brandStory, featureBadge: e.target.value }
                    }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#55524E' }}>
                    강조 특장점 설명
                  </label>
                  <input
                    type="text"
                    value={landingSettings.brandStory?.featureDesc || ''}
                    onChange={(e) => setLandingSettings(prev => ({
                      ...prev,
                      brandStory: { ...prev.brandStory, featureDesc: e.target.value }
                    }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#55524E' }}>
                    메인 타이틀
                  </label>
                  <textarea
                    rows={2}
                    value={landingSettings.brandStory?.title || ''}
                    onChange={(e) => setLandingSettings(prev => ({
                      ...prev,
                      brandStory: { ...prev.brandStory, title: e.target.value }
                    }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#55524E' }}>
                    스토리 소제목
                  </label>
                  <input
                    type="text"
                    value={landingSettings.brandStory?.sectionTitle || ''}
                    onChange={(e) => setLandingSettings(prev => ({
                      ...prev,
                      brandStory: { ...prev.brandStory, sectionTitle: e.target.value }
                    }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#55524E' }}>
                    스토리 본문 단락 1
                  </label>
                  <textarea
                    rows={2}
                    value={landingSettings.brandStory?.body1 || ''}
                    onChange={(e) => setLandingSettings(prev => ({
                      ...prev,
                      brandStory: { ...prev.brandStory, body1: e.target.value }
                    }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#55524E' }}>
                    스토리 본문 단락 2
                  </label>
                  <textarea
                    rows={2}
                    value={landingSettings.brandStory?.body2 || ''}
                    onChange={(e) => setLandingSettings(prev => ({
                      ...prev,
                      brandStory: { ...prev.brandStory, body2: e.target.value }
                    }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                  />
                </div>
              </div>

              <ImageFieldEditor
                label="브랜드 스토리 소개 사진 (제조 과정 및 제품 연출컷)"
                value={landingSettings.brandStory?.image || 'images/yuzu_classic_oranda.png'}
                onChange={(img) => setLandingSettings(prev => ({
                  ...prev,
                  brandStory: { ...prev.brandStory, image: img }
                }))}
                placeholder="스토리 이미지 URL 또는 PC 사진 업로드"
              />
            </div>

            {/* Section 4: 4-Product Lineup Full Settings (Name, Desc, Original Price, Sale Price, Unit, Badge, URL, Photo) */}
            <div style={{ border: '1px solid #EAE8E3', borderRadius: '14px', padding: '22px', backgroundColor: '#FFFFFF' }}>
              <strong style={{ fontSize: '17px', color: '#2B2A27', display: 'block', marginBottom: '4px' }}>
                4. 제품 소개 라인업 설정 (가격, 할인, 텍스트, 링크, 사진 전체)
              </strong>
              <p style={{ fontSize: '13px', color: '#6B6862', margin: '0 0 18px 0' }}>
                메인 랜딩페이지의 4종 세트 상품 카드에 노출되는 모든 가격, 할인율, 텍스트, 구매 링크, 사진을 직접 변경합니다.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                {[
                  { key: 'deundeun', label: '1. [든든세트] (18개입)' },
                  { key: 'silsok', label: '2. [실속세트] (12개입)' },
                  { key: 'mini', label: '3. [미니세트] (6개입)' },
                  { key: 'natgae', label: '4. [낱개] (1개입)' }
                ].map(({ key, label }) => {
                  const prod = landingSettings.products?.[key] || defaultLandingSettings.products[key] || {};
                  const origPrice = Number(prod.originalPrice) || 0;
                  const price = Number(prod.price) || 0;
                  const discount = origPrice > price ? Math.round((origPrice - price) / origPrice * 100) : 0;

                  return (
                    <div 
                      key={key} 
                      style={{ 
                        border: '1px solid #EAE8E3', 
                        borderRadius: '12px', 
                        padding: '16px', 
                        backgroundColor: '#FAF9F6' 
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <strong style={{ fontSize: '15px', color: '#2B2A27' }}>{label}</strong>
                        {discount > 0 ? (
                          <span style={{ backgroundColor: '#D8F3DC', color: '#2D6A4F', fontSize: '12px', fontWeight: '800', padding: '2px 8px', borderRadius: '10px' }}>
                            -{discount}% 할인 적용중
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#8C8983' }}>할인 없음</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '3px', color: '#55524E' }}>
                            상품명
                          </label>
                          <input
                            type="text"
                            value={prod.name || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setLandingSettings(prev => ({
                                ...prev,
                                products: {
                                  ...prev.products,
                                  [key]: { ...(prev.products?.[key] || defaultLandingSettings.products[key] || {}), name: val }
                                }
                              }));
                            }}
                            style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '3px', color: '#55524E' }}>
                            상품 설명
                          </label>
                          <textarea
                            rows={2}
                            value={prod.desc || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setLandingSettings(prev => ({
                                ...prev,
                                products: {
                                  ...prev.products,
                                  [key]: { ...(prev.products?.[key] || defaultLandingSettings.products[key] || {}), desc: val }
                                }
                              }));
                            }}
                            style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '3px', color: '#55524E' }}>
                              정가 (원)
                            </label>
                            <input
                              type="number"
                              value={prod.originalPrice !== undefined ? prod.originalPrice : 0}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setLandingSettings(prev => ({
                                  ...prev,
                                  products: {
                                    ...prev.products,
                                    [key]: { ...(prev.products?.[key] || defaultLandingSettings.products[key] || {}), originalPrice: val }
                                  }
                                }));
                              }}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '3px', color: '#55524E' }}>
                              판매가 (원)
                            </label>
                            <input
                              type="number"
                              value={prod.price !== undefined ? prod.price : 0}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setLandingSettings(prev => ({
                                  ...prev,
                                  products: {
                                    ...prev.products,
                                    [key]: { ...(prev.products?.[key] || defaultLandingSettings.products[key] || {}), price: val }
                                  }
                                }));
                              }}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '3px', color: '#55524E' }}>
                              구성 단위 문구
                            </label>
                            <input
                              type="text"
                              value={prod.unit || ''}
                              placeholder="(18개입 / 1박스)"
                              onChange={(e) => {
                                const val = e.target.value;
                                setLandingSettings(prev => ({
                                  ...prev,
                                  products: {
                                    ...prev.products,
                                    [key]: { ...(prev.products?.[key] || defaultLandingSettings.products[key] || {}), unit: val }
                                  }
                                }));
                              }}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '3px', color: '#55524E' }}>
                              배지 문구 (예: Best, 추천)
                            </label>
                            <input
                              type="text"
                              value={prod.badge || ''}
                              placeholder="Best, 추천, 인기"
                              onChange={(e) => {
                                const val = e.target.value;
                                setLandingSettings(prev => ({
                                  ...prev,
                                  products: {
                                    ...prev.products,
                                    [key]: { ...(prev.products?.[key] || defaultLandingSettings.products[key] || {}), badge: val }
                                  }
                                }));
                              }}
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '3px', color: '#55524E' }}>
                            스마트스토어 구매 링크 URL
                          </label>
                          <input
                            type="text"
                            value={prod.url || ''}
                            placeholder="https://smartstore.naver.com/..."
                            onChange={(e) => {
                              const val = e.target.value;
                              setLandingSettings(prev => ({
                                ...prev,
                                products: {
                                  ...prev.products,
                                  [key]: { ...(prev.products?.[key] || defaultLandingSettings.products[key] || {}), url: val }
                                }
                              }));
                            }}
                            style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                          />
                        </div>

                        <ImageFieldEditor
                          label="상품 사진"
                          value={prod.image || defaultLandingSettings.products[key].image}
                          onChange={(img) => {
                            setLandingSettings(prev => ({
                              ...prev,
                              products: {
                                ...prev.products,
                                [key]: { ...(prev.products?.[key] || defaultLandingSettings.products[key] || {}), image: img }
                              }
                            }));
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ====================================================================== */}
      {/* MODAL 1: ORDER ADD/EDIT MODAL                                          */}
      {/* ====================================================================== */}
      <ModalPopup
        isOpen={orderModal.isOpen}
        onClose={() => setOrderModal({ isOpen: false, isEdit: false, data: null })}
        title={orderModal.isEdit ? "주문 정보 수정" : "신규 현장 주문 등록"}
        subtitle="완제품 단위로 현장 주문을 기록합니다."
        footerActions={
          <>
            <button
              onClick={() => setOrderModal({ isOpen: false, isEdit: false, data: null })}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #EAE8E3', background: '#FFFFFF', cursor: 'pointer', fontWeight: '600' }}
            >
              취소
            </button>
            <button
              onClick={handleSaveOrder}
              style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2D6A4F', color: '#FFFFFF', cursor: 'pointer', fontWeight: '700' }}
            >
              {orderModal.isEdit ? "수정 저장" : "주문 등록 완료"}
            </button>
          </>
        }
      >
        {orderModal.data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>주문자명 (필수)</label>
              <input
                type="text"
                value={orderModal.data.customer_name || ''}
                onChange={(e) => setOrderModal(prev => ({ ...prev, data: { ...prev.data, customer_name: e.target.value } }))}
                placeholder="예: 홍길동"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE8E3' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>연락처</label>
              <input
                type="text"
                value={orderModal.data.phone || ''}
                onChange={(e) => setOrderModal(prev => ({ ...prev, data: { ...prev.data, phone: e.target.value } }))}
                placeholder="예: 010-1234-5678"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE8E3' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>완제품 상품 선택</label>
              <select
                value={orderModal.data.product_id}
                onChange={(e) => {
                  const sel = finishedGoods.find(g => g.id === e.target.value);
                  setOrderModal(prev => ({
                    ...prev,
                    data: {
                      ...prev.data,
                      product_id: e.target.value,
                      product_name: sel?.name || '',
                      unit_price: sel?.price || 0
                    }
                  }));
                }}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE8E3' }}
              >
                {finishedGoods.map(g => (
                  <option key={g.id} value={g.id}>{g.name} ({formatCurrency(g.price)})</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  주문 시점 단가 (원)
                </label>
                <input
                  type="number"
                  value={orderModal.data.unit_price !== undefined ? orderModal.data.unit_price : ''}
                  onChange={(e) => setOrderModal(prev => ({ ...prev, data: { ...prev.data, unit_price: parseFloat(e.target.value) || 0 } }))}
                  placeholder="단가 입력"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE8E3' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>수량</label>
                <input
                  type="number"
                  min="1"
                  value={orderModal.data.quantity || 1}
                  onChange={(e) => setOrderModal(prev => ({ ...prev, data: { ...prev.data, quantity: parseInt(e.target.value, 10) || 1 } }))}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE8E3' }}
                />
              </div>
            </div>
            <div style={{
              backgroundColor: '#FAF6EE',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #EAE8E3',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#6B6862' }}>예상 합계 금액:</span>
              <strong style={{ fontSize: '17px', color: '#2D6A4F' }}>
                {formatCurrency((orderModal.data.unit_price || 0) * (orderModal.data.quantity || 1))}
              </strong>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>주문 상태</label>
              <select
                value={orderModal.data.status}
                onChange={(e) => setOrderModal(prev => ({ ...prev, data: { ...prev.data, status: e.target.value } }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE8E3' }}
              >
                <option value="주문 접수">주문 접수</option>
                <option value="상품 준비">상품 준비</option>
                <option value="수령 완료">수령 완료</option>
                <option value="취소">취소</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>특이사항 메모</label>
              <textarea
                rows={2}
                value={orderModal.data.memo || ''}
                onChange={(e) => setOrderModal(prev => ({ ...prev, data: { ...prev.data, memo: e.target.value } }))}
                placeholder="예: 방문 수령 시간 등"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE8E3' }}
              />
            </div>
          </div>
        )}
      </ModalPopup>

      {/* ====================================================================== */}
      {/* MODAL 2: FINISHED GOOD ADD/EDIT MODAL                                  */}
      {/* ====================================================================== */}
      <ModalPopup
        isOpen={finishedModal.isOpen}
        onClose={() => setFinishedModal({ isOpen: false, isEdit: false, data: null })}
        title={finishedModal.isEdit ? "완제품 세트 수정" : "신규 완제품 세트 등록"}
        subtitle="세트 상품명, 세트 구분, 판매 금액, 재고를 관리합니다."
        footerActions={
          <>
            <button
              onClick={() => setFinishedModal({ isOpen: false, isEdit: false, data: null })}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #EAE8E3', background: '#FFFFFF', cursor: 'pointer', fontWeight: '600' }}
            >
              취소
            </button>
            <button
              onClick={handleSaveFinished}
              style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2D6A4F', color: '#FFFFFF', cursor: 'pointer', fontWeight: '700' }}
            >
              저장 완료
            </button>
          </>
        }
      >
        {finishedModal.data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>세트 이름 (필수)</label>
              <input
                type="text"
                value={finishedModal.data.name || ''}
                onChange={(e) => setFinishedModal(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))}
                placeholder="예: [든든세트] 고흥 유자품은 까부리와 오란다"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE8E3' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>세트 구분</label>
                <input
                  type="text"
                  value={finishedModal.data.set_type || ''}
                  onChange={(e) => setFinishedModal(prev => ({ ...prev, data: { ...prev.data, set_type: e.target.value } }))}
                  placeholder="예: 든든, 실속, 미니, 낱개"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE8E3' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>판매 금액 (원)</label>
                <input
                  type="number"
                  value={finishedModal.data.price || 0}
                  onChange={(e) => setFinishedModal(prev => ({ ...prev, data: { ...prev.data, price: parseFloat(e.target.value) || 0 } }))}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE8E3' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>완제품 재고 수량 (박스)</label>
              <input
                type="number"
                value={finishedModal.data.stock || 0}
                onChange={(e) => setFinishedModal(prev => ({ ...prev, data: { ...prev.data, stock: parseFloat(e.target.value) || 0 } }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE8E3' }}
              />
            </div>

            {/* 세트 상품 세부 구성 편집기 */}
            <div style={{ marginTop: '4px', border: '1px solid #EAE8E3', borderRadius: '10px', padding: '14px', backgroundColor: '#FAF9F6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#2B2A27' }}>세트 구성 상품 (낱개 조합)</label>
                <span style={{ fontSize: '12px', color: '#6B6862' }}>총 {(finishedModal.data.composition || []).length}개 항목</span>
              </div>

              {/* Existing composition items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {(!finishedModal.data.composition || finishedModal.data.composition.length === 0) ? (
                  <div style={{ fontSize: '12px', color: '#A09E9B', textAlign: 'center', padding: '10px' }}>
                    등록된 구성 상품이 없습니다. 아래에서 상품을 선택하여 추가해 주세요.
                  </div>
                ) : (
                  finishedModal.data.composition.map((comp, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #EAE8E3' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#2B2A27' }}>{comp.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#6B6862' }}>수량:</span>
                        <input
                          type="number"
                          min="1"
                          value={comp.qty || 1}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value, 10) || 1;
                            setFinishedModal(prev => {
                              const newComp = [...(prev.data.composition || [])];
                              newComp[idx] = { ...newComp[idx], qty: newQty };
                              return { ...prev, data: { ...prev.data, composition: newComp } };
                            });
                          }}
                          style={{ width: '60px', padding: '4px 6px', textAlign: 'center', borderRadius: '4px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                        />
                        <span style={{ fontSize: '12px' }}>개</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFinishedModal(prev => ({
                              ...prev,
                              data: {
                                ...prev.data,
                                composition: (prev.data.composition || []).filter((_, i) => i !== idx)
                              }
                            }));
                          }}
                          style={{ background: 'none', border: 'none', color: '#C0392B', cursor: 'pointer', padding: '2px 4px' }}
                          title="항목 제거"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add new composition item */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingTop: '10px', borderTop: '1px dashed #EAE8E3' }}>
                <select
                  id="fin-comp-prod-select"
                  style={{ flexGrow: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                  defaultValue={products[0]?.id || ''}
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input
                  id="fin-comp-qty-input"
                  type="number"
                  min="1"
                  defaultValue={1}
                  style={{ width: '60px', padding: '8px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px', textAlign: 'center' }}
                  placeholder="수량"
                />
                <button
                  type="button"
                  onClick={() => {
                    const selEl = document.getElementById('fin-comp-prod-select');
                    const qtyEl = document.getElementById('fin-comp-qty-input');
                    const pId = selEl?.value;
                    const q = parseInt(qtyEl?.value, 10) || 1;
                    const targetProd = products.find(p => p.id === pId);
                    if (!targetProd) return;
                    setFinishedModal(prev => {
                      const current = prev.data.composition || [];
                      const existingIdx = current.findIndex(c => c.product_id === pId);
                      let updated;
                      if (existingIdx >= 0) {
                        updated = [...current];
                        updated[existingIdx] = { ...updated[existingIdx], qty: updated[existingIdx].qty + q };
                      } else {
                        updated = [...current, { product_id: targetProd.id, name: targetProd.name, qty: q }];
                      }
                      return { ...prev, data: { ...prev.data, composition: updated } };
                    });
                  }}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#2D6A4F', color: '#FFFFFF', fontSize: '13px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  + 구성 추가
                </button>
              </div>
            </div>
          </div>
        )}
      </ModalPopup>

      {/* ====================================================================== */}
      {/* MODAL 3: PRODUCT ADD/EDIT MODAL                                        */}
      {/* ====================================================================== */}
      <ModalPopup
        isOpen={productModal.isOpen}
        onClose={() => setProductModal({ isOpen: false, isEdit: false, data: null })}
        title={productModal.isEdit ? "상품(낱개) 수정" : "신규 상품 등록"}
        subtitle="낱개 상품명, 재고량 및 포함 원재료 목록을 관리합니다."
        footerActions={
          <>
            <button
              onClick={() => setProductModal({ isOpen: false, isEdit: false, data: null })}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #EAE8E3', background: '#FFFFFF', cursor: 'pointer', fontWeight: '600' }}
            >
              취소
            </button>
            <button
              onClick={handleSaveProduct}
              style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2D6A4F', color: '#FFFFFF', cursor: 'pointer', fontWeight: '700' }}
            >
              저장 완료
            </button>
          </>
        }
      >
        {productModal.data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>상품명 (필수)</label>
              <input
                type="text"
                value={productModal.data.name || ''}
                onChange={(e) => setProductModal(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))}
                placeholder="예: 유자 오란다 낱개"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE8E3' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>현재 낱개 재고량 (개)</label>
              <input
                type="number"
                value={productModal.data.stock || 0}
                onChange={(e) => setProductModal(prev => ({ ...prev, data: { ...prev.data, stock: parseFloat(e.target.value) || 0 } }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE8E3' }}
              />
            </div>

            {/* 상품 세부 원재료 구성 편집기 */}
            <div style={{ marginTop: '4px', border: '1px solid #EAE8E3', borderRadius: '10px', padding: '14px', backgroundColor: '#FAF9F6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#2B2A27' }}>포함 원재료 구성 (단순 기록용)</label>
                <span style={{ fontSize: '12px', color: '#6B6862' }}>총 {(productModal.data.materials || []).length}개</span>
              </div>

              {/* Existing materials */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {(!productModal.data.materials || productModal.data.materials.length === 0) ? (
                  <span style={{ fontSize: '12px', color: '#A09E9B' }}>등록된 원재료가 없습니다. 아래에서 원재료를 추가해 주세요.</span>
                ) : (
                  productModal.data.materials.map((mat, idx) => (
                    <span
                      key={idx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #EAE8E3',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#2B2A27'
                      }}
                    >
                      {mat.name}
                      <button
                        type="button"
                        onClick={() => {
                          setProductModal(prev => ({
                            ...prev,
                            data: {
                              ...prev.data,
                              materials: (prev.data.materials || []).filter((_, i) => i !== idx)
                            }
                          }));
                        }}
                        style={{ background: 'none', border: 'none', color: '#C0392B', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                        title="원재료 삭제"
                      >
                        <Trash2 size={13} />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add new material control */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingTop: '10px', borderTop: '1px dashed #EAE8E3' }}>
                <select
                  id="prod-mat-select"
                  style={{ flexGrow: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                  defaultValue={rawMaterials[0]?.name || ''}
                  onChange={(e) => {
                    const customEl = document.getElementById('prod-mat-custom-input');
                    if (customEl) {
                      customEl.style.display = e.target.value === '__custom__' ? 'block' : 'none';
                    }
                  }}
                >
                  {rawMaterials.map(m => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                  <option value="__custom__">직접 입력...</option>
                </select>
                <input
                  id="prod-mat-custom-input"
                  type="text"
                  placeholder="원재료명 입력"
                  style={{ width: '120px', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px', display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const selEl = document.getElementById('prod-mat-select');
                    const customEl = document.getElementById('prod-mat-custom-input');
                    let matName = selEl?.value;
                    if (matName === '__custom__') {
                      matName = customEl?.value?.trim();
                    }
                    if (!matName) {
                      alert('원재료명을 입력해 주세요.');
                      return;
                    }
                    setProductModal(prev => {
                      const current = prev.data.materials || [];
                      if (current.some(m => m.name === matName)) {
                        alert('이미 포함된 원재료입니다.');
                        return prev;
                      }
                      return { ...prev, data: { ...prev.data, materials: [...current, { name: matName }] } };
                    });
                    if (customEl) customEl.value = '';
                  }}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#2D6A4F', color: '#FFFFFF', fontSize: '13px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  + 원재료 추가
                </button>
              </div>
            </div>
          </div>
        )}
      </ModalPopup>

      {/* ====================================================================== */}
      {/* MODAL 4: RAW MATERIAL ADD/EDIT MODAL (금액 필드 없음)                 */}
      {/* ====================================================================== */}
      <ModalPopup
        isOpen={rawModal.isOpen}
        onClose={() => setRawModal({ isOpen: false, isEdit: false, data: null })}
        title={rawModal.isEdit ? "원재료 정보 수정" : "신규 원재료 등록"}
        subtitle="원재료명, 재고량, 단위를 관리합니다."
        footerActions={
          <>
            <button
              onClick={() => setRawModal({ isOpen: false, isEdit: false, data: null })}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #EAE8E3', background: '#FFFFFF', cursor: 'pointer', fontWeight: '600' }}
            >
              취소
            </button>
            <button
              onClick={handleSaveRaw}
              style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2D6A4F', color: '#FFFFFF', cursor: 'pointer', fontWeight: '700' }}
            >
              저장 완료
            </button>
          </>
        }
      >
        {rawModal.data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>원재료명 (필수)</label>
              <input
                type="text"
                value={rawModal.data.name || ''}
                onChange={(e) => setRawModal(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))}
                placeholder="예: 오란다 알갱이, 쌀조청 등"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE8E3' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>재고량</label>
                <input
                  type="number"
                  value={rawModal.data.stock || 0}
                  onChange={(e) => setRawModal(prev => ({ ...prev, data: { ...prev.data, stock: parseFloat(e.target.value) || 0 } }))}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE8E3' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>재고 단위</label>
                <input
                  type="text"
                  value={rawModal.data.unit || 'kg'}
                  onChange={(e) => setRawModal(prev => ({ ...prev, data: { ...prev.data, unit: e.target.value } }))}
                  placeholder="kg, g, 박스, 개"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE8E3' }}
                />
              </div>
            </div>
          </div>
        )}
      </ModalPopup>

      {/* ====================================================================== */}
      {/* MODAL 5: LOG DETAIL & REASON EDIT MODAL                                */}
      {/* ====================================================================== */}
      <ModalPopup
        isOpen={logModal.isOpen}
        onClose={() => setLogModal({ isOpen: false, data: null })}
        title="재고 관리 기록 상세"
        subtitle={logModal.data ? `기록 일시: ${formatDateTime(logModal.data.created_at)}` : ''}
        footerActions={
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
            <button
              onClick={() => handleDeleteLog(logModal.data?.id)}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #F5B7B1', backgroundColor: '#FDEDEC', color: '#C0392B', cursor: 'pointer', fontWeight: '700' }}
            >
              기록 삭제
            </button>
            <button
              onClick={async () => {
                await supabase.updateInventoryLog(logModal.data.id, { reason: logModal.data.reason });
                setLogModal({ isOpen: false, data: null });
                await loadAll();
              }}
              style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#2D6A4F', color: '#FFFFFF', cursor: 'pointer', fontWeight: '700' }}
            >
              사유 수정 저장
            </button>
          </div>
        }
      >
        {logModal.data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>변경 사유</label>
              <input
                type="text"
                value={logModal.data.reason || ''}
                onChange={(e) => setLogModal(prev => ({ ...prev, data: { ...prev.data, reason: e.target.value } }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE8E3' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>세부 변경 내역</label>
              <div style={{ backgroundColor: '#FAF9F6', borderRadius: '8px', border: '1px solid #EAE8E3', padding: '12px' }}>
                {logModal.data.changes?.map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < logModal.data.changes.length - 1 ? '1px solid #F0EEE9' : 'none', fontSize: '13px' }}>
                    <span>{c.name}</span>
                    <span style={{ fontWeight: '700', color: c.diff > 0 ? '#2D6A4F' : '#C0392B' }}>
                      {c.diff > 0 ? `+${c.diff}` : c.diff} {c.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </ModalPopup>

    </div>
  );
}
