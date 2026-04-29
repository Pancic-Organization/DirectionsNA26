<p align="center">
  <img src="https://github.com/Pancic-Organization.png" alt="Community Logo" width="120" />
</p>

<h1 align="center">DirectionsNA26</h1>

<p align="center">
  <strong>Mobile purchase order management app integrated with Business Central</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.80+-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/Expo%20SDK-54-000020?logo=expo" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript" />
  <img src="https://img.shields.io/badge/Business%20Central-v2.0%20API-0078D4?logo=microsoft" />
</p>

---

## Overview

**DirectionsNA26** is a React Native (Expo SDK 54) mobile application designed for purchase departments to create, manage, and track purchase orders in Microsoft Dynamics 365 Business Central. The app communicates exclusively with BC's standard v2.0 APIs — no custom API pages are required.

Users can:
- Create purchase orders by selecting vendors and line items
- Track order status through the full lifecycle (Draft → Open → Received)
- View posted purchase invoices
- Scan purchase documents for automated order creation (Azure Document Intelligence — coming soon)

## Features

- **Dashboard** — Summary cards with open orders, pending receipts, and total amounts; quick actions for common tasks
- **Purchase Order Management** — Create, edit, delete, and submit purchase orders with multi-line support
- **Vendor & Item Search** — Searchable lists fetched live from Business Central
- **Order Lifecycle** — Status tracking with Receive & Invoice action
- **Posted Invoices** — Browse and search invoiced purchase documents
- **Document Scanning** *(placeholder)* — Future integration with Azure Document Intelligence for automated PO creation from scanned invoices
- **Offline-Ready Auth** — Demo login with persistent session via AsyncStorage
- **Pull-to-Refresh** — Real-time data sync on all list screens

## Tech Stack & Architecture

| Layer | Technology |
|---|---|
| Framework | React Native 0.80+ / Expo SDK 54 |
| Language | TypeScript 5.x |
| Navigation | React Navigation 7 (Bottom Tabs + Native Stack) |
| HTTP Client | Axios |
| Auth | OAuth2 Client Credentials (Entra ID) |
| Storage | @react-native-async-storage/async-storage |
| Icons | react-native-vector-icons (MaterialCommunityIcons) |
| Animations | react-native-reanimated |
| Gestures | react-native-gesture-handler |
| Date Picker | @react-native-community/datetimepicker |

### Project Structure

```
src/
├── config/
│   ├── appConfig.ts          # Real credentials (gitignored)
│   └── appConfig.example.ts  # Placeholder template
├── types/
│   └── index.ts              # All TypeScript interfaces
├── services/
│   └── bcApi.ts              # Centralized BC API service
├── navigation/
│   └── AppNavigator.tsx      # Tab + Stack navigators
├── screens/
│   ├── LoginScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── CreateOrderScreen.tsx
│   ├── OrderListScreen.tsx
│   ├── OrderDetailScreen.tsx
│   ├── EditOrderScreen.tsx
│   ├── ScanDocumentScreen.tsx
│   ├── PostedInvoicesScreen.tsx
│   └── SettingsScreen.tsx
├── components/
│   ├── VendorCard.tsx
│   ├── ItemCard.tsx
│   ├── OrderCard.tsx
│   ├── InvoiceCard.tsx
│   ├── StatusBadge.tsx
│   ├── FormInput.tsx
│   ├── SearchableList.tsx
│   ├── QuantityInput.tsx
│   ├── CurrencyDisplay.tsx
│   ├── EmptyState.tsx
│   ├── LoadingOverlay.tsx
│   ├── SectionHeader.tsx
│   └── ActionButton.tsx
└── theme/
    └── index.ts              # Colors, spacing, typography
```

## Business Central Setup Guide

### 1. Register an Entra ID (Azure AD) Application

