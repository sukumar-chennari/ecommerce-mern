# Project Instructions: E-Commerce MERN Platform

This document provides a comprehensive overview of the E-Commerce platform architecture, tech stack, and implementation standards. It is designed to help any developer or AI model understand the codebase quickly and accurately.

## 1. Project Overview
A full-stack e-commerce application featuring a React-based frontend and a Node.js/Express backend, using MongoDB as the primary database. The platform supports user authentication, product management, shopping cart functionality, secure payments via Stripe, and an admin dashboard for analytics and order management.

---

## 2. Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **State Management**: Redux Toolkit (RTK Query for API fetching)
- **Routing**: React Router 7
- **Styling**: Tailwind CSS 4 (with modern, premium aesthetics)
- **Data Visualization**: Recharts (for admin analytics)

### Backend
- **Environment**: Node.js with TypeScript
- **Framework**: Express (using version 5.1.0)
- **Database**: MongoDB with Mongoose
- **Validation**: Zod (for request body, query, and param validation)
- **Authentication**: JWT (stored in HttpOnly cookies), Bcryptjs for password hashing
- **File Storage**: Cloudinary (via Multer)
- **Payments**: Stripe

---

## 3. Project Structure

```text
ecommerce-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Cloudinary, and Stripe configs
│   │   ├── controllers/     # Request handlers (Standardized API responses)
│   │   ├── middlewares/     # Auth, error handling, upload, and validation
│   │   ├── models/          # Mongoose schemas (User, Product, Order, etc.)
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Business logic (e.g., auth services)
│   │   ├── utils/           # Helper utilities (ApiResponse, JWT, etc.)
│   │   ├── types/           # Custom TypeScript declarations
│   │   ├── server.ts        # Entry point
│   │   └── app.ts           # Express app configuration
├── frontend/
│   ├── ecommerce/
│   │   ├── src/
│   │   │   ├── app/         # Redux store and base API configuration
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── features/    # RTK Query slices and logic (Auth, Cart, Products)
│   │   │   ├── layouts/     # Page layouts (Main, Admin)
│   │   │   ├── pages/       # Page components (Home, Products, Checkout)
│   │   │   ├── routes/      # Frontend routing logic
│   │   │   └── assets/      # Static assets and global styles
```

---

## 4. API Response Standards

All backend controllers MUST use the `ApiResponse` utility for consistency. This ensures the frontend can predictably handle success and error states.

### Standard Response Format
```json
{
  "success": boolean,
  "message": "Human-readable message",
  "data": object | array | null,
  "error": object | null
}
```

### Backend Usage (`src/utils/response.util.ts`)
- `ApiResponse.success(res, message, data, statusCode)`
- `ApiResponse.error(res, message, error, statusCode)`

### Frontend Handling (`transformResponse`)
RTK Query endpoints use `transformResponse` to extract `response.data` so components can access the clean data object directly.

---

## 5. Core Database Models

- **User**: Name, Email, Password (hashed), Role (user/admin).
- **Product**: Name, Slug, Description, Price, Category, Brand, Stock, Images (Cloudinary URLs), Rating/Reviews.
- **Order**: User ID, Items (snapshots of name/price), Shipping Address, Payment Status (Stripe info), Order Status (pending/shipped/delivered).
- **Cart**: User ID, list of items with quantities.
- **Review**: User ID, Product ID, Rating, Comment.
- **Wishlist**: User ID, Product ID.

---

## 6. Implementation Features

### Authentication
- Register/Login/Logout.
- JWT Refresh/Access token flow using secure HttpOnly cookies.
- Role-based access control (RBAC).

### Products & Search
- Advanced filtering (category, brand, price range).
- Pagination and sorting.
- Slug-based product retrieval.

### Order Workflow
1. Add items to **Cart**.
2. **Checkout** creates a pending Order and a **Stripe Session**.
3. User pays via Stripe.
4. **Stripe Webhook** catches `checkout.session.completed`, updates Order status to `paid`, and decrements product stock.

### Admin Dashboard
- Analytics: Revenue growth, Order status breakdown, Top-selling products.
- Product Management: Create/Update/Delete with image upload.
- Order Management: Update shipping tracking and status.

---

## 7. Developer Guidelines

1. **Type Safety**: Always use TypeScript and define interfaces for API responses and component props.
2. **Validation**: Every POST/PUT/PATCH request must have a corresponding **Zod schema** for validation.
3. **Styling**: Maintain the "Premium Aesthetics" (glassmorphism, vibrant gradients, smooth transitions).
4. **Environment Variables**: Use `.env` for sensitive keys like `MONGO_URI`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, and `CLOUDINARY_API_SECRET`.
5. **Standardized Communication**: Use the `ApiResponse` utility for ALL controller returns.
