/**
 * Siva's Billing App -> Google Sheets bridge
 *
 * 1. Create a Google Sheet.
 * 2. Extensions -> Apps Script.
 * 3. Paste this file into Code.gs.
 * 4. Set SHEET_ID below to the Sheet ID.
 * 5. Deploy -> New deployment -> Web app -> Execute as Me -> Anyone.
 * 6. Copy the /exec URL into Billing App -> Settings -> Google Sheets.
 */
const SHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';
const TAB_HEADERS = {
  Invoices: ['id','invoiceNo','date','createdAt','customerId','customerName','phone','vehicleId','bikeNumber','bikeModel','km','mechanicName','problem','deliveryDate','status','partsJson','oilsJson','labourJson','waterWash','chargesJson','discount','subTotal','grandTotal'],
  Customers: ['id','name','phone','createdAt'],
  Vehicles: ['id','customerId','bikeNumber','bikeModel','createdAt'],
  Stock: ['id','name','trackStock','stockQty','reorderLevel'],
  Oils: ['id','brand','trackStock','stockQty','reorderLevel'],
  SyncLog: ['at','action','id','status','message']
};

function sheet_(name) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) sh.appendRow(TAB_HEADERS[name] || []);
  return sh;
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, service: "Siva's Billing App", time: new Date().toISOString() })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const action = body.action;
    if (action === 'ping') return json_({ ok:true, message:'Connected', time:new Date().toISOString() });
    if (action === 'upsertInvoice') return upsertInvoice_(body.data);
    if (action === 'deleteInvoice') return deleteById_('Invoices', body.data.id);
    if (action === 'upsertCustomer') return upsertObject_('Customers', body.data, ['id','name','phone','createdAt']);
    if (action === 'upsertVehicle') return upsertObject_('Vehicles', body.data, ['id','customerId','bikeNumber','bikeModel','createdAt']);
    if (action === 'upsertStock') return upsertObject_('Stock', body.data, TAB_HEADERS.Stock);
    if (action === 'upsertOil') return upsertObject_('Oils', body.data, TAB_HEADERS.Oils);
    return json_({ ok:false, error:'Unknown action' });
  } catch (err) {
    return json_({ ok:false, error:String(err) });
  }
}

function upsertInvoice_(d) {
  const row = TAB_HEADERS.Invoices.map(k => {
    if (k === 'partsJson') return JSON.stringify(d.parts || []);
    if (k === 'oilsJson') return JSON.stringify(d.oils || []);
    if (k === 'labourJson') return JSON.stringify(d.labour || []);
    if (k === 'chargesJson') return JSON.stringify(d.charges || []);
    return d[k] ?? '';
  });
  upsertRow_('Invoices', d.id, row);
  log_('upsertInvoice', d.id, 'OK', 'Invoice saved');
  return json_({ ok:true });
}

function upsertObject_(sheetName, d, keys) {
  const row = keys.map(k => d[k] ?? '');
  upsertRow_(sheetName, d.id, row);
  log_('upsertObject', d.id, 'OK', sheetName + ' saved');
  return json_({ ok:true });
}

function upsertRow_(sheetName, id, row) {
  const sh = sheet_(sheetName);
  const values = sh.getDataRange().getValues();
  const idCol = 1;
  let target = -1;
  for (let i=1;i<values.length;i++) if (String(values[i][idCol-1]) === String(id)) { target=i+1; break; }
  if (target === -1) sh.appendRow(row); else sh.getRange(target,1,1,row.length).setValues([row]);
}

function deleteById_(sheetName, id) {
  const sh = sheet_(sheetName), values = sh.getDataRange().getValues();
  for (let i=1;i<values.length;i++) if (String(values[i][0]) === String(id)) { sh.deleteRow(i+1); log_('delete',id,'OK',sheetName+' deleted'); return json_({ok:true}); }
  return json_({ok:true, message:'Not found'});
}

function log_(action,id,status,message){ try { sheet_('SyncLog').appendRow([new Date(),action,id,status,message]); } catch(e){} }
function json_(obj){ return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