1. Go to [Azure Portal](https://portal.azure.com) → **Microsoft Entra ID** → **App registrations** → **New registration**
2. Name: `DirectionsNA26` (or any name)
3. Supported account types: **Single tenant**
4. Click **Register**
5. Note the **Application (client) ID** and **Directory (tenant) ID**
6. Go to **Certificates & secrets** → **New client secret** → copy the secret value

### 2. Configure API Permissions

1. In the app registration → **API permissions** → **Add a permission**
2. Select **Dynamics 365 Business Central**
3. Choose **Application permissions**
4. Add: **API.ReadWrite.All**
5. Click **Grant admin consent** for your tenant

### 3. Enable Standard BC APIs (v2.0)

Ensure the following entities have API pages enabled in your BC environment:

| Entity | API Endpoint | Key Properties |
|---|---|---|
| **Purchase Orders** | `/purchaseOrders` | id, number, orderDate, vendorName, status, totalAmountIncludingTax |
| **Purchase Order Lines** | `/purchaseOrders({id})/purchaseOrderLines` | id, itemId, description, quantity, directUnitCost |
| **Vendors** | `/vendors` | id, number, displayName, addressLine1, city, phoneNumber, email |
| **Items** | `/items` | id, number, displayName, unitPrice, unitCost, inventory, blocked |
| **Purchase Invoices** | `/purchaseInvoices` | id, number, vendorName, totalAmountIncludingTax, postingDate |
| **Units of Measure** | `/unitsOfMeasure` | id, code, displayName |
| **Locations** | `/locations` | id, code, displayName |

These are all standard v2.0 API pages — no custom development is required in BC.

### 4. Authorize the App in Business Central

1. In BC, search for **Microsoft Entra Applications**
2. Add a new entry with the **Client ID** from step 1
3. Assign appropriate permission sets (e.g., `D365 BUS FULL ACCESS` or custom)

## Azure Document Intelligence (Future)

> **Status: Coming Soon — Placeholder UI included**

The app includes a placeholder Document Scan screen that demonstrates the future workflow:

1. **Capture** — Take a photo or select a PDF of a purchase invoice
2. **Extract** — Azure Document Intelligence processes the document using a custom-trained model
3. **Map** — Extracted fields (vendor name, invoice number, line items, quantities, unit costs) are mapped to BC entities
4. **Create** — A purchase order is pre-filled and ready for review

### Planned Configuration

- **Azure Document Intelligence** resource in your Azure subscription
- **Custom model** trained on your purchase invoice formats
- Fields to extract: Vendor Name, Invoice Number, Invoice Date, Line Items (description, quantity, unit cost, amount)
- The model endpoint and API key will be added to `appConfig.ts`

## Local Development Setup

### Prerequisites

- **Node.js** 18+ and npm
- **Expo CLI**: `npm install -g expo-cli`
- **iOS**: macOS with Xcode 15+ and iOS Simulator
- **Android**: Android Studio with an emulator or physical device
- **Expo Go** app on your physical device (optional)

### Getting Started

```bash
# Clone the repository
git clone https://github.com/Pancic-Organization/DirectionsNA26.git
cd DirectionsNA26

# Install dependencies
npm install

# Copy and configure credentials
cp src/config/appConfig.example.ts src/config/appConfig.ts
# Edit src/config/appConfig.ts with your real credentials

# Start the Expo development server
npx expo start

# Run on iOS Simulator
npx expo run:ios

# Run on Android Emulator
npx expo run:android
```

### Configuration

1. Copy `src/config/appConfig.example.ts` to `src/config/appConfig.ts`
2. Fill in your credentials:
   - **Entra ID Client ID** — from your Azure app registration
   - **Entra ID Tenant ID** — your Azure AD tenant
   - **Entra ID Client Secret** — the client secret value
   - **BC Environment** — your Business Central environment name (e.g., `Production`)
   - **BC Company ID** — the GUID of your BC company

### Demo Login

- **Username:** `rishabh.shukla`
- **Password:** `1234`

## Screenshots

> Screenshots will be added after the initial release.

| Dashboard | Create Order | Order Detail |
|---|---|---|
| *Coming soon* | *Coming soon* | *Coming soon* |

| Orders List | Posted Invoices | Document Scan |
|---|---|---|
| *Coming soon* | *Coming soon* | *Coming soon* |

## License

This project is for demonstration and educational purposes as part of the Directions NA 2026 conference.

---

<p align="center">
  Built with ❤️ for <strong>Directions NA 2026</strong>
</p>
