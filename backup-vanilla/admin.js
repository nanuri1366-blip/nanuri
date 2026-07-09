document.addEventListener('DOMContentLoaded', () => {
    // 0. Authentication Gate Control
    const authGate = document.getElementById('authGate');
    const gatePasswordInput = document.getElementById('gatePassword');
    const gateSubmitBtn = document.getElementById('gateSubmitBtn');
    const gatePasswordError = document.getElementById('gatePasswordError');

    const checkAuth = () => {
        if (sessionStorage.getItem('yuzu_admin_auth') === 'true') {
            if (authGate) authGate.style.display = 'none';
            document.body.style.overflow = '';
        } else {
            document.body.style.overflow = 'hidden';
            if (gatePasswordInput) {
                setTimeout(() => gatePasswordInput.focus(), 100);
            }
        }
    };

    const handleAuthSubmit = () => {
        const password = gatePasswordInput.value;
        if (password === 'yuzu1234') {
            sessionStorage.setItem('yuzu_admin_auth', 'true');
            if (authGate) authGate.style.display = 'none';
            document.body.style.overflow = '';
            if (gatePasswordError) gatePasswordError.style.display = 'none';
        } else {
            if (gatePasswordError) gatePasswordError.style.display = 'block';
            gatePasswordInput.focus();
        }
    };

    if (gateSubmitBtn) {
        gateSubmitBtn.addEventListener('click', handleAuthSubmit);
    }
    if (gatePasswordInput) {
        gatePasswordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleAuthSubmit();
        });
    }

    checkAuth();

    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Tab Menu Control
    const sidebarLinks = document.querySelectorAll('.sidebar-link[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');
    const tabTitle = document.getElementById('tabTitle');
    const tabDesc = document.getElementById('tabDesc');

    const tabInfos = {
        orders: {
            title: "주문 현황 관리",
            desc: "고객들이 신청한 가상 주문 내역을 실시간으로 확인하고 접수 처리합니다."
        },
        inventory: {
            title: "실시간 재고 관리",
            desc: "각 완제품의 재고 현황을 모니터링하고 입고 및 출고 처리를 수행합니다."
        },
        calculator: {
            title: "제조 원가 및 단가 계산기",
            desc: "상품별 원재료 소요비용을 분석하고, 판매가 대비 마진율 시뮬레이션을 제공합니다."
        }
    };

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.getAttribute('data-tab');

            // Set active link
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show target content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}Tab`) {
                    content.classList.add('active');
                }
            });

            // Update Header Text
            if (tabInfos[tabId]) {
                tabTitle.textContent = tabInfos[tabId].title;
                tabDesc.textContent = tabInfos[tabId].desc;
            }

            // Trigger specific tab load events
            if (tabId === 'orders') renderOrders();
            else if (tabId === 'inventory') renderInventory();
            else if (tabId === 'calculator') renderCalculator();
        });
    });

    // 3. Orders Management Logic
    const getOrders = () => JSON.parse(localStorage.getItem('yuzu_orders') || '[]');
    const saveOrders = (orders) => localStorage.setItem('yuzu_orders', JSON.stringify(orders));

    const productNamesMap = {
        classic: '유자 클래식 오란다',
        nutty: '유자 견과 오란다',
        gift: '프리미엄 유자 선물세트'
    };

    const productPricesMap = {
        classic: 12000,
        nutty: 14000,
        gift: 22000
    };

    const renderOrders = () => {
        const orders = getOrders();
        const tbody = document.getElementById('ordersTableBody');
        tbody.innerHTML = '';

        // Sort orders by newest first
        orders.sort((a, b) => b.id - a.id);

        let totalCount = orders.length;
        let pendingCount = 0;
        let completedCount = 0;

        if (totalCount === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="text-center" style="padding: 40px; color: var(--text-muted);">접수된 주문 내역이 없습니다.</td></tr>`;
        } else {
            orders.forEach(order => {
                if (order.status === '대기') pendingCount++;
                else completedCount++;

                const totalPrice = (productPricesMap[order.product] || 0) * order.qty;
                const statusClass = order.status === '대기' ? 'status-pending' : 'status-completed';
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${order.date}</td>
                    <td class="font-bold">${order.name}</td>
                    <td>${order.phone}</td>
                    <td>${productNamesMap[order.product] || order.product}</td>
                    <td>${order.qty}개</td>
                    <td class="font-bold text-green">${totalPrice.toLocaleString()}원</td>
                    <td class="table-msg" title="${order.message || ''}">${order.message || '-'}</td>
                    <td><span class="status-badge ${statusClass}">${order.status}</span></td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-table-action btn-status" data-id="${order.id}">
                                <i data-lucide="${order.status === '대기' ? 'check' : 'corner-up-left'}"></i>
                                <span>${order.status === '대기' ? '완료처리' : '대기전환'}</span>
                            </button>
                            <button class="btn-table-action btn-delete" data-id="${order.id}">
                                <i data-lucide="trash-2"></i>
                                <span>삭제</span>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        // Update scorecards
        document.getElementById('totalOrdersCount').textContent = totalCount;
        document.getElementById('pendingOrdersCount').textContent = pendingCount;
        document.getElementById('completedOrdersCount').textContent = completedCount;

        // Re-initialize Lucide Icons in table
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Add action event listeners
        document.querySelectorAll('.btn-status').forEach(btn => {
            btn.addEventListener('click', () => {
                const orderId = parseInt(btn.getAttribute('data-id'), 10);
                toggleOrderStatus(orderId);
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const orderId = parseInt(btn.getAttribute('data-id'), 10);
                if (confirm('이 주문 내역을 삭제하시겠습니까?')) {
                    deleteOrder(orderId);
                }
            });
        });
    };

    const toggleOrderStatus = (id) => {
        const orders = getOrders();
        const updated = orders.map(order => {
            if (order.id === id) {
                order.status = order.status === '대기' ? '완료' : '대기';
            }
            return order;
        });
        saveOrders(updated);
        renderOrders();
    };

    const deleteOrder = (id) => {
        const orders = getOrders();
        const filtered = orders.filter(order => order.id !== id);
        saveOrders(filtered);
        renderOrders();
    };

    const refreshOrdersBtn = document.getElementById('refreshOrdersBtn');
    if (refreshOrdersBtn) {
        refreshOrdersBtn.addEventListener('click', renderOrders);
    }

    // 4. Inventory Management Logic
    const getInventory = () => {
        const defaultInventory = { classic: 50, nutty: 30, gift: 15 };
        const inv = localStorage.getItem('yuzu_inventory');
        if (!inv) {
            localStorage.setItem('yuzu_inventory', JSON.stringify(defaultInventory));
            return defaultInventory;
        }
        return JSON.parse(inv);
    };

    const saveInventory = (inv) => {
        localStorage.setItem('yuzu_inventory', JSON.stringify(inv));
    };

    // Database Version Control (Forced migration for new unit system)
    const CURRENT_DB_VERSION = '1.2';
    const savedVersion = localStorage.getItem('yuzu_db_version');
    if (savedVersion !== CURRENT_DB_VERSION) {
        localStorage.removeItem('yuzu_materials_stock');
        localStorage.removeItem('yuzu_materials_classic');
        localStorage.removeItem('yuzu_materials_nutty');
        localStorage.removeItem('yuzu_materials_gift');
        localStorage.setItem('yuzu_db_version', CURRENT_DB_VERSION);
    }

    // 4.1 Raw Materials Inventory Logic
    const defaultMaterialsStock = {
        '오란다': 120, // kg
        '까불이': 80, // kg
        '유자청': 5, // kg
        '크랜베리': 2, // kg
        '슬라이스아몬드': 1.5, // kg
        '해바라기씨': 1, // kg
        '호박씨': 1.2, // kg
        '검은깨': 0.5, // kg
        '쌀엿조청': 8, // kg
        '설탕': 3, // kg
        '버터': 2000 // g (버터는 g 단위 유지)
    };

    const materialUnits = {
        '오란다': 'kg',
        '까불이': 'kg',
        '유자청': 'kg',
        '크랜베리': 'kg',
        '슬라이스아몬드': 'kg',
        '해바라기씨': 'kg',
        '호박씨': 'kg',
        '검은깨': 'kg',
        '쌀엿조청': 'kg',
        '설탕': 'kg',
        '버터': 'g'
    };

    const getMaterialsStock = () => {
        const data = localStorage.getItem('yuzu_materials_stock');
        if (!data) {
            localStorage.setItem('yuzu_materials_stock', JSON.stringify(defaultMaterialsStock));
            return defaultMaterialsStock;
        }
        return JSON.parse(data);
    };

    const saveMaterialsStock = (stock) => {
        localStorage.setItem('yuzu_materials_stock', JSON.stringify(stock));
    };

    const renderMaterialsInventory = () => {
        const stock = getMaterialsStock();
        const tbody = document.getElementById('materialsStockTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        Object.keys(stock).forEach(name => {
            const qty = stock[name];
            const unit = materialUnits[name] || 'kg';
            
            // Highlight low stock (under 10kg for main ingredients, under 1kg for toppings, under 500g for Butter)
            let isLow = false;
            if (unit === 'g') {
                isLow = qty <= 500;
            } else {
                isLow = (name === '오란다' || name === '까불이' || name === '쌀엿조청') ? qty <= 10 : qty <= 1;
            }
            const statusClass = qty <= 0 ? 'text-red font-bold' : (isLow ? 'text-orange font-bold' : '');

            // Format decimal places (up to 3 decimal places for kg, integer for g)
            const formattedQty = qty.toLocaleString(undefined, { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: unit === 'g' ? 0 : 3 
            });

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="font-bold">${name}</td>
                <td class="${statusClass}">${formattedQty}${unit}</td>
                <td>${unit}</td>
                <td>
                    <div class="table-adjust-qty">
                        <input type="number" id="adjust-mat-${name}" value="${unit === 'g' ? '500' : '1'}" step="${unit === 'g' ? '1' : '0.001'}" min="0.001">
                        <span class="unit-label">${unit}</span>
                    </div>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-table-action btn-mat-adjust-plus" data-mat="${name}">
                            <i data-lucide="plus"></i> <span>입고</span>
                        </button>
                        <button class="btn-table-action btn-mat-adjust-minus" data-mat="${name}">
                            <i data-lucide="minus"></i> <span>출고</span>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Bind events
        document.querySelectorAll('.btn-mat-adjust-plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.getAttribute('data-mat');
                adjustMaterialStock(name, 'add');
            });
        });

        document.querySelectorAll('.btn-mat-adjust-minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.getAttribute('data-mat');
                adjustMaterialStock(name, 'sub');
            });
        });
    };

    const adjustMaterialStock = (name, action) => {
        const inputEl = document.getElementById(`adjust-mat-${name}`);
        const amount = parseFloat(inputEl.value);

        if (isNaN(amount) || amount <= 0) {
            alert('올바른 조절 수량을 입력해 주세요.');
            return;
        }

        const stock = getMaterialsStock();
        if (action === 'add') {
            stock[name] += amount;
        } else if (action === 'sub') {
            if (stock[name] < amount) {
                alert('현재 재고 수량보다 많이 출고할 수 없습니다.');
                return;
            }
            stock[name] -= amount;
        }

        // Round to 3 decimal places to prevent float precision issues (since 1g = 0.001kg)
        stock[name] = Math.round(stock[name] * 1000) / 1000;

        saveMaterialsStock(stock);
        renderMaterialsInventory();
    };

    const renderInventory = () => {
        const inventory = getInventory();
        const products = ['classic', 'nutty', 'gift'];
        const maxStockReference = 100; // Reference for progress bar 100%

        products.forEach(p => {
            const stockQty = inventory[p];
            const stockEl = document.getElementById(`stock-${p}`);
            const progressEl = document.getElementById(`progress-${p}`);
            const statusEl = document.getElementById(`status-${p}`);

            if (stockEl) stockEl.textContent = stockQty;
            
            // Progress bar
            const percent = Math.min((stockQty / maxStockReference) * 100, 100);
            if (progressEl) {
                progressEl.style.width = `${percent}%`;
                
                if (stockQty <= 0) {
                    progressEl.style.backgroundColor = '#E74C3C'; // Red
                } else if (stockQty <= 10) {
                    progressEl.style.backgroundColor = '#FFAA00'; // Orange
                } else {
                    progressEl.style.backgroundColor = '#2D6A4F'; // Green
                }
            }

            // Status label
            if (statusEl) {
                if (stockQty <= 0) {
                    statusEl.textContent = '품절 (Sold Out)';
                    statusEl.className = 'stock-status-text out';
                } else if (stockQty <= 10) {
                    statusEl.textContent = '재고 부족';
                    statusEl.className = 'stock-status-text warning';
                } else {
                    statusEl.textContent = '정상';
                    statusEl.className = 'stock-status-text normal';
                }
            }
        });

        // Also render raw materials inventory
        renderMaterialsInventory();
    };

    // Inventory Adjust Button Handlers
    const handleInventoryAdjust = (productId, action) => {
        const inputEl = document.getElementById(`adjust-${productId}`);
        const amount = parseInt(inputEl.value, 10);

        if (isNaN(amount) || amount <= 0) {
            alert('올바른 조절 수량을 입력해 주세요.');
            return;
        }

        const inventory = getInventory();
        if (action === 'add') {
            // Deduct raw materials on production (완제품 입고)
            const materials = getMaterials(productId);
            const stock = getMaterialsStock();
            const shortage = [];

            // 1. Verify enough materials exist
            materials.forEach(mat => {
                const required = mat.qty * amount;
                if (mat.name in stock) {
                    if (stock[mat.name] < required) {
                        const unit = materialUnits[mat.name] || 'kg';
                        const lack = required - stock[mat.name];
                        // format decimals nicely (3 decimals for kg, integer for g)
                        const formattedLack = unit === 'g' ? Math.round(lack) : lack.toFixed(3);
                        shortage.push(`${mat.name} ${formattedLack}${unit} 부족`);
                    }
                }
            });

            if (shortage.length > 0) {
                alert(`원재료 재고가 부족하여 완제품을 생산(입고)할 수 없습니다.\n\n[부족 항목]\n- ${shortage.join('\n- ')}`);
                return;
            }

            // 2. Deduct materials
            materials.forEach(mat => {
                if (mat.name in stock) {
                    stock[mat.name] -= (mat.qty * amount);
                    stock[mat.name] = Math.round(stock[mat.name] * 1000) / 1000; // Float precision fix (3 decimals)
                }
            });

            saveMaterialsStock(stock);
            inventory[productId] += amount;
        } else if (action === 'sub') {
            if (inventory[productId] < amount) {
                alert('현재 재고 수량보다 많이 출고할 수 없습니다.');
                return;
            }
            inventory[productId] -= amount;
        }

        saveInventory(inventory);
        renderInventory();
    };

    document.querySelectorAll('.btn-adjust-plus').forEach(btn => {
        btn.addEventListener('click', () => {
            const pid = btn.getAttribute('data-target');
            handleInventoryAdjust(pid, 'add');
        });
    });

    document.querySelectorAll('.btn-adjust-minus').forEach(btn => {
        btn.addEventListener('click', () => {
            const pid = btn.getAttribute('data-target');
            handleInventoryAdjust(pid, 'sub');
        });
    });

    // 5. Raw Material & Price Calculator Logic
    const calcProductSelect = document.getElementById('calcProductSelect');
    const calcSalePriceInput = document.getElementById('calcSalePrice');
    const targetMarginInput = document.getElementById('targetMarginRate');

    // Default Raw Materials Mock data (All raw materials in kg except Butter in g)
    const defaultMaterialsData = {
        classic: [
            { id: 1, name: '오란다', unitPrice: 5000, qty: 0.6 }, // 0.6 kg = 600g (3000 KRW)
            { id: 2, name: '까불이', unitPrice: 6000, qty: 0 },
            { id: 3, name: '유자청', unitPrice: 20000, qty: 0.025 }, // 0.025 kg = 25g (500 KRW)
            { id: 4, name: '크랜베리', unitPrice: 40000, qty: 0 },
            { id: 5, name: '슬라이스아몬드', unitPrice: 35000, qty: 0 },
            { id: 6, name: '해바라기씨', unitPrice: 15000, qty: 0 },
            { id: 7, name: '호박씨', unitPrice: 20000, qty: 0 },
            { id: 8, name: '검은깨', unitPrice: 10000, qty: 0.005 }, // 0.005 kg = 5g (50 KRW)
            { id: 9, name: '쌀엿조청', unitPrice: 8000, qty: 0.08 }, // 0.08 kg = 80g (640 KRW)
            { id: 10, name: '설탕', unitPrice: 3000, qty: 0.02 }, // 0.02 kg = 20g (60 KRW)
            { id: 11, name: '버터', unitPrice: 50, qty: 10 } // 10 g (500 KRW)
        ],
        nutty: [
            { id: 1, name: '오란다', unitPrice: 5000, qty: 0.4 },  // 0.4 kg = 400g (2000 KRW)
            { id: 2, name: '까불이', unitPrice: 6000, qty: 0.2 },  // 0.2 kg = 200g (1200 KRW)
            { id: 3, name: '유자청', unitPrice: 20000, qty: 0.025 }, // 0.025 kg = 25g (500 KRW)
            { id: 4, name: '크랜베리', unitPrice: 40000, qty: 0.008 }, // 0.008 kg = 8g (320 KRW)
            { id: 5, name: '슬라이스아몬드', unitPrice: 35000, qty: 0.015 }, // 0.015 kg = 15g (525 KRW)
            { id: 6, name: '해바라기씨', unitPrice: 15000, qty: 0.01 }, // 0.01 kg = 10g (150 KRW)
            { id: 7, name: '호박씨', unitPrice: 20000, qty: 0.012 }, // 0.012 kg = 12g (240 KRW)
            { id: 8, name: '검은깨', unitPrice: 10000, qty: 0.005 }, // 0.005 kg = 5g (50 KRW)
            { id: 9, name: '쌀엿조청', unitPrice: 8000, qty: 0.07 }, // 0.07 kg = 70g (560 KRW)
            { id: 10, name: '설탕', unitPrice: 3000, qty: 0.015 }, // 0.015 kg = 15g (45 KRW)
            { id: 11, name: '버터', unitPrice: 50, qty: 12 } // 12 g (600 KRW)
        ],
        gift: [
            { id: 1, name: '오란다', unitPrice: 5000, qty: 1.0 },  // 1.0 kg = 1000g (5000 KRW)
            { id: 2, name: '까불이', unitPrice: 6000, qty: 0.4 },  // 0.4 kg = 400g (2400 KRW)
            { id: 3, name: '유자청', unitPrice: 20000, qty: 0.05 }, // 0.05 kg = 50g (1000 KRW)
            { id: 4, name: '크랜베리', unitPrice: 40000, qty: 0.016 }, // 0.016 kg = 16g (640 KRW)
            { id: 5, name: '슬라이스아몬드', unitPrice: 35000, qty: 0.03 }, // 0.03 kg = 30g (1050 KRW)
            { id: 6, name: '해바라기씨', unitPrice: 15000, qty: 0.02 }, // 0.02 kg = 20g (300 KRW)
            { id: 7, name: '호박씨', unitPrice: 20000, qty: 0.024 }, // 0.024 kg = 24g (480 KRW)
            { id: 8, name: '검은깨', unitPrice: 10000, qty: 0.01 }, // 0.01 kg = 10g (100 KRW)
            { id: 9, name: '쌀엿조청', unitPrice: 8000, qty: 0.12 }, // 0.12 kg = 120g (960 KRW)
            { id: 10, name: '설탕', unitPrice: 3000, qty: 0.03 }, // 0.03 kg = 30g (90 KRW)
            { id: 11, name: '버터', unitPrice: 50, qty: 24 } // 24 g (1200 KRW)
        ]
    };

    const getMaterials = (productId) => {
        const key = `yuzu_materials_${productId}`;
        const data = localStorage.getItem(key);
        let materials = null;
        if (data) {
            materials = JSON.parse(data);
            const matOranda = materials.find(m => m.name === '오란다');
            // If old 'Box' unit is detected (e.g. Oranda quantity is 0.15 instead of 0.6 kg)
            if (matOranda && matOranda.qty < 0.3) {
                materials = null;
            }
        }
        
        // Force reset if no data or if it's outdated
        if (!materials) {
            localStorage.setItem(key, JSON.stringify(defaultMaterialsData[productId]));
            return defaultMaterialsData[productId];
        }
        return materials;
    };

    const saveMaterials = (productId, materials) => {
        localStorage.setItem(`yuzu_materials_${productId}`, JSON.stringify(materials));
    };

    const renderCalculator = () => {
        const currentProduct = calcProductSelect.value;
        const materials = getMaterials(currentProduct);
        const tbody = document.getElementById('materialTableBody');
        
        tbody.innerHTML = '';
        let totalCost = 0;

        materials.forEach(mat => {
            const cost = mat.unitPrice * mat.qty;
            totalCost += cost;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${mat.name}</td>
                <td>${mat.unitPrice.toLocaleString()}원</td>
                <td>${mat.qty.toLocaleString()}</td>
                <td class="font-bold">${cost.toLocaleString()}원</td>
                <td>
                    <button class="btn-table-action btn-delete-mat" data-id="${mat.id}" style="padding: 4px 8px;">
                        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Set Total Cost Display
        document.getElementById('calcTotalCost').textContent = `${totalCost.toLocaleString()}원`;

        // Update default sale price if changed by selector
        const productDefaultPrices = {
            classic: 12000,
            nutty: 14000,
            gift: 22000
        };
        
        // Only set sale price if user has not customized it yet in this view session
        if (!calcSalePriceInput.dataset.userEdited) {
            calcSalePriceInput.value = productDefaultPrices[currentProduct];
        }

        calculateMargins(totalCost);

        // Delete Material Button Event
        document.querySelectorAll('.btn-delete-mat').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'), 10);
                deleteMaterial(currentProduct, id);
            });
        });

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    };

    const calculateMargins = (totalCost) => {
        const salePrice = parseInt(calcSalePriceInput.value, 10) || 0;
        const profit = salePrice - totalCost;
        const rate = salePrice > 0 ? Math.round((profit / salePrice) * 100) : 0;

        const profitEl = document.getElementById('calcMarginProfit');
        const rateEl = document.getElementById('calcMarginRate');

        profitEl.textContent = `${profit.toLocaleString()}원`;
        rateEl.textContent = `${rate}%`;

        // Margin Rate Color Formatting
        if (rate >= 50) {
            rateEl.style.color = '#2D6A4F'; // High margin (Green)
        } else if (rate >= 30) {
            rateEl.style.color = '#FFAA00'; // Normal margin (Orange)
        } else {
            rateEl.style.color = '#E74C3C'; // Low margin (Red)
        }

        // Recommend Target Price calculation
        const targetRate = parseInt(targetMarginInput.value, 10) || 0;
        if (targetRate > 0 && targetRate < 100) {
            const recommendedPrice = Math.round((totalCost / (1 - (targetRate / 100))) / 100) * 100; // Round to 100 KRW
            document.getElementById('recommendedSalePrice').textContent = `${recommendedPrice.toLocaleString()}원`;
        } else {
            document.getElementById('recommendedSalePrice').textContent = '0원';
        }
    };

    const deleteMaterial = (productId, id) => {
        const materials = getMaterials(productId);
        const filtered = materials.filter(m => m.id !== id);
        saveMaterials(productId, filtered);
        renderCalculator();
    };

    // Calculator Event Listeners
    if (calcProductSelect) {
        calcProductSelect.addEventListener('change', () => {
            // Reset custom user edited mark
            delete calcSalePriceInput.dataset.userEdited;
            renderCalculator();
        });
    }

    if (calcSalePriceInput) {
        calcSalePriceInput.addEventListener('input', () => {
            calcSalePriceInput.dataset.userEdited = true;
            const cost = parseInt(document.getElementById('calcTotalCost').textContent.replace(/[^0-9]/g, ''), 10) || 0;
            calculateMargins(cost);
        });
    }

    if (targetMarginInput) {
        targetMarginInput.addEventListener('input', () => {
            const cost = parseInt(document.getElementById('calcTotalCost').textContent.replace(/[^0-9]/g, ''), 10) || 0;
            calculateMargins(cost);
        });
    }

    // Material Modal Control
    const addMaterialBtn = document.getElementById('addMaterialBtn');
    const materialModal = document.getElementById('materialModal');
    const matCancelBtn = document.getElementById('matCancelBtn');
    const matSubmitBtn = document.getElementById('matSubmitBtn');

    const newMatName = document.getElementById('newMatName');
    const newMatUnitPrice = document.getElementById('newMatUnitPrice');
    const newMatQty = document.getElementById('newMatQty');

    if (addMaterialBtn) {
        addMaterialBtn.addEventListener('click', () => {
            materialModal.classList.add('active');
            newMatName.value = '';
            newMatUnitPrice.value = '';
            newMatQty.value = '';
        });
    }

    if (matCancelBtn) {
        matCancelBtn.addEventListener('click', () => {
            materialModal.classList.remove('active');
        });
    }

    if (materialModal) {
        materialModal.addEventListener('click', (e) => {
            if (e.target === materialModal) {
                materialModal.classList.remove('active');
            }
        });
    }

    if (matSubmitBtn) {
        matSubmitBtn.addEventListener('click', () => {
            const name = newMatName.value.trim();
            const unitPrice = parseInt(newMatUnitPrice.value, 10);
            const qty = parseInt(newMatQty.value, 10);
            const currentProduct = calcProductSelect.value;

            if (!name || isNaN(unitPrice) || isNaN(qty) || unitPrice < 0 || qty <= 0) {
                alert('원재료 정보를 올바르게 입력해 주세요.');
                return;
            }

            const materials = getMaterials(currentProduct);
            const newMat = {
                id: Date.now(),
                name,
                unitPrice,
                qty
            };
            materials.push(newMat);
            saveMaterials(currentProduct, materials);
            
            materialModal.classList.remove('active');
            renderCalculator();
        });
    }

    // Initial Active Tab Render
    renderOrders();
});
