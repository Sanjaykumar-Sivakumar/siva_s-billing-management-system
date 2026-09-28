# Siva Sakthi Auto Works — Billing App V10

A client-ready, offline-first workshop billing application built with **HTML, CSS and vanilla JavaScript**.

## V10 final requirements covered

- Common **Access PIN** only — no username/password account system.
- Responsive professional UI for desktop, tablet and mobile.
- Light mode + dark mode with readable contrast.
- Workshop Profile for shop name, owner name, phone, address, app logo, owner photo and owner e-signature PNG.
- **Profile logo is never printed on the invoice.** The motorcycle/logo artwork inside the supplied invoice template remains unchanged.
- Customer/bill mandatory fields: **Customer Name, Bike Number and Kilometers**.
- Phone, bike model, mechanic, problem, delivery date and status remain optional.
- Manual item/service price and quantity entry on every bill.
- No GST section.
- Automatic grand-total calculation.
- Stock tracking can be enabled per spare part/oil; saved bills reduce tracked stock and deleted/edited bills restore/apply the correct stock delta.
- Bill history, customer history, reports and search.
- LocalStorage keeps the application usable offline.
- Optional Google Sheets sync through Google Apps Script.
- Excel `.xlsx` backup and restore.
- Supplied invoice template is the visual master for **Preview, PDF and Print**.
- PDF export is **A4 portrait**, keeps the template artwork intact, and overlays only dynamic values.
- PDF preparation is completed before the Download button becomes active, avoiding the previous browser download failure path.
- Print output uses the same template artwork and is fitted to a single A4 portrait page.
- No external PDF library or CDN is required.
- No forced internet connection is required for normal billing/PDF/backup operation.

## Google Sheets setup

1. Create a Google Sheet.
2. Open **Extensions → Apps Script**.
3. Paste `google-apps-script/Code.gs`.
4. Replace `PASTE_YOUR_GOOGLE_SHEET_ID_HERE` with the spreadsheet ID.
5. Deploy as **Web app**.
6. Execute as **Me** and grant the access required by the client-side sync endpoint.
7. Copy the `/exec` URL into **Settings → Google Sheets**.
8. Use **Test Connection**, then **Sync Now**.

## Important security note

The common PIN is a client-side access gate, not server-side authentication. If the Apps Script Web App is public, treat its URL as sensitive and use appropriate Apps Script request validation for production deployments.

## Invoice template

The supplied `docs/Billing Template.pdf` and `assets/billing-template-background.png` are retained in the project. The renderer does not rebuild the invoice as a generic HTML invoice. It places dynamic values over the supplied artwork:

- Customer name
- Customer mobile number
- Date
- Up to 8 line items with quantity and amount
- Grand total
- Owner e-signature
- Profile phone/address/owner name where configured

The app logo uploaded in Profile is intentionally excluded from the invoice.


### V10 PDF export reliability
PDF generation embeds the master invoice artwork directly inside `js/pdf.js`. The export path does not fetch the template from Vercel/CDN, so PDF generation remains available even when asset fetch/CORS/network requests fail.

## V10 Final PDF Data Fix
The PDF engine now normalizes legacy/current invoice data before rendering, recalculates missing totals, supports alternate field names/JSON arrays, and uses the visible invoice preview as a final rendering fallback. This fixes PDFs that previously showed customer/date but omitted line items, amounts, phone number, or grand total.
