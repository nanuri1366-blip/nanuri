document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Header Scroll Effect
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 3. Mobile Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const toggleIcon = menuToggle.querySelector('i');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const isActive = navMenu.classList.toggle('active');
            if (isActive) {
                menuToggle.innerHTML = '<i data-lucide="x"></i>';
            } else {
                menuToggle.innerHTML = '<i data-lucide="menu"></i>';
            }
            lucide.createIcons();
        });
    }

    // Close menu when clicking nav link
    const navLinks = document.querySelectorAll('.nav-link, .nav-btn');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                menuToggle.innerHTML = '<i data-lucide="menu"></i>';
                lucide.createIcons();
            }
        });
    });

    // 4. Inventory Data Initialize & Sold Out Control
    // Default values if not set
    const defaultInventory = {
        classic: 50,
        nutty: 30,
        gift: 15
    };

    const getInventory = () => {
        const inv = localStorage.getItem('yuzu_inventory');
        if (!inv) {
            localStorage.setItem('yuzu_inventory', JSON.stringify(defaultInventory));
            return defaultInventory;
        }
        return JSON.parse(inv);
    };

    const updateInventoryUI = () => {
        const inventory = getInventory();
        const productCards = document.querySelectorAll('.product-card');
        const selectOptions = document.querySelectorAll('#productSelect option');

        // Check each product card using action button's product name
        productCards.forEach(card => {
            const actionBtn = card.querySelector('.product-action-btn');
            if (!actionBtn) return;
            
            const productName = actionBtn.getAttribute('data-product');
            let key = '';
            if (productName.includes('클래식')) key = 'classic';
            else if (productName.includes('견과')) key = 'nutty';
            else if (productName.includes('선물세트')) key = 'gift';

            if (key && inventory[key] <= 0) {
                card.classList.add('sold-out');
                actionBtn.textContent = '품절 (Sold Out)';
            } else {
                card.classList.remove('sold-out');
                actionBtn.innerHTML = '선택하기 <i data-lucide="chevron-right"></i>';
            }
        });

        // Update Select Option availability
        selectOptions.forEach(opt => {
            const val = opt.value;
            if (val && val in inventory) {
                if (inventory[val] <= 0) {
                    opt.disabled = true;
                    opt.textContent = opt.textContent.split(' (품절')[0] + ' (품절)';
                } else {
                    opt.disabled = false;
                    opt.textContent = opt.textContent.replace(' (품절)', '');
                }
            }
        });
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    };

    // Apply inventory UI status initially
    updateInventoryUI();

    // 5. Product Action Selector (선택하기 클릭 시 주문 폼 연동)
    const productButtons = document.querySelectorAll('.product-action-btn');
    const productSelect = document.getElementById('productSelect');
    
    productButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // If parent card is sold out, prevent action
            if (btn.closest('.product-card').classList.contains('sold-out')) {
                return;
            }

            const productName = btn.getAttribute('data-product');
            let selectValue = '';
            if (productName.includes('클래식')) {
                selectValue = 'classic';
            } else if (productName.includes('견과')) {
                selectValue = 'nutty';
            } else if (productName.includes('선물세트')) {
                selectValue = 'gift';
            }

            if (selectValue) {
                productSelect.value = selectValue;
                const group = productSelect.closest('.form-group');
                group.classList.remove('has-error');
                
                const orderSection = document.getElementById('order');
                orderSection.scrollIntoView({ behavior: 'smooth' });

                setTimeout(() => {
                    productSelect.focus();
                }, 800);
            }
        });
    });

    // 6. Order Form Validation and Submit
    const orderForm = document.getElementById('orderForm');
    const nameInput = document.getElementById('userName');
    const phoneInput = document.getElementById('userPhone');
    const qtyInput = document.getElementById('productQty');
    const messageInput = document.getElementById('userMessage');
    
    const nameError = document.getElementById('nameError');
    const phoneError = document.getElementById('phoneError');
    const productError = document.getElementById('productError');
    const qtyError = document.getElementById('qtyError');

    const successModal = document.getElementById('successModal');
    const modalPhone = document.getElementById('modalPhone');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    const phoneRegex = /^01[016789]-?\d{3,4}-?\d{4}$/;

    const validateField = (input, errorEl, validatorFn) => {
        const group = input.closest('.form-group');
        const isValid = validatorFn(input.value);
        if (!isValid) {
            group.classList.add('has-error');
        } else {
            group.classList.remove('has-error');
        }
        return isValid;
    };

    phoneInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/[^0-9]/g, '');
        if (val.length > 3 && val.length <= 7) {
            val = val.slice(0, 3) + '-' + val.slice(3);
        } else if (val.length > 7) {
            val = val.slice(0, 3) + '-' + val.slice(3, 7) + '-' + val.slice(7, 11);
        }
        e.target.value = val;
    });

    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const inventory = getInventory();
        const selectedProduct = productSelect.value;
        const requestedQty = parseInt(qtyInput.value, 10);

        // Perform validations
        const isNameValid = validateField(nameInput, nameError, val => val.trim().length > 0);
        const isPhoneValid = validateField(phoneInput, phoneError, val => phoneRegex.test(val));
        const isProductValid = validateField(productSelect, productError, val => val !== '');
        
        // Quantity validation checks inventory first
        const isQtyValid = validateField(qtyInput, qtyError, val => {
            const num = parseInt(val, 10);
            if (isNaN(num) || num < 1 || num > 100) return false;
            
            // Check current stock limit
            if (selectedProduct && selectedProduct in inventory) {
                if (num > inventory[selectedProduct]) {
                    qtyError.textContent = `재고가 부족합니다. (남은 수량: ${inventory[selectedProduct]}개)`;
                    return false;
                }
            }
            return true;
        });

        // Focus first error
        if (!isNameValid) nameInput.focus();
        else if (!isPhoneValid) phoneInput.focus();
        else if (!isProductValid) productSelect.focus();
        else if (!isQtyValid) qtyInput.focus();

        if (isNameValid && isPhoneValid && isProductValid && isQtyValid) {
            // Deduct inventory
            inventory[selectedProduct] -= requestedQty;
            localStorage.setItem('yuzu_inventory', JSON.stringify(inventory));
            updateInventoryUI();

            // Save order data to localStorage
            const orders = JSON.parse(localStorage.getItem('yuzu_orders') || '[]');
            const newOrder = {
                id: Date.now(),
                date: new Date().toLocaleString('ko-KR'),
                name: nameInput.value.trim(),
                phone: phoneInput.value.trim(),
                product: selectedProduct,
                qty: requestedQty,
                message: messageInput.value.trim(),
                status: '대기'
            };
            orders.push(newOrder);
            localStorage.setItem('yuzu_orders', JSON.stringify(orders));

            // Show success modal
            modalPhone.textContent = phoneInput.value;
            successModal.classList.add('active');

            // Reset form
            orderForm.reset();
            document.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('has-error');
            });
            qtyError.textContent = "1개 이상 100개 이하로 입력해주세요."; // Reset text
        }
    });

    modalCloseBtn.addEventListener('click', () => {
        successModal.classList.remove('active');
    });

    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.classList.remove('active');
        }
    });
});

