# MediStock — Pharmacy Management Frontend

Modern Next.js 14 frontend for the Supply Chain Management (Pharmacy) backend.

## Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS** (custom design system)
- **Axios** (API client with auth interceptors)
- **react-hot-toast** (toast notifications)
- **lucide-react** (icon library)

## What this app does

| Role | What they can do |
|---|---|
| **Customer** | Browse medicines, add to cart, place orders, view order history |
| **Employee** | View assigned invoices, update invoice status |
| **Admin** | All employee abilities + add/edit medicines + view all customers |

## How to run (step-by-step)

### Prerequisites
- Node.js 18 or later installed (https://nodejs.org/)
- The backend running on `http://localhost:8080`

### Setup steps

**Step 1: Open this folder in VS Code**

Open the folder `scm-pharmacy-frontend` in VS Code.

**Step 2: Open a terminal in VS Code**

`View → Terminal` (or press `` Ctrl+` ``)

**Step 3: Install dependencies (one-time)**

Run this command in the terminal:
```bash
npm install
```

This downloads all required packages (~150MB). Takes 3-10 minutes depending on internet speed. You'll see a `node_modules` folder appear.

**Step 4: Make sure your backend is running**

In a separate terminal (or in IntelliJ), start your Spring Boot backend. It should be running at `http://localhost:8080`.

**Step 5: Start the frontend**

In the VS Code terminal, run:
```bash
npm run dev
```

You'll see:
```
▲ Next.js 14.2.5
- Local:        http://localhost:3000
✓ Ready in 2.1s
```

**Step 6: Open in browser**

Open Chrome/Edge and go to: **http://localhost:3000**

You should see the login page.

### Sample credentials

- **Customer:** `jcustomer` / `password`
- **Employee:** `ttesty` / `testspassword`
- **Admin:** `jchiarella` / `jasonspassword`

Click "Use sample customer/employee credentials" on the login page to auto-fill.

## File structure

```
src/
├── app/
│   ├── login/page.tsx        # Login page
│   ├── dashboard/page.tsx    # Role-based dashboard
│   ├── shop/page.tsx         # Customer: browse medicines
│   ├── cart/page.tsx         # Customer: cart and checkout
│   ├── my-orders/page.tsx    # Customer: order history
│   ├── admin/
│   │   ├── stock/page.tsx        # Admin: manage medicines
│   │   └── customers/page.tsx    # Admin: view customers
│   ├── employee/
│   │   └── invoices/page.tsx     # Employee: fulfill invoices
│   ├── layout.tsx            # Root layout with toaster
│   ├── globals.css           # Tailwind + custom styles
│   └── page.tsx              # Home (redirect)
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx           # Role-based navigation
│   │   ├── PageHeader.tsx        # Reusable page header
│   │   └── ProtectedLayout.tsx   # Auth guard wrapper
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Spinner.tsx
│       └── Empty.tsx
└── lib/
    ├── api.ts                # Axios client + interceptors
    ├── auth.ts               # JWT decode + session
    ├── cart.ts               # Cart localStorage helpers
    ├── types.ts              # TypeScript interfaces
    └── utils.ts              # Helpers (formatPrice, etc.)
```

## How it connects to backend

The frontend reads `NEXT_PUBLIC_API_URL` from `.env.local` (set to `http://localhost:8080`).

All API requests go through `src/lib/api.ts`, which:
- Attaches the JWT token to every request as `Authorization: Bearer <token>`
- Auto-logs out the user if backend returns 401
- Extracts structured error messages from your backend's `ErrorDto` responses

## Troubleshooting

**Problem: `npm install` fails**
- Check Node.js version: `node --version` (must be 18+)
- Delete `node_modules` and `package-lock.json`, try again

**Problem: "Failed to fetch" / CORS error**
- Make sure backend is running on port 8080
- Check `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:8080`

**Problem: Login works but pages show no data**
- Open browser DevTools → Network tab → check the requests
- Look for 401 errors (token expired) or 404 (wrong URL)

**Problem: Port 3000 already in use**
- Run `npm run dev -- -p 3001` to use a different port

## Production build

```bash
npm run build
npm start
```
