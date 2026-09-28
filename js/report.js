/* ============================================================
   report.js — Revenue Reports, Top Lists, Charts
   ============================================================ */

const Report = {
  render() {
    const main = document.getElementById('mainContent');
    const invoices = Storage.getAll(DB_KEYS.INVOICES);

    const today = invoices.filter(i => Utils.isToday(i.date)).reduce((s, i) => s + i.grandTotal, 0);
    const week = invoices.filter(i => Utils.isThisWeek(i.date)).reduce((s, i) => s + i.grandTotal, 0);
    const month = invoices.filter(i => Utils.isThisMonth(i.date)).reduce((s, i) => s + i.grandTotal, 0);
    const year = invoices.filter(i => Utils.isThisYear(i.date)).reduce((s, i) => s + i.grandTotal, 0);

    main.innerHTML = `
      <div class="page-header">
        <div><h1>Reports</h1><p class="page-sub">Revenue analytics</p></div>
      </div>
      <div class="stat-grid">
        <div class="stat-card glass"><div class="stat-icon" style="background:var(--accent-orange-soft)">📅</div><div class="stat-info"><span class="stat-label">Today</span><span class="stat-value">${Utils.formatCurrency(today)}</span></div></div>
        <div class="stat-card glass"><div class="stat-icon" style="background:var(--accent-blue-soft)">🗓️</div><div class="stat-info"><span class="stat-label">This Week</span><span class="stat-value">${Utils.formatCurrency(week)}</span></div></div>
        <div class="stat-card glass"><div class="stat-icon" style="background:var(--accent-orange-soft)">📆</div><div class="stat-info"><span class="stat-label">This Month</span><span class="stat-value">${Utils.formatCurrency(month)}</span></div></div>
        <div class="stat-card glass"><div class="stat-icon" style="background:var(--accent-blue-soft)">📊</div><div class="stat-info"><span class="stat-label">This Year</span><span class="stat-value">${Utils.formatCurrency(year)}</span></div></div>
      </div>

      <div class="dash-grid">
        <div class="card glass reports-chart-card">
          <h3>📈 Last 7 Days Revenue</h3>
          <div class="chart-caption">Daily billed revenue • local workshop time</div>
          <canvas id="revenueChart" height="240"></canvas>
        </div>
        <div class="card glass">
          <h3>🏆 Top Customers</h3>
          ${this.topCustomersHtml(invoices)}
        </div>
      </div>

      <div class="dash-grid">
        <div class="card glass">
          <h3>🔧 Top Selling Spare Parts</h3>
          ${this.topPartsHtml(invoices)}
        </div>
        <div class="card glass">
          <h3>🏍️ Most Frequent Bikes</h3>
          ${this.topBikesHtml(invoices)}
        </div>
      </div>
    `;

    this.drawChart(invoices);
  },

  topCustomersHtml(invoices) {
    const map = {};
    invoices.forEach(i => {
      map[i.customerName] = (map[i.customerName] || 0) + i.grandTotal;
    });
    const top = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (top.length === 0) return '<p class="empty-msg">No data yet</p>';
    return `<ul class="rank-list">${top.map(([name, amt], idx) => `<li><span class="rank-no">${idx + 1}</span><span class="rank-name">${Utils.escapeHtml(name)}</span><span class="rank-val">${Utils.formatCurrency(amt)}</span></li>`).join('')}</ul>`;
  },

  topPartsHtml(invoices) {
    const map = {};
    invoices.forEach(i => (i.parts || []).forEach(p => { map[p.name] = (map[p.name] || 0) + p.qty; }));
    const top = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (top.length === 0) return '<p class="empty-msg">No data yet</p>';
    return `<ul class="rank-list">${top.map(([name, qty], idx) => `<li><span class="rank-no">${idx + 1}</span><span class="rank-name">${Utils.escapeHtml(name)}</span><span class="rank-val">${qty} units</span></li>`).join('')}</ul>`;
  },

  topBikesHtml(invoices) {
    const map = {};
    invoices.forEach(i => { map[i.bikeNumber] = (map[i.bikeNumber] || 0) + 1; });
    const top = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (top.length === 0) return '<p class="empty-msg">No data yet</p>';
    return `<ul class="rank-list">${top.map(([name, count], idx) => `<li><span class="rank-no">${idx + 1}</span><span class="rank-name">${Utils.escapeHtml(name)}</span><span class="rank-val">${count} visits</span></li>`).join('')}</ul>`;
  },

  drawChart(invoices) {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;
    const draw = (progress = 1) => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(280, Math.floor(rect.width || canvas.parentElement?.clientWidth || 640));
      const h = 240;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = '100%'; canvas.style.height = `${h}px`;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const days = [];
      for (let i = 6; i >= 0; i--) { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - i); days.push(d); }
      const localISO = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const values = days.map(d => invoices.filter(inv => inv.date === localISO(d)).reduce((sum, inv) => sum + Number(inv.grandTotal || 0), 0));
      const max = Math.max(...values, 1);
      const styles = getComputedStyle(document.documentElement);
      const accent = styles.getPropertyValue('--accent-orange').trim() || '#BD5B55';
      const blue = styles.getPropertyValue('--brand-blue').trim() || '#263544';
      const text = styles.getPropertyValue('--text-secondary').trim() || '#687386';
      const border = styles.getPropertyValue('--border-color').trim() || 'rgba(0,0,0,.1)';
      const plot = { left: 40, right: 16, top: 18, bottom: 38 };
      const plotW = w - plot.left - plot.right;
      const plotH = h - plot.top - plot.bottom;
      const slot = plotW / days.length;
      const barW = Math.min(44, Math.max(20, slot * .56));
      ctx.clearRect(0,0,w,h);
      ctx.font = '10px Poppins, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = text;
      [0,.5,1].forEach(level => {
        const y = plot.top + plotH - plotH * level;
        ctx.strokeStyle = border;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(plot.left,y); ctx.lineTo(w-plot.right,y); ctx.stroke();
        const val = max * level;
        ctx.fillText(`₹${Math.round(val).toLocaleString('en-IN')}`, 4, y-4);
      });
      days.forEach((d,i) => {
        const rawH = values[i] > 0 ? (values[i]/max) * (plotH - 8) : 3;
        const barH = rawH * progress;
        const x = plot.left + i*slot + (slot-barW)/2;
        const y = plot.top + plotH - barH;
        const grad = ctx.createLinearGradient(0,y,0,plot.top+plotH);
        grad.addColorStop(0, accent); grad.addColorStop(1, blue);
        ctx.fillStyle = grad;
        ctx.globalAlpha = values[i] > 0 ? 1 : .28;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x,y,barW,barH,7); else ctx.rect(x,y,barW,barH);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = text; ctx.textAlign = 'center';
        ctx.fillText(d.toLocaleDateString('en-IN',{weekday:'short'}), x+barW/2, h-13);
        if (values[i] > 0 && progress > .98) {
          ctx.fillStyle = styles.getPropertyValue('--text-primary').trim() || '#17202A';
          ctx.font = '600 10px Poppins, sans-serif';
          ctx.fillText(`₹${Math.round(values[i]).toLocaleString('en-IN')}`, x+barW/2, Math.max(12,y-7));
          ctx.font = '10px Poppins, sans-serif';
        }
      });
    };
    draw(1);
    if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
    this._resizeHandler = () => draw(1);
    window.addEventListener('resize', this._resizeHandler, { passive: true });
    let start = null;
    const animate = ts => {
      if (!start) start = ts;
      const p = Math.min(1, (ts-start)/420);
      const eased = 1 - Math.pow(1-p,3);
      draw(eased);
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }
};

window.Report = Report;
