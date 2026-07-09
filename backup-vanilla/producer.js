/* producer.js */
document.addEventListener('DOMContentLoaded', () => {
    // 0. Authentication Gate Control
    const authGate = document.getElementById('authGate');
    const gatePasswordInput = document.getElementById('gatePassword');
    const gateSubmitBtn = document.getElementById('gateSubmitBtn');
    const gatePasswordError = document.getElementById('gatePasswordError');

    const checkAuth = () => {
        if (sessionStorage.getItem('yuzu_producer_auth') === 'true') {
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
        if (password === 'maker1234') {
            sessionStorage.setItem('yuzu_producer_auth', 'true');
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

    // Default Raw Materials Inventory Mock data
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
        '버터': 2000 // g
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

    // Default Finished Product Recipes
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

    const getMaterials = (productId) => {
        const key = `yuzu_materials_${productId}`;
        const data = localStorage.getItem(key);
        if (!data) {
            localStorage.setItem(key, JSON.stringify(defaultMaterialsData[productId]));
            return defaultMaterialsData[productId];
        }
        return JSON.parse(data);
    };

    // Render Raw Materials Inventory List
    const renderMaterialsTable = () => {
        const stock = getMaterialsStock();
        const tbody = document.getElementById('producerMaterialsStockTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        Object.keys(stock).forEach(name => {
            const qty = stock[name];
            const unit = materialUnits[name] || 'kg';
            
            // Low stock highlighting
            let isLow = false;
            if (unit === 'g') {
                isLow = qty <= 500;
            } else {
                isLow = (name === '오란다' || name === '까불이' || name === '쌀엿조청') ? qty <= 10 : qty <= 1;
            }
            const statusClass = qty <= 0 ? 'text-red font-bold' : (isLow ? 'text-orange font-bold' : '');

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
                        <input type="number" id="producer-adjust-mat-${name}" value="${unit === 'g' ? '500' : '1'}" step="${unit === 'g' ? '1' : '0.001'}" min="0.001">
                        <span class="unit-label">${unit}</span>
                    </div>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-table-action btn-prod-mat-plus" data-mat="${name}" style="background-color: #EAE8E3; border-color: #D6D4CF;">
                            <i data-lucide="plus"></i> <span style="font-weight: 700;">입고</span>
                        </button>
                        <button class="btn-table-action btn-prod-mat-minus" data-mat="${name}" style="background-color: #EAE8E3; border-color: #D6D4CF;">
                            <i data-lucide="minus"></i> <span style="font-weight: 700;">사용</span>
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
        document.querySelectorAll('.btn-prod-mat-plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.getAttribute('data-mat');
                adjustMaterialStock(name, 'add');
            });
        });

        document.querySelectorAll('.btn-prod-mat-minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.getAttribute('data-mat');
                adjustMaterialStock(name, 'sub');
            });
        });
    };

    // Adjust Individual Raw Material Stock
    const adjustMaterialStock = (name, action) => {
        const inputEl = document.getElementById(`producer-adjust-mat-${name}`);
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
                alert('현재 재고 수량보다 많이 사용할 수 없습니다.');
                return;
            }
            stock[name] -= amount;
        }

        // Precision adjustment (3 decimals)
        stock[name] = Math.round(stock[name] * 1000) / 1000;

        saveMaterialsStock(stock);
        renderMaterialsTable();
    };

    // 2. Production form submission
    const btnRegisterProduction = document.getElementById('btnRegisterProduction');
    if (btnRegisterProduction) {
        btnRegisterProduction.addEventListener('click', () => {
            const productId = document.getElementById('produceSelect').value;
            const amountInput = document.getElementById('produceQty');
            const amount = parseInt(amountInput.value, 10);

            if (isNaN(amount) || amount <= 0) {
                alert('올바른 생산 수량을 입력해 주세요.');
                return;
            }

            const materials = getMaterials(productId);
            const stock = getMaterialsStock();
            const shortage = [];

            // 1) Verify ingredient sufficiency
            materials.forEach(mat => {
                const required = mat.qty * amount;
                if (mat.name in stock) {
                    if (stock[mat.name] < required) {
                        const unit = materialUnits[mat.name] || 'kg';
                        const lack = required - stock[mat.name];
                        const formattedLack = unit === 'g' ? Math.round(lack) : lack.toFixed(3);
                        shortage.push(`${mat.name} ${formattedLack}${unit} 부족`);
                    }
                }
            });

            if (shortage.length > 0) {
                alert(`원재료 재고가 부족하여 완제품을 생산할 수 없습니다.\n\n[부족 항목]\n- ${shortage.join('\n- ')}`);
                return;
            }

            // 2) Deduct raw materials
            materials.forEach(mat => {
                if (mat.name in stock) {
                    stock[mat.name] -= (mat.qty * amount);
                    stock[mat.name] = Math.round(stock[mat.name] * 1000) / 1000; // Float precision fix
                }
            });

            // 3) Add to finished goods inventory
            const inventory = getInventory();
            inventory[productId] += amount;

            // Save & Sync
            saveMaterialsStock(stock);
            saveInventory(inventory);
            renderMaterialsTable();

            alert(`완제품 생산 등록 완료!\n\n- 생산 품목: ${document.getElementById('produceSelect').options[document.getElementById('produceSelect').selectedIndex].text}\n- 생산 수량: ${amount}박스\n\n원재료 재고 차감 및 완제품 수량이 실시간 업데이트되었습니다.`);
        });
    }

    // 3. Outbound form submission
    const btnRegisterOutbound = document.getElementById('btnRegisterOutbound');
    if (btnRegisterOutbound) {
        btnRegisterOutbound.addEventListener('click', () => {
            const productId = document.getElementById('outboundSelect').value;
            const amountInput = document.getElementById('outboundQty');
            const amount = parseInt(amountInput.value, 10);

            if (isNaN(amount) || amount <= 0) {
                alert('올바른 출고 수량을 입력해 주세요.');
                return;
            }

            const inventory = getInventory();
            if (inventory[productId] < amount) {
                alert('출고하려는 수량이 완제품 현재 재고량보다 많습니다.');
                return;
            }

            // Deduct finished goods
            inventory[productId] -= amount;
            saveInventory(inventory);

            alert(`완제품 출고 등록 완료!\n\n- 출고 품목: ${document.getElementById('outboundSelect').options[document.getElementById('outboundSelect').selectedIndex].text}\n- 출고 수량: ${amount}박스`);
        });
    }

    // Initial render
    renderMaterialsTable();
});
