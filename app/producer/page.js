"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import StockBadge from '../../components/common/StockBadge';
import RecentLogViewer from '../../components/common/RecentLogViewer';
import ModalPopup from '../../components/common/ModalPopup';
import { formatDateTime } from '../../lib/inventoryCommon';
import { 
  Factory, 
  ChefHat, 
  Package, 
  Save, 
  History, 
  Lock, 
  RotateCcw, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle, 
  Plus, 
  Minus,
  ExternalLink,
  Info
} from 'lucide-react';
import './producer.css';

export default function ProducerPage() {
  // 1. Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [gatePassword, setGatePassword] = useState('');
  const [showGateError, setShowGateError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 2. Core Entities State
  const [activeProducerTab, setActiveProducerTab] = useState('raw'); // 'raw', 'products', 'finished'
  const [rawMaterials, setRawMaterials] = useState([]);
  const [products, setProducts] = useState([]);
  const [finishedGoods, setFinishedGoods] = useState([]);
  const [inventoryLogs, setInventoryLogs] = useState([]);

  // 3. Left Panel Input Amounts (State of changes to apply)
  // format: { [id]: number } (positive or negative)
  const [rawAdjusts, setRawAdjusts] = useState({});
  const [productAdjusts, setProductAdjusts] = useState({});
  const [finishedAdjusts, setFinishedAdjusts] = useState({});

  // 4. Modals State
  // 4.1 Save Confirmation & Reason Modal
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveReason, setSaveReason] = useState('당일 정기 생산 및 재고 조정');
  const [isSaving, setIsSaving] = useState(false);

  // 4.2 Item Edit Popup Modal (원재료 / 상품 / 완제품 항목 수정용)
  const [editItemModal, setEditItemModal] = useState({
    isOpen: false,
    type: '', // 'raw', 'product', 'finished'
    item: null
  });

  // 4.3 Log Detail / Edit / Delete Modal (사이드바에서 클릭 시)
  const [selectedLogModal, setSelectedLogModal] = useState({
    isOpen: false,
    log: null,
    reason: ''
  });

  // Load Data
  const loadAllData = async () => {
    const [mats, prods, goods, logs] = await Promise.all([
      supabase.getRawMaterials(),
      supabase.getProducts(),
      supabase.getFinishedGoods(),
      supabase.getInventoryLogs()
    ]);
    setRawMaterials(mats || []);
    setProducts(prods || []);
    setFinishedGoods(goods || []);
    setInventoryLogs(logs || []);
  };

  useEffect(() => {
    setIsMounted(true);
    const auth = sessionStorage.getItem('yuzu_producer_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    loadAllData();
  }, []);

  // Auth Handler
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (gatePassword === 'maker1234') {
      sessionStorage.setItem('yuzu_producer_auth', 'true');
      setIsAuthenticated(true);
      setShowGateError(false);
    } else {
      setShowGateError(true);
    }
  };

  // Adjust input change helper
  const handleAmountChange = (setter, id, val) => {
    const num = parseFloat(val);
    setter(prev => ({
      ...prev,
      [id]: isNaN(num) ? '' : num
    }));
  };

  const handleQuickStep = (setter, id, step) => {
    setter(prev => {
      const current = parseFloat(prev[id]) || 0;
      return {
        ...prev,
        [id]: Math.round((current + step) * 100) / 100
      };
    });
  };

  // Check if any adjustments are staged
  const stagedChangesList = () => {
    const changes = [];

    rawMaterials.forEach(m => {
      const diff = parseFloat(rawAdjusts[m.id]);
      if (diff && diff !== 0) {
        changes.push({
          category: 'raw_materials',
          item_id: m.id,
          name: m.name,
          diff,
          unit: m.unit
        });
      }
    });

    products.forEach(p => {
      const diff = parseFloat(productAdjusts[p.id]);
      if (diff && diff !== 0) {
        changes.push({
          category: 'products',
          item_id: p.id,
          name: p.name,
          diff,
          unit: '개'
        });
      }
    });

    finishedGoods.forEach(g => {
      const diff = parseFloat(finishedAdjusts[g.id]);
      if (diff && diff !== 0) {
        changes.push({
          category: 'finished_goods',
          item_id: g.id,
          name: g.name,
          diff,
          unit: '박스'
        });
      }
    });

    return changes;
  };

  // Open Save Modal
  const handleOpenSaveModal = () => {
    const list = stagedChangesList();
    if (list.length === 0) {
      alert('입력된 재고 변동 내역이 없습니다. 수량을 입력한 후 저장을 눌러주세요.');
      return;
    }
    setSaveReason('당일 정기 생산 및 재고 조정');
    setIsSaveModalOpen(true);
  };

  // Execute Save All Changes to DB
  const handleConfirmSaveAll = async () => {
    const list = stagedChangesList();
    if (list.length === 0) return;
    if (!saveReason.trim()) {
      alert('변경 사유를 입력해 주세요.');
      return;
    }

    setIsSaving(true);
    try {
      // 1. Update Raw Materials
      const updatedMaterials = rawMaterials.map(m => {
        const diff = parseFloat(rawAdjusts[m.id]) || 0;
        return diff !== 0 ? { ...m, stock: Math.max(0, Math.round((m.stock + diff) * 100) / 100) } : m;
      });
      await supabase.saveRawMaterials(updatedMaterials);

      // 2. Update Products
      const updatedProducts = products.map(p => {
        const diff = parseFloat(productAdjusts[p.id]) || 0;
        return diff !== 0 ? { ...p, stock: Math.max(0, Math.round((p.stock + diff) * 100) / 100) } : p;
      });
      await supabase.saveProducts(updatedProducts);

      // 3. Update Finished Goods
      const updatedFinished = finishedGoods.map(g => {
        const diff = parseFloat(finishedAdjusts[g.id]) || 0;
        return diff !== 0 ? { ...g, stock: Math.max(0, Math.round((g.stock + diff) * 100) / 100) } : g;
      });
      await supabase.saveFinishedGoods(updatedFinished);

      // 4. Create single Inventory Log
      const newLog = {
        id: `log_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        reason: saveReason.trim(),
        changes: list
      };
      await supabase.addInventoryLog(newLog);

      // Reset staged adjustments
      setRawAdjusts({});
      setProductAdjusts({});
      setFinishedAdjusts({});
      setIsSaveModalOpen(false);

      // Reload
      await loadAllData();
      alert('작업 내역이 성공적으로 데이터베이스에 저장되고 기록되었습니다.');
    } catch (e) {
      console.error(e);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // Item Edit Modal Handlers (원재료, 상품, 완제품 항목 수정)
  const openEditModal = (type, item) => {
    setEditItemModal({
      isOpen: true,
      type,
      item: { ...item }
    });
  };

  const handleSaveItemEdit = async () => {
    const { type, item } = editItemModal;
    if (!item || !item.name) return;

    if (type === 'raw') {
      await supabase.updateRawMaterial(item.id, {
        name: item.name,
        unit: item.unit,
        stock: parseFloat(item.stock) || 0
      });
    } else if (type === 'product') {
      await supabase.updateProduct(item.id, {
        name: item.name,
        stock: parseFloat(item.stock) || 0
      });
    } else if (type === 'finished') {
      await supabase.updateFinishedGood(item.id, {
        name: item.name,
        set_type: item.set_type,
        price: parseFloat(item.price) || 0,
        stock: parseFloat(item.stock) || 0
      });
    }

    setEditItemModal({ isOpen: false, type: '', item: null });
    await loadAllData();
  };

  // Sidebar Log Item Click Handlers
  const handleLogClick = (log) => {
    setSelectedLogModal({
      isOpen: true,
      log,
      reason: log.reason
    });
  };

  // "좌측 화면으로 불러오기" (해당 기록의 수량을 좌측 인풋에 복원)
  const handleLoadLogToLeft = (log) => {
    const newRaw = {};
    const newProd = {};
    const newFin = {};

    log.changes.forEach(c => {
      if (c.category === 'raw_materials') {
        const found = rawMaterials.find(m => m.name === c.name || m.id === c.item_id);
        if (found) newRaw[found.id] = c.diff;
      } else if (c.category === 'products') {
        const found = products.find(p => p.name === c.name || p.id === c.item_id);
        if (found) newProd[found.id] = c.diff;
      } else if (c.category === 'finished_goods') {
        const found = finishedGoods.find(g => g.name === c.name || g.id === c.item_id);
        if (found) newFin[found.id] = c.diff;
      }
    });

    setRawAdjusts(newRaw);
    setProductAdjusts(newProd);
    setFinishedAdjusts(newFin);
    setSelectedLogModal({ isOpen: false, log: null, reason: '' });
    alert('선택한 기록의 변동 수량이 좌측 입력 화면에 반영되었습니다.');
  };

  const handleUpdateLogReason = async () => {
    if (!selectedLogModal.log) return;
    await supabase.updateInventoryLog(selectedLogModal.log.id, {
      reason: selectedLogModal.reason.trim()
    });
    setSelectedLogModal({ isOpen: false, log: null, reason: '' });
    await loadAllData();
  };

  const handleDeleteLog = async () => {
    if (!selectedLogModal.log) return;
    if (!confirm('이 재고 변경 기록을 삭제하시겠습니까? (실제 재고량은 되돌려지지 않고 기록만 삭제됩니다)')) return;
    await supabase.deleteInventoryLog(selectedLogModal.log.id);
    setSelectedLogModal({ isOpen: false, log: null, reason: '' });
    await loadAllData();
  };

  // 1. Gate screen
  if (!isMounted || !isAuthenticated) {
    return (
      <div className="producer-auth-gate">
        <div className="producer-auth-card">
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#FFEFA6',
            color: '#8C6F3E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <Factory size={28} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 8px 0', color: '#2B2A27' }}>
            생산자 / 작업장 시스템
          </h2>
          <p style={{ fontSize: '14px', color: '#6B6862', margin: '0 0 24px 0' }}>
            생산 현장 작업자 전용 대시보드입니다.<br />비밀번호를 입력해 주세요.
          </p>
          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="password"
              value={gatePassword}
              onChange={(e) => setGatePassword(e.target.value)}
              placeholder="작업자 암호 (기본값: maker1234)"
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
              현장 대시보드 입장
            </button>
          </form>
        </div>
      </div>
    );
  }

  const stagedCount = stagedChangesList().length;

  return (
    <div className="producer-layout">
      {/* Top Header */}
      <header className="producer-header">
        <div className="producer-header-brand">
          <Factory size={22} style={{ color: 'var(--primary-yuzu)' }} />
          <h1>유자품은 오란다&까부리 생산/작업 시스템</h1>
          <span className="producer-badge">FACTORY MODE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button 
            onClick={() => {
              sessionStorage.removeItem('yuzu_producer_auth');
              setIsAuthenticated(false);
            }}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#A09E9B',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* Main Content Split */}
      <main className="producer-main-grid">
        {/* Left Side: Work inputs & Save */}
        <div className="producer-left-panel">
          {/* Top Tab Bar with Batch Save Button */}
          <div className="producer-top-tabbar">
            <div className="producer-tabs-group">
              <button
                type="button"
                className={`producer-tab-btn ${activeProducerTab === 'raw' ? 'active' : ''}`}
                onClick={() => setActiveProducerTab('raw')}
              >
                <Package size={17} />
                <span>1. 원재료 재고 관리</span>
                {Object.values(rawAdjusts).filter(v => v && v !== 0 && v !== '').length > 0 && (
                  <span className="tab-badge-indicator">
                    {Object.values(rawAdjusts).filter(v => v && v !== 0 && v !== '').length}
                  </span>
                )}
              </button>

              <button
                type="button"
                className={`producer-tab-btn ${activeProducerTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveProducerTab('products')}
              >
                <ChefHat size={17} />
                <span>2. 상품 낱개 생산량</span>
                {Object.values(productAdjusts).filter(v => v && v !== 0 && v !== '').length > 0 && (
                  <span className="tab-badge-indicator">
                    {Object.values(productAdjusts).filter(v => v && v !== 0 && v !== '').length}
                  </span>
                )}
              </button>

              <button
                type="button"
                className={`producer-tab-btn ${activeProducerTab === 'finished' ? 'active' : ''}`}
                onClick={() => setActiveProducerTab('finished')}
              >
                <Factory size={17} />
                <span>3. 완제품(세트) 생산량</span>
                {Object.values(finishedAdjusts).filter(v => v && v !== 0 && v !== '').length > 0 && (
                  <span className="tab-badge-indicator">
                    {Object.values(finishedAdjusts).filter(v => v && v !== 0 && v !== '').length}
                  </span>
                )}
              </button>
            </div>

            <div className="producer-top-actions">
              <button
                type="button"
                onClick={handleOpenSaveModal}
                disabled={stagedCount === 0 || isSaving}
                className="btn-producer-top-save"
                title="모든 탭에서 입력한 작업 내역을 한 번에 저장합니다"
              >
                <Save size={18} />
                <span>작업 내역 일괄 저장</span>
                {stagedCount > 0 && (
                  <span className="staged-count-pill">
                    {stagedCount}건 대기
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* TAB 1: Raw Materials */}
          {activeProducerTab === 'raw' && (
            <div className="producer-card">
              <div className="producer-card-header">
                <h2>
                  <Package size={18} style={{ color: '#2D6A4F' }} />
                  1. 원재료 재고 관리
                </h2>
                <span style={{ fontSize: '13px', color: '#6B6862' }}>
                  원재료 입고(+) / 사용(-) 수량을 조정하세요
                </span>
              </div>
              <div className="producer-card-body">
                {rawMaterials.map(m => {
                  const adjVal = rawAdjusts[m.id] !== undefined ? rawAdjusts[m.id] : '';
                  return (
                    <div key={m.id} className="producer-item-row">
                      <div className="producer-item-info">
                        <div className="producer-item-name">
                          <span>{m.name}</span>
                          <button
                            type="button"
                            onClick={() => openEditModal('raw', m)}
                            className="btn-producer-item-edit"
                            title="항목 정보 수정 (팝업)"
                          >
                            <Edit3 size={12} />
                            <span>수정</span>
                          </button>
                        </div>
                        <div className="producer-item-meta">
                          <StockBadge stock={m.stock} unit={m.unit} />
                          <RecentLogViewer logs={inventoryLogs} itemName={m.name} category="raw_materials" />
                        </div>
                      </div>

                      <div className="producer-adjust-group">
                        <button 
                          className="btn-adjust" 
                          onClick={() => handleQuickStep(setRawAdjusts, m.id, -1)}
                          title="1 차감"
                        >
                          -1
                        </button>
                        <button 
                          className="btn-adjust" 
                          onClick={() => handleQuickStep(setRawAdjusts, m.id, 1)}
                          title="1 추가"
                        >
                          +1
                        </button>
                        <input
                          type="number"
                          className="producer-qty-input"
                          placeholder="0"
                          value={adjVal}
                          onChange={(e) => handleAmountChange(setRawAdjusts, m.id, e.target.value)}
                        />
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#6B6862', minWidth: '24px' }}>
                          {m.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Products */}
          {activeProducerTab === 'products' && (
            <div className="producer-card">
              <div className="producer-card-header">
                <h2>
                  <ChefHat size={18} style={{ color: '#FFAA00' }} />
                  2. 상품 낱개 생산량 관리
                </h2>
                <span style={{ fontSize: '13px', color: '#6B6862' }}>
                  가공 생산된 낱개 오란다/까부리 등록
                </span>
              </div>
              <div className="producer-card-body">
                {products.map(p => {
                  const adjVal = productAdjusts[p.id] !== undefined ? productAdjusts[p.id] : '';
                  return (
                    <div key={p.id} className="producer-item-row">
                      <div className="producer-item-info">
                        <div className="producer-item-name">
                          <span>{p.name}</span>
                          <button
                            type="button"
                            onClick={() => openEditModal('product', p)}
                            className="btn-producer-item-edit"
                            title="상품 정보 수정 (팝업)"
                          >
                            <Edit3 size={12} />
                            <span>수정</span>
                          </button>
                        </div>
                        <div className="producer-item-meta">
                          <StockBadge stock={p.stock} unit="개" />
                          <RecentLogViewer logs={inventoryLogs} itemName={p.name} category="products" />
                        </div>
                      </div>

                      <div className="producer-adjust-group">
                        <button 
                          className="btn-adjust" 
                          onClick={() => handleQuickStep(setProductAdjusts, p.id, -10)}
                          title="10개 차감"
                        >
                          -10
                        </button>
                        <button 
                          className="btn-adjust" 
                          onClick={() => handleQuickStep(setProductAdjusts, p.id, 10)}
                          title="10개 추가"
                        >
                          +10
                        </button>
                        <input
                          type="number"
                          className="producer-qty-input"
                          placeholder="0"
                          value={adjVal}
                          onChange={(e) => handleAmountChange(setProductAdjusts, p.id, e.target.value)}
                        />
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#6B6862', minWidth: '24px' }}>
                          개
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Finished Goods */}
          {activeProducerTab === 'finished' && (
            <div className="producer-card">
              <div className="producer-card-header">
                <h2>
                  <Factory size={18} style={{ color: '#2D6A4F' }} />
                  3. 완제품(세트) 생산량 관리
                </h2>
                <span style={{ fontSize: '13px', color: '#6B6862' }}>
                  세트 포장 완료된 완제품 재고 입고(+)
                </span>
              </div>
              <div className="producer-card-body">
                {finishedGoods.map(g => {
                  const adjVal = finishedAdjusts[g.id] !== undefined ? finishedAdjusts[g.id] : '';
                  return (
                    <div key={g.id} className="producer-item-row">
                      <div className="producer-item-info">
                        <div className="producer-item-name">
                          <span>{g.name}</span>
                          <span style={{ fontSize: '11px', color: '#8C6F3E', backgroundColor: '#FFEFA6', padding: '1px 6px', borderRadius: '4px' }}>
                            {g.set_type}세트
                          </span>
                          <button
                            type="button"
                            onClick={() => openEditModal('finished', g)}
                            className="btn-producer-item-edit"
                            title="완제품 정보 수정 (팝업)"
                          >
                            <Edit3 size={12} />
                            <span>수정</span>
                          </button>
                        </div>
                        <div className="producer-item-meta">
                          <StockBadge stock={g.stock} unit="박스" />
                          <RecentLogViewer logs={inventoryLogs} itemName={g.name} category="finished_goods" />
                        </div>
                      </div>

                      <div className="producer-adjust-group">
                        <button 
                          className="btn-adjust" 
                          onClick={() => handleQuickStep(setFinishedAdjusts, g.id, -5)}
                          title="5박스 차감"
                        >
                          -5
                        </button>
                        <button 
                          className="btn-adjust" 
                          onClick={() => handleQuickStep(setFinishedAdjusts, g.id, 5)}
                          title="5박스 추가"
                        >
                          +5
                        </button>
                        <input
                          type="number"
                          className="producer-qty-input"
                          placeholder="0"
                          value={adjVal}
                          onChange={(e) => handleAmountChange(setFinishedAdjusts, g.id, e.target.value)}
                        />
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#6B6862', minWidth: '24px' }}>
                          박스
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Action Save Bar */}
          <div className="producer-save-bar">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: '800', color: '#2B2A27' }}>
                  현재 변경 대기 항목:
                </span>
                <span style={{
                  backgroundColor: stagedCount > 0 ? '#2D6A4F' : '#EAE8E3',
                  color: stagedCount > 0 ? '#FFFFFF' : '#6B6862',
                  padding: '2px 10px',
                  borderRadius: '20px',
                  fontWeight: '800',
                  fontSize: '13px'
                }}>
                  {stagedCount}개 항목
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B6862' }}>
                상단 또는 하단의 저장 버튼을 누르면 1, 2, 3 모든 탭의 수량이 DB에 일괄 반영됩니다.
              </p>
            </div>

            <button
              onClick={handleOpenSaveModal}
              className="btn-save-all"
              disabled={stagedCount === 0}
              style={{ opacity: stagedCount === 0 ? 0.5 : 1 }}
            >
              <Save size={18} />
              <span>작업 내역 일괄 저장</span>
            </button>
          </div>
        </div>

        {/* Right Side: Sidebar Logs */}
        <aside className="producer-sidebar-card">
          <div className="producer-sidebar-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} style={{ color: '#8C6F3E' }} />
              <h3>최근 변경 내역 (재고 기록)</h3>
            </div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#8C6F3E' }}>
              총 {inventoryLogs.length}건
            </span>
          </div>

          <div className="producer-sidebar-list">
            {inventoryLogs.length === 0 ? (
              <div style={{ padding: '40px 10px', textAlign: 'center', color: '#A09E9B', fontSize: '13px' }}>
                기록된 재고 변경 내역이 없습니다.
              </div>
            ) : (
              inventoryLogs.map(log => (
                <div 
                  key={log.id} 
                  className="producer-log-item"
                  onClick={() => handleLogClick(log)}
                  title="클릭하여 상세 조회, 수정 또는 삭제"
                >
                  <div className="producer-log-top">
                    <span>{formatDateTime(log.created_at)}</span>
                    <span style={{ fontSize: '11px', color: '#FFAA00', fontWeight: '700' }}>상세/수정</span>
                  </div>
                  <div className="producer-log-reason">
                    {log.reason}
                  </div>
                  <div className="producer-log-changes">
                    {log.changes?.map((c, i) => (
                      <span 
                        key={i} 
                        className={`producer-change-chip ${c.diff > 0 ? 'plus' : 'minus'}`}
                      >
                        {c.name}: {c.diff > 0 ? `+${c.diff}` : c.diff}{c.unit}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </main>

      {/* ---------------------------------------------------------------------- */}
      {/* Modal 1: Save Confirmation & Reason Input Modal */}
      {/* ---------------------------------------------------------------------- */}
      <ModalPopup
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="작업 내역 저장 및 사유 입력"
        subtitle="데이터베이스에 변경분을 반영하고 변경 관리 기록에 저장합니다."
        footerActions={
          <>
            <button
              onClick={() => setIsSaveModalOpen(false)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #EAE8E3',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              취소
            </button>
            <button
              onClick={handleConfirmSaveAll}
              disabled={isSaving}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#2D6A4F',
                color: '#FFFFFF',
                cursor: isSaving ? 'wait' : 'pointer',
                fontWeight: '700'
              }}
            >
              {isSaving ? '저장 중...' : '확인 및 저장 완료'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>
              변경 사유 (필수)
            </label>
            <input
              type="text"
              value={saveReason}
              onChange={(e) => setSaveReason(e.target.value)}
              placeholder="예: 당일 정기 생산 완료, 원재료 입고 등"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #EAE8E3',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <span style={{ fontSize: '12px', color: '#6B6862', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
              자주 쓰는 사유 선택:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                '당일 정기 생산 완료',
                '원재료 신규 입고',
                '현장 시식 및 샘플 출고',
                '불량 및 파손 폐기',
                '재고 실사 수량 보정'
              ].map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => setSaveReason(template)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: '1px solid #EAE8E3',
                    backgroundColor: saveReason === template ? '#FFEFA6' : '#FFFFFF',
                    color: '#2B2A27',
                    fontSize: '12px',
                    fontWeight: saveReason === template ? '700' : '500',
                    cursor: 'pointer'
                  }}
                >
                  {template}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            backgroundColor: '#FAF9F6',
            border: '1px solid #EAE8E3',
            borderRadius: '8px',
            padding: '12px 16px'
          }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#2B2A27', display: 'block', marginBottom: '8px' }}>
              반영될 변경 목록 ({stagedChangesList().length}개):
            </span>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#6B6862' }}>
              {stagedChangesList().map((c, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>
                  <strong>{c.name}</strong>: {c.diff > 0 ? `+${c.diff}` : c.diff} {c.unit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ModalPopup>

      {/* ---------------------------------------------------------------------- */}
      {/* Modal 2: Item Edit Modal (원재료/상품/완제품 항목 자체의 명칭, 기본정보 수정) */}
      {/* ---------------------------------------------------------------------- */}
      <ModalPopup
        isOpen={editItemModal.isOpen}
        onClose={() => setEditItemModal({ isOpen: false, type: '', item: null })}
        title={`${editItemModal.type === 'raw' ? '원재료' : editItemModal.type === 'product' ? '상품' : '완제품'} 정보 수정`}
        subtitle="항목의 기본 정보 및 현재 재고를 직접 수정합니다."
        footerActions={
          <>
            <button
              onClick={() => setEditItemModal({ isOpen: false, type: '', item: null })}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #EAE8E3',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              취소
            </button>
            <button
              onClick={handleSaveItemEdit}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#2D6A4F',
                color: '#FFFFFF',
                cursor: 'pointer',
                fontWeight: '700'
              }}
            >
              수정 완료
            </button>
          </>
        }
      >
        {editItemModal.item && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                명칭
              </label>
              <input
                type="text"
                value={editItemModal.item.name || ''}
                onChange={(e) => setEditItemModal(prev => ({
                  ...prev,
                  item: { ...prev.item, name: e.target.value }
                }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE8E3' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                현재 재고량
              </label>
              <input
                type="number"
                value={editItemModal.item.stock !== undefined ? editItemModal.item.stock : 0}
                onChange={(e) => setEditItemModal(prev => ({
                  ...prev,
                  item: { ...prev.item, stock: parseFloat(e.target.value) || 0 }
                }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE8E3' }}
              />
            </div>

            {editItemModal.type === 'raw' && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  재고 단위 (kg, g, 박스, 개 등)
                </label>
                <input
                  type="text"
                  value={editItemModal.item.unit || ''}
                  onChange={(e) => setEditItemModal(prev => ({
                    ...prev,
                    item: { ...prev.item, unit: e.target.value }
                  }))}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE8E3' }}
                />
              </div>
            )}

            {editItemModal.type === 'finished' && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  판매 금액 (원)
                </label>
                <input
                  type="number"
                  value={editItemModal.item.price || 0}
                  onChange={(e) => setEditItemModal(prev => ({
                    ...prev,
                    item: { ...prev.item, price: parseFloat(e.target.value) || 0 }
                  }))}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE8E3' }}
                />
              </div>
            )}
          </div>
        )}
      </ModalPopup>

      {/* ---------------------------------------------------------------------- */}
      {/* Modal 3: Log Detail / Edit / Delete Modal */}
      {/* ---------------------------------------------------------------------- */}
      <ModalPopup
        isOpen={selectedLogModal.isOpen}
        onClose={() => setSelectedLogModal({ isOpen: false, log: null, reason: '' })}
        title="재고 변경 내역 상세 및 관리"
        subtitle={selectedLogModal.log ? `기록 일시: ${formatDateTime(selectedLogModal.log.created_at)}` : ''}
        footerActions={
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
            <button
              onClick={handleDeleteLog}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #F5B7B1',
                backgroundColor: '#FDEDEC',
                color: '#C0392B',
                cursor: 'pointer',
                fontWeight: '700'
              }}
            >
              <Trash2 size={16} />
              <span>기록 삭제</span>
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleLoadLogToLeft(selectedLogModal.log)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #EAE8E3',
                  backgroundColor: '#FAF6EE',
                  color: '#8C6F3E',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
                title="이 기록의 변동 수량을 좌측 작업창으로 다시 불러와 재작업합니다"
              >
                <RotateCcw size={16} />
                <span>좌측 화면으로 불러오기</span>
              </button>
              <button
                onClick={handleUpdateLogReason}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#2D6A4F',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              >
                사유 수정 저장
              </button>
            </div>
          </div>
        }
      >
        {selectedLogModal.log && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                변경 사유
              </label>
              <input
                type="text"
                value={selectedLogModal.reason}
                onChange={(e) => setSelectedLogModal(prev => ({ ...prev, reason: e.target.value }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #EAE8E3' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                세부 변경 내역:
              </label>
              <div style={{
                backgroundColor: '#FAF9F6',
                borderRadius: '8px',
                border: '1px solid #EAE8E3',
                padding: '12px'
              }}>
                {selectedLogModal.log.changes?.map((c, idx) => (
                  <div 
                    key={idx} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 0',
                      borderBottom: idx < selectedLogModal.log.changes.length - 1 ? '1px solid #F0EEE9' : 'none',
                      fontSize: '13px'
                    }}
                  >
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
