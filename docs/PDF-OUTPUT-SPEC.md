# Final Invoice PDF Output

## Required behavior

The supplied blank billing artwork is the master visual design. The motorcycle/logo artwork already present in that template remains fixed; the Profile App Logo is never printed on the invoice.

The invoice uses one consistent renderer for:

- Bill preview inside the app
- Print
- Download PDF

This prevents the previous problem where the preview displayed the template image first and then flowed the entered data underneath it.

## Dynamic fields

Only the following live values are inserted into the template's existing blank/value areas:

- Customer Name
- Customer Contact Number
- Date
- Item Description
- Quantity
- Amount
- Grand Total
- Profile phone/address when changed
- Owner name when changed
- Owner e-signature PNG

## PDF

- A4 portrait PDF
- No external PDF library/CDN is required
- The browser fetches the supplied template as a same-origin Blob URL, renders the complete invoice into a high-resolution canvas, and verifies that the canvas can be encoded before enabling download
- The rendered JPEG is embedded into a self-contained PDF
- The supplied template aspect ratio is preserved when fitted to A4; it is not stretched
- Maximum 8 rows on the supplied one-page template

## Logo rule

The Profile page may store an App Logo for the application UI, but that image is intentionally excluded from the invoice PDF. The motorcycle/logo artwork supplied in the invoice template remains the invoice logo.
