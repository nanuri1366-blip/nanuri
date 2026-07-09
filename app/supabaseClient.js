// Supabase REST API Client using fetch to avoid dependency overhead
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const headers = {
  'apikey': supabaseKey,
  'Authorization': `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

export const supabase = {
  // 1. Inventory Table
  async getInventory() {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/inventory?select=*`, { headers });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      // Convert array [{id: 'deundeun', stock: 50}, ...] to object {deundeun: 50, ...}
      const inv = {};
      data.forEach(item => {
        inv[item.id] = item.stock;
      });
      return inv;
    } catch (e) {
      console.error("Supabase getInventory failed, fallback to local", e);
      return null;
    }
  },

  async updateInventory(id, stock) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/inventory?id=eq.${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ stock })
      });
      return res.ok;
    } catch (e) {
      console.error(`Supabase updateInventory failed for ${id}`, e);
      return false;
    }
  },

  async updateAllInventory(inventoryObj) {
    try {
      const promises = Object.keys(inventoryObj).map(key => 
        this.updateInventory(key, inventoryObj[key])
      );
      await Promise.all(promises);
      return true;
    } catch (e) {
      console.error("Supabase updateAllInventory failed", e);
      return false;
    }
  },

  // 2. Orders Table
  async getOrders() {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/orders?select=*`, { headers });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      // Extract the nested 'data' property from each row
      return data.map(item => item.data);
    } catch (e) {
      console.error("Supabase getOrders failed", e);
      return null;
    }
  },

  async addOrder(order) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ id: order.id, data: order })
      });
      return res.ok;
    } catch (e) {
      console.error("Supabase addOrder failed", e);
      return false;
    }
  },

  async deleteOrder(id) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${id}`, {
        method: 'DELETE',
        headers
      });
      return res.ok;
    } catch (e) {
      console.error(`Supabase deleteOrder failed for ${id}`, e);
      return false;
    }
  },

  async saveAllOrders(ordersList) {
    try {
      // Clear existing and bulk insert, or merge. Since it's a small app, we delete and insert.
      // 1. Delete all
      await fetch(`${supabaseUrl}/rest/v1/orders?id=neq.0`, {
        method: 'DELETE',
        headers
      });
      // 2. Insert new
      if (ordersList.length === 0) return true;
      const rows = ordersList.map(order => ({ id: order.id, data: order }));
      const res = await fetch(`${supabaseUrl}/rest/v1/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(rows)
      });
      return res.ok;
    } catch (e) {
      console.error("Supabase saveAllOrders failed", e);
      return false;
    }
  },

  // 3. Materials Stock Table
  async getMaterialsStock() {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/materials_stock?select=*`, { headers });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const stock = {};
      data.forEach(item => {
        stock[item.name] = Number(item.stock);
      });
      return stock;
    } catch (e) {
      console.error("Supabase getMaterialsStock failed", e);
      return null;
    }
  },

  async updateMaterialStock(name, stock) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/materials_stock?name=eq.${name}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ stock })
      });
      return res.ok;
    } catch (e) {
      console.error(`Supabase updateMaterialStock failed for ${name}`, e);
      return false;
    }
  },

  async updateAllMaterialsStock(stockObj) {
    try {
      const promises = Object.keys(stockObj).map(key => 
        this.updateMaterialStock(key, stockObj[key])
      );
      await Promise.all(promises);
      return true;
    } catch (e) {
      console.error("Supabase updateAllMaterialsStock failed", e);
      return false;
    }
  },

  // 4. Recipes Table
  async getRecipe(productId) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/recipes?product_id=eq.${productId}&select=*`, { headers });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data.length > 0) {
        return typeof data[0].materials === 'string' ? JSON.parse(data[0].materials) : data[0].materials;
      }
      return null;
    } catch (e) {
      console.error(`Supabase getRecipe failed for ${productId}`, e);
      return null;
    }
  },

  async updateRecipe(productId, materials) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/recipes?product_id=eq.${productId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ materials })
      });
      return res.ok;
    } catch (e) {
      console.error(`Supabase updateRecipe failed for ${productId}`, e);
      return false;
    }
  }
};
