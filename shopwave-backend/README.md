# 🛒 ShopWave — Multi-Vendor E-Commerce Platform
### B.Tech Final Year Major Project | MERN Stack

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, Redux Toolkit |
| Backend | Node.js, Express.js (ES Modules) |
| Database | MongoDB Atlas (Free Tier) |
| Auth | JWT (JSON Web Tokens) |
| Payment | Razorpay (Free Test Mode) |
| Media | Cloudinary (Free Tier) |
| Email | Nodemailer + Gmail SMTP |
| Real-time | Socket.io |
| Charts | Recharts |

---

## 📁 Project Structure

```
shopwave/
├── shopwave-backend/         ← Express API
│   ├── config/               ← DB + Cloudinary config
│   ├── controllers/          ← Business logic
│   ├── middleware/           ← Auth + error handling
│   ├── models/               ← Mongoose schemas
│   ├── routes/               ← API route definitions
│   ├── utils/                ← JWT, email helpers
│   ├── server.js             ← Entry point
│   └── .env.example          ← Environment template
│
└── shopwave-frontend/        ← React App
    ├── src/
    │   ├── api/              ← Axios instance + services
    │   ├── components/       ← Reusable UI components
    │   ├── pages/            ← Route pages
    │   │   ├── auth/         ← Login, Register
    │   │   ├── customer/     ← Account, Order Detail
    │   │   ├── vendor/       ← Vendor Dashboard, Register
    │   │   └── admin/        ← Admin Panel
    │   ├── store/            ← Redux slices
    │   └── App.jsx           ← Routes
    └── index.html
```

---

## ⚙️ Setup Instructions

### 1. Clone & install

```bash
# Backend
cd shopwave-backend
npm install
cp .env.example .env    # Fill in your values

# Frontend
cd shopwave-frontend
npm install
```

### 2. Environment Variables (Backend `.env`)

```
MONGO_URI=mongodb+srv://...      ← MongoDB Atlas (free at mongodb.com/atlas)
JWT_SECRET=any_long_random_string
CLOUDINARY_CLOUD_NAME=...        ← Free at cloudinary.com
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RAZORPAY_KEY_ID=rzp_test_...     ← Free test keys at razorpay.com
RAZORPAY_KEY_SECRET=...
EMAIL_USER=your_gmail@gmail.com  ← Gmail with App Password
EMAIL_PASS=xxxx xxxx xxxx xxxx   ← Gmail App Password (not account password)
```

### 3. Run

```bash
# Backend (terminal 1)
cd shopwave-backend
npm run dev          # Starts on http://localhost:5000

# Frontend (terminal 2)
cd shopwave-frontend
npm run dev          # Starts on http://localhost:5173
```

---

## 🔑 Free API Keys — How to Get Them

### MongoDB Atlas (Database)
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create free account → Create free cluster (M0)
3. Click Connect → Drivers → Copy connection string
4. Replace `<password>` with your DB password

### Cloudinary (Image Storage)
1. Go to [cloudinary.com](https://cloudinary.com) → Sign up free
2. Dashboard shows Cloud Name, API Key, API Secret

### Razorpay (Payments)
1. Go to [razorpay.com](https://razorpay.com) → Sign up
2. Dashboard → Settings → API Keys → Generate Test Keys
3. Use `rzp_test_...` keys (no real money charged)

### Gmail App Password (Email)
1. Google Account → Security → 2-Step Verification (enable)
2. Search "App Passwords" → Generate for Mail
3. Use the 16-char password in EMAIL_PASS

---

## 👥 User Roles

| Role | Access |
|------|--------|
| **Customer** | Browse, search, cart, checkout, orders, wishlist, reviews |
| **Vendor** | All customer access + product management, analytics, order fulfillment |
| **Admin** | Full access + vendor approvals, user management, platform analytics |

---

## 📱 Pages & Features

### Public
- **Home** — Hero, categories, featured products, CTA
- **Products** — Search, filter by category/price/rating, sort, pagination
- **Product Detail** — Images, specs, reviews, add to cart, wishlist
- **Cart** — Quantity control, price summary, shipping calculation

### Auth
- Login / Register (with role selection)
- Forgot/Reset Password via email

### Customer Dashboard
- My Orders (with status tracking)
- Wishlist
- Profile management
- Saved addresses
- Password change

### Vendor Dashboard
- Revenue + orders analytics (bar chart)
- Product management (CRUD)
- Order management (status updates)
- Shop settings

### Admin Panel
- Platform stats (revenue, users, vendors, orders)
- Monthly revenue chart + order status pie chart
- User management (activate/deactivate)
- Vendor approval system
- All orders table

---

## 💳 Payment Flow (Razorpay)

```
1. Customer places order → POST /api/orders
2. Frontend calls POST /api/payment/create-order
3. Razorpay modal opens (UPI/Card/Net Banking)
4. On success → POST /api/payment/verify (signature check)
5. Order status → confirmed, stock decremented
6. Confirmation email sent to customer
```

---

## 🔌 API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile           (protected)

GET    /api/products               (search, filter, paginate)
GET    /api/products/featured
GET    /api/products/:id
POST   /api/products               (vendor)

POST   /api/orders                 (customer)
GET    /api/orders/my-orders       (customer)
GET    /api/orders/vendor-orders   (vendor)
PUT    /api/orders/:id/status      (vendor)

POST   /api/payment/create-order
POST   /api/payment/verify

GET    /api/admin/dashboard        (admin)
PUT    /api/admin/vendors/:id/approve  (admin)

POST   /api/upload/images          (vendor)
```

---

## 🌟 Key Features for Resume

- **Multi-role RBAC** (Customer / Vendor / Admin)
- **Razorpay payment gateway** with signature verification
- **Real-time order updates** via Socket.io
- **Cloudinary image management** for products
- **JWT authentication** with refresh handling
- **Redux state management** with cart persistence
- **Recharts analytics** dashboards
- **React Hook Form** validation
- **Mongoose aggregation pipelines** for analytics
- **Email notifications** via Nodemailer

---

*Built with ❤️ as B.Tech Final Year Project*
