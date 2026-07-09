"use client";

import { useState, useEffect } from 'react';
import { 
  Lock, 
  ShoppingCart, 
  Box, 
  Calculator, 
  LogOut, 
  RotateCw, 
  Check, 
  CornerUpLeft, 
  Trash2, 
  Plus, 
  Minus, 
  BarChart2, 
  Clock, 
  CheckCircle2,
  PackageOpen
} from 'lucide-react';
import './admin.css';

export default function AdminDashboard() {
  // 1. Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [gatePassword, setGatePassword] = useState('');
  const [showGateError, setShowGateError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 2. Active Tab State
  const [activeTab, setActiveTab] = useState('orders');

  // 3. Shared Inventory & Orders & Materials States
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState({ classic: 50, nutty: 30, gift: 15 });
  const [materialsStock, setMaterialsStock] = useState({});
  const [calcProduct, setCalcProduct] = useState('classic');
  const [calcMaterials, setCalcMaterials] = useState([]);
  const [calcSalePrice, setCalcSalePrice] = useState(12000);
  const [userEditedSalePrice, setUserEditedSalePrice] = useState(false);
  const [targetMargin, setTargetMargin] = useState(40);

  // 4. Adjust Qty Form Inputs
  const [adjustClassic, setAdjustClassic] = useState(10);
  const [adjustNutty, setAdjustNutty] = useState(10);
  const [adjustGift, setAdjustGift] = useState(5);
  const [adjustMatAmounts, setAdjustMatAmounts] = useState({});

  // 5. Add Material Modal Form States
  const [showAddMatModal, setShowAddMatModal] = useState(false);
  const [newMatName, setNewMatName] = useState('');
  const [newMatUnitPrice, setNewMatUnitPrice] = useState('');
  const [newMatQty, setNewMatQty] = useState('');

  // Fixed unit mappings
  const materialUnits = {
    '오란다': 'kg', '까불이': 'kg', '유자청': 'kg', '크랜베리': 'kg',
    '슬라이스아몬드': 'kg', '해바라기씨': 'kg', '호박씨': 'kg',
    '검은깨': 'kg', '쌀엿조청': 'kg', '설탕': 'kg', '버터': 'g'
  };

  const defaultMaterialsStock = {
    '오란다': 120, '까불이': 80, '유자청': 5, '크랜베리': 2,
    '슬라이스아몬드': 1.5, '해바라기씨': 1, '호박씨': 1.2,
    '검은깨': 0.5, '쌀엿조청': 8, '설탕': 3, '버터': 2000
  };

  const defaultMaterialsData = {
    classic: [
      { id: 1, name: '오란다', unitPrice: 5000, qty: 0.6 },
      { id: 2, name: '까불이', unitPrice: 6000, qty: 0 },
      { id: 3, name: '유자청', unitPrice: 20000, qty: 0.025 },
      { id: 4, name: '크랜베리', unitPrice: 40000, qty: 0 },
      { id: 5, name: '슬라이스아몬드', unitPrice: 35000, qty: 0 },
      { id: 6, name: '해바라기씨', unitPrice: 15000, qty: 0 },
      { id: 7, name: '호박씨', unitPrice: 20000, qty: 0 },
      { id: 8, name: '검은깨', unitPrice: 10000, qty: 0.005 },
      { id: 9, name: '쌀엿조청', unitPrice: 8000, qty: 0.08 },
      { id: 10, name: '설탕', unitPrice: 3000, qty: 0.02 },
      { id: 11, name: '버터', unitPrice: 50, qty: 10 }
    ],
    nutty: [
      { id: 1, name: '오란다', unitPrice: 5000, qty: 0.4 },
      { id: 2, name: '까불이', unitPrice: 6000, qty: 0.2 },
      { id: 3, name: '유자청', unitPrice: 20000, qty: 0.025 },
      { id: 4, name: '크랜베리', unitPrice: 40000, qty: 0.008 },
      { id: 5, name: '슬라이스아몬드', unitPrice: 35000, qty: 0.015 },
      { id: 6, name: '해바라기씨', unitPrice: 15000, qty: 0.01 },
      { id: 7, name: '호박씨', unitPrice: 20000, qty: 0.012 },
      { id: 8, name: '검은깨', unitPrice: 10000, qty: 0.005 },
      { id: 9, name: '쌀엿조청', unitPrice: 8000, qty: 0.07 },
      { id: 10, name: '설탕', unitPrice: 3000, qty: 0.015 },
      { id: 11, name: '버터', unitPrice: 50, qty: 12 }
    ],
    gift: [
      { id: 1, name: '오란다', unitPrice: 5000, qty: 1.0 },
      { id: 2, name: '까불이', unitPrice: 6000, qty: 0.4 },
      { id: 3, name: '유자청', unitPrice: 20000, qty: 0.05 },
      { id: 4, name: '크랜베리', unitPrice: 40000, qty: 0.016 },
      { id: 5, name: '슬라이스아몬드', unitPrice: 35000, qty: 0.03 },
      { id: 6, name: '해바라기씨', unitPrice: 15000, qty: 0.02 },
      { id: 7, name: '호박씨', unitPrice: 20000, qty: 0.024 },
      { id: 8, name: '검은깨', unitPrice: 10000, qty: 0.01 },
      { id: 9, name: '쌀엿조청', unitPrice: 8000, qty: 0.12 },
      { id: 10, name: '설탕', unitPrice: 3000, qty: 0.03 },
      { id: 11, name: '버터', unitPrice: 50, qty: 24 }
    ]
  };

  useEffect(() => {
    setIsMounted(true);

    // Authentication check
    if (sessionStorage.getItem('yuzu_admin_auth') === 'true') {
      setIsAuthenticated(true);
    }

    // Database Migration check (V1.2 system)
    const CURRENT_DB_VERSION = '1.2';
    const savedVersion = localStorage.getItem('yuzu_db_version');
    if (savedVersion !== CURRENT_DB_VERSION) {
      localStorage.removeItem('yuzu_materials_stock');
      localStorage.removeItem('yuzu_materials_classic');
      localStorage.removeItem('yuzu_materials_nutty');
      localStorage.removeItem('yuzu_materials_gift');
      localStorage.setItem('yuzu_db_version', CURRENT_DB_VERSION);
    }

    // Load Local Storage Datas
    loadOrdersFromStorage();
    loadInventoryFromStorage();
    loadMaterialsStockFromStorage();
  }, []);

  // Load calculator recipe materials when calcProduct changes
  useEffect(() => {
    if (!isMounted) return;
    loadCalcMaterials(calcProduct);
  }, [calcProduct, isMounted]);

  // Loading Storage Data helpers
  const loadOrdersFromStorage = () => {
    const data = localStorage.getItem('yuzu_orders');
    if (data) {
      try { setOrders(JSON.parse(data)); } catch (e) { console.error(e); }
    }
  };

  const loadInventoryFromStorage = () => {
    const data = localStorage.getItem('yuzu_inventory');
    if (data) {
      try { setInventory(JSON.parse(data)); } catch (e) { console.error(e); }
    } else {
      localStorage.setItem('yuzu_inventory', JSON.stringify({ classic: 50, nutty: 30, gift: 15 }));
    }
  };

  const loadMaterialsStockFromStorage = () => {
    const data = localStorage.getItem('yuzu_materials_stock');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setMaterialsStock(parsed);
        // Initialize adjustment inputs
        const initialAdjs = {};
        Object.keys(parsed).forEach(k => {
          initialAdjs[k] = materialUnits[k] === 'g' ? 500 : 1;
        });
        setAdjustMatAmounts(initialAdjs);
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('yuzu_materials_stock', JSON.stringify(defaultMaterialsStock));
      setMaterialsStock(defaultMaterialsStock);
      const initialAdjs = {};
      Object.keys(defaultMaterialsStock).forEach(k => {
        initialAdjs[k] = materialUnits[k] === 'g' ? 500 : 1;
      });
      setAdjustMatAmounts(initialAdjs);
    }
  };

  const loadCalcMaterials = (productId) => {
    const key = `yuzu_materials_${productId}`;
    const data = localStorage.getItem(key);
    let materials = null;
    if (data) {
      try {
        materials = JSON.parse(data);
        const matOranda = materials.find(m => m.name === '오란다');
        // Force upgrade if old 'box' unit data is detected
        if (matOranda && matOranda.qty < 0.3) {
          materials = null;
        }
      } catch (e) {
        materials = null;
      }
    }

    if (!materials) {
      localStorage.setItem(key, JSON.stringify(defaultMaterialsData[productId]));
      materials = defaultMaterialsData[productId];
    }
    setCalcMaterials(materials);
    
    // Set default sale price
    const defaultPrices = { classic: 12000, nutty: 14000, gift: 22000 };
    if (!userEditedSalePrice) {
      setCalcSalePrice(defaultPrices[productId]);
    }
  };

  // Auth Submit Handler
  const handleAuthSubmit = () => {
    if (gatePassword === 'yuzu1234') {
      sessionStorage.setItem('yuzu_admin_auth', 'true');
      setIsAuthenticated(true);
      setShowGateError(false);
    } else {
      setShowGateError(true);
    }
  };

  // 1) Toggle Order status
  const toggleOrderStatus = (orderId) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: o.status === '대기' ? '완료' : '대기' };
      }
      return o;
    });
    setOrders(updated);
    localStorage.setItem('yuzu_orders', JSON.stringify(updated));
  };

  // 2) Delete Order
  const deleteOrder = (orderId) => {
    if (confirm('이 주문 내역을 삭제하시겠습니까?')) {
      const filtered = orders.filter(o => o.id !== orderId);
      setOrders(filtered);
      localStorage.setItem('yuzu_orders', JSON.stringify(filtered));
    }
  };

  // 3) Adjust Finished Product Stock
  const handleInventoryAdjust = (productId, action) => {
    const amountVal = productId === 'classic' ? adjustClassic : (productId === 'nutty' ? adjustNutty : adjustGift);
    const amount = parseInt(amountVal, 10);

    if (isNaN(amount) || amount <= 0) {
      alert('올바른 조절 수량을 입력해 주세요.');
      return;
    }

    const nextInv = { ...inventory };
    if (action === 'add') {
      // Production mode -> Check and deduct raw materials
      const recipeKey = `yuzu_materials_${productId}`;
      let recipe = [];
      const savedRecipe = localStorage.getItem(recipeKey);
      if (savedRecipe) {
        recipe = JSON.parse(savedRecipe);
      } else {
        recipe = defaultMaterialsData[productId];
      }

      const nextMaterials = { ...materialsStock };
      const shortage = [];

      recipe.forEach(mat => {
        const required = mat.qty * amount;
        if (mat.name in nextMaterials) {
          if (nextMaterials[mat.name] < required) {
            const unit = materialUnits[mat.name] || 'kg';
            const lack = required - nextMaterials[mat.name];
            const formattedLack = unit === 'g' ? Math.round(lack) : lack.toFixed(3);
            shortage.push(`${mat.name} ${formattedLack}${unit} 부족`);
          }
        }
      });

      if (shortage.length > 0) {
        alert(`원재료 재고가 부족하여 완제품을 생산할 수 없습니다.\n\n[부족 항목]\n- ${shortage.join('\n- ')}`);
        return;
      }

      // Deduct materials
      recipe.forEach(mat => {
        if (mat.name in nextMaterials) {
          nextMaterials[mat.name] -= (mat.qty * amount);
          nextMaterials[mat.name] = Math.round(nextMaterials[mat.name] * 1000) / 1000;
        }
      });

      // Save materials
      setMaterialsStock(nextMaterials);
      localStorage.setItem('yuzu_materials_stock', JSON.stringify(nextMaterials));

      nextInv[productId] += amount;
    } else if (action === 'sub') {
      if (nextInv[productId] < amount) {
        alert('현재 재고 수량보다 많이 출고할 수 없습니다.');
        return;
      }
      nextInv[productId] -= amount;
    }

    setInventory(nextInv);
    localStorage.setItem('yuzu_inventory', JSON.stringify(nextInv));
  };

  // 4) Adjust Raw Material Stock
  const handleMaterialAdjust = (name, action) => {
    const inputVal = adjustMatAmounts[name];
    const amount = parseFloat(inputVal);

    if (isNaN(amount) || amount <= 0) {
      alert('올바른 조절 수량을 입력해 주세요.');
      return;
    }

    const nextStock = { ...materialsStock };
    if (action === 'add') {
      nextStock[name] += amount;
    } else if (action === 'sub') {
      if (nextStock[name] < amount) {
        alert('현재 재고 수량보다 많이 사용할 수 없습니다.');
        return;
      }
      nextStock[name] -= amount;
    }

    nextStock[name] = Math.round(nextStock[name] * 1000) / 1000;
    setMaterialsStock(nextStock);
    localStorage.setItem('yuzu_materials_stock', JSON.stringify(nextStock));
  };

  // 5) Delete Material from Recipe Calculator
  const handleDeleteRecipeMaterial = (matId) => {
    const filtered = calcMaterials.filter(m => m.id !== matId);
    setCalcMaterials(filtered);
    localStorage.setItem(`yuzu_materials_${calcProduct}`, JSON.stringify(filtered));
  };

  // 6) Add New Material to Recipe
  const handleAddMaterialSubmit = () => {
    const unitPrice = parseInt(newMatUnitPrice, 10);
    const qty = parseFloat(newMatQty);

    if (!newMatName.trim() || isNaN(unitPrice) || isNaN(qty) || unitPrice < 0 || qty <= 0) {
      alert('원재료 정보를 올바르게 입력해 주세요.');
      return;
    }

    const updated = [
      ...calcMaterials,
      {
        id: Date.now(),
        name: newMatName.trim(),
        unitPrice,
        qty
      }
    ];

    setCalcMaterials(updated);
    localStorage.setItem(`yuzu_materials_${calcProduct}`, JSON.stringify(updated));
    setShowAddMatModal(false);

    setNewMatName('');
    setNewMatUnitPrice('');
    setNewMatQty('');
  };

  // Calculated Calculator Values
  const totalCost = calcMaterials.reduce((acc, curr) => acc + (curr.unitPrice * curr.qty), 0);
  const profit = calcSalePrice - totalCost;
  const marginRate = calcSalePrice > 0 ? Math.round((profit / calcSalePrice) * 100) : 0;
  const recommendedPrice = targetMargin > 0 && targetMargin < 100 
    ? Math.round((totalCost / (1 - (targetMargin / 100))) / 100) * 100 
    : 0;

  // Margin rate badge color definition
  let marginColor = '#E74C3C'; // Red
  if (marginRate >= 50) marginColor = '#2D6A4F'; // Green
  else if (marginRate >= 30) marginColor = '#FFAA00'; // Orange

  // Active scorecard orders counter
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === '대기').length;
  const completedOrders = totalOrders - pendingOrders;

  // Authentication Gate Overlay Render
  if (!isAuthenticated) {
    return (
      <div id="authGate" className="auth-gate-backdrop">
        <div className="auth-gate-card">
          <div className="auth-gate-icon"><Lock /></div>
          <h2>관리자 비밀번호 확인</h2>
          <p>보안을 위해 관리자 비밀번호를 입력해 주세요.</p>
          <div className="form-group" style={{ marginTop: '16px', marginBottom: 0, width: '100%' }}>
            <input 
              type="password" 
              placeholder="비밀번호 입력" 
              value={gatePassword}
              onChange={(e) => setGatePassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuthSubmit()}
              style={{
                width: '100%', 
                padding: '12px 16px', 
                border: '1px solid rgba(180, 160, 120, 0.3)', 
                borderRadius: '6px', 
                outline: 'none', 
                textAlign: 'center', 
                fontSize: '16px'
              }}
            />
            {showGateError && (
              <span className="error-msg" style={{ marginTop: '8px', color: '#E74C3C', fontSize: '12px', display: 'block' }}>
                비밀번호가 올바르지 않습니다.
              </span>
            )}
          </div>
          <div style={{ marginTop: '24px', width: '100%' }}>
            <button 
              onClick={handleAuthSubmit} 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px', fontSize: '15px', backgroundColor: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}
            >
              로그인
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabInfos = {
    orders: { title: "주문 현황 관리", desc: "고객들이 신청한 가상 주문 내역을 실시간으로 확인하고 접수 처리합니다." },
    inventory: { title: "실시간 재고 관리", desc: "각 완제품의 재고 현황을 모니터링하고 입고 및 출고 처리를 수행합니다." },
    calculator: { title: "제조 원가 및 단가 계산기", desc: "상품별 원재료 소요비용을 분석하고, 판매가 대비 마진율 시뮬레이션을 제공합니다." }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-en">Yuzu Admin</span>
        </div>
        <nav className="sidebar-menu">
          <button 
            onClick={() => setActiveTab('orders')} 
            className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`}
          >
            <ShoppingCart size={18} />
            <span>주문 현황</span>
          </button>
          <button 
            onClick={() => setActiveTab('inventory')} 
            className={`sidebar-link ${activeTab === 'inventory' ? 'active' : ''}`}
          >
            <Box size={18} />
            <span>재고 관리</span>
          </button>
          <button 
            onClick={() => setActiveTab('calculator')} 
            className={`sidebar-link ${activeTab === 'calculator' ? 'active' : ''}`}
          >
            <Calculator size={18} />
            <span>단가 계산기</span>
          </button>
          <div className="sidebar-divider"></div>
          <a href="index.html" className="sidebar-link exit-link">
            <LogOut size={18} />
            <span>메인 홈으로</span>
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Header */}
        <header className="content-header">
          <div className="header-title">
            <h1>{tabInfos[activeTab].title}</h1>
            <p>{tabInfos[activeTab].desc}</p>
          </div>
          <div className="admin-profile">
            <div className="profile-info">
              <span className="profile-name">최고 관리자</span>
              <span className="profile-role">마스터 계정</span>
            </div>
            <div className="profile-avatar">Y</div>
          </div>
        </header>

        {/* 1. Orders Tab Content */}
        {activeTab === 'orders' && (
          <div className="tab-content active">
            <div className="scorecards-grid">
              <div className="scorecard yellow">
                <div className="scorecard-info">
                  <span className="scorecard-label">총 주문 건수</span>
                  <h3 className="scorecard-value">{totalOrders}</h3>
                </div>
                <div className="scorecard-icon"><BarChart2 size={24} /></div>
              </div>
              <div className="scorecard green">
                <div className="scorecard-info">
                  <span className="scorecard-label">처리 대기중</span>
                  <h3 className="scorecard-value">{pendingOrders}</h3>
                </div>
                <div className="scorecard-icon"><Clock size={24} /></div>
              </div>
              <div className="scorecard dark">
                <div className="scorecard-info">
                  <span className="scorecard-label">처리 완료</span>
                  <h3 className="scorecard-value">{completedOrders}</h3>
                </div>
                <div className="scorecard-icon"><CheckCircle2 size={24} /></div>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <h3>주문 내역 목록</h3>
                <button onClick={loadOrdersFromStorage} className="btn-refresh">
                  <RotateCw size={14} /> <span>새로고침</span>
                </button>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>주문일시</th>
                      <th>주문자</th>
                      <th>연락처</th>
                      <th>상품명</th>
                      <th>수량</th>
                      <th>총 예정금액</th>
                      <th>요청사항</th>
                      <th>상태</th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>
                          접수된 주문 내역이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      orders.map(order => (
                        <tr key={order.id}>
                          <td>{order.orderTime}</td>
                          <td className="font-bold">{order.customerName}</td>
                          <td>{order.phone}</td>
                          <td>{order.product}</td>
                          <td>{order.qty}개</td>
                          <td className="font-bold text-green">{order.price?.toLocaleString()}원</td>
                          <td className="table-msg" title={order.userMessage || ''}>{order.userMessage || '-'}</td>
                          <td>
                            <span className={`status-badge ${order.status === '대기' ? 'status-pending' : 'status-completed'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button onClick={() => toggleOrderStatus(order.id)} className="btn-table-action btn-status">
                                {order.status === '대기' ? <Check size={14} /> : <CornerUpLeft size={14} />}
                                <span>{order.status === '대기' ? '완료처리' : '대기전환'}</span>
                              </button>
                              <button onClick={() => deleteOrder(order.id)} className="btn-table-action btn-delete">
                                <Trash2 size={14} />
                                <span>삭제</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. Inventory Tab Content */}
        {activeTab === 'inventory' && (
          <div className="tab-content active">
            <div className="inventory-grid">
              {/* Product Stock Card 1: Classic */}
              <div className="inventory-card">
                <div className="inv-card-header">
                  <span className="product-badge">BEST</span>
                  <h3>유자 클래식 오란다</h3>
                </div>
                <div className="inv-status">
                  <div className="inv-qty-box">
                    <span className="label">현재 재고</span>
                    <span className="qty-value">{inventory.classic}</span><span className="unit">개</span>
                  </div>
                  <div className="progress-bar-wrapper">
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${Math.min((inventory.classic / 100) * 100, 100)}%`,
                        backgroundColor: inventory.classic <= 0 ? '#E74C3C' : (inventory.classic <= 10 ? '#FFAA00' : '#2D6A4F')
                      }}
                    ></div>
                  </div>
                  <span className={`stock-status-text ${inventory.classic <= 0 ? 'out' : (inventory.classic <= 10 ? 'warning' : 'normal')}`}>
                    {inventory.classic <= 0 ? '품절 (Sold Out)' : (inventory.classic <= 10 ? '재고 부족' : '정상')}
                  </span>
                </div>
                <div className="inv-actions">
                  <input 
                    type="number" 
                    value={adjustClassic} 
                    onChange={(e) => setAdjustClassic(parseInt(e.target.value, 10) || '')}
                    min="1" 
                    max="1000" 
                  />
                  <button onClick={() => handleInventoryAdjust('classic', 'add')} className="btn btn-adjust-plus">입고 (+)</button>
                  <button onClick={() => handleInventoryAdjust('classic', 'sub')} className="btn btn-adjust-minus">출고 (-)</button>
                </div>
              </div>

              {/* Product Stock Card 2: Nutty */}
              <div className="inventory-card">
                <div className="inv-card-header">
                  <h3>유자 견과 오란다</h3>
                </div>
                <div className="inv-status">
                  <div className="inv-qty-box">
                    <span className="label">현재 재고</span>
                    <span className="qty-value">{inventory.nutty}</span><span className="unit">개</span>
                  </div>
                  <div className="progress-bar-wrapper">
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${Math.min((inventory.nutty / 100) * 100, 100)}%`,
                        backgroundColor: inventory.nutty <= 0 ? '#E74C3C' : (inventory.nutty <= 10 ? '#FFAA00' : '#2D6A4F')
                      }}
                    ></div>
                  </div>
                  <span className={`stock-status-text ${inventory.nutty <= 0 ? 'out' : (inventory.nutty <= 10 ? 'warning' : 'normal')}`}>
                    {inventory.nutty <= 0 ? '품절 (Sold Out)' : (inventory.nutty <= 10 ? '재고 부족' : '정상')}
                  </span>
                </div>
                <div className="inv-actions">
                  <input 
                    type="number" 
                    value={adjustNutty} 
                    onChange={(e) => setAdjustNutty(parseInt(e.target.value, 10) || '')}
                    min="1" 
                    max="1000" 
                  />
                  <button onClick={() => handleInventoryAdjust('nutty', 'add')} className="btn btn-adjust-plus">입고 (+)</button>
                  <button onClick={() => handleInventoryAdjust('nutty', 'sub')} className="btn btn-adjust-minus">출고 (-)</button>
                </div>
              </div>

              {/* Product Stock Card 3: Gift */}
              <div className="inventory-card">
                <div className="inv-card-header">
                  <span className="product-badge accent">GIFT</span>
                  <h3>프리미엄 유자 선물세트</h3>
                </div>
                <div className="inv-status">
                  <div className="inv-qty-box">
                    <span className="label">현재 재고</span>
                    <span className="qty-value">{inventory.gift}</span><span className="unit">개</span>
                  </div>
                  <div className="progress-bar-wrapper">
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${Math.min((inventory.gift / 100) * 100, 100)}%`,
                        backgroundColor: inventory.gift <= 0 ? '#E74C3C' : (inventory.gift <= 10 ? '#FFAA00' : '#2D6A4F')
                      }}
                    ></div>
                  </div>
                  <span className={`stock-status-text ${inventory.gift <= 0 ? 'out' : (inventory.gift <= 10 ? 'warning' : 'normal')}`}>
                    {inventory.gift <= 0 ? '품절 (Sold Out)' : (inventory.gift <= 10 ? '재고 부족' : '정상')}
                  </span>
                </div>
                <div className="inv-actions">
                  <input 
                    type="number" 
                    value={adjustGift} 
                    onChange={(e) => setAdjustGift(parseInt(e.target.value, 10) || '')}
                    min="1" 
                    max="1000" 
                  />
                  <button onClick={() => handleInventoryAdjust('gift', 'add')} className="btn btn-adjust-plus">입고 (+)</button>
                  <button onClick={() => handleInventoryAdjust('gift', 'sub')} className="btn btn-adjust-minus">출고 (-)</button>
                </div>
              </div>
            </div>

            {/* Raw Materials Inventory Stock Card */}
            <div className="dashboard-card" style={{ marginTop: '40px' }}>
              <div className="card-header">
                <h3>원재료 재고 현황</h3>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>원재료명</th>
                      <th>현재 재고량</th>
                      <th>단위</th>
                      <th>수량 조절</th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(materialsStock).map(name => {
                      const qty = materialsStock[name];
                      const unit = materialUnits[name] || 'kg';
                      
                      let isLow = false;
                      if (unit === 'g') isLow = qty <= 500;
                      else isLow = (name === '오란다' || name === '까불이' || name === '쌀엿조청') ? qty <= 10 : qty <= 1;

                      const statusClass = qty <= 0 ? 'text-red font-bold' : (isLow ? 'text-orange font-bold' : '');

                      return (
                        <tr key={name}>
                          <td className="font-bold">{name}</td>
                          <td className={statusClass}>
                            {qty.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: unit === 'g' ? 0 : 3 })}{unit}
                          </td>
                          <td>{unit}</td>
                          <td>
                            <div className="table-adjust-qty">
                              <input 
                                type="number" 
                                value={adjustMatAmounts[name] || ''}
                                onChange={(e) => setAdjustMatAmounts({ ...adjustMatAmounts, [name]: e.target.value })}
                                step={unit === 'g' ? '1' : '0.001'} 
                                min="0.001" 
                              />
                              <span className="unit-label">{unit}</span>
                            </div>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button onClick={() => handleMaterialAdjust(name, 'add')} className="btn-table-action btn-mat-adjust-plus" style={{ border: '1px solid #ddd', padding: '6px 12px', borderRadius: '4px' }}>
                                <Plus size={14} /> <span>입고</span>
                              </button>
                              <button onClick={() => handleMaterialAdjust(name, 'sub')} className="btn-table-action btn-mat-adjust-minus" style={{ border: '1px solid #ddd', padding: '6px 12px', borderRadius: '4px' }}>
                                <Minus size={14} /> <span>출고</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. Calculator Tab Content */}
        {activeTab === 'calculator' && (
          <div className="tab-content active">
            <div className="calculator-layout">
              {/* Left Column: Raw Material List */}
              <div className="dashboard-card calc-input-card">
                <div className="card-header">
                  <h3>원재료 비용 등록</h3>
                  <button onClick={() => setShowAddMatModal(true)} className="btn-primary" style={{ borderRadius: '4px', padding: '8px 16px', fontSize: '13px' }}>
                    <Plus size={14} /> <span>재료 추가</span>
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="data-table calc-table">
                    <thead>
                      <tr>
                        <th>원재료명</th>
                        <th>단위당 단가</th>
                        <th>1회 소요량</th>
                        <th>총 소요원가</th>
                        <th>작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calcMaterials.map(mat => {
                        const cost = mat.unitPrice * mat.qty;
                        return (
                          <tr key={mat.id}>
                            <td>{mat.name}</td>
                            <td>{mat.unitPrice.toLocaleString()}원</td>
                            <td>{mat.qty.toLocaleString()}</td>
                            <td className="font-bold">{cost.toLocaleString()}원</td>
                            <td>
                              <button onClick={() => handleDeleteRecipeMaterial(mat.id)} className="btn-table-action btn-delete-mat" style={{ padding: '4px 8px' }}>
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Margin Summary */}
              <div className="calc-sidebar">
                <div className="dashboard-card calc-summary-card">
                  <h3>원가 및 마진 분석</h3>
                  <div className="form-group select-calc-product">
                    <label htmlFor="calcProductSelect">대상 상품 선택</label>
                    <select 
                      id="calcProductSelect"
                      value={calcProduct}
                      onChange={(e) => {
                        setCalcProduct(e.target.value);
                        setUserEditedSalePrice(false);
                      }}
                    >
                      <option value="classic">유자 클래식 오란다 (1박스)</option>
                      <option value="nutty">유자 견과 오란다 (1박스)</option>
                      <option value="gift">프리미엄 유자 선물세트 (1박스)</option>
                    </select>
                  </div>

                  <div className="summary-scorecard-list">
                    <div className="summary-item">
                      <span className="label">총 제조원가</span>
                      <span className="value">{totalCost.toLocaleString()}원</span>
                    </div>
                    <div className="summary-item form-input-item">
                      <span className="label">설정 판매가</span>
                      <div className="input-wrapper">
                        <input 
                          type="number" 
                          value={calcSalePrice} 
                          onChange={(e) => {
                            setCalcSalePrice(parseInt(e.target.value, 10) || 0);
                            setUserEditedSalePrice(true);
                          }}
                          min="0" 
                          step="500" 
                        />
                        <span className="unit">원</span>
                      </div>
                    </div>
                    <div className="summary-divider"></div>
                    <div className="summary-item highlight-margin">
                      <span className="label">예상 순이익 (마진액)</span>
                      <span className="value text-green">{profit.toLocaleString()}원</span>
                    </div>
                    <div className="summary-item highlight-margin-rate">
                      <span className="label">예상 마진율</span>
                      <span className="value" style={{ color: marginColor, fontWeight: '900' }}>{marginRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="dashboard-card calc-simulator-card">
                  <h3>목표 마진율 판매가 계산기</h3>
                  <p className="sim-desc">원하는 마진율을 달성하기 위한 적정 판매가를 자동으로 제안합니다.</p>
                  <div className="form-group">
                    <label htmlFor="targetMarginRate">목표 마진율 입력</label>
                    <div className="input-wrapper">
                      <input 
                        type="number" 
                        value={targetMargin} 
                        onChange={(e) => setTargetMargin(parseInt(e.target.value, 10) || 0)}
                        min="1" 
                        max="99" 
                      />
                      <span className="unit">%</span>
                    </div>
                  </div>
                  <div className="sim-result-box">
                    <span className="result-label">제안 권장 판매가</span>
                    <h4 className="result-value">{recommendedPrice.toLocaleString()}원</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Recipe Material Modal */}
      {showAddMatModal && (
        <div className="modal-backdrop active">
          <div className="modal-card">
            <h3>새 원재료 등록</h3>
            <div className="form-group" style={{ marginTop: '16px', textAlign: 'left' }}>
              <label>원재료명</label>
              <input 
                type="text" 
                placeholder="예: 국산 유자청, 쌀과자 알갱이" 
                value={newMatName}
                onChange={(e) => setNewMatName(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid rgba(180, 160, 120, 0.3)', borderRadius: '4px', outline: 'none' }}
              />
            </div>
            <div className="form-group" style={{ marginTop: '12px', textAlign: 'left' }}>
              <label>단위당 가격 (원)</label>
              <input 
                type="number" 
                placeholder="단위당 가격 입력" 
                value={newMatUnitPrice}
                onChange={(e) => setNewMatUnitPrice(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid rgba(180, 160, 120, 0.3)', borderRadius: '4px', outline: 'none' }}
              />
            </div>
            <div className="form-group" style={{ marginTop: '12px', textAlign: 'left' }}>
              <label>소요량 (개 / g / ml 등)</label>
              <input 
                type="number" 
                placeholder="소요량 입력" 
                value={newMatQty}
                onChange={(e) => setNewMatQty(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid rgba(180, 160, 120, 0.3)', borderRadius: '4px', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'center' }}>
              <button onClick={() => setShowAddMatModal(false)} className="btn btn-outline" style={{ padding: '10px 20px', fontSize: '14px', borderRadius: '4px' }}>
                취소
              </button>
              <button onClick={handleAddMaterialSubmit} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '14px', backgroundColor: 'var(--accent-green)', color: 'white', borderRadius: '4px' }}>
                추가하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
const white = '#fff';
