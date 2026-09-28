/* ============================================================
   storage.js — LocalStorage Data Layer (Siva's Billing App)
   All persistence goes through this module. No UI logic here.
   ============================================================ */

const DB_KEYS = {
  CUSTOMERS: 'ssb_customers',
  VEHICLES: 'ssb_vehicles',
  INVOICES: 'ssb_invoices',
  STOCK: 'ssb_stock',
  OILS: 'ssb_oils',
  LABOUR: 'ssb_labour',
  CHARGES: 'ssb_charges',
  SETTINGS: 'ssb_settings',
  SESSION: 'ssb_session',
  INVOICE_SEQ: 'ssb_invoice_seq',
  THEME: 'ssb_theme',
  SYNC_QUEUE: 'ssb_sync_queue'
};

const Storage = {
  _read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null || raw === undefined) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.error('Storage read error', key, e);
      return fallback;
    }
  },
  _write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage write error', key, e);
      return false;
    }
  },

  // Generic collection helpers
  getAll(key) { return this._read(key, []); },
  saveAll(key, arr) { return this._write(key, arr); },

  getById(key, id) {
    return this.getAll(key).find(x => x.id === id) || null;
  },
  upsert(key, item) {
    const all = this.getAll(key);
    const idx = all.findIndex(x => x.id === item.id);
    if (idx >= 0) all[idx] = item; else all.push(item);
    this.saveAll(key, all);
    return item;
  },
  remove(key, id) {
    const all = this.getAll(key).filter(x => x.id !== id);
    this.saveAll(key, all);
  },

  // Settings (single object)
  getSettings() {
    const defaults = {
      appName: "Siva's Billing App",
      workshopName: 'Siva Sakthi Auto Works',
      ownerName: 'Sivakumar S',
      address: '2nd Vasuki Street, Near Chinna Market, Erode.',
      phone: '+91 9443547577',
      logo: '',
      ownerPhoto: '',
      signature: '',
      invoicePrefix: 'SS',
      thankYouMsg: 'Thank you! Visit again.',
      accessPin: '1234',
      sheetsUrl: '',
      syncEnabled: false
    };
    const current = this._read(DB_KEYS.SETTINGS, {});
    return { ...defaults, ...current };
  },
  saveSettings(s) { return this._write(DB_KEYS.SETTINGS, s); },

  // Session
  getSession() { return this._read(DB_KEYS.SESSION, null); },
  setSession(s) { return this._write(DB_KEYS.SESSION, s); },
  clearSession() { localStorage.removeItem(DB_KEYS.SESSION); },

  // Theme
  getTheme() { return this._read(DB_KEYS.THEME, 'light'); },
  setTheme(t) { return this._write(DB_KEYS.THEME, t); },

  // Invoice numbering
  nextInvoiceNumber() {
    let seq = this._read(DB_KEYS.INVOICE_SEQ, 0);
    seq += 1;
    this._write(DB_KEYS.INVOICE_SEQ, seq);
    const settings = this.getSettings();
    const year = new Date().getFullYear();
    return `${settings.invoicePrefix || 'SS'}-${year}-${String(seq).padStart(4, '0')}`;
  },

  // Backup / Restore
  exportAll() {
    const dump = {};
    Object.values(DB_KEYS).forEach(k => {
      dump[k] = this._read(k, null);
    });
    dump._exportedAt = new Date().toISOString();
    dump._app = "Siva's Billing App";
    return dump;
  },
  importAll(dump) {
    Object.values(DB_KEYS).forEach(k => {
      if (dump[k] !== undefined && dump[k] !== null) {
        this._write(k, dump[k]);
      }
    });
    return true;
  },
  resetAll() {
    Object.values(DB_KEYS).forEach(k => localStorage.removeItem(k));
  },

  getSyncQueue() { return this._read(DB_KEYS.SYNC_QUEUE, []); },
  saveSyncQueue(queue) { return this._write(DB_KEYS.SYNC_QUEUE, queue); },
  enqueueSync(item) {
    const q = this.getSyncQueue();
    q.push({ ...item, queuedAt: Date.now() });
    this.saveSyncQueue(q);
    return q.length;
  },
  clearSyncQueue() { localStorage.removeItem(DB_KEYS.SYNC_QUEUE); },

  // Seed default reference data (labour, charges) on first run
  seedIfEmpty() {
    if (this.getAll(DB_KEYS.LABOUR).length === 0) {
      this.saveAll(DB_KEYS.LABOUR, [
        { id: Utils.uid(), name: 'General Service', price: 250 },
        { id: Utils.uid(), name: 'Engine Work', price: 800 },
        { id: Utils.uid(), name: 'Electrical Work', price: 300 },
        { id: Utils.uid(), name: 'Brake Work', price: 150 },
        { id: Utils.uid(), name: 'Chain Work', price: 200 },
        { id: Utils.uid(), name: 'Clutch Work', price: 350 }
      ]);
    }
    if (this.getAll(DB_KEYS.STOCK).length === 0) {
      this.saveAll(DB_KEYS.STOCK, [
        { id: Utils.uid(), name: 'Brake Shoe' },
        { id: Utils.uid(), name: 'Clutch Cable' },
        { id: Utils.uid(), name: 'Spark Plug' },
        { id: Utils.uid(), name: 'Chain Sprocket' },
        { id: Utils.uid(), name: 'Air Filter' },
        { id: Utils.uid(), name: 'Oil Filter' },
        { id: Utils.uid(), name: 'Disc Pad' },
        { id: Utils.uid(), name: 'Tube' },
        { id: Utils.uid(), name: 'Tyre' },
        { id: Utils.uid(), name: 'Battery' }
      ]);
    }
    if (this.getAll(DB_KEYS.OILS).length === 0) {
      this.saveAll(DB_KEYS.OILS, [
        { id: Utils.uid(), brand: 'Castrol' },
        { id: Utils.uid(), brand: 'Motul' },
        { id: Utils.uid(), brand: 'Shell' },
        { id: Utils.uid(), brand: 'Servo' },
        { id: Utils.uid(), brand: 'Yamalube' }
      ]);
    }
    if (this.getAll(DB_KEYS.CHARGES).length === 0) {
      this.saveAll(DB_KEYS.CHARGES, [
        { id: Utils.uid(), name: 'Pickup', price: 100 },
        { id: Utils.uid(), name: 'Delivery', price: 100 },
        { id: Utils.uid(), name: 'Parking', price: 20 }
      ]);
    }
  }
};

window.DB_KEYS = DB_KEYS;
window.Storage = Storage;
