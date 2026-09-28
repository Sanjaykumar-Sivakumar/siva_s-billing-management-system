/* ============================================================
   stock.js — Spare Part Name Master & Engine Oil Brand Master
   No prices or stock quantities are stored here. The mechanic
   enters price and quantity fresh on every single bill.
   ============================================================ */

const Stock = {
  searchTerm: '',

  // ---------------- Spare Part Names ----------------
  renderList() {
    const main = document.getElementById('mainContent');
    main.innerHTML = `
      <div class="page-header">
        <div><h1>Spare Part Names</h1><p class="page-sub">Names only — price is entered fresh on every bill</p></div>
        <div class="page-header-actions">
          <button class="btn btn-secondary ripple" data-route="oil">🛢️ Engine Oil List</button>
          <button class="btn btn-primary btn-lg ripple" id="addStockBtn">➕ New Part Name</button>
        </div>
      </div>
      <div class="card glass">
        <div class="search-row">
          <input type="text" id="stockSearch" class="input" placeholder="🔍 Search part name...">
        </div>
        <div id="stockListWrap"></div>
      </div>
    `;
    main.querySelector('[data-route="oil"]').addEventListener('click', () => Router.navigate('oil'));
    document.getElementById('addStockBtn').addEventListener('click', () => this.openForm());
    document.getElementById('stockSearch').addEventListener('input', Utils.debounce(e => {
      this.searchTerm = e.target.value; this.renderTable();
    }, 200));
    this.renderTable();
  },

  renderTable() {
    const wrap = document.getElementById('stockListWrap');
    if (!wrap) return;
    const term = this.searchTerm.toLowerCase();
    const list = Storage.getAll(DB_KEYS.STOCK)
      .filter(s => !term || s.name.toLowerCase().includes(term))
      .sort((a, b) => a.name.localeCompare(b.name));
    if (list.length === 0) { wrap.innerHTML = '<p class="empty-msg">No part names yet.</p>'; return; }
    wrap.innerHTML = `
      <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th>Part Name</th><th>Stock</th><th></th></tr></thead>
        <tbody>
          ${list.map(s => `
            <tr>
              <td>${Utils.escapeHtml(s.name)}</td>
              <td>${s.trackStock ? `<span class="badge ${Number(s.stockQty||0) <= Number(s.reorderLevel||0) ? 'badge-danger' : 'badge-success'}">${Number(s.stockQty||0)} ${Number(s.stockQty||0) <= Number(s.reorderLevel||0) ? 'Low' : 'In stock'}</span>` : '<span class="badge">Not tracked</span>'}</td>
              <td class="row-actions">
                <button class="btn btn-sm btn-ghost" data-act="edit" data-id="${s.id}">✏️</button>
                <button class="btn btn-sm btn-ghost danger" data-act="del" data-id="${s.id}">🗑️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      </div>
    `;
    wrap.querySelectorAll('[data-act="edit"]').forEach(b => b.addEventListener('click', () => this.openForm(b.dataset.id)));
    wrap.querySelectorAll('[data-act="del"]').forEach(b => b.addEventListener('click', () => this.deleteItem(b.dataset.id)));
  },

  openForm(id) {
    const item = id ? Storage.getById(DB_KEYS.STOCK, id) : null;
    const body = `
      <form id="stockForm">
        <div class="form-group"><label>Part Name *</label><input required class="input" name="name" value="${Utils.escapeHtml(item?.name || '')}" placeholder="e.g. Brake Shoe" autofocus></div>
        <div class="form-row"><div class="form-group"><label>Current Stock</label><input type="number" min="0" step="1" class="input" name="stockQty" value="${item?.trackStock ? Number(item?.stockQty||0) : ''}" placeholder="Optional"></div><div class="form-group"><label>Low Stock Alert</label><input type="number" min="0" step="1" class="input" name="reorderLevel" value="${item?.trackStock ? Number(item?.reorderLevel||0) : 2}"></div></div>
        <label class="login-remember"><input type="checkbox" name="trackStock" ${item?.trackStock ? 'checked' : ''}> Track stock for this part</label>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="stockCancelBtn">Cancel</button>
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>
    `;
    this.showFormModal(item ? 'Edit Part Name' : 'New Part Name', body);
    document.getElementById('stockCancelBtn').addEventListener('click', () => Utils.closeModal('formModal'));
    document.getElementById('stockForm').addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const obj = item || { id: Utils.uid() };
      obj.name = fd.get('name').trim();
      if (!obj.name) return Utils.toast('Part name is required', 'error');
      obj.trackStock = fd.get('trackStock') === 'on';
      obj.stockQty = obj.trackStock ? Math.max(0, Number(fd.get('stockQty') || 0)) : null;
      obj.reorderLevel = obj.trackStock ? Math.max(0, Number(fd.get('reorderLevel') || 0)) : 0;
      Storage.upsert(DB_KEYS.STOCK, obj);
      Sync.queue('upsertStock', obj);
      Utils.toast('Part name saved', 'success');
      Utils.closeModal('formModal');
      this.renderTable();
    });
  },

  async deleteItem(id) {
    const ok = await Utils.confirm('Delete this part name?', 'Delete');
    if (!ok) return;
    Storage.remove(DB_KEYS.STOCK, id);
    Utils.toast('Deleted', 'success');
    this.renderTable();
  },

  // Add a new spare part name to the master list (used from the New Bill screen)
  addNameIfMissing(name) {
    name = (name || '').trim();
    if (!name) return null;
    const existing = Storage.getAll(DB_KEYS.STOCK).find(s => s.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;
    const obj = { id: Utils.uid(), name };
    Storage.upsert(DB_KEYS.STOCK, obj);
    return obj;
  },
  addOilBrandIfMissing(brand) {
    brand = (brand || '').trim();
    if (!brand) return null;
    const existing = Storage.getAll(DB_KEYS.OILS).find(o => o.brand.toLowerCase() === brand.toLowerCase());
    if (existing) return existing;
    const obj = { id: Utils.uid(), brand };
    Storage.upsert(DB_KEYS.OILS, obj);
    return obj;
  },

  // ---------------- Oil Brand Names ----------------
  renderOilList() {
    const main = document.getElementById('mainContent');
    main.innerHTML = `
      <div class="page-header">
        <div><h1>Engine Oil Brands</h1><p class="page-sub">Brand names only — price is entered fresh on every bill</p></div>
        <div class="page-header-actions">
          <button class="btn btn-secondary ripple" data-route="stock">📦 Spare Parts</button>
          <button class="btn btn-primary btn-lg ripple" id="addOilBtn">➕ New Oil Brand</button>
        </div>
      </div>
      <div class="card glass"><div id="oilListWrap"></div></div>
    `;
    main.querySelector('[data-route="stock"]').addEventListener('click', () => Router.navigate('stock'));
    document.getElementById('addOilBtn').addEventListener('click', () => this.openOilForm());
    this.renderOilTable();
  },

  renderOilTable() {
    const wrap = document.getElementById('oilListWrap');
    if (!wrap) return;
    const list = Storage.getAll(DB_KEYS.OILS).sort((a, b) => a.brand.localeCompare(b.brand));
    if (list.length === 0) { wrap.innerHTML = '<p class="empty-msg">No oil brands yet.</p>'; return; }
    wrap.innerHTML = `
      <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th>Brand Name</th><th>Stock</th><th></th></tr></thead>
        <tbody>
          ${list.map(o => `
            <tr>
              <td>${Utils.escapeHtml(o.brand)}</td>
              <td>${o.trackStock ? `<span class="badge ${Number(o.stockQty||0) <= Number(o.reorderLevel||0) ? 'badge-danger' : 'badge-success'}">${Number(o.stockQty||0)} L</span>` : '<span class="badge">Not tracked</span>'}</td>
              <td class="row-actions">
                <button class="btn btn-sm btn-ghost" data-act="edit" data-id="${o.id}">✏️</button>
                <button class="btn btn-sm btn-ghost danger" data-act="del" data-id="${o.id}">🗑️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      </div>
    `;
    wrap.querySelectorAll('[data-act="edit"]').forEach(b => b.addEventListener('click', () => this.openOilForm(b.dataset.id)));
    wrap.querySelectorAll('[data-act="del"]').forEach(b => b.addEventListener('click', () => this.deleteOil(b.dataset.id)));
  },

  openOilForm(id) {
    const item = id ? Storage.getById(DB_KEYS.OILS, id) : null;
    const body = `
      <form id="oilForm">
        <div class="form-group"><label>Oil Brand Name *</label><input required class="input" name="brand" value="${Utils.escapeHtml(item?.brand || '')}" placeholder="e.g. Castrol" autofocus></div>
        <div class="form-row"><div class="form-group"><label>Current Stock (L)</label><input type="number" min="0" step="0.1" class="input" name="stockQty" value="${item?.trackStock ? Number(item?.stockQty||0) : ''}" placeholder="Optional"></div><div class="form-group"><label>Low Stock Alert (L)</label><input type="number" min="0" step="0.1" class="input" name="reorderLevel" value="${item?.trackStock ? Number(item?.reorderLevel||0) : 1}"></div></div>
        <label class="login-remember"><input type="checkbox" name="trackStock" ${item?.trackStock ? 'checked' : ''}> Track oil stock</label>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="oilCancelBtn">Cancel</button>
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>
    `;
    this.showFormModal(item ? 'Edit Oil Brand' : 'New Oil Brand', body);
    document.getElementById('oilCancelBtn').addEventListener('click', () => Utils.closeModal('formModal'));
    document.getElementById('oilForm').addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const obj = item || { id: Utils.uid() };
      obj.brand = fd.get('brand').trim();
      if (!obj.brand) return Utils.toast('Brand name is required', 'error');
      obj.trackStock = fd.get('trackStock') === 'on';
      obj.stockQty = obj.trackStock ? Math.max(0, Number(fd.get('stockQty') || 0)) : null;
      obj.reorderLevel = obj.trackStock ? Math.max(0, Number(fd.get('reorderLevel') || 0)) : 0;
      Storage.upsert(DB_KEYS.OILS, obj);
      Sync.queue('upsertOil', obj);
      Utils.toast('Oil brand saved', 'success');
      Utils.closeModal('formModal');
      this.renderOilTable();
    });
  },

  async deleteOil(id) {
    const ok = await Utils.confirm('Delete this oil brand?', 'Delete');
    if (!ok) return;
    Storage.remove(DB_KEYS.OILS, id);
    Utils.toast('Deleted', 'success');
    this.renderOilTable();
  },

  applyInvoiceStock(previousInvoice, nextInvoice) {
    const previous = previousInvoice || { parts: [], oils: [] };
    const prevParts = {}; (previous.parts || []).forEach(p => { prevParts[p.itemId] = (prevParts[p.itemId] || 0) + Number(p.qty || 0); });
    const nextParts = {}; (nextInvoice.parts || []).forEach(p => { nextParts[p.itemId] = (nextParts[p.itemId] || 0) + Number(p.qty || 0); });
    Object.keys({ ...prevParts, ...nextParts }).forEach(id => {
      const item = Storage.getById(DB_KEYS.STOCK, id); if (!item || !item.trackStock) return;
      const delta = (nextParts[id] || 0) - (prevParts[id] || 0);
      if (delta > Number(item.stockQty || 0)) throw new Error(`Insufficient stock for ${item.name}`);
      item.stockQty = Math.max(0, Number(item.stockQty || 0) - delta); Storage.upsert(DB_KEYS.STOCK, item); Sync.queue('upsertStock', item);
    });
    const prevOils = {}; (previous.oils || []).forEach(o => { prevOils[o.itemId] = (prevOils[o.itemId] || 0) + Number(o.qty || 0); });
    const nextOils = {}; (nextInvoice.oils || []).forEach(o => { nextOils[o.itemId] = (nextOils[o.itemId] || 0) + Number(o.qty || 0); });
    Object.keys({ ...prevOils, ...nextOils }).forEach(id => {
      const item = Storage.getById(DB_KEYS.OILS, id); if (!item || !item.trackStock) return;
      const delta = (nextOils[id] || 0) - (prevOils[id] || 0);
      if (delta > Number(item.stockQty || 0)) throw new Error(`Insufficient oil stock for ${item.brand}`);
      item.stockQty = Math.max(0, Number(item.stockQty || 0) - delta); Storage.upsert(DB_KEYS.OILS, item); Sync.queue('upsertOil', item);
    });
  },

  restoreInvoiceStock(inv) {
    (inv.parts || []).forEach(p => { const item=Storage.getById(DB_KEYS.STOCK,p.itemId); if(item?.trackStock){item.stockQty=Number(item.stockQty||0)+Number(p.qty||0);Storage.upsert(DB_KEYS.STOCK,item);Sync.queue('upsertStock',item);} });
    (inv.oils || []).forEach(o => { const item=Storage.getById(DB_KEYS.OILS,o.itemId); if(item?.trackStock){item.stockQty=Number(item.stockQty||0)+Number(o.qty||0);Storage.upsert(DB_KEYS.OILS,item);Sync.queue('upsertOil',item);} });
  },

  showFormModal(title, bodyHtml) {
    document.getElementById('formModalTitle').textContent = title;
    document.getElementById('formModalBody').innerHTML = bodyHtml;
    Utils.openModal('formModal');
  }
};

window.Stock = Stock;
