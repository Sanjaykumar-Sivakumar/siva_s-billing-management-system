/* Google Sheets sync layer. LocalStorage remains the source of truth while offline. */
const Sync = {
  getUrl() { return Storage.getSettings().sheetsUrl || ''; },
  status() { return this.getUrl() ? 'configured' : 'not-configured'; },
  async post(payload) {
    const url = this.getUrl();
    if (!url) return { ok: false, skipped: true };
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch (_) {}
      if (!res.ok || data.ok === false) throw new Error(data.error || `HTTP ${res.status}`);
      return { ok: true, data };
    } catch (e) {
      console.warn('Google Sheets sync failed:', e);
      return { ok: false, error: e.message };
    }
  },
  queue(type, data) {
    Storage.enqueueSync({ type, data });
    this.flush();
  },
  async flush() {
    const url = this.getUrl();
    if (!url) return;
    const queue = Storage.getSyncQueue();
    if (!queue.length) return;
    const remaining = [];
    for (const item of queue) {
      const result = await this.post({ action: item.type, data: item.data });
      if (!result.ok) remaining.push(item);
    }
    Storage.saveSyncQueue(remaining);
    if (!remaining.length) Utils.toast('Google Sheets synced', 'success');
  },
  async test() {
    const result = await this.post({ action: 'ping', data: { app: "Siva's Billing App", at: new Date().toISOString() } });
    return result;
  },
  pendingCount() { return Storage.getSyncQueue().length; }
};
window.Sync = Sync;
