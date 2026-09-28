# 🧾 Siva Sakthi Auto Works — Billing App V10

A professional, offline-first workshop billing application developed with **HTML, CSS and Vanilla JavaScript**, designed to simplify the day-to-day billing process of an automobile workshop.

## 🎯 Project Overview

The application replaces traditional handwritten billing with a simple, fast and user-friendly digital billing system.

It is designed around the actual workflow of the workshop, with a focus on **easy billing, clear UI, stock tracking, professional e-bills and reliable data backup**.

---

## ✨ Key Features

### 🔐 Access & UI
- Common **Access PIN** — no username/password system.
- Responsive design for **desktop, tablet and mobile**.
- Light Mode + Dark Mode.
- Clean, simple and user-friendly interface.

### 🏪 Workshop Profile
- Shop Name
- Owner Name
- Phone Number
- Address
- Application Logo
- Owner Photo
- Owner E-Signature PNG

> **Note:** The Profile Logo is never printed on the invoice. The original motorcycle/logo artwork in the supplied invoice template remains unchanged.

### 👤 Customer & Vehicle
**Mandatory:**
- Customer Name
- Bike Number
- Kilometers

**Optional:**
- Mobile Number
- Bike Model
- Mechanic
- Problem / Complaint
- Delivery Date
- Bill Status

### 🧾 E-Billing
- Quick digital bill creation.
- Manual item/service price entry.
- Quantity management.
- Automatic grand-total calculation.
- No GST section.
- Professional invoice preview.
- A4 PDF generation.
- Print support.

### 🛠️ Tamil Spare Parts & Services
Spare parts and service names can be maintained in **Tamil**, making the billing process easier to understand for workshop users.

### 📦 Stock Management
- Track spare parts and oils.
- Automatically reduce tracked stock when billing.
- Correct stock adjustment when bills are edited.
- Restore stock when bills are deleted.

### 📊 Bill History & Reports
- Bill history.
- Customer history.
- Search and review previous bills.
- Reports for billing activities.

---

## ☁️ Google Sheets Backup

The application optionally supports Google Sheets synchronization using **Google Apps Script**.

```text
Billing App
    ↓
Google Apps Script
    ↓
Google Sheets
