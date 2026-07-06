# 🌿 CraveBox — Full-Stack Food Ordering App

A production-ready food ordering platform built with **Next.js 14**, **MongoDB**, **Razorpay**, and **Cloudinary** — fresh white & green design.

---

## ✨ Features

### Customer (User)
- 🍕 Browse menu with category filters and live search
- 🛒 Persistent cart with quantity controls (Zustand + localStorage)
- 🏷️ **Coupon / promo codes** — apply at checkout, server-verified discount
- 🎉 **Offers page** with scrolling deals strip and copyable coupon cards
- ⭐ **Product reviews & ratings** — rate delivered orders, see reviews on items
- 💳 Razorpay online payment OR cash on delivery
- 📦 Order placement with server-side price + coupon verification
- 🔴 Live order tracking with status polling (15s interval)
- 📋 Order history with full details
- 🔐 Auth via email/password (NextAuth.js)
- 🆓 Free delivery above ₹299, auto-calculated tax

### Admin Panel
- 📊 Dashboard with revenue chart, today's orders, live stats
- 📦 Product management: add, edit, delete, toggle availability
- 🖼️ Image upload via Cloudinary with instant preview
- 🏷️ Category management: create, rename, enable/disable
- 🎫 **Coupon management**: create % or flat discounts, usage limits, expiry dates
- 🛍️ Order management: view all orders, advance status in one click
- 👤 Customer list with order count, total spend, enable/disable
- 🚴 Assign delivery agent name + phone to orders
- 📈 7-day revenue bar chart (Recharts)

---

## 🎨 Design

Fresh **white & green** theme — clean, modern, food-tech aesthetic. Color palette:
- Primary: `#16a34a` (green-600)
- Backgrounds: `#f0fdf4` (green-50) and white
- Accents: yellow (ratings), orange (spicy/bestseller tags)

---

## 🏗️ Tech Stack

| Layer       | Tech                              |
|-------------|-----------------------------------|
| Framework   | Next.js 14 (App Router)           |
| Database    | MongoDB + Mongoose                |
| Auth        | NextAuth.js (JWT)                 |
| Payment     | Razorpay                          |
| Images      | Cloudinary                        |
| State       | Zustand (cart)                    |
| Styling     | Tailwind CSS                      |
| Charts      | Recharts                          |
| Hosting     | Vercel + MongoDB Atlas            |

---

## 🚀 Local Setup

### 1. Clone and install

```bash
git clone https://github.com/yourusername/cravebox.git
cd cravebox
npm install
```

### 2. Set environment variables

```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

Required keys:
- `MONGODB_URI` — MongoDB Atlas connection string
- `NEXTAUTH_SECRET` — any random 32+ char string (`openssl rand -base64 32`)
- `NEXTAUTH_URL` — `http://localhost:3000` for dev
- `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` — from Razorpay dashboard
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` — same as KEY_ID (public)
- `CLOUDINARY_CLOUD_NAME` + `CLOUDINARY_API_KEY` + `CLOUDINARY_API_SECRET`
- `ADMIN_EMAIL` — email address that gets admin role on register

### 3. Seed the database

```bash
npx tsx scripts/seed.ts
```

This creates 5 categories, 15 sample products, and 4 starter coupons (WELCOME20, FLAT50, PIZZA30, FREEMAGGI).

### 4. Create admin account

Register at `http://localhost:3000/auth/register` using the email you set in `ADMIN_EMAIL`.

### 5. Run

```bash
npm run dev
# App: http://localhost:3000
# Admin: http://localhost:3000/admin
```

---

## 🌐 Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add all env vars in Vercel dashboard → Project → Settings → Environment Variables.

Make sure `NEXTAUTH_URL` is set to your production URL (e.g. `https://cravebox.vercel.app`).

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Homepage (menu)
│   ├── auth/login/               # Login page
│   ├── auth/register/            # Register page
│   ├── orders/                   # User orders list
│   ├── orders/[id]/              # Order tracking page
│   ├── admin/
│   │   ├── dashboard/            # Admin dashboard + charts
│   │   ├── products/             # Product CRUD
│   │   ├── orders/               # Order management
│   │   ├── categories/           # Category management
│   │   └── customers/            # Customer management
│   └── api/
│       ├── auth/                 # NextAuth + register
│       ├── products/             # Products CRUD
│       ├── categories/           # Categories CRUD
│       ├── orders/               # Orders CRUD
│       ├── payments/             # Razorpay create + verify
│       ├── upload/               # Cloudinary image upload
│       └── admin/                # Stats, user management
├── components/
│   ├── user/                     # Navbar, Hero, MenuSection, CartDrawer
│   ├── admin/                    # AdminSidebar, ProductModal
│   └── shared/                   # Providers
├── lib/
│   └── db.ts                     # MongoDB connection
├── models/
│   └── index.ts                  # User, Category, Product, Order, Review
├── store/
│   └── cartStore.ts              # Zustand cart
├── types/
│   └── next-auth.d.ts            # Session type extensions
└── middleware.ts                 # Route protection
```

---

## 💡 Key Implementation Notes

### Server-side price verification
Prices are always recalculated on the server in `POST /api/orders` — client-sent prices are ignored. This prevents price manipulation.

### Razorpay signature verification
Payment is only marked as `paid` after verifying the HMAC-SHA256 signature in `/api/payments/verify`.

### Admin route protection
`middleware.ts` checks JWT role — non-admin users are redirected from `/admin/*` routes to the homepage.

### Order polling
The tracking page (`/orders/[id]`) polls the server every 15 seconds for status updates. For production, replace with Socket.io for true real-time updates.

---

## 🔮 Roadmap / Extensions

- [ ] OTP phone login (Twilio / MSG91)
- [ ] Push notifications when order status changes
- [ ] Google Maps delivery tracking (Socket.io + driver app)
- [ ] PDF invoice download
- [ ] Multiple store locations

---

Made with ❤️ — Built for learning and real-world deployment.
