"use client";

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Home as HomeIcon, 
  Factory, 
  PackageOpen, 
  ChefHat, 
  Truck, 
  Plus, 
  Minus,
  PlusCircle,
  MinusCircle
} from 'lucide-react';
import './producer.css';

export default function ProducerDashboard() {
  // 1. Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [gatePassword, setGatePassword] = useState('');
  const [showGateError, setShowGateError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 2. Data States
  const [inventory, setInventory] = useState({ classic: 50, nutty: 30, gift: 15 });
  const [materialsStock, setMaterialsStock] = useState({});

  // 3. Form Input States
  const [produceSelect, setProduceSelect] = useState('classic');
  const [produceQty, setProduceQty] = useState(10);
  const [outboundSelect, setOutboundSelect] = useState('classic');
  const [outboundQty, setOutboundQty] = useState(5);
  const [adjustMatAmounts, setAdjustMatAmounts] = useState({});

  // Fixed metadata mapping
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
      { id: 1, name: '오란다', qty: 0.6 },
      { id: 2, name: '까불이', qty: 0 },
      { id: 3, name: '유자청', qty: 0.025 },
      { id: 4, name: '크랜베리', qty: 0 },
      { id: 5, name: '슬라이스아몬드', qty: 0 },
      { id: 6, name: '해바라기씨', qty: 0 },
      { id: 7, name: '호박씨', qty: 0 },
      { id: 8, name: '검은깨', qty: 0.005 },
      { id: 9, name: '쌀엿조청', qty: 0.08 },
      { id: 10, name: '설탕', qty: 0.02 },
      { id: 11, name: '버터', qty: 10 }
    ],
    nutty: [
      { id: 1, name: '오란다', qty: 0.4 },
      { id: 2, name: '까불이', qty: 0.2 },
      { id: 3, name: '유자청', qty: 0.025 },
      { id: 4, name: '크랜베리', qty: 0.008 },
      { id: 5, name: '슬라이스아몬드', qty: 0.015 },
      { id: 6, name: '해바라기씨', qty: 0.01 },
      { id: 7, name: '호박씨', qty: 0.012 },
      { id: 8, name: '검은깨', qty: 0.005 },
      { id: 9, name: '쌀엿조청', qty: 0.07 },
      { id: 10, name: '설탕', qty: 0.015 },
      { id: 11, name: '버터', qty: 12 }
    ],
    gift: [
      { id: 1, name: '오란다', qty: 1.0 },
      { id: 2, name: '까불이', qty: 0.4 },
      { id: 3, name: '유자청', qty: 0.05 },
      { id: 4, name: '크랜베리', qty: 0.016 },
      { id: 5, name: '슬라이스아몬드', qty: 0.03 },
      { id: 6, name: '해바라기씨', qty: 0.02 },
      { id: 7, name: '호박씨', qty: 0.024 },
      { id: 8, name: '검은깨', qty: 0.01 },
      { id: 9, name: '쌀엿조청', qty: 0.12 },
      { id: 10, name: '설탕', qty: 0.03 },
      { id: 11, name: '버터', qty: 24 }
    ]
  };

  useEffect(() => {
    setIsMounted(true);

    // Authentication session validation
    if (sessionStorage.getItem('yuzu_producer_auth') === 'true') {
      setIsAuthenticated(true);
    }

    // Load Local Storage Datas
    loadInventoryFromStorage();
    loadMaterialsStockFromStorage();
  }, []);

  const loadInventoryFromStorage = () => {
    const data = localStorage.getItem('yuzu_inventory');
    if (data) {
      try { setInventory(JSON.parse(data)); } catch (e) { console.error(e); }
    }
  };

  const loadMaterialsStockFromStorage = () => {
    const data = localStorage.getItem('yuzu_materials_stock');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setMaterialsStock(parsed);
        // Initialize adjust input value mapping
        const adjs = {};
        Object.keys(parsed).forEach(k => {
          adjs[k] = materialUnits[k] === 'g' ? 500 : 1;
        });
        setAdjustMatAmounts(adjs);
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('yuzu_materials_stock', JSON.stringify(defaultMaterialsStock));
      setMaterialsStock(defaultMaterialsStock);
      const adjs = {};
      Object.keys(defaultMaterialsStock).forEach(k => {
        adjs[k] = materialUnits[k] === 'g' ? 500 : 1;
      });
      setAdjustMatAmounts(adjs);
    }
  };

  // Auth Submit Handler
  const handleAuthSubmit = () => {
    if (gatePassword === 'maker1234') {
      sessionStorage.setItem('yuzu_producer_auth', 'true');
      setIsAuthenticated(true);
      setShowGateError(false);
    } else {
      setShowGateError(true);
    }
  };

  // 1) Adjust Individual Raw Material Stock
  const handleMaterialAdjust = (name, action) => {
    const amountVal = adjustMatAmounts[name];
    const amount = parseFloat(amountVal);

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

  // 2) 완제품 생산 등록 (레시피 비례 원자재 차감)
  const handleProductionSubmit = (e) => {
    e.preventDefault();
    const amount = parseInt(produceQty, 10);

    if (isNaN(amount) || amount <= 0) {
      alert('올바른 생산 수량을 입력해 주세요.');
      return;
    }

    // Get Recipe 소요원가 명세
    const recipeKey = `yuzu_materials_${produceSelect}`;
    let recipe = [];
    const savedRecipe = localStorage.getItem(recipeKey);
    if (savedRecipe) {
      recipe = JSON.parse(savedRecipe);
    } else {
      recipe = defaultMaterialsData[produceSelect];
    }

    const nextStock = { ...materialsStock };
    const shortage = [];

    // Check sufficiency
    recipe.forEach(mat => {
      const required = mat.qty * amount;
      if (mat.name in nextStock) {
        if (nextStock[mat.name] < required) {
          const unit = materialUnits[mat.name] || 'kg';
          const lack = required - nextStock[mat.name];
          const formattedLack = unit === 'g' ? Math.round(lack) : lack.toFixed(3);
          shortage.push(`${mat.name} ${formattedLack}${unit} 부족`);
        }
      }
    });

    if (shortage.length > 0) {
      alert(`원재료 재고가 부족하여 완제품을 생산할 수 없습니다.\n\n[부족 항목]\n- ${shortage.join('\n- ')}`);
      return;
    }

    // Deduct raw materials
    recipe.forEach(mat => {
      if (mat.name in nextStock) {
        nextStock[mat.name] -= (mat.qty * amount);
        nextStock[mat.name] = Math.round(nextStock[name] * 1000) / 1000;
      }
    });

    // Increase Finished Product Stock
    const nextInv = { ...inventory };
    nextInv[produceSelect] += amount;

    // Save & Refresh
    setMaterialsStock(nextStock);
    setInventory(nextInv);
    localStorage.setItem('yuzu_materials_stock', JSON.stringify(nextStock));
    localStorage.setItem('yuzu_inventory', JSON.stringify(nextInv));

    const selectedText = {
      classic: "유자 클래식 오란다",
      nutty: "유자 견과 오란다",
      gift: "프리미엄 유자 선물세트"
    }[produceSelect];

    alert(`완제품 생산 등록 완료!\n\n- 생산 품목: ${selectedText}\n- 생산 수량: ${amount}박스\n\n원재료 재고 차감 및 완제품 수량이 실시간 업데이트되었습니다.`);
  };

  // 3) 완제품 출고/폐기 등록
  const handleOutboundSubmit = (e) => {
    e.preventDefault();
    const amount = parseInt(outboundQty, 10);

    if (isNaN(amount) || amount <= 0) {
      alert('올바른 출고 수량을 입력해 주세요.');
      return;
    }

    const nextInv = { ...inventory };
    if (nextInv[outboundSelect] < amount) {
      alert('출고하려는 수량이 완제품 현재 재고량보다 많습니다.');
      return;
    }

    nextInv[outboundSelect] -= amount;
    setInventory(nextInv);
    localStorage.setItem('yuzu_inventory', JSON.stringify(nextInv));

    const selectedText = {
      classic: "유자 클래식 오란다",
      nutty: "유자 견과 오란다",
      gift: "프리미엄 유자 선물세트"
    }[outboundSelect];

    alert(`완제품 출고 등록 완료!\n\n- 출고 품목: ${selectedText}\n- 출고 수량: ${amount}박스`);
  };

  // Gate Overlay Render
  if (!isAuthenticated) {
    return (
      <div id="authGate" className="auth-gate-backdrop">
        <div className="auth-gate-card">
          <div className="auth-gate-icon" style={{ backgroundColor: 'rgba(255, 170, 0, 0.1)', color: 'var(--accent-orange, #FFAA00)' }}><Settings /></div>
          <h2>생산자 비밀번호 확인</h2>
          <p>보안을 위해 생산 시설 비밀번호를 입력해 주세요.</p>
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
              style={{ width: '100%', padding: '12px', fontSize: '15px', backgroundColor: '#FFAA00', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}
            >
              로그인
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-body">
      <div className="admin-header">
        <div className="header-left">
          <div className="admin-logo">
            <span className="logo-badge" style={{ backgroundColor: 'var(--accent-orange, #FFAA00)' }}>MAKER</span>
            <h2>유자품은 오란다&까부리</h2>
          </div>
          <span className="header-divider">|</span>
          <span className="page-title">생산 관리 대시보드</span>
        </div>
        <div className="header-right">
          <a href="index.html" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <HomeIcon size={14} /> 메인 홈으로
          </a>
        </div>
      </div>

      <div className="main-content" style={{ padding: '30px 24px', maxWidth: '1300px', margin: '0 auto' }}>
        {/* Top Status Card */}
        <div className="dashboard-card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #FFF9EB 0%, #FFF3D6 100%)', border: '1px solid rgba(255, 170, 0, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FFAA00', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Factory size={24} />
            </div>
            <div>
              <h3 style={{ color: '#6A4B13', marginBottom: '4px', fontWeight: '700', fontSize: '18px' }}>실시간 수제 생산 지침</h3>
              <p style={{ color: '#8C6F3E', fontSize: '14px', margin: 0 }}>원재료가 입고되면 아래 표에 기록해 주세요. 완제품 생산 완료 시 생산 품목과 수량을 등록하면 레시피에 맞춰 원자재 재고가 자동 차감됩니다.</p>
            </div>
          </div>
        </div>

        <div className="producer-grid">
          {/* Left Column: Raw Materials Inventory */}
          <div className="dashboard-card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PackageOpen style={{ color: '#FFAA00' }} />
                <h3>원재료 재고 관리 대장</h3>
              </div>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>원재료명</th>
                    <th>현재 재고량</th>
                    <th>단위</th>
                    <th>조절 수량</th>
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
                            <button onClick={() => handleMaterialAdjust(name, 'add')} className="btn-table-action" style={{ border: '1px solid #ddd', padding: '6px 12px', borderRadius: '4px', backgroundColor: '#EAE8E3' }}>
                              <Plus size={12} /> <span style={{ fontWeight: '700' }}>입고</span>
                            </button>
                            <button onClick={() => handleMaterialAdjust(name, 'sub')} className="btn-table-action" style={{ border: '1px solid #ddd', padding: '6px 12px', borderRadius: '4px', backgroundColor: '#EAE8E3' }}>
                              <Minus size={12} /> <span style={{ fontWeight: '700' }}>사용</span>
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

          {/* Right Column: Finished Goods Production & Outbound */}
          <div className="producer-right-panel">
            {/* 1. Finished Product Production Form */}
            <div className="dashboard-card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ChefHat style={{ color: '#2D6A4F' }} />
                  <h3>완제품 생산 등록</h3>
                </div>
              </div>
              <form onSubmit={handleProductionSubmit} className="producer-form">
                <div className="form-group">
                  <label htmlFor="produceSelect">생산 품목 선택</label>
                  <select 
                    id="produceSelect" 
                    value={produceSelect}
                    onChange={(e) => setProduceSelect(e.target.value)}
                    required
                  >
                    <option value="classic">유자 클래식 오란다</option>
                    <option value="nutty">유자 견과 오란다</option>
                    <option value="gift">프리미엄 유자 선물세트</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="produceQty">생산 완료 수량 (박스 단위)</label>
                  <div className="qty-input-wrapper">
                    <input 
                      type="number" 
                      id="produceQty" 
                      value={produceQty}
                      onChange={(e) => setProduceQty(parseInt(e.target.value, 10) || '')}
                      min="1" 
                      max="500" 
                      required 
                    />
                    <span className="qty-unit">박스</span>
                  </div>
                </div>
                <button type="submit" id="btnRegisterProduction" className="btn-produce-submit">
                  <PlusCircle size={16} /> 생산 등록 (원재료 소모)
                </button>
              </form>
            </div>

            {/* 2. Finished Product Outbound Form */}
            <div className="dashboard-card" style={{ marginTop: '24px' }}>
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Truck style={{ color: '#C0392B' }} />
                  <h3>완제품 출고/폐기 등록</h3>
                </div>
              </div>
              <form onSubmit={handleOutboundSubmit} className="producer-form">
                <div className="form-group">
                  <label htmlFor="outboundSelect">출고/폐기 품목 선택</label>
                  <select 
                    id="outboundSelect" 
                    value={outboundSelect}
                    onChange={(e) => setOutboundSelect(e.target.value)}
                    required
                  >
                    <option value="classic">유자 클래식 오란다</option>
                    <option value="nutty">유자 견과 오란다</option>
                    <option value="gift">프리미엄 유자 선물세트</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="outboundQty">출하/출고 수량 (박스 단위)</label>
                  <div className="qty-input-wrapper">
                    <input 
                      type="number" 
                      id="outboundQty" 
                      value={outboundQty}
                      onChange={(e) => setOutboundQty(parseInt(e.target.value, 10) || '')}
                      min="1" 
                      max="500" 
                      required 
                    />
                    <span className="qty-unit">박스</span>
                  </div>
                </div>
                <button type="submit" id="btnRegisterOutbound" className="btn-outbound-submit">
                  <MinusCircle size={16} /> 출고 등록 (완제품 차감)
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const white = '#fff';
const justify = 'center';
