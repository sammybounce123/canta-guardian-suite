# Canta Guardian Suite — Internal Operations Portal

> A comprehensive back-office operations platform for managing cross-border FX transactions, customer onboarding, compliance, and financial operations.

---

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Core Features](#core-features)
- [Transaction on Behalf Workflow](#transaction-on-behalf-workflow)
- [Audit & Compliance](#audit--compliance)
- [Project Structure](#project-structure)

---

## Overview

Canta Guardian Suite is an internal operations portal designed for managing cross-border foreign exchange (FX) transactions, customer lifecycle management, KYC/AML compliance, and financial reporting. The platform enforces strict role-based access control across seven internal roles and provides end-to-end audit logging for all actions.

---

## Technology Stack

| Layer        | Technology                              |
| ------------ | --------------------------------------- |
| Framework    | React 18 + TypeScript                  |
| Build Tool   | Vite                                   |
| Styling      | Tailwind CSS + shadcn/ui               |
| Routing      | React Router v6                        |
| State/Cache  | TanStack React Query                   |
| Charts       | Recharts                               |
| Forms        | React Hook Form + Zod validation       |
| Notifications| Sonner + Radix Toast                   |

---

## Getting Started

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev

# Run tests
npm run test
```

---

## Architecture

```
src/
├── components/       # Shared UI components & layout
│   ├── ui/           # shadcn/ui primitives (button, dialog, table, etc.)
│   ├── AppLayout.tsx  # Authenticated page wrapper
│   ├── AppSidebar.tsx # Role-aware navigation sidebar
│   └── NavLink.tsx    # Active-state nav link
├── contexts/         # React Context providers
│   └── AuthContext.tsx # Authentication, RBAC, permission matrix
├── data/             # Mock data & seed fixtures
│   ├── mockExpenses.ts
│   ├── mockFxRates.ts
│   ├── mockInviteTokens.ts
│   └── onboardingMockData.ts
├── hooks/            # Custom React hooks
├── pages/            # Route-level page components
├── types/            # TypeScript type definitions
└── lib/              # Utility functions
```

---

## Role-Based Access Control (RBAC)

The platform implements a **granular permission matrix** mapping **7 roles** to **14 resources** with **13 distinct actions**.

### Roles

| Role           | Description                                        |
| -------------- | -------------------------------------------------- |
| **Super Admin**| Full system access — structure, config, overrides   |
| **Admin**      | Day-to-day operations — transactions, onboarding   |
| **Sales**      | Customer acquisition, onboarding, act-on-behalf     |
| **Compliance** | KYC/AML review, account freeze/unfreeze, approvals  |
| **Treasury**   | FX rate management, liquidity, virtual accounts      |
| **Support**    | Customer assistance, transaction retries             |
| **Finance**    | Financial reporting, expense management              |

### Resources & Actions

| Resource          | Actions Available                                                  |
| ----------------- | ------------------------------------------------------------------ |
| Dashboard         | `view`                                                             |
| Transactions      | `view`, `create`, `update`, `delete`, `approve`, `act_on_behalf`, `export`, `retry`, `cancel` |
| Customers         | `view`, `create`, `update`, `delete`, `freeze`, `unfreeze`         |
| Rates             | `view`, `create`, `update`, `approve`                              |
| Virtual Accounts  | `view`, `create`, `update`, `delete`                               |
| Approvals         | `view`, `approve`                                                  |
| Audit Logs        | `view`                                                             |
| Settings          | `view`, `update`                                                   |
| Internal Users    | `view`, `create`, `update`, `delete`                               |
| Onboarding        | `view`, `create`, `update`                                         |
| KYC               | `view`, `approve`, `update`, `delete`                              |
| Financial Metrics | `view`                                                             |
| Notifications     | `send_invite`, `send_notification`                                 |
| Reporting         | `view`, `export`                                                   |
| Expenses          | `view`, `create`, `update`, `delete`, `approve`, `export`          |

> **Permission enforcement:** The `useAuth()` hook exposes `hasPermission(resource, action)` and `canAccessRoute(resource)` for component-level gating. The sidebar dynamically filters navigation items based on the current user's role.

---

## Core Features

### 1. Dashboard
Real-time overview of transaction volume, active customers, pending approvals, and key financial metrics.

### 2. Transactions
Full transaction lifecycle management — search, filter by status, paginated list with role-based column visibility. Statuses: `pending`, `completed`, `failed`, `held`, `processing`.

### 3. Customer Onboarding
Multi-step wizard supporting **individual** and **business** customer types:
- Customer type & segment selection
- Contact & identity details
- Document upload (ID, proof of address, CAC/MEMART for businesses)
- KYC verification & invite dispatch (Email/SMS/WhatsApp)
- Duplicate detection & draft saving

### 4. Customer Management
Detailed customer profiles with tabbed views: Overview, Documents, Notes, Activity, and Compliance. Supports account freeze/unfreeze (Compliance role) and tag-based classification.

### 5. FX Rate Management
Live rate table with buy/sell/mid rates. Supports manual overrides with spread calculation, conversion preview, and audit trail of rate changes.

### 6. Virtual Accounts
Provision virtual accounts with automatic name-matching to customer legal profiles. Multi-channel notifications deliver bank instructions.

### 7. Approvals Workflow
High-risk actions and transactions exceeding defined thresholds (≥₦50M) require formal approval from Compliance or Admin roles before execution.

### 8. Expenses
Full expense lifecycle: creation, submission, approval/rejection, and CSV export. Dashboard with category breakdown (PieChart) and monthly trends (BarChart).

### 9. Financial Metrics & Reports
Financial analytics dashboards and exportable reports for Finance and Treasury roles.

### 10. Audit Logs
Immutable activity trail capturing: **actor**, **role**, **action**, **resource**, **timestamp**, **IP address**, and **before/after data states** for every portal action.

---

## Transaction on Behalf Workflow

A secure 10-step wizard enabling authorized staff (Sales, Admin, Super Admin) to initiate FX transactions on behalf of customers.

### Wizard Steps

| Step | Name                  | Description                                                       |
| ---- | --------------------- | ----------------------------------------------------------------- |
| 0    | Customer Verification | Automated KYC check, account freeze status, wallet status         |
| 1    | FX Quote & Rate Lock  | Currency selection, live rate fetch, 60-second rate lock           |
| 2    | Beneficiary Details   | Beneficiary name, bank, account number, country, payment method   |
| 3    | Narration             | Transfer purpose / memo                                           |
| 4    | Customer Consent      | OTP, document upload, or approval link verification               |
| 5    | Virtual Account       | Auto-generated VA for customer funding                            |
| 6    | Funding Detection     | Confirm customer has funded the VA                                |
| 7    | Compliance Review     | Auto-flagging for high-value (≥₦50M) or high-risk corridors (CNY/AED) |
| 8    | Summary & Confirm     | Full transaction summary before execution                         |
| 9    | Completion            | Payout execution (restricted to Treasury/Admin/Super Admin)       |

### Key Safeguards

- **Rate Lock:** 60-second FX rate lock on the quote step. If the user has progressed past step 1, the rate remains valid for the session.
- **Consent:** Mandatory customer consent via one of three methods: OTP, document upload, or approval link.
- **Compliance Flags:** Automatic flagging for transactions ≥₦50M or involving high-risk corridors (CNY, AED).
- **Payout Restriction:** Final payout execution is restricted to Treasury, Admin, and Super Admin roles only.

### Relevant Types

```typescript
type TxOnBehalfStatus =
  | "draft" | "awaiting_consent" | "awaiting_funding"
  | "funded" | "processing" | "sent_to_beneficiary"
  | "completed" | "failed" | "cancelled";

type ConsentMethod = "otp" | "document_upload" | "approval_link";
type PaymentMethod = "bank_transfer" | "wallet" | "card" | "cash";
```

---

## Audit & Compliance

All actions across the portal are logged with the following data points:

| Field      | Description                              |
| ---------- | ---------------------------------------- |
| Actor      | User or system that performed the action |
| Actor Type | `internal_user` or `system`              |
| Action     | e.g. `rate.update`, `customer.kyc_update`|
| Resource   | Target entity ID or reference            |
| Before     | Previous state value                     |
| After      | New state value                          |
| IP Address | Source IP of the action                  |
| Timestamp  | ISO 8601 datetime                        |

Logs are searchable and filterable by action type, and exportable for external audit purposes.

---

## Configuration

### FX Rate Thresholds

```typescript
// src/data/mockFxRates.ts
HIGH_VALUE_THRESHOLD = 50_000_000;  // ₦50M — triggers compliance review
HIGH_RISK_CORRIDORS = ["CNY", "AED"]; // triggers compliance flagging
```

### Supported Currencies

| Currency | Rate (NGN→) | Fee (NGN) |
| -------- | ----------- | --------- |
| GBP      | 0.00052     | ₦2,500    |
| USD      | 0.00065     | ₦2,000    |
| CNY      | 0.00478     | ₦3,000    |
| EUR      | 0.00060     | ₦2,500    |

---

## License

Internal use only — Canta Operations.
