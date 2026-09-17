"use client";

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import DataTable from '../../components/common/DataTable';
import ModalPopup from '../../components/common/ModalPopup';
import StockBadge from '../../components/common/StockBadge';
import { formatCurrency, formatDateTime } from '../../lib/inventoryCommon';
import { 
  DEFAULT_LANDING_CONFIG, 
  normalizeLandingSettings, 
  SECTION_TEMPLATES, 
  AVAILABLE_ICON_NAMES, 
  DynamicIcon 
} from '../../lib/landingDefaults';
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
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  GripVertical,
  Settings,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Star,
  Image as ImageIcon,
  FileText,
  X
} from 'lucide-react';
import './admin.css';

// Icon Picker Component for Features & Badges
function IconPicker({ selectedIcon, onSelect }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(42px, 1fr))', gap: '6px', maxHeight: '160px', overflowY: 'auto', padding: '8px', border: '1px solid #EAE8E3', borderRadius: '8px', backgroundColor: '#FAF9F6' }}>
      {AVAILABLE_ICON_NAMES.map(iconName => (
        <button
          key={iconName}
          type="button"
          onClick={() => onSelect(iconName)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 4px',
            borderRadius: '6px',
            border: selectedIcon === iconName ? '2px solid #2D6A4F' : '1px solid #EAE8E3',
            backgroundColor: selectedIcon === iconName ? '#D8F3DC' : '#FFFFFF',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title={iconName}
        >
          <DynamicIcon name={iconName} size={20} color={selectedIcon === iconName ? '#2D6A4F' : '#4A4844'} />
        </button>
      ))}
    </div>
  );
}

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
  const [landingSettings, setLandingSettings] = useState(DEFAULT_LANDING_CONFIG);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 3.1 Password Management State
  const [authPasswords, setAuthPasswords] = useState({ admin: 'yuzu1234', producer: 'maker1234' });
  const [adminNewPw, setAdminNewPw] = useState('');
  const [adminConfirmPw, setAdminConfirmPw] = useState('');
  const [producerNewPw, setProducerNewPw] = useState('');
  const [producerConfirmPw, setProducerConfirmPw] = useState('');
  const [pwSaveSuccess, setPwSaveSuccess] = useState('');
  const [pwSaveError, setPwSaveError] = useState('');

  // 3.2 Visual Landing Page Editor State
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [editingModal, setEditingModal] = useState({ isOpen: false, type: null, targetId: null, data: null });

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
      const [ordList, goodsList, prodList, matsList, logsList, land, pwData] = await Promise.all([
        supabase.getOrders(),
        supabase.getFinishedGoods(),
        supabase.getProducts(),
        supabase.getRawMaterials(),
        supabase.getInventoryLogs(),
        supabase.getLandingSettings(),
        supabase.getAuthPasswords()
      ]);
      setOrders(ordList || []);
      setFinishedGoods(goodsList || []);
      setProducts(prodList || []);
      setRawMaterials(matsList || []);
      setInventoryLogs(logsList || []);
      if (pwData) {
        setAuthPasswords(pwData);
      }
      if (land) {
        setLandingSettings(normalizeLandingSettings(land));
      } else {
        setLandingSettings(DEFAULT_LANDING_CONFIG);
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

  // Reordering handler for drag-and-drop
  const handleReorderItems = async (category, reorderedList) => {
    if (category === 'finished_goods') {
      setFinishedGoods(reorderedList);
    } else if (category === 'products') {
      setProducts(reorderedList);
    } else if (category === 'raw_materials') {
      setRawMaterials(reorderedList);
    }
    await supabase.reorderItems(category, reorderedList);
  };

  // Password Management Save Handler
  const handleSavePasswords = async () => {
    setPwSaveSuccess('');
    setPwSaveError('');

    let updatedAdmin = authPasswords.admin;
    let updatedProducer = authPasswords.producer;
    let changed = false;

    if (adminNewPw) {
      if (adminNewPw.length < 4) {
        setPwSaveError('관리자 새 비밀번호는 최소 4자 이상이어야 합니다.');
        return;
      }
      if (adminNewPw !== adminConfirmPw) {
        setPwSaveError('관리자 새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
        return;
      }
      updatedAdmin = adminNewPw;
      changed = true;
    }

    if (producerNewPw) {
      if (producerNewPw.length < 4) {
        setPwSaveError('생산자 새 비밀번호는 최소 4자 이상이어야 합니다.');
        return;
      }
      if (producerNewPw !== producerConfirmPw) {
        setPwSaveError('생산자 새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
        return;
      }
      updatedProducer = producerNewPw;
      changed = true;
    }

    if (!changed) {
      setPwSaveError('변경할 새 비밀번호를 입력해주세요.');
      return;
    }

    const newObj = { admin: updatedAdmin, producer: updatedProducer };
    const success = await supabase.updateAuthPasswords(newObj);
    if (success) {
      setAuthPasswords(newObj);
      setAdminNewPw('');
      setAdminConfirmPw('');
      setProducerNewPw('');
      setProducerConfirmPw('');
      setPwSaveSuccess('비밀번호가 안전하게 변경되었습니다.');
    } else {
      setPwSaveError('비밀번호 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // Section manipulation handlers for visual editor
  const handleMoveSection = (index, direction) => {
    const list = [...(landingSettings.sections || [])];
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    setLandingSettings(prev => ({ ...prev, sections: list }));
  };

  const handleToggleSectionVisibility = (secId) => {
    setLandingSettings(prev => ({
      ...prev,
      sections: (prev.sections || []).map(s => s.id === secId ? { ...s, enabled: !s.enabled } : s)
    }));
  };

  const handleAddSection = (templateType) => {
    const template = SECTION_TEMPLATES[templateType];
    if (!template) return;
    const newId = `sec_${templateType}_${Date.now()}`;
    const newSec = JSON.parse(JSON.stringify(template));
    newSec.id = newId;
    newSec.name = `${template.name} (추가)`;
    setLandingSettings(prev => ({
      ...prev,
      sections: [...(prev.sections || []), newSec]
    }));
  };

  const handleDuplicateSection = (secId) => {
    const list = [...(landingSettings.sections || [])];
    const idx = list.findIndex(s => s.id === secId);
    if (idx === -1) return;
    const original = list[idx];
    const copy = JSON.parse(JSON.stringify(original));
    copy.id = `sec_${copy.type}_${Date.now()}`;
    copy.name = `${original.name} (사본)`;
    list.splice(idx + 1, 0, copy);
    setLandingSettings(prev => ({ ...prev, sections: list }));
  };

  const handleDeleteSection = (secId) => {
    if (!confirm('정말 이 섹션을 삭제하시겠습니까?')) return;
    setLandingSettings(prev => ({
      ...prev,
      sections: (prev.sections || []).filter(s => s.id !== secId)
    }));
  };

  const handleOpenEditModal = (type, targetId = null, initialData = null) => {
    let dataToEdit = null;
    if (type === 'header') {
      dataToEdit = JSON.parse(JSON.stringify(landingSettings.header || DEFAULT_LANDING_CONFIG.header));
    } else if (type === 'footer') {
      dataToEdit = JSON.parse(JSON.stringify(landingSettings.footer || DEFAULT_LANDING_CONFIG.footer));
    } else if (type === 'popups') {
      dataToEdit = JSON.parse(JSON.stringify(landingSettings.popups || []));
    } else if (targetId) {
      const sec = (landingSettings.sections || []).find(s => s.id === targetId);
      if (sec) {
        dataToEdit = JSON.parse(JSON.stringify(sec));
      }
    }
    setEditingModal({
      isOpen: true,
      type,
      targetId,
      data: dataToEdit || initialData
    });
  };

  const handleSaveEditModal = () => {
    if (!editingModal.type || !editingModal.data) {
      setEditingModal({ isOpen: false, type: null, targetId: null, data: null });
      return;
    }

    const { type, targetId, data } = editingModal;
    setLandingSettings(prev => {
      if (type === 'header') {
        return { ...prev, header: data };
      }
      if (type === 'footer') {
        return { ...prev, footer: data };
      }
      if (type === 'popups') {
        return { ...prev, popups: data, popup: data[0] || null };
      }
      if (targetId) {
        return {
          ...prev,
          sections: (prev.sections || []).map(s => s.id === targetId ? data : s)
        };
      }
      return prev;
    });

    setEditingModal({ isOpen: false, type: null, targetId: null, data: null });
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
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    let currentAdminPw = authPasswords.admin;
    try {
      const dbPw = await supabase.getAuthPasswords();
      if (dbPw && dbPw.admin) {
        currentAdminPw = dbPw.admin;
        setAuthPasswords(dbPw);
      }
    } catch (err) {
      console.error(err);
    }

    if (gatePassword === currentAdminPw) {
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
            <span>원재료 관리</span>
            <span style={{ marginLeft: 'auto', fontSize: '11px', opacity: 0.8, backgroundColor: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '10px' }}>
              {rawMaterials.length}
            </span>
          </button>

          <button 
            className={`sidebar-link ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Layers size={18} />
            <span>상품(낱개) 관리</span>
            <span style={{ marginLeft: 'auto', fontSize: '11px', opacity: 0.8, backgroundColor: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '10px' }}>
              {products.length}
            </span>
          </button>

          <button 
            className={`sidebar-link ${activeTab === 'finished' ? 'active' : ''}`}
            onClick={() => setActiveTab('finished')}
          >
            <Package size={18} />
            <span>완제품 관리</span>
            <span style={{ marginLeft: 'auto', fontSize: '11px', opacity: 0.8, backgroundColor: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '10px' }}>
              {finishedGoods.length}
            </span>
          </button>

          <button 
            className={`sidebar-link ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <History size={18} />
            <span>변경 내역 (감사)</span>
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

          <button 
            className={`sidebar-link ${activeTab === 'passwords' ? 'active' : ''}`}
            onClick={() => setActiveTab('passwords')}
          >
            <KeyRound size={18} />
            <span>비밀번호 관리</span>
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
            onReorderRows={(reordered) => handleReorderItems('finished_goods', reordered)}
            onAdd={handleOpenAddFinished}
            addButtonText="완제품 세트 등록"
            onRefresh={loadAll}
            isRefreshing={isRefreshing}
            columns={[
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
            onReorderRows={(reordered) => handleReorderItems('products', reordered)}
            onAdd={handleOpenAddProduct}
            addButtonText="신규 상품 등록"
            onRefresh={loadAll}
            isRefreshing={isRefreshing}
            columns={[
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
            onReorderRows={(reordered) => handleReorderItems('raw_materials', reordered)}
            onAdd={handleOpenAddRaw}
            addButtonText="신규 원재료 등록"
            onRefresh={loadAll}
            isRefreshing={isRefreshing}
            columns={[
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
        {/* SUB TAB: LANDING VISUAL EDITOR (워드프레스형 실시간 비주얼 에디터)     */}
        {/* ==================================================================== */}
        {activeTab === 'landing' && (
          <div className="landing-editor-container">
            {/* Top Toolbar */}
            <div className="editor-top-bar" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '16px 24px',
              border: '1px solid #EAE8E3',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '14px'
            }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#2B2A27', margin: 0 }}>
                  랜딩페이지 실시간 비주얼 에디터
                </h2>
                <p style={{ fontSize: '13px', color: '#6B6862', margin: '3px 0 0 0' }}>
                  좌측에서 섹션 순서와 구성을 관리하고, 우측 캔버스의 요소를 클릭해 텍스트와 사진을 실시간으로 수정하세요.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {/* Device Selector */}
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
                    { id: 'desktop', label: 'PC', icon: Monitor },
                    { id: 'tablet', label: '태블릿', icon: Tablet },
                    { id: 'mobile', label: '모바일', icon: Smartphone }
                  ].map(dev => {
                    const IconCmp = dev.icon;
                    const isActive = previewDevice === dev.id;
                    return (
                      <button
                        key={dev.id}
                        type="button"
                        onClick={() => setPreviewDevice(dev.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          backgroundColor: isActive ? '#2D6A4F' : 'transparent',
                          color: isActive ? '#FFFFFF' : '#6B6862',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <IconCmp size={14} />
                        <span>{dev.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Global Editors */}
                <button
                  type="button"
                  onClick={() => handleOpenEditModal('popups')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #EAE8E3',
                    backgroundColor: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#2B2A27',
                    cursor: 'pointer'
                  }}
                >
                  <Sliders size={14} color="#D97706" />
                  <span>공지 팝업 관리</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEditModal('header')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #EAE8E3',
                    backgroundColor: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#2B2A27',
                    cursor: 'pointer'
                  }}
                >
                  <Settings size={14} color="#2563EB" />
                  <span>상단 메뉴/GNB</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEditModal('footer')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #EAE8E3',
                    backgroundColor: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#2B2A27',
                    cursor: 'pointer'
                  }}
                >
                  <Globe size={14} color="#059669" />
                  <span>푸터/SNS</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveLanding}
                  disabled={isRefreshing}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#2D6A4F',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(45, 106, 79, 0.25)'
                  }}
                >
                  <Save size={15} />
                  <span>랜딩 설정 최종 저장</span>
                </button>
              </div>
            </div>

            {/* Split Layout: Left Control Panel + Right Canvas */}
            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px', alignItems: 'start' }}>
              
              {/* Left Panel: Section Structure & Order */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #EAE8E3',
                padding: '18px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={17} color="#2D6A4F" />
                    <strong style={{ fontSize: '15px', color: '#2B2A27' }}>섹션 목록 및 순서</strong>
                  </div>
                  <span style={{ fontSize: '12px', color: '#8C8983', fontWeight: '700' }}>
                    총 {(landingSettings.sections || []).length}개
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: '#6B6862', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                  ▲ / ▼ 버튼으로 섹션 순서를 바꾸고, 눈 아이콘으로 표시 여부를 즉시 토글할 수 있습니다.
                </p>

                {/* Section List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {(landingSettings.sections || []).map((sec, idx) => {
                    return (
                      <div
                        key={sec.id}
                        style={{
                          border: sec.enabled ? '1.5px solid #D6D3CC' : '1px dashed #D6D3CC',
                          borderRadius: '10px',
                          padding: '12px',
                          backgroundColor: sec.enabled ? '#FFFFFF' : '#FAF9F6',
                          opacity: sec.enabled ? 1 : 0.65,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: '800',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: '#EAE8E3',
                              color: '#4A4844',
                              textTransform: 'uppercase'
                            }}>
                              {sec.type}
                            </span>
                            <strong style={{ fontSize: '13px', color: '#2B2A27' }}>
                              {sec.name}
                            </strong>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {/* Up / Down */}
                            <button
                              type="button"
                              onClick={() => handleMoveSection(idx, -1)}
                              disabled={idx === 0}
                              style={{
                                border: '1px solid #EAE8E3',
                                background: '#FFFFFF',
                                borderRadius: '4px',
                                padding: '3px 5px',
                                cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                color: idx === 0 ? '#CCC' : '#333'
                              }}
                              title="위로 이동"
                            >
                              <ChevronUp size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSection(idx, 1)}
                              disabled={idx === (landingSettings.sections || []).length - 1}
                              style={{
                                border: '1px solid #EAE8E3',
                                background: '#FFFFFF',
                                borderRadius: '4px',
                                padding: '3px 5px',
                                cursor: idx === (landingSettings.sections || []).length - 1 ? 'not-allowed' : 'pointer',
                                color: idx === (landingSettings.sections || []).length - 1 ? '#CCC' : '#333'
                              }}
                              title="아래로 이동"
                            >
                              <ChevronDown size={13} />
                            </button>

                            {/* Visibility Toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggleSectionVisibility(sec.id)}
                              style={{
                                border: '1px solid #EAE8E3',
                                background: sec.enabled ? '#D8F3DC' : '#FFFFFF',
                                color: sec.enabled ? '#2D6A4F' : '#999',
                                borderRadius: '4px',
                                padding: '3px 5px',
                                cursor: 'pointer'
                              }}
                              title={sec.enabled ? "화면에서 숨기기" : "화면에 노출하기"}
                            >
                              {sec.enabled ? <Eye size={13} /> : <EyeOff size={13} />}
                            </button>

                            {/* Duplicate */}
                            <button
                              type="button"
                              onClick={() => handleDuplicateSection(sec.id)}
                              style={{
                                border: '1px solid #EAE8E3',
                                background: '#FFFFFF',
                                color: '#4A4844',
                                borderRadius: '4px',
                                padding: '3px 5px',
                                cursor: 'pointer'
                              }}
                              title="이 섹션 복제하기"
                            >
                              <Copy size={13} />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteSection(sec.id)}
                              style={{
                                border: '1px solid #EAE8E3',
                                background: '#FFFFFF',
                                color: '#C0392B',
                                borderRadius: '4px',
                                padding: '3px 5px',
                                cursor: 'pointer'
                              }}
                              title="이 섹션 삭제하기"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Quick edit button & GNB link info */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#6B6862', paddingTop: '6px', borderTop: '1px solid #F0EFEA' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span>앵커: <code>#{sec.anchor || sec.id}</code></span>
                            {sec.showInNav && (
                              <span style={{ backgroundColor: '#FAF6EE', padding: '1px 5px', borderRadius: '4px', color: '#8C6F3E', fontWeight: '700' }}>
                                GNB: {sec.navLabel || sec.name}
                              </span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(sec.type, sec.id)}
                            style={{
                              border: 'none',
                              backgroundColor: '#FAF6EE',
                              color: '#2D6A4F',
                              fontWeight: '700',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            <Edit3 size={11} /> <span>수정</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add New Section */}
                <div style={{ borderTop: '1px solid #EAE8E3', paddingTop: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#2B2A27', marginBottom: '8px' }}>
                    + 새 섹션 추가하기
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {[
                      { type: 'hero', label: '히어로 (Hero)' },
                      { type: 'story', label: '스토리 (Story)' },
                      { type: 'features', label: '특장점 (Features)' },
                      { type: 'lineup', label: '제품 (Lineup)' },
                      { type: 'reviews', label: '후기 (Reviews)' },
                      { type: 'cta', label: '배너 (CTA)' }
                    ].map(tmpl => (
                      <button
                        key={tmpl.type}
                        type="button"
                        onClick={() => handleAddSection(tmpl.type)}
                        style={{
                          padding: '7px 10px',
                          borderRadius: '6px',
                          border: '1px solid #EAE8E3',
                          backgroundColor: '#FAF9F6',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: '#2B2A27',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        + {tmpl.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Panel: Interactive Canvas */}
              <div style={{
                backgroundColor: '#262624',
                borderRadius: '14px',
                padding: '24px 16px',
                minHeight: '800px',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3)',
                overflowX: 'auto'
              }}>
                <div style={{
                  maxWidth: previewDevice === 'desktop' ? '100%' : (previewDevice === 'tablet' ? '768px' : '390px'),
                  margin: '0 auto',
                  backgroundColor: '#FFFFFF',
                  borderRadius: previewDevice === 'desktop' ? '8px' : '24px',
                  border: previewDevice === 'desktop' ? '1px solid #EAE8E3' : '8px solid #3B3936',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {/* Canvas Header */}
                  <div style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #EAE8E3',
                    backgroundColor: '#FFFFFF',
                    position: 'relative'
                  }} className="canvas-section-hover">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px', fontWeight: '900', color: '#E8A317' }}>
                        {landingSettings.header?.logoTextEn || 'Yuzu'}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#2B2A27' }}>
                        {landingSettings.header?.logoTextKo || '유자품은 오란다&까부리'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <nav style={{ display: previewDevice === 'mobile' ? 'none' : 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#6B6862' }}>
                        {(landingSettings.sections || []).filter(s => s.enabled && s.showInNav).map(s => (
                          <span key={s.id} style={{ cursor: 'pointer' }}>{s.navLabel || s.name}</span>
                        ))}
                      </nav>

                      {landingSettings.header?.showSmartStoreBtn !== false && (
                        <span style={{
                          backgroundColor: '#2D6A4F',
                          color: '#FFFFFF',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '700'
                        }}>
                          {landingSettings.header?.smartStoreText || '구매하기'}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal('header')}
                      className="canvas-edit-overlay-btn"
                    >
                      <Edit3 size={13} /> <span>헤더/메뉴 편집</span>
                    </button>
                  </div>

                  {/* Canvas Sections Rendering */}
                  {(landingSettings.sections || []).filter(sec => sec.enabled).map((sec) => {
                    const data = sec.data || {};

                    if (sec.type === 'hero') {
                      return (
                        <div key={sec.id} className="canvas-section-hover" style={{ position: 'relative', padding: '60px 24px', backgroundColor: '#FAF9F6', textAlign: 'center', borderBottom: '1px solid #EAE8E3' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal('hero', sec.id)}
                            className="canvas-edit-overlay-btn"
                          >
                            <Edit3 size={13} /> <span>Hero 편집</span>
                          </button>

                          {data.badge && (
                            <span style={{ display: 'inline-block', backgroundColor: '#FAF6EE', border: '1px solid #EAE8E3', color: '#8C6F3E', padding: '4px 12px', borderRadius: '16px', fontSize: '11px', fontWeight: '800', marginBottom: '14px' }}>
                              {data.badge}
                            </span>
                          )}

                          <h1 style={{ fontSize: previewDevice === 'mobile' ? '24px' : '36px', fontWeight: '900', color: '#2B2A27', margin: '0 0 16px 0', lineHeight: 1.35, whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>
                            {data.title || '바삭함 속에 피어나는\n싱그러운 유자 향'}
                          </h1>

                          <p style={{ fontSize: previewDevice === 'mobile' ? '13px' : '15px', color: '#6B6862', maxWidth: '600px', margin: '0 auto 24px auto', lineHeight: 1.6, wordBreak: 'keep-all' }}>
                            {data.subtitle || '100% 국산 유자와 쌀조청의 조화'}
                          </p>

                          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
                            <span style={{ backgroundColor: '#2D6A4F', color: '#FFFFFF', padding: '10px 22px', borderRadius: '24px', fontSize: '13px', fontWeight: '800' }}>
                              {data.ctaText || '스마트스토어로 구매하기'}
                            </span>
                            {data.storyLinkText && (
                              <span style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAE8E3', color: '#2B2A27', padding: '10px 18px', borderRadius: '24px', fontSize: '13px', fontWeight: '700' }}>
                                {data.storyLinkText}
                              </span>
                            )}
                          </div>

                          {data.image && (
                            <div style={{ maxWidth: '400px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden', border: '1px solid #EAE8E3' }}>
                              <img src={data.image} alt="Hero" style={{ width: '100%', height: 'auto', display: 'block' }} />
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (sec.type === 'story') {
                      return (
                        <div key={sec.id} className="canvas-section-hover" style={{ position: 'relative', padding: '50px 24px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #EAE8E3' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal('story', sec.id)}
                            className="canvas-edit-overlay-btn"
                          >
                            <Edit3 size={13} /> <span>Story 편집</span>
                          </button>

                          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: previewDevice === 'mobile' ? '1fr' : '1fr 1fr', gap: '30px', alignItems: 'center' }}>
                            <div>
                              <span style={{ fontSize: '11px', fontWeight: '800', color: '#8C6F3E', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                {data.subtitle || 'BRAND STORY'}
                              </span>
                              <h2 style={{ fontSize: previewDevice === 'mobile' ? '20px' : '28px', fontWeight: '900', color: '#2B2A27', margin: '8px 0 14px 0', lineHeight: 1.35, whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>
                                {data.title || '자연에서 온 상큼함과\n전통의 만남'}
                              </h2>
                              <strong style={{ display: 'block', fontSize: '14px', color: '#2D6A4F', marginBottom: '10px' }}>
                                {data.sectionTitle || '딱딱하고 끈적이는 오란다는 잊으세요.'}
                              </strong>
                              <p style={{ fontSize: '13px', color: '#6B6862', lineHeight: 1.6, marginBottom: '10px', wordBreak: 'keep-all' }}>
                                {data.body1}
                              </p>
                              <p style={{ fontSize: '13px', color: '#6B6862', lineHeight: 1.6, marginBottom: '16px', wordBreak: 'keep-all' }}>
                                {data.body2}
                              </p>

                              {data.featureBadge && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', backgroundColor: '#FAF6EE', borderRadius: '8px', border: '1px solid #EAE8E3' }}>
                                  <DynamicIcon name={data.featureIcon || 'Leaf'} size={20} color="#2D6A4F" />
                                  <div>
                                    <strong style={{ display: 'block', fontSize: '12px', color: '#2B2A27' }}>{data.featureBadge}</strong>
                                    <span style={{ fontSize: '11px', color: '#6B6862' }}>{data.featureDesc}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {data.image && (
                              <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #EAE8E3' }}>
                                <img src={data.image} alt="Story" style={{ width: '100%', height: 'auto', display: 'block' }} />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    if (sec.type === 'features') {
                      const items = Array.isArray(data.items) ? data.items : [];
                      return (
                        <div key={sec.id} className="canvas-section-hover" style={{ position: 'relative', padding: '50px 24px', backgroundColor: '#FAF9F6', borderBottom: '1px solid #EAE8E3' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal('features', sec.id)}
                            className="canvas-edit-overlay-btn"
                          >
                            <Edit3 size={13} /> <span>특장점 편집</span>
                          </button>

                          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#8C6F3E', letterSpacing: '1px' }}>
                              {data.subtitle || 'KEY FEATURES'}
                            </span>
                            <h2 style={{ fontSize: previewDevice === 'mobile' ? '20px' : '26px', fontWeight: '900', color: '#2B2A27', margin: '6px 0 0 0', whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>
                              {data.title || '유자품은 오란다&까부리의 약속'}
                            </h2>
                          </div>

                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: previewDevice === 'mobile' ? '1fr' : `repeat(${Math.min(items.length || 3, 3)}, 1fr)`,
                            gap: '16px',
                            maxWidth: '900px',
                            margin: '0 auto'
                          }}>
                            {items.map((it, idx) => (
                              <div key={it.id || idx} style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #EAE8E3', textAlign: 'center' }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#FAF6EE', border: '1px solid #EAE8E3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                                  <DynamicIcon name={it.icon || 'Sparkles'} size={20} color="#2D6A4F" />
                                </div>
                                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#2B2A27', margin: '0 0 8px 0', wordBreak: 'keep-all' }}>
                                  {it.title}
                                </h3>
                                <p style={{ fontSize: '12px', color: '#6B6862', lineHeight: 1.5, margin: 0, wordBreak: 'keep-all' }}>
                                  {it.desc}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    if (sec.type === 'lineup') {
                      const items = Array.isArray(data.items) ? data.items : [];
                      return (
                        <div key={sec.id} className="canvas-section-hover" style={{ position: 'relative', padding: '50px 24px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #EAE8E3' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal('lineup', sec.id)}
                            className="canvas-edit-overlay-btn"
                          >
                            <Edit3 size={13} /> <span>라인업 편집</span>
                          </button>

                          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#8C6F3E', letterSpacing: '1px' }}>
                              {data.subtitle || 'PRODUCT LINEUP'}
                            </span>
                            <h2 style={{ fontSize: previewDevice === 'mobile' ? '20px' : '26px', fontWeight: '900', color: '#2B2A27', margin: '6px 0 0 0', whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>
                              {data.title || '상큼함을 담은 라인업'}
                            </h2>
                          </div>

                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: previewDevice === 'mobile' ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px',
                            maxWidth: '960px',
                            margin: '0 auto'
                          }}>
                            {items.map((prod, idx) => (
                              <div key={prod.id || idx} style={{ border: '1px solid #EAE8E3', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ height: '160px', backgroundColor: '#FAF9F6', overflow: 'hidden', position: 'relative' }}>
                                  {prod.image ? (
                                    <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: '12px' }}>이미지 없음</div>
                                  )}
                                  {prod.badge && (
                                    <span style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: '#2D6A4F', color: '#FFFFFF', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '12px' }}>
                                      {prod.badge}
                                    </span>
                                  )}
                                </div>
                                <div style={{ padding: '14px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                  <div>
                                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#2B2A27', margin: '0 0 4px 0', wordBreak: 'keep-all' }}>{prod.name}</h4>
                                    <p style={{ fontSize: '11px', color: '#6B6862', margin: '0 0 8px 0', lineHeight: 1.4, wordBreak: 'keep-all' }}>{prod.desc}</p>
                                  </div>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                      <strong style={{ fontSize: '15px', color: '#2D6A4F' }}>{Number(prod.price || 0).toLocaleString()}원</strong>
                                      {prod.originalPrice ? (
                                        <span style={{ fontSize: '11px', color: '#A09E9B', textDecoration: 'line-through' }}>{Number(prod.originalPrice).toLocaleString()}원</span>
                                      ) : null}
                                    </div>
                                    <span style={{ fontSize: '10px', color: '#8C6F3E', display: 'block', marginTop: '2px' }}>{prod.unit}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    if (sec.type === 'reviews') {
                      const items = Array.isArray(data.items) ? data.items : [];
                      return (
                        <div key={sec.id} className="canvas-section-hover" style={{ position: 'relative', padding: '50px 24px', backgroundColor: '#FAF9F6', borderBottom: '1px solid #EAE8E3' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal('reviews', sec.id)}
                            className="canvas-edit-overlay-btn"
                          >
                            <Edit3 size={13} /> <span>후기 편집</span>
                          </button>

                          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#8C6F3E', letterSpacing: '1px' }}>
                              {data.subtitle || 'CUSTOMER REVIEWS'}
                            </span>
                            <h2 style={{ fontSize: previewDevice === 'mobile' ? '20px' : '26px', fontWeight: '900', color: '#2B2A27', margin: '6px 0 0 0', whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>
                              {data.title || '직접 맛보신 분들의 생생한 후기'}
                            </h2>
                          </div>

                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: previewDevice === 'mobile' ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
                            gap: '16px',
                            maxWidth: '900px',
                            margin: '0 auto'
                          }}>
                            {items.map((rev, idx) => (
                              <div key={rev.id || idx} style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAE8E3', borderRadius: '12px', padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#E8A317', marginBottom: '8px' }}>
                                  {[...Array(rev.rating || 5)].map((_, i) => (
                                    <Star key={i} size={14} fill="#E8A317" />
                                  ))}
                                </div>
                                <p style={{ fontSize: '12px', color: '#2B2A27', lineHeight: 1.5, margin: '0 0 12px 0', wordBreak: 'keep-all' }}>
                                  "{rev.content}"
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#8C8983' }}>
                                  <span>{rev.author} · {rev.product}</span>
                                  {rev.tag && <span style={{ color: '#2D6A4F', fontWeight: '700' }}>#{rev.tag}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    if (sec.type === 'cta') {
                      return (
                        <div key={sec.id} className="canvas-section-hover" style={{ position: 'relative', padding: '60px 24px', backgroundColor: '#2D6A4F', color: '#FFFFFF', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal('cta', sec.id)}
                            className="canvas-edit-overlay-btn"
                          >
                            <Edit3 size={13} /> <span>CTA 편집</span>
                          </button>

                          {data.badge && (
                            <span style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', padding: '4px 12px', borderRadius: '16px', fontSize: '11px', fontWeight: '700', marginBottom: '14px' }}>
                              {data.badge}
                            </span>
                          )}

                          <h2 style={{ fontSize: previewDevice === 'mobile' ? '22px' : '30px', fontWeight: '900', margin: '0 0 12px 0', whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>
                            {data.title || '향긋한 고흥 유자의 감동을\n지금 바로 만나보세요'}
                          </h2>

                          <p style={{ fontSize: '13px', opacity: 0.9, maxWidth: '500px', margin: '0 auto 24px auto', lineHeight: 1.5, wordBreak: 'keep-all' }}>
                            {data.subtitle || '정성을 다해 정직하게 만든 프리미엄 수제 디저트'}
                          </p>

                          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <span style={{ backgroundColor: '#FFFFFF', color: '#2D6A4F', padding: '10px 22px', borderRadius: '24px', fontSize: '13px', fontWeight: '800' }}>
                              {data.ctaText || '스마트스토어로 구매하기'}
                            </span>
                            {data.contactText && (
                              <span style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#FFFFFF', padding: '10px 18px', borderRadius: '24px', fontSize: '13px', fontWeight: '700' }}>
                                {data.contactText}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })}

                  {/* Canvas Footer */}
                  <div style={{ padding: '30px 20px', backgroundColor: '#1F1E1D', color: '#999', fontSize: '11px', position: 'relative' }} className="canvas-section-hover">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal('footer')}
                      className="canvas-edit-overlay-btn"
                    >
                      <Edit3 size={13} /> <span>푸터/SNS 편집</span>
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#FFF' }}>
                        {landingSettings.footer?.companyName || '행복마루'}
                      </span>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {(landingSettings.footer?.snsLinks || []).filter(s => s.enabled).map(s => (
                          <span key={s.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#FFF' }}>
                            <DynamicIcon name={s.icon || 'ExternalLink'} size={14} color="#FFF" />
                            <span>{s.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ lineHeight: 1.6 }}>
                      <span>대표: {landingSettings.footer?.ceo || '김은주'}</span> | 
                      <span> 사업자등록번호: {landingSettings.footer?.registrationNo || '546-95-01586'}</span><br />
                      <span>주소: {landingSettings.footer?.address || '전라남도 고흥군 도화면'}</span> | 
                      <span> 문의: {landingSettings.footer?.phone || '010-8608-2510'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* SUB TAB: PASSWORDS (관리자 및 생산자 비밀번호 통합 관리)              */}
        {/* ==================================================================== */}
        {activeTab === 'passwords' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid #EAE8E3',
              boxShadow: '0 4px 20px rgba(180, 160, 120, 0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#FAF6EE',
                  border: '1px solid #EAE8E3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2D6A4F'
                }}>
                  <KeyRound size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#2B2A27', margin: 0 }}>
                    보안 및 비밀번호 관리
                  </h2>
                  <p style={{ fontSize: '13px', color: '#6B6862', margin: '4px 0 0 0' }}>
                    관리자 대시보드와 생산자(포장/제조) 전용 페이지의 접속 비밀번호를 한 곳에서 안전하게 변경합니다.
                  </p>
                </div>
              </div>

              {pwSaveSuccess && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#D8F3DC',
                  color: '#2D6A4F',
                  fontSize: '14px',
                  fontWeight: '700',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle2 size={18} />
                  <span>{pwSaveSuccess}</span>
                </div>
              )}

              {pwSaveError && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#FDEDEC',
                  color: '#C0392B',
                  fontSize: '14px',
                  fontWeight: '700',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertTriangle size={18} />
                  <span>{pwSaveError}</span>
                </div>
              )}

              {/* Grid with 2 Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                {/* Card 1: Admin Password */}
                <div style={{
                  border: '1.5px solid #EAE8E3',
                  borderRadius: '12px',
                  padding: '24px',
                  backgroundColor: '#FAFAF8'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <Lock size={18} color="#2D6A4F" />
                    <strong style={{ fontSize: '16px', color: '#2B2A27' }}>관리자 페이지 비밀번호</strong>
                  </div>
                  <p style={{ fontSize: '12px', color: '#6B6862', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                    현재 대시보드 및 전체 설정을 수정할 수 있는 최고 권한 암호입니다. (초기값: <code>yuzu1234</code>)
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4A4844', marginBottom: '4px' }}>
                        새 관리자 비밀번호
                      </label>
                      <input
                        type="password"
                        value={adminNewPw}
                        onChange={(e) => setAdminNewPw(e.target.value)}
                        placeholder="새 비밀번호 (4자 이상)"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #D6D3CC',
                          fontSize: '14px',
                          backgroundColor: '#FFFFFF'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4A4844', marginBottom: '4px' }}>
                        새 관리자 비밀번호 확인
                      </label>
                      <input
                        type="password"
                        value={adminConfirmPw}
                        onChange={(e) => setAdminConfirmPw(e.target.value)}
                        placeholder="새 비밀번호 다시 입력"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #D6D3CC',
                          fontSize: '14px',
                          backgroundColor: '#FFFFFF'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card 2: Producer Password */}
                <div style={{
                  border: '1.5px solid #EAE8E3',
                  borderRadius: '12px',
                  padding: '24px',
                  backgroundColor: '#FAFAF8'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <Package size={18} color="#D97706" />
                    <strong style={{ fontSize: '16px', color: '#2B2A27' }}>생산자(작업자) 페이지 비밀번호</strong>
                  </div>
                  <p style={{ fontSize: '12px', color: '#6B6862', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                    현장 제조/포장 담당자가 재고와 주문 상태를 확인하는 전용 암호입니다. (초기값: <code>maker1234</code>)
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4A4844', marginBottom: '4px' }}>
                        새 생산자 비밀번호
                      </label>
                      <input
                        type="password"
                        value={producerNewPw}
                        onChange={(e) => setProducerNewPw(e.target.value)}
                        placeholder="새 비밀번호 (4자 이상)"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #D6D3CC',
                          fontSize: '14px',
                          backgroundColor: '#FFFFFF'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4A4844', marginBottom: '4px' }}>
                        새 생산자 비밀번호 확인
                      </label>
                      <input
                        type="password"
                        value={producerConfirmPw}
                        onChange={(e) => setProducerConfirmPw(e.target.value)}
                        placeholder="새 비밀번호 다시 입력"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #D6D3CC',
                          fontSize: '14px',
                          backgroundColor: '#FFFFFF'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleSavePasswords}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 28px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#2D6A4F',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(45, 106, 79, 0.25)'
                  }}
                >
                  <Save size={16} />
                  <span>비밀번호 저장하기</span>
                </button>
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

      {/* ====================================================================== */}
      {/* MODAL 6: VISUAL LANDING EDITOR MODAL POPUP                             */}
      {/* ====================================================================== */}
      <ModalPopup
        isOpen={editingModal.isOpen}
        onClose={() => setEditingModal({ isOpen: false, type: null, targetId: null, data: null })}
        title={(() => {
          switch (editingModal.type) {
            case 'hero': return '메인 히어로 (Hero) 섹션 수정';
            case 'story': return '브랜드 스토리 (Story) 섹션 수정';
            case 'features': return '핵심 특장점 (Features) 섹션 수정';
            case 'lineup': return '제품 소개 (Lineup) 섹션 수정';
            case 'reviews': return '고객 리뷰 (Reviews) 섹션 수정';
            case 'cta': return '하단 배너 (CTA) 섹션 수정';
            case 'header': return '상단 헤더 및 GNB 메뉴 설정';
            case 'footer': return '푸터 정보 및 SNS 링크 설정';
            case 'popups': return '공지사항 팝업 관리';
            default: return '섹션 설정 수정';
          }
        })()}
        subtitle="원하는 텍스트와 사진을 수정하고 '변경사항 적용'을 누르면 실시간 캔버스에 즉시 반영됩니다."
        footerActions={
          <>
            <button
              type="button"
              onClick={() => setEditingModal({ isOpen: false, type: null, targetId: null, data: null })}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #EAE8E3', background: '#FFFFFF', cursor: 'pointer', fontWeight: '600' }}
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSaveEditModal}
              style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', background: '#2D6A4F', color: '#FFFFFF', cursor: 'pointer', fontWeight: '700' }}
            >
              변경사항 적용
            </button>
          </>
        }
      >
        {editingModal.data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px' }}>
            
            {/* Section Common Meta Header (Anchor & GNB) */}
            {editingModal.targetId && (
              <div style={{ backgroundColor: '#FAF6EE', padding: '12px', borderRadius: '8px', border: '1px solid #EAE8E3', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6B6862', marginBottom: '2px' }}>섹션 관리명</label>
                  <input
                    type="text"
                    value={editingModal.data.name || ''}
                    onChange={(e) => setEditingModal(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6B6862', marginBottom: '2px' }}>페이지 앵커 ID (#)</label>
                  <input
                    type="text"
                    value={editingModal.data.anchor || ''}
                    onChange={(e) => setEditingModal(prev => ({ ...prev, data: { ...prev.data, anchor: e.target.value } }))}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                  />
                </div>
                <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editingModal.data.showInNav || false}
                      onChange={(e) => setEditingModal(prev => ({ ...prev, data: { ...prev.data, showInNav: e.target.checked } }))}
                    />
                    <span>상단 GNB 메뉴에 노출</span>
                  </label>
                  {editingModal.data.showInNav && (
                    <input
                      type="text"
                      value={editingModal.data.navLabel || ''}
                      placeholder="메뉴 표시명"
                      onChange={(e) => setEditingModal(prev => ({ ...prev, data: { ...prev.data, navLabel: e.target.value } }))}
                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px', flexGrow: 1 }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* 1. HERO EDITOR */}
            {editingModal.type === 'hero' && (() => {
              const d = editingModal.data.data || {};
              const updateHero = (field, val) => {
                setEditingModal(prev => ({
                  ...prev,
                  data: {
                    ...prev.data,
                    data: { ...(prev.data.data || {}), [field]: val }
                  }
                }));
              };
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>상단 배지 문구</label>
                    <input
                      type="text"
                      value={d.badge || ''}
                      onChange={(e) => updateHero('badge', e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      메인 타이틀 (Enter 줄바꿈 엄격 반영)
                    </label>
                    <textarea
                      rows={3}
                      value={d.title || ''}
                      onChange={(e) => updateHero('title', e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px', lineHeight: 1.5 }}
                    />
                    <span style={{ fontSize: '11px', color: '#2D6A4F', marginTop: '2px', display: 'block' }}>
                      💡 Enter로 줄바꿈을 입력하시면 실제 랜딩페이지에 줄바꿈이 그대로 반영됩니다.
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>서브타이틀 설명 문구</label>
                    <textarea
                      rows={2}
                      value={d.subtitle || ''}
                      onChange={(e) => updateHero('subtitle', e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px', lineHeight: 1.5 }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>구매 버튼 문구</label>
                      <input
                        type="text"
                        value={d.ctaText || ''}
                        onChange={(e) => updateHero('ctaText', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>구매 링크 URL</label>
                      <input
                        type="text"
                        value={d.ctaLink || ''}
                        onChange={(e) => updateHero('ctaLink', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>스토리 링크 문구</label>
                    <input
                      type="text"
                      value={d.storyLinkText || ''}
                      onChange={(e) => updateHero('storyLinkText', e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                    />
                  </div>

                  <ImageFieldEditor
                    label="대표 비주얼 이미지"
                    value={d.image || 'images/yuzu_oranda_hero.png'}
                    onChange={(img) => updateHero('image', img)}
                  />
                </div>
              );
            })()}

            {/* 2. STORY EDITOR */}
            {editingModal.type === 'story' && (() => {
              const d = editingModal.data.data || {};
              const updateStory = (field, val) => {
                setEditingModal(prev => ({
                  ...prev,
                  data: {
                    ...prev.data,
                    data: { ...(prev.data.data || {}), [field]: val }
                  }
                }));
              };
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>소제목 (서브타이틀)</label>
                      <input
                        type="text"
                        value={d.subtitle || ''}
                        onChange={(e) => updateStory('subtitle', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>스토리 헤드라인</label>
                      <input
                        type="text"
                        value={d.sectionTitle || ''}
                        onChange={(e) => updateStory('sectionTitle', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      메인 타이틀 (Enter 줄바꿈 반영)
                    </label>
                    <textarea
                      rows={2}
                      value={d.title || ''}
                      onChange={(e) => updateStory('title', e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px', lineHeight: 1.5 }}
                    />
                    <span style={{ fontSize: '11px', color: '#2D6A4F', marginTop: '2px', display: 'block' }}>
                      💡 Enter로 줄바꿈을 입력하시면 실제 랜딩페이지에 줄바꿈이 그대로 반영됩니다.
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>스토리 본문 단락 1</label>
                    <textarea
                      rows={3}
                      value={d.body1 || ''}
                      onChange={(e) => updateStory('body1', e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px', lineHeight: 1.5 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>스토리 본문 단락 2</label>
                    <textarea
                      rows={3}
                      value={d.body2 || ''}
                      onChange={(e) => updateStory('body2', e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px', lineHeight: 1.5 }}
                    />
                  </div>

                  <div style={{ backgroundColor: '#FAF6EE', padding: '12px', borderRadius: '8px', border: '1px solid #EAE8E3' }}>
                    <strong style={{ fontSize: '13px', color: '#2B2A27', display: 'block', marginBottom: '8px' }}>강조 특장점 배지 & 아이콘</strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginBottom: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '3px' }}>배지 문구</label>
                        <input
                          type="text"
                          value={d.featureBadge || ''}
                          onChange={(e) => updateStory('featureBadge', e.target.value)}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '3px' }}>배지 설명</label>
                        <input
                          type="text"
                          value={d.featureDesc || ''}
                          onChange={(e) => updateStory('featureDesc', e.target.value)}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '3px' }}>아이콘 선택 (현재: {d.featureIcon || 'Leaf'})</label>
                      <IconPicker
                        selectedIcon={d.featureIcon || 'Leaf'}
                        onSelect={(iconName) => updateStory('featureIcon', iconName)}
                      />
                    </div>
                  </div>

                  <ImageFieldEditor
                    label="스토리 연출 사진"
                    value={d.image || 'images/yuzu_classic_oranda.png'}
                    onChange={(img) => updateStory('image', img)}
                  />
                </div>
              );
            })()}

            {/* 3. FEATURES EDITOR */}
            {editingModal.type === 'features' && (() => {
              const d = editingModal.data.data || {};
              const items = Array.isArray(d.items) ? d.items : [];
              const updateFeatures = (field, val) => {
                setEditingModal(prev => ({
                  ...prev,
                  data: {
                    ...prev.data,
                    data: { ...(prev.data.data || {}), [field]: val }
                  }
                }));
              };
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>서브타이틀</label>
                      <input
                        type="text"
                        value={d.subtitle || ''}
                        onChange={(e) => updateFeatures('subtitle', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>메인 타이틀</label>
                      <input
                        type="text"
                        value={d.title || ''}
                        onChange={(e) => updateFeatures('title', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #EAE8E3', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <strong style={{ fontSize: '14px', color: '#2B2A27' }}>특장점 카드 목록 ({items.length}개)</strong>
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = [...items, { id: `feat_${Date.now()}`, icon: 'Sparkles', title: '새 특장점', desc: '특장점 상세 설명을 입력하세요.' }];
                          updateFeatures('items', newItems);
                        }}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #2D6A4F', backgroundColor: '#FAFDFB', color: '#2D6A4F', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        + 특장점 카드 추가
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {items.map((item, idx) => (
                        <div key={item.id || idx} style={{ border: '1px solid #EAE8E3', borderRadius: '8px', padding: '12px', backgroundColor: '#FAF9F6' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '13px', color: '#2D6A4F' }}>카드 #{idx + 1}</strong>
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = items.filter((_, i) => i !== idx);
                                updateFeatures('items', newItems);
                              }}
                              style={{ border: 'none', background: 'none', color: '#C0392B', cursor: 'pointer' }}
                              title="삭제"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div style={{ marginBottom: '8px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '2px' }}>카드 제목</label>
                            <input
                              type="text"
                              value={item.title || ''}
                              onChange={(e) => {
                                const newItems = [...items];
                                newItems[idx] = { ...newItems[idx], title: e.target.value };
                                updateFeatures('items', newItems);
                              }}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                            />
                          </div>

                          <div style={{ marginBottom: '8px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '2px' }}>카드 상세 설명</label>
                            <textarea
                              rows={2}
                              value={item.desc || ''}
                              onChange={(e) => {
                                const newItems = [...items];
                                newItems[idx] = { ...newItems[idx], desc: e.target.value };
                                updateFeatures('items', newItems);
                              }}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '2px' }}>아이콘 선택 (현재: {item.icon || 'Sparkles'})</label>
                            <IconPicker
                              selectedIcon={item.icon || 'Sparkles'}
                              onSelect={(iconName) => {
                                const newItems = [...items];
                                newItems[idx] = { ...newItems[idx], icon: iconName };
                                updateFeatures('items', newItems);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 4. LINEUP EDITOR */}
            {editingModal.type === 'lineup' && (() => {
              const d = editingModal.data.data || {};
              const items = Array.isArray(d.items) ? d.items : [];
              const updateLineup = (field, val) => {
                setEditingModal(prev => ({
                  ...prev,
                  data: {
                    ...prev.data,
                    data: { ...(prev.data.data || {}), [field]: val }
                  }
                }));
              };
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>서브타이틀</label>
                      <input
                        type="text"
                        value={d.subtitle || ''}
                        onChange={(e) => updateLineup('subtitle', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>메인 타이틀</label>
                      <input
                        type="text"
                        value={d.title || ''}
                        onChange={(e) => updateLineup('title', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #EAE8E3', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <strong style={{ fontSize: '14px', color: '#2B2A27' }}>제품 카드 목록 ({items.length}개)</strong>
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = [...items, {
                            id: `card_${Date.now()}`,
                            name: '새 세트 상품',
                            desc: '상품 구성을 입력하세요.',
                            originalPrice: 20000,
                            price: 18000,
                            unit: '(12개입 / 1박스)',
                            badge: '추천',
                            url: 'https://smartstore.naver.com/kkaburioranda',
                            image: ''
                          }];
                          updateLineup('items', newItems);
                        }}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #2D6A4F', backgroundColor: '#FAFDFB', color: '#2D6A4F', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        + 제품 카드 추가
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {items.map((prod, idx) => (
                        <div key={prod.id || idx} style={{ border: '1px solid #EAE8E3', borderRadius: '10px', padding: '14px', backgroundColor: '#FAF9F6' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '13px', color: '#2D6A4F' }}>제품 #{idx + 1}: {prod.name}</strong>
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = items.filter((_, i) => i !== idx);
                                updateLineup('items', newItems);
                              }}
                              style={{ border: 'none', background: 'none', color: '#C0392B', cursor: 'pointer' }}
                              title="삭제"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '8px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '2px' }}>상품명</label>
                              <input
                                type="text"
                                value={prod.name || ''}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx] = { ...newItems[idx], name: e.target.value };
                                  updateLineup('items', newItems);
                                }}
                                style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '2px' }}>배지 (Best 등)</label>
                              <input
                                type="text"
                                value={prod.badge || ''}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx] = { ...newItems[idx], badge: e.target.value };
                                  updateLineup('items', newItems);
                                }}
                                style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                              />
                            </div>
                          </div>

                          <div style={{ marginBottom: '8px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '2px' }}>상품 설명</label>
                            <input
                              type="text"
                              value={prod.desc || ''}
                              onChange={(e) => {
                                const newItems = [...items];
                                newItems[idx] = { ...newItems[idx], desc: e.target.value };
                                updateLineup('items', newItems);
                              }}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                            />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '2px' }}>정가 (원)</label>
                              <input
                                type="number"
                                value={prod.originalPrice || 0}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx] = { ...newItems[idx], originalPrice: Number(e.target.value) };
                                  updateLineup('items', newItems);
                                }}
                                style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '2px' }}>판매가 (원)</label>
                              <input
                                type="number"
                                value={prod.price || 0}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx] = { ...newItems[idx], price: Number(e.target.value) };
                                  updateLineup('items', newItems);
                                }}
                                style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '2px' }}>구성 단위</label>
                              <input
                                type="text"
                                value={prod.unit || ''}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx] = { ...newItems[idx], unit: e.target.value };
                                  updateLineup('items', newItems);
                                }}
                                style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                              />
                            </div>
                          </div>

                          <div style={{ marginBottom: '8px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '2px' }}>스마트스토어 구매 링크</label>
                            <input
                              type="text"
                              value={prod.url || ''}
                              onChange={(e) => {
                                const newItems = [...items];
                                newItems[idx] = { ...newItems[idx], url: e.target.value };
                                updateLineup('items', newItems);
                              }}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                            />
                          </div>

                          <ImageFieldEditor
                            label="상품 사진"
                            value={prod.image || ''}
                            onChange={(img) => {
                              const newItems = [...items];
                              newItems[idx] = { ...newItems[idx], image: img };
                              updateLineup('items', newItems);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 5. REVIEWS EDITOR */}
            {editingModal.type === 'reviews' && (() => {
              const d = editingModal.data.data || {};
              const items = Array.isArray(d.items) ? d.items : [];
              const updateReviews = (field, val) => {
                setEditingModal(prev => ({
                  ...prev,
                  data: {
                    ...prev.data,
                    data: { ...(prev.data.data || {}), [field]: val }
                  }
                }));
              };
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>서브타이틀</label>
                      <input
                        type="text"
                        value={d.subtitle || ''}
                        onChange={(e) => updateReviews('subtitle', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>메인 타이틀</label>
                      <input
                        type="text"
                        value={d.title || ''}
                        onChange={(e) => updateReviews('title', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #EAE8E3', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <strong style={{ fontSize: '14px', color: '#2B2A27' }}>고객 후기 목록 ({items.length}개)</strong>
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = [...items, {
                            id: `rev_${Date.now()}`,
                            author: '고객명',
                            product: '든든세트 구매',
                            rating: 5,
                            content: '정말 부드럽고 유자 향이 향긋해서 온 가족이 맛있게 먹었습니다!',
                            date: '2026.03',
                            tag: '베스트리뷰'
                          }];
                          updateReviews('items', newItems);
                        }}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #2D6A4F', backgroundColor: '#FAFDFB', color: '#2D6A4F', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        + 후기 추가
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {items.map((rev, idx) => (
                        <div key={rev.id || idx} style={{ border: '1px solid #EAE8E3', borderRadius: '8px', padding: '12px', backgroundColor: '#FAF9F6' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '13px', color: '#2D6A4F' }}>후기 #{idx + 1} ({rev.author})</strong>
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = items.filter((_, i) => i !== idx);
                                updateReviews('items', newItems);
                              }}
                              style={{ border: 'none', background: 'none', color: '#C0392B', cursor: 'pointer' }}
                              title="삭제"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '8px', marginBottom: '8px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '2px' }}>작성자</label>
                              <input
                                type="text"
                                value={rev.author || ''}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx] = { ...newItems[idx], author: e.target.value };
                                  updateReviews('items', newItems);
                                }}
                                style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '2px' }}>구매 상품</label>
                              <input
                                type="text"
                                value={rev.product || ''}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx] = { ...newItems[idx], product: e.target.value };
                                  updateReviews('items', newItems);
                                }}
                                style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '2px' }}>별점</label>
                              <select
                                value={rev.rating || 5}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx] = { ...newItems[idx], rating: Number(e.target.value) };
                                  updateReviews('items', newItems);
                                }}
                                style={{ width: '100%', padding: '6px 4px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                              >
                                {[5, 4, 3, 2, 1].map(r => (
                                  <option key={r} value={r}>★ {r}점</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div style={{ marginBottom: '8px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '2px' }}>후기 본문 내용</label>
                            <textarea
                              rows={2}
                              value={rev.content || ''}
                              onChange={(e) => {
                                const newItems = [...items];
                                newItems[idx] = { ...newItems[idx], content: e.target.value };
                                updateReviews('items', newItems);
                              }}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                            />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '2px' }}>작성 일자</label>
                              <input
                                type="text"
                                value={rev.date || ''}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx] = { ...newItems[idx], date: e.target.value };
                                  updateReviews('items', newItems);
                                }}
                                style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '2px' }}>태그</label>
                              <input
                                type="text"
                                value={rev.tag || ''}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx] = { ...newItems[idx], tag: e.target.value };
                                  updateReviews('items', newItems);
                                }}
                                style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 6. CTA EDITOR */}
            {editingModal.type === 'cta' && (() => {
              const d = editingModal.data.data || {};
              const updateCta = (field, val) => {
                setEditingModal(prev => ({
                  ...prev,
                  data: {
                    ...prev.data,
                    data: { ...(prev.data.data || {}), [field]: val }
                  }
                }));
              };
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>상단 배지 문구</label>
                    <input
                      type="text"
                      value={d.badge || ''}
                      onChange={(e) => updateCta('badge', e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      메인 타이틀 (Enter 줄바꿈 반영)
                    </label>
                    <textarea
                      rows={2}
                      value={d.title || ''}
                      onChange={(e) => updateCta('title', e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px', lineHeight: 1.5 }}
                    />
                    <span style={{ fontSize: '11px', color: '#2D6A4F', marginTop: '2px', display: 'block' }}>
                      💡 Enter로 줄바꿈을 입력하시면 실제 랜딩페이지에 줄바꿈이 그대로 반영됩니다.
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>서브타이틀 설명 문구</label>
                    <input
                      type="text"
                      value={d.subtitle || ''}
                      onChange={(e) => updateCta('subtitle', e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>구매 버튼 문구</label>
                      <input
                        type="text"
                        value={d.ctaText || ''}
                        onChange={(e) => updateCta('ctaText', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>구매 링크 URL</label>
                      <input
                        type="text"
                        value={d.ctaLink || ''}
                        onChange={(e) => updateCta('ctaLink', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>문의 버튼 문구</label>
                      <input
                        type="text"
                        value={d.contactText || ''}
                        onChange={(e) => updateCta('contactText', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>문의 링크 URL</label>
                      <input
                        type="text"
                        value={d.contactLink || ''}
                        onChange={(e) => updateCta('contactLink', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 7. HEADER & GNB EDITOR */}
            {editingModal.type === 'header' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>상단 영문 로고 문구</label>
                    <input
                      type="text"
                      value={editingModal.data.logoTextEn || ''}
                      onChange={(e) => setEditingModal(prev => ({ ...prev, data: { ...prev.data, logoTextEn: e.target.value } }))}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>상단 한글 상호 문구</label>
                    <input
                      type="text"
                      value={editingModal.data.logoTextKo || ''}
                      onChange={(e) => setEditingModal(prev => ({ ...prev, data: { ...prev.data, logoTextKo: e.target.value } }))}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div style={{ border: '1px solid #EAE8E3', borderRadius: '8px', padding: '12px', backgroundColor: '#FAF6EE' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', marginBottom: '10px' }}>
                    <input
                      type="checkbox"
                      checked={editingModal.data.showSmartStoreBtn !== false}
                      onChange={(e) => setEditingModal(prev => ({ ...prev, data: { ...prev.data, showSmartStoreBtn: e.target.checked } }))}
                    />
                    <span>상단 네이버 스마트스토어 구매 바로가기 버튼 노출</span>
                  </label>

                  {editingModal.data.showSmartStoreBtn !== false && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '2px' }}>버튼 문구</label>
                        <input
                          type="text"
                          value={editingModal.data.smartStoreText || ''}
                          onChange={(e) => setEditingModal(prev => ({ ...prev, data: { ...prev.data, smartStoreText: e.target.value } }))}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '2px' }}>스마트스토어 URL</label>
                        <input
                          type="text"
                          value={editingModal.data.smartStoreUrl || ''}
                          onChange={(e) => setEditingModal(prev => ({ ...prev, data: { ...prev.data, smartStoreUrl: e.target.value } }))}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 8. FOOTER & SNS EDITOR */}
            {editingModal.type === 'footer' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>상호명</label>
                    <input
                      type="text"
                      value={editingModal.data.companyName || ''}
                      onChange={(e) => setEditingModal(prev => ({ ...prev, data: { ...prev.data, companyName: e.target.value } }))}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>대표자 성명</label>
                    <input
                      type="text"
                      value={editingModal.data.ceo || ''}
                      onChange={(e) => setEditingModal(prev => ({ ...prev, data: { ...prev.data, ceo: e.target.value } }))}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>사업자등록번호</label>
                    <input
                      type="text"
                      value={editingModal.data.registrationNo || ''}
                      onChange={(e) => setEditingModal(prev => ({ ...prev, data: { ...prev.data, registrationNo: e.target.value } }))}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>고객센터 연락처</label>
                    <input
                      type="text"
                      value={editingModal.data.phone || ''}
                      onChange={(e) => setEditingModal(prev => ({ ...prev, data: { ...prev.data, phone: e.target.value } }))}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>사업장 주소</label>
                  <input
                    type="text"
                    value={editingModal.data.address || ''}
                    onChange={(e) => setEditingModal(prev => ({ ...prev, data: { ...prev.data, address: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #EAE8E3', fontSize: '13px' }}
                  />
                </div>

                {/* SNS Links Management */}
                <div style={{ borderTop: '1px solid #EAE8E3', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <strong style={{ fontSize: '13px', color: '#2B2A27' }}>푸터 SNS 채널 링크 목록</strong>
                    <button
                      type="button"
                      onClick={() => {
                        const current = Array.isArray(editingModal.data.snsLinks) ? editingModal.data.snsLinks : [];
                        setEditingModal(prev => ({
                          ...prev,
                          data: {
                            ...prev.data,
                            snsLinks: [...current, { id: `sns_${Date.now()}`, name: '새 SNS', icon: 'ExternalLink', url: '', enabled: true }]
                          }
                        }));
                      }}
                      style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #2D6A4F', backgroundColor: '#FAFDFB', color: '#2D6A4F', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      + SNS 추가
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(Array.isArray(editingModal.data.snsLinks) ? editingModal.data.snsLinks : []).map((sns, idx) => (
                      <div key={sns.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: '#FAF9F6', borderRadius: '6px', border: '1px solid #EAE8E3' }}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={sns.enabled !== false}
                            onChange={(e) => {
                              const newLinks = [...editingModal.data.snsLinks];
                              newLinks[idx] = { ...newLinks[idx], enabled: e.target.checked };
                              setEditingModal(prev => ({ ...prev, data: { ...prev.data, snsLinks: newLinks } }));
                            }}
                          />
                          <span>노출</span>
                        </label>
                        <input
                          type="text"
                          value={sns.name || ''}
                          placeholder="채널명"
                          onChange={(e) => {
                            const newLinks = [...editingModal.data.snsLinks];
                            newLinks[idx] = { ...newLinks[idx], name: e.target.value };
                            setEditingModal(prev => ({ ...prev, data: { ...prev.data, snsLinks: newLinks } }));
                          }}
                          style={{ width: '100px', padding: '5px 8px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                        />
                        <input
                          type="text"
                          value={sns.url || ''}
                          placeholder="https://..."
                          onChange={(e) => {
                            const newLinks = [...editingModal.data.snsLinks];
                            newLinks[idx] = { ...newLinks[idx], url: e.target.value };
                            setEditingModal(prev => ({ ...prev, data: { ...prev.data, snsLinks: newLinks } }));
                          }}
                          style={{ flexGrow: 1, padding: '5px 8px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newLinks = editingModal.data.snsLinks.filter((_, i) => i !== idx);
                            setEditingModal(prev => ({ ...prev, data: { ...prev.data, snsLinks: newLinks } }));
                          }}
                          style={{ border: 'none', background: 'none', color: '#C0392B', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 9. POPUPS EDITOR */}
            {editingModal.type === 'popups' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '13px', color: '#6B6862', margin: 0 }}>
                    다중 팝업을 등록할 수 있으며 활성화된 팝업은 메인 페이지 방문 시 모달/슬라이더로 노출됩니다.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const current = Array.isArray(editingModal.data) ? editingModal.data : [];
                      setEditingModal(prev => ({
                        ...prev,
                        data: [...current, {
                          id: `popup_${Date.now()}`,
                          enabled: true,
                          title: '새 공지사항',
                          content: '공지사항 내용을 입력하세요.',
                          image: '',
                          link: 'https://smartstore.naver.com/kkaburioranda',
                          linkText: '자세히 보기'
                        }]
                      }));
                    }}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #2D6A4F', backgroundColor: '#FAFDFB', color: '#2D6A4F', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    + 새 공지 팝업 추가
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {(Array.isArray(editingModal.data) ? editingModal.data : []).map((pop, idx) => (
                    <div key={pop.id || idx} style={{ border: pop.enabled ? '1.5px solid #2D6A4F' : '1px dashed #D6D3CC', borderRadius: '10px', padding: '14px', backgroundColor: pop.enabled ? '#FFFFFF' : '#FAF9F6' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={pop.enabled || false}
                            onChange={(e) => {
                              const list = [...editingModal.data];
                              list[idx] = { ...list[idx], enabled: e.target.checked };
                              setEditingModal(prev => ({ ...prev, data: list }));
                            }}
                          />
                          <span style={{ color: pop.enabled ? '#2D6A4F' : '#6B6862' }}>팝업 #{idx + 1} {pop.enabled ? '(노출 활성화)' : '(비활성화)'}</span>
                        </label>

                        {editingModal.data.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const list = editingModal.data.filter((_, i) => i !== idx);
                              setEditingModal(prev => ({ ...prev, data: list }));
                            }}
                            style={{ border: 'none', background: 'none', color: '#C0392B', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '2px' }}>팝업 제목</label>
                          <input
                            type="text"
                            value={pop.title || ''}
                            onChange={(e) => {
                              const list = [...editingModal.data];
                              list[idx] = { ...list[idx], title: e.target.value };
                              setEditingModal(prev => ({ ...prev, data: list }));
                            }}
                            style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '2px' }}>버튼 표시 문구</label>
                          <input
                            type="text"
                            value={pop.linkText || ''}
                            onChange={(e) => {
                              const list = [...editingModal.data];
                              list[idx] = { ...list[idx], linkText: e.target.value };
                              setEditingModal(prev => ({ ...prev, data: list }));
                            }}
                            style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '2px' }}>버튼 이동 링크 URL</label>
                        <input
                          type="text"
                          value={pop.link || ''}
                          onChange={(e) => {
                            const list = [...editingModal.data];
                            list[idx] = { ...list[idx], link: e.target.value };
                            setEditingModal(prev => ({ ...prev, data: list }));
                          }}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                        />
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '2px' }}>공지 본문 내용</label>
                        <textarea
                          rows={2}
                          value={pop.content || ''}
                          onChange={(e) => {
                            const list = [...editingModal.data];
                            list[idx] = { ...list[idx], content: e.target.value };
                            setEditingModal(prev => ({ ...prev, data: list }));
                          }}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #D6D3CC', fontSize: '12px' }}
                        />
                      </div>

                      <ImageFieldEditor
                        label="팝업 첨부 사진 (선택)"
                        value={pop.image || ''}
                        onChange={(img) => {
                          const list = [...editingModal.data];
                          list[idx] = { ...list[idx], image: img };
                          setEditingModal(prev => ({ ...prev, data: list }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </ModalPopup>

    </div>
  );
}
