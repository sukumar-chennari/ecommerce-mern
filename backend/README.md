# 🚀 Ecommerce Backend API

A high-performance, secure, and scalable Node.js/Express API powering the Ecommerce Ecosystem.

## 📋 Features
- **Robust Authentication**: JWT + Refresh Tokens via HttpOnly cookies.
- **Stripe Integration**: Complete payment lifecycle with secure webhook handling.
- **Real-time Engine**: Socket.io integration for instant user updates.
- **Validation Layer**: Zod-powered request validation.
- **Security Suite**: Helmet, CORS, and Rate Limiting pre-configured.

## 🛠 Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js (TypeScript)
- **Database**: MongoDB (Mongoose ODM)
- **Real-time**: Socket.io
- **Validation**: Zod
- **Documentation**: RESTful API standards

## 🚦 Installation

1. `npm install`
2. Configure `.env` (see `.env.example`)
3. `npm run dev`

## 🧪 Key Technical Patterns
- **Atomic Transactions**: Used for payment success and stock updates.
- **Idempotent Webhooks**: Event-tracking to prevent duplicate processing.
- **Middleware-based Auth**: Granular role-based access control.

---
*For full project documentation, see the [Main README](../README.md)*
