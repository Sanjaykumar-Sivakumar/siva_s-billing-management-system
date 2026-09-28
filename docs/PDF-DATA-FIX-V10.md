# PDF Data Fix — V10 Final

## Problem fixed
The invoice preview could contain customer/item/amount data while the generated PDF used an incomplete invoice object. This produced PDFs where customer/date appeared but phone, line items, amounts and grand total were blank/zero.

## Fix
The PDF module now normalizes invoice data before Preview/Print/PDF and supports:
- parts / spareParts / spare_parts
- oils / engineOil / engineOils / engine_oil
- labour / labor / labourCharges / labour_charges
- charges / otherCharges / other_charges / miscCharges
- generic items / lineItems / invoiceItems / billItems
- phone / mobile / mobileNumber / contactNo / contact
- customerName / customer.name / name
- grandTotal / grand_total / totalAmount / total
- quantity/qty/litres/liters/volume

If a legacy invoice has no stored grand total, the total is recalculated from normalized line items.

The visible invoice preview is also used as a final fallback source for the PDF renderer, keeping Preview and PDF consistent.

The supplied invoice artwork remains the visual master. The profile logo is never inserted into the invoice.
