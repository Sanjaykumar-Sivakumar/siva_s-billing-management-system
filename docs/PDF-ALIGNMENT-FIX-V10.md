# V10 PDF Alignment Fix

The invoice PDF canvas is rendered at 2x resolution (1536x2304) while the template coordinate system is 768x1152. Earlier builds scaled the canvas coordinates but not the canvas font sizes, causing customer/item/amount/total/owner text to appear too small.

V10 now scales canvas fonts using the actual canvas-to-template scale while preserving the existing template coordinates. This keeps the PDF values aligned with the master invoice artwork and consistent with the HTML preview.
