# 🛒 Modern Full-Stack E-Commerce Ecosystem

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)](https://stripe.com/)

A premium, production-ready e-commerce platform built with the MERN stack, featuring real-time updates, secure payments, and a sophisticated admin management system. This project demonstrates high-level software engineering principles including database transactions, secure authentication, and scalable architecture.

---

## 🌟 Key Features

### 🛍️ Customer Experience
- **Secure Authentication**: JWT-based auth with HttpOnly cookies for maximum security against XSS.
- **Dynamic Product Discovery**: Advanced filtering by category, price, brand, and text search with MongoDB text indices.
- **Seamless Checkout**: Integrated Stripe Checkout for a frictionless and secure payment experience.
- **Real-Time Updates**: Instant order status notifications powered by Socket.io.
- **Persistent Cart & Wishlist**: State-managed user preferences across sessions.
- **Product Reviews**: Comprehensive rating and review system for social proof.

### 🛡️ Admin Dashboard (The Nerve Center)
- **Inventory Management**: Full CRUD capabilities for products with automated slug generation.
- **Order Command Center**: Real-time monitoring of orders, status management (Paid, Shipped, Delivered), and refund handling.
- **Business Insights**: Dashboard analytics for revenue tracking and sales performance.
- **Customer Oversight**: User management and role-based access control.

### ⚙️ Technical Excellence
- **Database Transactions**: Mongoose sessions used in critical payment flows to ensure atomicity and data integrity.
- **Security First**: Implementation of `Helmet.js`, `CORS` whitelisting, and `Express-Rate-Limit` to mitigate common web vulnerabilities.
- **Zod Validation**: Strict schema validation for all API requests ensuring type-safe data handling.
- **RTK Query**: Efficient state management and data fetching with automated caching and invalidation.

---

## 🛠️ Tech Stack

### Backend
- **Node.js & Express**: Scalable server architecture.
- **MongoDB & Mongoose**: NoSQL database with sophisticated schema design and indexing.
- **Socket.io**: Bidirectional real-time communication.
- **Stripe SDK**: Enterprise-grade payment processing.
- **Nodemailer**: Automated email triggers for order confirmations.

### Frontend
- **React 18**: Component-based UI with Modern Hooks.
- **TypeScript**: Typed development for fewer bugs and better documentation.
- **Redux Toolkit & RTK Query**: Powerful state management and server-state synchronization.
- **Tailwind CSS**: Modern, responsive utility-first styling.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB instance
- Stripe Account (for API keys)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ecommerce-platform.git
cd ecommerce-platform
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
CLIENT_URL=http://localhost:5173
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
```
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend/ecommerce
npm install
```
Create a `.env` file in the `frontend/ecommerce` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_pub_key
```
```bash
npm run dev
```

---

## 📐 System Architecture

### Database Schema Overview
- **Users**: Extended profiles with role-based access (User/Admin).
- **Products**: Search-optimized documents with text indices.
- **Orders**: Transactional documents snapshotting product state (price/name) at time of purchase.
- **Notifications**: Persistent logs for real-time delivery fallback.

### Security Implementation
- **Rate Limiting**: Prevent brute-force attacks on auth endpoints.
- **Idempotency**: Webhook handling with `WebhookEvent` tracking to prevent duplicate payment processing.
- **Validation**: 100% API coverage with Zod schemas.

---

## 👨‍💻 Author
**Sukumar Chennari**
- LinkedIn: [linkedin.com/in/sukumar-chennari](https://www.linkedin.com/in/sukumar-chennari/)
- Portfolio: [chennarisukumar.netlify.app](https://chennarisukumar.netlify.app/)

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
