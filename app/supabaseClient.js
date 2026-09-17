// ==============================================================================
// [유자를 품은 오란다&까부리] Supabase REST API Client & Local Fallback Store
// ==============================================================================

import { 
  INITIAL_RAW_MATERIALS, 
  INITIAL_PRODUCTS, 
  INITIAL_FINISHED_GOODS, 
  INITIAL_INVENTORY_LOGS, 
  INITIAL_ORDERS 
} from '../lib/inventoryCommon';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const headers = {
  'apikey': supabaseKey,
  'Authorization': `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

// Helper for LocalStorage fallback with SSR safety
function getLocalItem(key, defaultValue) {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn(`Failed to read localStorage for ${key}`, e);
    return defaultValue;
  }
}

function setLocalItem(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to write localStorage for ${key}`, e);
  }
}

export const supabase = {
  // ----------------------------------------------------------------------------
  // 1. Raw Materials (원재료)
  // ----------------------------------------------------------------------------
  async getRawMaterials() {
    try {
      if (!supabaseUrl || !supabaseKey) throw new Error('No Supabase credentials');
      const res = await fetch(`${supabaseUrl}/rest/v1/raw_materials?select=*&order=sort_order.asc,created_at.asc`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        data.sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
        setLocalItem('yuzu_raw_materials', data);
        return data;
      }
    } catch (e) {
      console.warn('Supabase getRawMaterials failed, using local store', e);
    }
    const local = getLocalItem('yuzu_raw_materials', INITIAL_RAW_MATERIALS);
    return Array.isArray(local) ? [...local].sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999)) : local;
  },

  async saveRawMaterials(materials) {
    setLocalItem('yuzu_raw_materials', materials);
    try {
      if (!supabaseUrl || !supabaseKey) return true;
      for (const item of materials) {
        await fetch(`${supabaseUrl}/rest/v1/raw_materials`, {
          method: 'POST',
          headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
          body: JSON.stringify(item)
        });
      }
      return true;
    } catch (e) {
      console.warn('Supabase saveRawMaterials error', e);
      return true; // Local updated
    }
  },

  async updateRawMaterial(id, updates) {
    const list = getLocalItem('yuzu_raw_materials', INITIAL_RAW_MATERIALS);
    const updated = list.map(m => m.id === id ? { ...m, ...updates, updated_at: new Date().toISOString() } : m);
    setLocalItem('yuzu_raw_materials', updated);

    try {
      if (!supabaseUrl || !supabaseKey) return true;
      const res = await fetch(`${supabaseUrl}/rest/v1/raw_materials?id=eq.${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      });
      return res.ok;
    } catch (e) {
      return true;
    }
  },

  async deleteRawMaterial(id) {
    const list = getLocalItem('yuzu_raw_materials', INITIAL_RAW_MATERIALS);
    const filtered = list.filter(m => m.id !== id);
    setLocalItem('yuzu_raw_materials', filtered);

    try {
      if (!supabaseUrl || !supabaseKey) return true;
      await fetch(`${supabaseUrl}/rest/v1/raw_materials?id=eq.${id}`, {
        method: 'DELETE',
        headers
      });
      return true;
    } catch (e) {
      return true;
    }
  },

  // ----------------------------------------------------------------------------
  // 2. Products (상품 낱개)
  // ----------------------------------------------------------------------------
  async getProducts() {
    try {
      if (!supabaseUrl || !supabaseKey) throw new Error('No Supabase credentials');
      const res = await fetch(`${supabaseUrl}/rest/v1/products?select=*&order=sort_order.asc,created_at.asc`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        data.sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
        setLocalItem('yuzu_products', data);
        return data;
      }
    } catch (e) {
      console.warn('Supabase getProducts failed, using local store', e);
    }
    const local = getLocalItem('yuzu_products', INITIAL_PRODUCTS);
    return Array.isArray(local) ? [...local].sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999)) : local;
  },

  async saveProducts(products) {
    setLocalItem('yuzu_products', products);
    try {
      if (!supabaseUrl || !supabaseKey) return true;
      for (const item of products) {
        await fetch(`${supabaseUrl}/rest/v1/products`, {
          method: 'POST',
          headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
          body: JSON.stringify(item)
        });
      }
      return true;
    } catch (e) {
      return true;
    }
  },

  async updateProduct(id, updates) {
    const list = getLocalItem('yuzu_products', INITIAL_PRODUCTS);
    const updated = list.map(p => p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p);
    setLocalItem('yuzu_products', updated);

    try {
      if (!supabaseUrl || !supabaseKey) return true;
      await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      });
      return true;
    } catch (e) {
      return true;
    }
  },

  async deleteProduct(id) {
    const list = getLocalItem('yuzu_products', INITIAL_PRODUCTS);
    const filtered = list.filter(p => p.id !== id);
    setLocalItem('yuzu_products', filtered);

    try {
      if (!supabaseUrl || !supabaseKey) return true;
      await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${id}`, {
        method: 'DELETE',
        headers
      });
      return true;
    } catch (e) {
      return true;
    }
  },

  // ----------------------------------------------------------------------------
  // 3. Finished Goods (완제품 세트)
  // ----------------------------------------------------------------------------
  async getFinishedGoods() {
    try {
      if (!supabaseUrl || !supabaseKey) throw new Error('No Supabase credentials');
      const res = await fetch(`${supabaseUrl}/rest/v1/finished_goods?select=*&order=sort_order.asc,created_at.asc`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        data.sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
        setLocalItem('yuzu_finished_goods', data);
        return data;
      }
    } catch (e) {
      console.warn('Supabase getFinishedGoods failed, using local store', e);
    }
    const local = getLocalItem('yuzu_finished_goods', INITIAL_FINISHED_GOODS);
    return Array.isArray(local) ? [...local].sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999)) : local;
  },

  async reorderItems(category, orderedList) {
    const keyMap = {
      raw_materials: 'yuzu_raw_materials',
      products: 'yuzu_products',
      finished_goods: 'yuzu_finished_goods'
    };
    const storageKey = keyMap[category] || `yuzu_${category}`;
    const withOrder = orderedList.map((item, idx) => ({
      ...item,
      sort_order: idx + 1,
      updated_at: new Date().toISOString()
    }));
    setLocalItem(storageKey, withOrder);

    try {
      if (!supabaseUrl || !supabaseKey) return true;
      for (const item of withOrder) {
        await fetch(`${supabaseUrl}/rest/v1/${category}?id=eq.${item.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ sort_order: item.sort_order, updated_at: item.updated_at })
        });
      }
      return true;
    } catch (e) {
      console.warn(`Supabase reorder ${category} failed`, e);
      return true;
    }
  },

  async saveFinishedGoods(goods) {
    setLocalItem('yuzu_finished_goods', goods);
    try {
      if (!supabaseUrl || !supabaseKey) return true;
      for (const item of goods) {
        await fetch(`${supabaseUrl}/rest/v1/finished_goods`, {
          method: 'POST',
          headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
          body: JSON.stringify(item)
        });
      }
      return true;
    } catch (e) {
      return true;
    }
  },

  async updateFinishedGood(id, updates) {
    const list = getLocalItem('yuzu_finished_goods', INITIAL_FINISHED_GOODS);
    const updated = list.map(g => g.id === id ? { ...g, ...updates, updated_at: new Date().toISOString() } : g);
    setLocalItem('yuzu_finished_goods', updated);

    try {
      if (!supabaseUrl || !supabaseKey) return true;
      await fetch(`${supabaseUrl}/rest/v1/finished_goods?id=eq.${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      });
      return true;
    } catch (e) {
      return true;
    }
  },

  async deleteFinishedGood(id) {
    const list = getLocalItem('yuzu_finished_goods', INITIAL_FINISHED_GOODS);
    const filtered = list.filter(g => g.id !== id);
    setLocalItem('yuzu_finished_goods', filtered);

    try {
      if (!supabaseUrl || !supabaseKey) return true;
      await fetch(`${supabaseUrl}/rest/v1/finished_goods?id=eq.${id}`, {
        method: 'DELETE',
        headers
      });
      return true;
    } catch (e) {
      return true;
    }
  },

  // ----------------------------------------------------------------------------
  // 4. Inventory Logs (재고 관리 기록)
  // ----------------------------------------------------------------------------
  async getInventoryLogs() {
    try {
      if (!supabaseUrl || !supabaseKey) throw new Error('No Supabase credentials');
      const res = await fetch(`${supabaseUrl}/rest/v1/inventory_logs?select=*&order=created_at.desc`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setLocalItem('yuzu_inventory_logs', data);
        return data;
      }
    } catch (e) {
      console.warn('Supabase getInventoryLogs failed, using local store', e);
    }
    return getLocalItem('yuzu_inventory_logs', INITIAL_INVENTORY_LOGS);
  },

  async addInventoryLog(log) {
    const logs = getLocalItem('yuzu_inventory_logs', INITIAL_INVENTORY_LOGS);
    const newLog = {
      ...log,
      id: log.id || `log_${Date.now()}`,
      created_at: log.created_at || new Date().toISOString(),
      updated_at: log.updated_at || new Date().toISOString()
    };
    const updated = [newLog, ...logs];
    setLocalItem('yuzu_inventory_logs', updated);

    try {
      if (!supabaseUrl || !supabaseKey) return true;
      await fetch(`${supabaseUrl}/rest/v1/inventory_logs`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newLog)
      });
      return true;
    } catch (e) {
      return true;
    }
  },

  async updateInventoryLog(id, updates) {
    const logs = getLocalItem('yuzu_inventory_logs', INITIAL_INVENTORY_LOGS);
    const updated = logs.map(l => l.id === id ? { ...l, ...updates, updated_at: new Date().toISOString() } : l);
    setLocalItem('yuzu_inventory_logs', updated);

    try {
      if (!supabaseUrl || !supabaseKey) return true;
      await fetch(`${supabaseUrl}/rest/v1/inventory_logs?id=eq.${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      });
      return true;
    } catch (e) {
      return true;
    }
  },

  async deleteInventoryLog(id) {
    const logs = getLocalItem('yuzu_inventory_logs', INITIAL_INVENTORY_LOGS);
    const filtered = logs.filter(l => l.id !== id);
    setLocalItem('yuzu_inventory_logs', filtered);

    try {
      if (!supabaseUrl || !supabaseKey) return true;
      await fetch(`${supabaseUrl}/rest/v1/inventory_logs?id=eq.${id}`, {
        method: 'DELETE',
        headers
      });
      return true;
    } catch (e) {
      return true;
    }
  },

  // ----------------------------------------------------------------------------
  // 5. Orders (현장 주문)
  // ----------------------------------------------------------------------------
  async getOrders() {
    try {
      if (!supabaseUrl || !supabaseKey) throw new Error('No Supabase credentials');
      const res = await fetch(`${supabaseUrl}/rest/v1/orders?select=*&order=order_date.desc`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setLocalItem('yuzu_orders_v2', data);
        return data;
      }
    } catch (e) {
      console.warn('Supabase getOrders failed, using local store', e);
    }
    return getLocalItem('yuzu_orders_v2', INITIAL_ORDERS);
  },

  async addOrder(order) {
    const list = getLocalItem('yuzu_orders_v2', INITIAL_ORDERS);
    const newOrd = {
      ...order,
      id: order.id || `ord_${Date.now()}`,
      order_date: order.order_date || new Date().toISOString(),
      status: order.status || '주문 접수'
    };
    const updated = [newOrd, ...list];
    setLocalItem('yuzu_orders_v2', updated);

    try {
      if (!supabaseUrl || !supabaseKey) return true;
      await fetch(`${supabaseUrl}/rest/v1/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newOrd)
      });
      return true;
    } catch (e) {
      return true;
    }
  },

  async updateOrder(id, updates) {
    const list = getLocalItem('yuzu_orders_v2', INITIAL_ORDERS);
    const updated = list.map(o => o.id === id ? { ...o, ...updates } : o);
    setLocalItem('yuzu_orders_v2', updated);

    try {
      if (!supabaseUrl || !supabaseKey) return true;
      await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      });
      return true;
    } catch (e) {
      return true;
    }
  },

  async deleteOrder(id) {
    const list = getLocalItem('yuzu_orders_v2', INITIAL_ORDERS);
    const filtered = list.filter(o => o.id !== id);
    setLocalItem('yuzu_orders_v2', filtered);

    try {
      if (!supabaseUrl || !supabaseKey) return true;
      await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${id}`, {
        method: 'DELETE',
        headers
      });
      return true;
    } catch (e) {
      return true;
    }
  },

  // ----------------------------------------------------------------------------
  // 6. Landing Settings (동적 섹션 및 하위 호환)
  // ----------------------------------------------------------------------------
  async getLandingSettings() {
    let settings = null;
    try {
      if (supabaseUrl && supabaseKey) {
        const res = await fetch(`${supabaseUrl}/rest/v1/recipes?product_id=eq.landing_settings&select=*`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            settings = typeof data[0].materials === 'string' ? JSON.parse(data[0].materials) : data[0].materials;
          }
        }
      }
    } catch (e) {
      console.warn('Supabase getLandingSettings failed, using local store', e);
    }
    if (!settings) {
      settings = getLocalItem('yuzu_landing_settings', null);
    }
    return settings;
  },

  async updateLandingSettings(settings) {
    setLocalItem('yuzu_landing_settings', settings);
    try {
      if (!supabaseUrl || !supabaseKey) return true;
      const existing = await this.getLandingSettings();
      let res;
      if (existing) {
        res = await fetch(`${supabaseUrl}/rest/v1/recipes?product_id=eq.landing_settings`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ materials: settings })
        });
      } else {
        res = await fetch(`${supabaseUrl}/rest/v1/recipes`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ product_id: 'landing_settings', materials: settings })
        });
      }
      return res.ok;
    } catch (e) {
      return true;
    }
  },

  // ----------------------------------------------------------------------------
  // 7. Auth Passwords (관리자 & 생산자 비밀번호)
  // ----------------------------------------------------------------------------
  async getAuthPasswords() {
    const defaultPasswords = { admin: 'yuzu1234', producer: 'maker1234' };
    try {
      if (supabaseUrl && supabaseKey) {
        const res = await fetch(`${supabaseUrl}/rest/v1/recipes?product_id=eq.auth_passwords&select=*`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            const parsed = typeof data[0].materials === 'string' ? JSON.parse(data[0].materials) : data[0].materials;
            if (parsed && (parsed.admin || parsed.producer)) {
              setLocalItem('yuzu_auth_passwords', parsed);
              return { ...defaultPasswords, ...parsed };
            }
          }
        }
      }
    } catch (e) {
      console.warn('Supabase getAuthPasswords failed, using local store', e);
    }
    return getLocalItem('yuzu_auth_passwords', defaultPasswords);
  },

  async updateAuthPasswords(passwords) {
    const updated = {
      admin: passwords.admin || 'yuzu1234',
      producer: passwords.producer || 'maker1234',
      updated_at: new Date().toISOString()
    };
    setLocalItem('yuzu_auth_passwords', updated);

    try {
      if (!supabaseUrl || !supabaseKey) return true;
      const res = await fetch(`${supabaseUrl}/rest/v1/recipes?product_id=eq.auth_passwords`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({ product_id: 'auth_passwords', materials: updated })
      });
      return res.ok;
    } catch (e) {
      console.warn('Supabase updateAuthPasswords error', e);
      return true;
    }
  },

  // ----------------------------------------------------------------------------
  // 8. Backward Compatibility: getInventory (Landing page용)
  // ----------------------------------------------------------------------------
  async getInventory() {
    // 랜딩페이지에서 호출하는 deundeun, silsok, mini, natgae 재고 매핑
    const goods = await this.getFinishedGoods();
    const invMap = {};
    goods.forEach(g => {
      if (g.id === 'set_deundeun') invMap['deundeun'] = Number(g.stock);
      else if (g.id === 'set_silsok') invMap['silsok'] = Number(g.stock);
      else if (g.id === 'set_mini') invMap['mini'] = Number(g.stock);
      else if (g.id === 'set_single') invMap['natgae'] = Number(g.stock);
      else if (g.set_type) invMap[g.set_type] = Number(g.stock);
    });
    return invMap;
  }
};
