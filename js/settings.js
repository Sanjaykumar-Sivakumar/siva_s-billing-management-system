/* Profile + application settings. Workshop identity is reused by every invoice. */
const Settings = {
  renderProfile() {
    const main = document.getElementById('mainContent');
    const s = Storage.getSettings();
    main.innerHTML = `
      <div class="page-header">
        <div><h1>Workshop Profile</h1><p class="page-sub">Everything saved here automatically appears on your next bill.</p></div>
        <span class="profile-save-hint">● Invoice profile</span>
      </div>
      <div class="profile-grid">
        <div class="card glass profile-card">
          <div class="profile-heading"><div class="profile-avatar">🏪</div><div><h3>Business Details</h3><p>Shop identity, contact and address</p></div></div>
          <form id="profileForm">
            <div class="form-row"><div class="form-group"><label>Shop Name *</label><input class="input" name="workshopName" value="${Utils.escapeHtml(s.workshopName)}" required></div><div class="form-group"><label>Owner Name *</label><input class="input" name="ownerName" value="${Utils.escapeHtml(s.ownerName)}" required></div></div>
            <div class="form-row"><div class="form-group"><label>Phone Number</label><input class="input" name="phone" value="${Utils.escapeHtml(s.phone)}" inputmode="tel"></div><div class="form-group"><label>Invoice Prefix</label><input class="input" name="invoicePrefix" maxlength="8" value="${Utils.escapeHtml(s.invoicePrefix)}"></div></div>
            <div class="form-group"><label>Shop Address</label><textarea class="input" name="address" rows="3">${Utils.escapeHtml(s.address)}</textarea></div>
            <div class="form-group"><label>Thank You Message</label><input class="input" name="thankYouMsg" value="${Utils.escapeHtml(s.thankYouMsg)}"></div>
            <button class="btn btn-primary ripple" type="submit">💾 Save Profile</button>
          </form>
        </div>

        <div class="card glass profile-card">
          <div class="profile-heading"><div class="profile-avatar">✍️</div><div><h3>Owner Identity</h3><p>Used in the invoice signature area</p></div></div>
          <div class="upload-grid">
            <div class="upload-box"><div class="upload-label">App Logo <span class="required-note">Not printed on invoice</span></div><img id="profileLogoPreview" class="upload-preview logo-preview-large" src="${s.logo || 'assets/logo.png'}" alt="Logo"><label class="btn btn-secondary ripple upload-btn" for="profileLogo">Upload Logo</label><input id="profileLogo" type="file" accept="image/png,image/jpeg,image/webp" hidden></div>
            <div class="upload-box"><div class="upload-label">Owner Photo</div>${s.ownerPhoto ? `<img id="ownerPhotoPreview" class="upload-preview avatar-preview" src="${s.ownerPhoto}" alt="Owner photo">` : `<div id="ownerPhotoPreview" class="upload-preview avatar-placeholder">👤</div>`}<label class="btn btn-secondary ripple upload-btn" for="ownerPhoto">Upload Photo</label><input id="ownerPhoto" type="file" accept="image/png,image/jpeg,image/webp" hidden></div>
            <div class="upload-box signature-box"><div class="upload-label">Owner E-Signature <span class="required-note">PNG</span></div>${s.signature ? `<img id="signaturePreview" class="signature-preview" src="${s.signature}" alt="Owner signature">` : `<div id="signaturePreview" class="signature-placeholder">Upload transparent PNG signature</div>`}<label class="btn btn-secondary ripple upload-btn" for="signatureInput">Upload Signature PNG</label><input id="signatureInput" type="file" accept="image/png" hidden><small>Transparent PNG is recommended for the exact invoice look.</small></div>
          </div>
          <div class="signature-live-card"><div><span>Invoice signature</span><strong>${Utils.escapeHtml(s.ownerName || 'Owner')}</strong><small>OWNER</small></div>${s.signature ? `<img src="${s.signature}" alt="signature">` : '<span class="signature-missing">Not uploaded</span>'}</div>
        </div>
      </div>
      <div class="card glass profile-note"><strong>How it works</strong><span>Change the shop name, address, phone or signature once. Every newly generated PDF uses the latest saved profile automatically.</span></div>
    `;
    document.getElementById('profileForm').addEventListener('submit', e => this.saveProfile(e));
    document.getElementById('profileLogo').addEventListener('change', e => this.handleImage(e, 'logo'));
    document.getElementById('ownerPhoto').addEventListener('change', e => this.handleImage(e, 'ownerPhoto'));
    document.getElementById('signatureInput').addEventListener('change', e => this.handleSignature(e));
  },

  render() {
    const main = document.getElementById('mainContent');
    const s = Storage.getSettings();
    main.innerHTML = `
      <div class="page-header"><div><h1>Settings</h1><p class="page-sub">Security, appearance, Google Sheets and backup</p></div></div>
      <div class="settings-grid">
        <div class="card glass"><h3>🔐 Common Access</h3><p class="page-sub">One shared PIN opens the app for your workshop team.</p>
          <form id="pinForm" class="settings-form"><div class="form-group"><label>Common Access PIN</label><input class="input" name="accessPin" inputmode="numeric" maxlength="8" value="${Utils.escapeHtml(s.accessPin)}" required></div><button class="btn btn-primary" type="submit">🔑 Update PIN</button></form>
        </div>
        <div class="card glass"><h3>☁️ Google Sheets</h3><p class="page-sub">Optional cloud sync through Google Apps Script.</p>
          <form id="sheetsForm" class="settings-form"><div class="form-group"><label>Apps Script Web App URL</label><input class="input" name="sheetsUrl" value="${Utils.escapeHtml(s.sheetsUrl)}" placeholder="https://script.google.com/macros/s/.../exec"></div><div class="settings-actions"><button class="btn btn-primary" type="submit">💾 Save URL</button><button class="btn btn-secondary" type="button" id="testSheetsBtn">🔎 Test Connection</button><button class="btn btn-secondary" type="button" id="syncNowBtn">↻ Sync Now</button></div><div class="sync-status" id="syncStatus"></div></form>
        </div>
        <div class="card glass"><h3>🎨 Appearance</h3><p class="page-sub">Both modes are optimized for readable text and clear controls.</p><div class="theme-switch-row"><button class="btn btn-secondary" id="setLightTheme">☀️ Light Mode</button><button class="btn btn-secondary" id="setDarkTheme">🌙 Dark Mode</button></div></div>
        <div class="card glass"><h3>📊 Excel Backup</h3><p class="page-sub">Download your billing data as an Excel-compatible workbook for safekeeping or sharing.</p><div class="settings-actions"><button class="btn btn-primary" id="exportBtn">⬇️ Download Excel Backup</button><label class="btn btn-secondary" for="importFile">⬆️ Restore Excel Backup</label><input type="file" id="importFile" accept=".xlsx,.xls,.xml" hidden><button class="btn btn-danger" id="resetBtn">🗑️ Erase All Data</button></div><p class="backup-note">Excel export creates a real .xlsx workbook with separate data sheets.</p></div>
      </div>
    `;
    document.getElementById('pinForm').addEventListener('submit', e => this.savePin(e));
    document.getElementById('sheetsForm').addEventListener('submit', e => this.saveSheets(e));
    document.getElementById('testSheetsBtn').addEventListener('click', () => this.testSheets());
    document.getElementById('syncNowBtn').addEventListener('click', () => Sync.flush());
    document.getElementById('setLightTheme').addEventListener('click', () => { Storage.setTheme('light'); App.applyTheme('light'); });
    document.getElementById('setDarkTheme').addEventListener('click', () => { Storage.setTheme('dark'); App.applyTheme('dark'); });
    document.getElementById('exportBtn').addEventListener('click', () => this.exportBackup());
    document.getElementById('importFile').addEventListener('change', e => this.importBackup(e));
    document.getElementById('resetBtn').addEventListener('click', () => this.resetData());
    this.updateSyncStatus();
  },

  saveProfile(e) {
    e.preventDefault();
    const fd = new FormData(e.target), s = Storage.getSettings();
    s.workshopName = fd.get('workshopName').trim(); s.ownerName = fd.get('ownerName').trim(); s.phone = fd.get('phone').trim(); s.address = fd.get('address').trim(); s.invoicePrefix = fd.get('invoicePrefix').trim().toUpperCase() || 'SS'; s.thankYouMsg = fd.get('thankYouMsg').trim() || 'Thank you! Visit again.';
    Storage.saveSettings(s); App.renderTopbarInfo();
    const title = document.getElementById('accessWorkshopName'); if (title) title.textContent = s.workshopName.toUpperCase();
    Utils.toast('Workshop profile saved', 'success');
  },

  handleImage(e, key) {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 2 * 1024 * 1024) { Utils.toast('Please use an image below 2 MB', 'warning'); return; }
    const reader = new FileReader();
    reader.onload = () => { const s = Storage.getSettings(); s[key] = reader.result; Storage.saveSettings(s); Utils.toast(key === 'ownerPhoto' ? 'Owner photo updated' : 'Logo updated', 'success'); this.renderProfile(); App.renderTopbarInfo(); };
    reader.readAsDataURL(file);
  },

  handleSignature(e) {
    const file = e.target.files[0]; if (!file) return;
    if (file.type !== 'image/png') { Utils.toast('E-signature must be a PNG file', 'error'); return; }
    if (file.size > 2 * 1024 * 1024) { Utils.toast('Please use a PNG below 2 MB', 'warning'); return; }
    const reader = new FileReader();
    reader.onload = () => { const s = Storage.getSettings(); s.signature = reader.result; Storage.saveSettings(s); Utils.toast('Owner e-signature saved', 'success'); this.renderProfile(); };
    reader.readAsDataURL(file);
  },

  savePin(e) { e.preventDefault(); const pin = new FormData(e.target).get('accessPin').trim(); if (!/^\d{4,8}$/.test(pin)) return Utils.toast('PIN must contain 4 to 8 digits', 'error'); const s=Storage.getSettings(); s.accessPin=pin; Storage.saveSettings(s); Utils.toast('Common access PIN updated', 'success'); },
  saveSheets(e) { e.preventDefault(); const s=Storage.getSettings(); s.sheetsUrl=new FormData(e.target).get('sheetsUrl').trim(); s.syncEnabled=!!s.sheetsUrl; Storage.saveSettings(s); Utils.toast(s.sheetsUrl ? 'Google Sheets URL saved' : 'Google Sheets sync disabled', 'success'); this.updateSyncStatus(); },
  async testSheets() { const r=await Sync.test(); Utils.toast(r.ok ? 'Google Sheets connection successful' : 'Connection failed — check the Web App URL and deployment access', r.ok?'success':'error'); this.updateSyncStatus(); },
  updateSyncStatus() { const el=document.getElementById('syncStatus'); if (!el) return; const s=Storage.getSettings(); el.innerHTML=s.sheetsUrl ? `🟢 Connected setting · ${Sync.pendingCount()} item(s) waiting to sync` : '⚪ Not configured · bills are safely stored on this device'; },
  exportBackup() {
    const dump = Storage.exportAll();
    const esc = value => String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
    const pretty = value => value === null || value === undefined ? '' : (typeof value === 'object' ? JSON.stringify(value) : String(value));
    const sheetRows = [];
    const collections = [
      ['Invoices', DB_KEYS.INVOICES], ['Customers', DB_KEYS.CUSTOMERS], ['Vehicles', DB_KEYS.VEHICLES],
      ['Spare Parts', DB_KEYS.STOCK], ['Engine Oil', DB_KEYS.OILS], ['Labour', DB_KEYS.LABOUR],
      ['Charges', DB_KEYS.CHARGES], ['Sync Queue', DB_KEYS.SYNC_QUEUE]
    ];
    collections.forEach(([name,key]) => {
      const rows = Array.isArray(dump[key]) ? dump[key] : [];
      const columns = [...new Set(rows.flatMap(row => row && typeof row === 'object' ? Object.keys(row) : []))];
      const header = columns.length ? columns : ['Data'];
      const body = rows.map(row => columns.length ? columns.map(col => pretty(row?.[col])) : [pretty(row)]);
      sheetRows.push({name, rows:[header,...body]});
    });
    const settings = dump[DB_KEYS.SETTINGS] || {};
    sheetRows.push({name:'Settings', rows:[['Setting','Value'], ...Object.entries(settings).map(([k,v]) => [k,pretty(v)])]});
    sheetRows.push({name:'Backup Info', rows:[['Field','Value'],['Exported At',dump._exportedAt],['App',dump._app],['Invoice Sequence',dump[DB_KEYS.INVOICE_SEQ] ?? 0],['Theme',dump[DB_KEYS.THEME] ?? 'light']]});

    const colName = n => { let out=''; while(n>0){ const r=(n-1)%26; out=String.fromCharCode(65+r)+out; n=Math.floor((n-1)/26); } return out || 'A'; };
    const cellXml = (value, r, c) => `<c r="${colName(c+1)}${r}" s="${r === 1 ? 1 : 0}" t="inlineStr"><is><t xml:space="preserve">${esc(value)}</t></is></c>`;
    const sheetXml = rows => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="18"/><sheetData>${rows.map((row,ri)=>`<row r="${ri+1}">${row.map((v,ci)=>cellXml(v,ri+1,ci)).join('')}</row>`).join('')}</sheetData></worksheet>`;
    const files = [];
    const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheetRows.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`;
    files.push(['[Content_Types].xml',contentTypes]);
    files.push(['_rels/.rels',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`]);
    files.push(['xl/workbook.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheetRows.map((sh,i)=>`<sheet name="${esc(sh.name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets></workbook>`]);
    files.push(['xl/_rels/workbook.xml.rels',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheetRows.map((_,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}<Relationship Id="rId${sheetRows.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`]);
    files.push(['xl/styles.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="10"/><name val="Aptos"/></font><font><b/><sz val="10"/><name val="Aptos"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE8EDF2"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/><xf numFmtId="0" fontId="1" fillId="1" borderId="0"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`]);
    sheetRows.forEach((sh,i)=>files.push([`xl/worksheets/sheet${i+1}.xml`,sheetXml(sh.rows)]));

    const enc = new TextEncoder();
    const crcTable = (()=>{ const t=new Uint32Array(256); for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);t[n]=c>>>0;} return t; })();
    const crc32 = bytes => { let c=0xFFFFFFFF; for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8); return (c^0xFFFFFFFF)>>>0; };
    const u16 = n => new Uint8Array([n&255,(n>>>8)&255]);
    const u32 = n => new Uint8Array([n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255]);
    const join = parts => { const total=parts.reduce((n,p)=>n+p.length,0); const out=new Uint8Array(total); let o=0; parts.forEach(p=>{out.set(p,o);o+=p.length;}); return out; };
    const chunks=[], central=[]; let offset=0;
    files.forEach(([name,text])=>{
      const nameB=enc.encode(name), data=enc.encode(text), crc=crc32(data);
      const local=join([u32(0x04034b50),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(nameB.length),u16(0),nameB,data]);
      chunks.push(local);
      central.push(join([u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(nameB.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),nameB]));
      offset += local.length;
    });
    const cd=join(central), localAll=join(chunks), end=join([u32(0x06054b50),u16(0),u16(0),u16(files.length),u16(files.length),u32(cd.length),u32(localAll.length),u16(0)]);
    const xlsx=join([localAll,cd,end]);
    const blob=new Blob([xlsx],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    const url=URL.createObjectURL(blob), a=document.createElement('a'); a.href=url; a.download=`siva-billing-backup-${Utils.todayISO()}.xlsx`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),500);
    Utils.toast('Excel .xlsx backup downloaded','success');
  },
  async importBackup(e) {
    const file = e.target.files[0];
    if (!file) return;
    const ok = await Utils.confirm('Current local data will be overwritten by the Excel backup. Continue?', 'Restore Excel Backup');
    if (!ok) { e.target.value = ''; return; }
    const sheetToKey = {
      'Invoices': DB_KEYS.INVOICES, 'Customers': DB_KEYS.CUSTOMERS, 'Vehicles': DB_KEYS.VEHICLES,
      'Spare Parts': DB_KEYS.STOCK, 'Engine Oil': DB_KEYS.OILS, 'Labour': DB_KEYS.LABOUR,
      'Charges': DB_KEYS.CHARGES, 'Sync Queue': DB_KEYS.SYNC_QUEUE
    };
    const restoreRows = (sheetRows, imported) => {
      const textOf = cell => cell?.getElementsByTagNameNS('http://schemas.openxmlformats.org/spreadsheetml/2006/main', 't')[0]?.textContent ?? cell?.textContent ?? '';
      const values = sheetRows.map(row => [...row.children].map(textOf));
      return values;
    };
    const applyImported = imported => {
      if (!imported[DB_KEYS.INVOICES] && !imported[DB_KEYS.SETTINGS]) throw new Error('No Siva Billing backup sheets found');
      Object.entries(imported).forEach(([key,value]) => Storage._write(key,value));
      Storage.clearSession();
      Utils.toast('Excel backup restored. Reloading...', 'success');
      setTimeout(() => location.reload(), 900);
    };
    const parseRows = (values, name, imported) => {
      if (sheetToKey[name]) {
        if (!values.length) return;
        const headers = values[0];
        imported[sheetToKey[name]] = values.slice(1).filter(r => r.some(Boolean)).map(r => {
          const obj = {};
          headers.forEach((h,i) => { if (!h) return; const raw = r[i] ?? ''; try { obj[h] = /^[\[{]/.test(raw.trim()) ? JSON.parse(raw) : raw; } catch (_) { obj[h] = raw; } });
          return obj;
        });
      } else if (name === 'Settings') {
        const settings = {};
        values.slice(1).forEach(r => { if (r[0]) { let v=r[1] ?? ''; try { v=/^[\[{]/.test(v.trim()) ? JSON.parse(v) : v; } catch (_) {} settings[r[0]]=v; } });
        imported[DB_KEYS.SETTINGS]=settings;
      } else if (name === 'Backup Info') {
        values.slice(1).forEach(r => { if (r[0] === 'Invoice Sequence') imported[DB_KEYS.INVOICE_SEQ]=Number(r[1]||0); if (r[0] === 'Theme') imported[DB_KEYS.THEME]=r[1]||'light'; });
      }
    };
    const readXmlWorkbook = readerText => {
      const doc = new DOMParser().parseFromString(readerText,'application/xml');
      if (doc.querySelector('parsererror')) throw new Error('Invalid Excel XML');
      const ns='urn:schemas-microsoft-com:office:spreadsheet';
      const imported={};
      [...doc.getElementsByTagNameNS(ns,'Worksheet')].forEach(ws => {
        const name=ws.getAttributeNS(ns,'Name') || ws.getAttribute('ss:Name') || '';
        const rows=[...ws.getElementsByTagNameNS(ns,'Row')].map(row => [...row.getElementsByTagNameNS(ns,'Cell')].map(cell => cell.getElementsByTagNameNS(ns,'Data')[0]?.textContent ?? ''));
        parseRows(rows,name,imported);
      });
      applyImported(imported);
    };
    const readU16=(v,o)=>v.getUint16(o,true), readU32=(v,o)=>v.getUint32(o,true);
    const unzipStore = async buffer => {
      const bytes=new Uint8Array(buffer), view=new DataView(buffer);
      let eocd=-1;
      for(let i=bytes.length-22;i>=0;i--){ if(readU32(view,i)===0x06054b50){ eocd=i; break; } }
      if(eocd<0) throw new Error('ZIP end record not found');
      const count=readU16(view,eocd+10), cdOffset=readU32(view,eocd+16), files={}; let pos=cdOffset;
      const decoder=new TextDecoder('utf-8');
      for(let i=0;i<count;i++){
        if(readU32(view,pos)!==0x02014b50) throw new Error('Invalid ZIP central directory');
        const method=readU16(view,pos+10), compSize=readU32(view,pos+20), nameLen=readU16(view,pos+28), extraLen=readU16(view,pos+30), commentLen=readU16(view,pos+32), localOffset=readU32(view,pos+42);
        const name=decoder.decode(bytes.slice(pos+46,pos+46+nameLen));
        if(method!==0) throw new Error('Compressed XLSX is not supported by this browser-only restore path');
        const lp=localOffset;
        if(readU32(view,lp)!==0x04034b50) throw new Error('Invalid ZIP local header');
        const localNameLen=readU16(view,lp+26), localExtraLen=readU16(view,lp+28), dataStart=lp+30+localNameLen+localExtraLen;
        files[name]=decoder.decode(bytes.slice(dataStart,dataStart+compSize));
        pos += 46+nameLen+extraLen+commentLen;
      }
      return files;
    };
    const readXlsx = async buffer => {
      const files=await unzipStore(buffer), wbDoc=new DOMParser().parseFromString(files['xl/workbook.xml'],'application/xml'), relDoc=new DOMParser().parseFromString(files['xl/_rels/workbook.xml.rels'],'application/xml');
      const mainNS='http://schemas.openxmlformats.org/spreadsheetml/2006/main', relNS='http://schemas.openxmlformats.org/package/2006/relationships', rNS='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
      const rels={}; [...relDoc.getElementsByTagNameNS(relNS,'Relationship')].forEach(r=>{rels[r.getAttribute('Id')]=r.getAttribute('Target');});
      const imported={};
      [...wbDoc.getElementsByTagNameNS(mainNS,'sheet')].forEach(sheet=>{
        const name=sheet.getAttribute('name'), rid=sheet.getAttributeNS(rNS,'id') || sheet.getAttribute('r:id'), target=rels[rid];
        if(!target) return;
        const path='xl/'+target.replace(/^\//,'');
        const doc=new DOMParser().parseFromString(files[path]||'','application/xml');
        if(doc.querySelector('parsererror')) return;
        const values=[...doc.getElementsByTagNameNS(mainNS,'row')].map(row=>[...row.getElementsByTagNameNS(mainNS,'c')].map(c=>c.getElementsByTagNameNS(mainNS,'t')[0]?.textContent ?? c.textContent ?? ''));
        parseRows(values,name,imported);
      });
      applyImported(imported);
    };
    try {
      if (/\.xlsx$/i.test(file.name)) {
        readXlsx(await file.arrayBuffer());
      } else {
        const reader=new FileReader();
        reader.onload=()=>{ try { readXmlWorkbook(reader.result); } catch(err){ console.error(err); Utils.toast('Invalid Excel backup file','error'); } };
        reader.readAsText(file);
      }
    } catch (err) {
      console.error(err);
      Utils.toast('Invalid or unsupported Excel backup file','error');
    }
  },
  async resetData() { if(!(await Utils.confirm('All local data will be permanently erased. Continue?','Warning!')))return; if(!(await Utils.confirm('This cannot be undone. Are you sure?','Final Confirmation')))return; Storage.resetAll(); Utils.toast('All data erased','info'); setTimeout(()=>location.reload(),700); }
};
window.Settings = Settings;
