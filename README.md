# 💼 BizTrack — VPS & Business Operations Management Dashboard

[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Dexie.js](https://img.shields.io/badge/IndexedDB-Dexie.js-FFA000)](https://dexie.org/)
[![Netlify Status](https://img.shields.io/badge/Deploy-Netlify-00C7B7?logo=netlify&logoColor=white)](https://www.netlify.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> A modern, high-performance, offline-first business operations and financial tracking ERP built for managing VPS subscriptions, client dues, provider transactions, and automated PDF invoicing.

---

## 🌟 Key Features

### 📊 1. Executive Dashboard & Real-Time Analytics
- **Live Financial KPIs**: Instant tracking of Total Revenue, Total Expenses, Net Profit, and Pending Customer/Vendor Dues.
- **Visual Analytics**: Interactive monthly revenue and expense trends visualized with **Recharts**.
- **Renewal Alerts**: Instant visibility into upcoming and overdue VPS/hosting subscription renewals.

### 💳 2. Sales & Subscription Lifecycle Management
- **Product & Plan Catalog**: Manage server plans (VPS, Dedicated, Cloud Hosting) and recurring add-ons.
- **Subscription Tracking**: Automatic renewal tracking with date-based status flags (Active, Upcoming Renewal, Expired).
- **Multi-channel Payment Tracking**: Split payments across Cash, Bank, and UPI accounts.

### 💰 3. Dues & Accounts Ledger (Receivables & Payables)
- **Credit & Dues Management**: Track outstanding payments from customers and payables to upstream server providers.
- **One-Click Settlements**: Record partial and full settlements with automatic account balance reconciliation.
- **Multi-Account Vault**: Real-time balance management across Cash, Bank, and UPI accounts.

### 📑 4. Instant PDF Invoice Generation
- **Automated Invoicing**: Generate sleek, branded PDF invoices using `jsPDF` and `jspdf-autotable`.
- **Custom Business Details**: Automatically attaches business name, contact info, itemized services, tax/discounts, and payment modes.
- **Download & Share**: One-click client invoice generation directly from the browser.

### 👥 5. Client CRM & Vendor Ledger
- **Customer Directory**: Centralized repository of customer contact details, purchase logs, and active subscriptions.
- **Provider Ledger**: Dedicated provider transaction history for tracking infrastructure costs and supplier payments.

### 🔒 6. Privacy-First & Local Security
- **PIN-based App Lock**: Protect sensitive business numbers and financial data with an integrated secure PIN lock screen.
- **Zero-Cloud Data Leaks**: All records are stored locally on the client's browser via **IndexedDB (Dexie.js)** with full privacy.
- **Backup & Restore**: Easily export and restore the entire database in JSON format.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 6](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Custom Glassmorphism UI |
| **Local Database** | [Dexie.js](https://dexie.org/) (Client-Side IndexedDB Wrapper) |
| **Charts & Visualization** | [Recharts](https://recharts.org/) |
| **PDF Engine** | [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) |
| **Animations & Icons** | [Framer Motion](https://www.framer.com/motion/) + [Lucide React](https://lucide.dev/) |
| **Routing** | [React Router v7](https://reactrouter.com/) |
| **Deployment** | [Netlify](https://www.netlify.com/) / [Vercel](https://vercel.com/) |

---

## 📁 Project Structure

```text
biztrack/
├── public/
│   ├── _redirects          # Netlify SPA redirect rules
│   ├── manifest.json       # PWA web app manifest
│   └── icon.png            # App branding icons
├── src/
│   ├── components/
│   │   ├── layout/         # Sidebar navigation, Header & Layout shell
│   │   └── shared/         # Reusable modals, PIN AppLock, etc.
│   ├── db/
│   │   └── db.ts           # Dexie IndexedDB schemas & initialization
│   ├── hooks/              # Custom React hooks (Live queries, theme, etc.)
│   ├── pages/
│   │   ├── Dashboard.tsx   # Real-time overview & financial charts
│   │   ├── SalesPage.tsx   # Subscription sales & renewals
│   │   ├── DuesPage.tsx    # Customer & vendor credit tracking
│   │   ├── InvoicesPage.tsx# PDF invoice builder & history
│   │   ├── CustomersPage.tsx# Client CRM database
│   │   ├── ProductsPage.tsx# Product/Service catalog
│   │   ├── ExpensesPage.tsx# Business expenses & vendor payouts
│   │   ├── StatsPage.tsx   # Advanced analytics & reporting
│   │   └── SettingsPage.tsx# App PIN lock & Database export/import
│   ├── types/              # TypeScript interface definitions
│   ├── utils/              # PDF generation, currency & date formatters
│   ├── App.tsx             # Route definitions
│   └── main.tsx            # Entry point
├── netlify.toml            # Netlify deployment configuration
├── vite.config.ts          # Vite build configuration
└── package.json            # Project dependencies & scripts
```

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`, `yarn`, or `pnpm`

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/biztrack.git
   cd biztrack
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🌐 Deploy to Netlify

This project is fully pre-configured for automated continuous deployment on **Netlify**.

### Option 1: Deploy via GitHub (Recommended)
1. Push this repository to your **GitHub** account.
2. Go to [Netlify](https://app.netlify.com/) and click **"Add new site" > "Import an existing project"**.
3. Select your GitHub repository.
4. Netlify will automatically detect the settings from `netlify.toml`:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
   - **Node Version:** `20`
5. Click **Deploy Site** — your app is live!

### Option 2: Deploy using Netlify CLI
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

> **Note on Client-Side Routing:** Both `netlify.toml` and `public/_redirects` are already configured with SPA 200 rewrite rules (`/*  /index.html  200`) so that page refreshes on subroutes (like `/sales`, `/dues`, `/invoices`) will never throw 404 errors.

---

## 🔒 Privacy & Data Storage
All data is stored purely inside your browser's local **IndexedDB** instance. No business numbers, client records, or financial statistics are sent to any external server, guaranteeing 100% privacy and zero infrastructure costs.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
