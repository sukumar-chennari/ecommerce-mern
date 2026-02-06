# Project Constructor Documentation

This document outlines the architecture, folder structure, and key constructor patterns used in this full-stack e-commerce platform.

## 📁 Project Structure

```
ecommerce-platform/
├── backend/                    # Express.js + MongoDB backend
│   ├── src/
│   │   ├── app.ts             # Express app configuration
│   │   ├── server.ts          # Server entry point
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route handlers
│   │   ├── middlewares/       # Express middlewares
│   │   ├── models/            # MongoDB schemas
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   └── utils/             # Utility functions
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/ecommerce/        # React + Redux + Vite frontend
    ├── src/
    │   ├── app/               # Redux store & API
    │   ├── components/        # React components
    │   ├── features/          # Feature-based modules
    │   ├── App.tsx
    │   └── main.tsx
    ├── public/
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```

---

## 🏗️ Backend Architecture

### App Constructor (backend/src/app.ts)

The Express application is initialized with:

- **CORS Configuration**: Allows frontend at `http://localhost:5173`
- **Cookie Parser**: For JWT token management
- **JSON Parser**: For request body parsing
- **Webhook Handler**: Raw body parser for Stripe webhooks

```typescript
// Key middleware setup
app.use(cors({ origin, credentials: true }));
app.use(cookieParser());
app.use(express.json());
```

### Server Constructor (backend/src/server.ts)

Manages application startup:

1. **MongoDB Connection**: Connects to MongoDB using Mongoose
2. **Port Binding**: Listens on `process.env.PORT` (default: 5000)
3. **Error Handling**: Graceful error handling on startup

### Database Models

#### User Model (backend/src/models/User.model.ts)
- Fields: `name`, `email`, `password`, `role` (user/admin)
- Unique email constraint
- Timestamps tracking

#### Product Model (backend/src/models/Product.model.ts)
- Fields: `name`, `description`, `price`, `category`, `brand`, `stock`, `images`, `slug`
- Text indexing for search
- Auto-slug generation on save
- Rating and review tracking

#### Order Model (backend/src/models/Order.model.ts)
- Snapshot-based items (immutable product data)
- Status lifecycle: `pending` → `paid` → `shipped` → `delivered`
- Shipping address and payment metadata
- Timeline tracking for order progression

#### Cart Model (backend/src/models/Cart.model.ts)
- One cart per user (unique index on `userId`)
- Items array with `productId` and `quantity`
- Timestamps for tracking

#### Review Model (backend/src/models/Review.model.ts)
- Fields: `userId`, `productId`, `orderId`, `rating`, `comment`
- Unique constraint: one review per user per product
- Triggers product rating recalculation

#### Wishlist Model (backend/src/models/Wishlist.model.ts)
- Fields: `userId`, `productId`
- Unique constraint: prevent duplicate wishlist items

### Controllers (Business Logic)

| Controller | Responsibility |
|-----------|-----------------|
| auth.controller.ts | Register, login, logout, token refresh |
| product.controller.ts | Product listing, filtering, search |
| cart.controller.ts | Cart CRUD operations |
| order.controller.ts | Order creation, user orders, order details |
| stripe.controller.ts | Stripe checkout session creation |
| webhook.controller.ts | Stripe webhook handling & order payment |
| review.controller.ts | Review creation with purchase validation |
| wishlist.controller.ts | Wishlist management |
| adminProduct.controller.ts | Admin product CRUD with Cloudinary upload |
| adminOrder.controller.ts | Admin order status updates |
| adminAnalytics.controller.ts | Revenue & order analytics |

### Middleware Stack

| Middleware | Purpose |
|-----------|---------|
| auth.middleware.ts | JWT verification & user extraction |
| role.middleware.ts | Admin role verification |
| upload.middleware.ts | Cloudinary file upload via Multer |

### Routes Structure

```
/api/auth/          → Authentication (register, login, logout, refresh, me)
/api/products/      → Product listing & details
/api/cart/          → Cart management
/api/orders/        → Order operations
/api/stripe/        → Stripe checkout sessions
/api/reviews/       → Product reviews
/api/wishlist/      → Wishlist management
/api/admin/products → Admin product management
/api/admin/analytics → Admin analytics endpoints
/webhook            → Stripe webhook receiver
```

### Authentication Flow

1. **Registration**: Hash password with bcrypt, create user
2. **Login**: Verify credentials, generate JWT tokens
3. **Tokens**: 
   - `accessToken`: 15 minutes (httpOnly cookie)
   - `refreshToken`: 7 days (httpOnly cookie)
4. **Middleware**: `requireAuth` extracts userId from token
5. **Role Check**: `requireAdmin` validates admin role

### Payment Flow

1. User creates order (status: `pending`)
2. Frontend requests checkout session from Stripe
3. User completes payment on Stripe
4. Stripe webhook updates order to `paid`
5. Stock decrements automatically
6. Order ready for fulfillment

---

## 🎨 Frontend Architecture

### Redux Store (frontend/ecommerce/src/app/store.ts)

Central state management using Redux Toolkit:

```typescript
{
  api: RTK Query reducer,        // API caching
  auth: authReducer              // User authentication state
}
```

### RTK Query API (frontend/ecommerce/src/app/api.ts)

- **Base URL**: `http://localhost:5000/api`
- **Credentials**: Cookies enabled for JWT transmission
- **Tag Types**: Auth, Product, Cart, Order, Admin, Analytics

### Auth Feature (frontend/ecommerce/src/features/auth/)

#### Auth Slice (authSlice.ts)
Redux slice managing:
- `user`: Current user object or null
- `isAuthenticated`: Boolean flag

Actions: `setUser()`, `clearUser()`

#### Auth API (authApi.ts)
RTK Query endpoints:
- `useLoginMutation`: POST /auth/login
- `useLogoutMutation`: POST /auth/logout
- `useGetMeQuery`: GET /auth/me

#### Protected Route (ProtectedRoute.tsx)
HOC wrapper that:
- Checks `isAuthenticated` from Redux
- Redirects to `/login` if not authenticated
- Renders children if authenticated

### UI Components

#### Input Component (frontend/ecommerce/src/components/ui/Input.tsx)
Styled input with Tailwind:
- Border styling
- Focus ring effect
- Full width by default

#### Card Component (frontend/ecommerce/src/components/ui/Card.tsx)
Container component:
- Rounded corners
- Shadow effect
- Padding

#### Button Component (frontend/ecommerce/src/components/ui/Button.tsx)
Reusable button with variants:
- **primary**: Blue background
- **secondary**: Slate background
- **danger**: Red background

### Build Configuration

#### Vite (vite.config.ts)
- React plugin for Fast Refresh
- Tailwind CSS v4 integration

#### TypeScript (tsconfig.app.json)
- Target: ES2022
- Strict mode enabled
- JSX: react-jsx

#### Tailwind (tailwind.config.js)
- Content paths configured for all src files
- Theme extensions available

---

## 🔌 Key Integrations

### Cloudinary (Image Upload)
- Config: backend/src/config/cloudinary.ts
- Middleware: backend/src/middlewares/upload.middleware.ts
- Utility: backend/src/utils/cloudinary.util.ts

### Stripe Payment
- Checkout: stripe.controller.ts
- Webhooks: webhook.controller.ts
- Route: stripe.routes.ts

### JWT Authentication
- Token generation: backend/src/utils/jwt.ts
- Password hashing: backend/src/services/auth.service.ts

---

## 📝 Environment Variables

### Backend (.env)
```
MONGO_URI=mongodb://...
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLIENT_URL=http://localhost:5173
PORT=5000
```

---

## 🚀 Development Workflow

### Backend
```bash
cd backend
npm install
npm run dev          # Starts with nodemon on port 5000
```

### Frontend
```bash
cd frontend/ecommerce
npm install
npm run dev          # Starts Vite dev server on port 5173
```

---

## 📊 Data Flow

### User Registration → Authentication → Protected Routes
1. User submits registration form
2. Backend hashes password, creates user
3. User logs in (JWT tokens in cookies)
4. Frontend stores user state in Redux
5. `ProtectedRoute` component checks authentication
6. Authenticated routes render protected content

### Product Purchase Flow
1. User adds products to cart
2. Creates order from cart (status: pending)
3. Requests Stripe checkout session
4. Completes payment on Stripe
5. Webhook updates order to paid
6. Stock decrements automatically
7. Order available for tracking

---

## 🔐 Security Features

- **JWT Tokens**: HTTPOnly cookies (inaccessible to XSS)
- **CORS**: Restricted to frontend origin
- **Password Hashing**: bcryptjs with salt rounds
- **Webhook Verification**: Stripe signature validation
- **Idempotency**: Webhook event deduplication
- **Role-Based Access**: Admin middleware on sensitive routes

---

## 📦 Dependencies Overview

### Backend
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT handling
- **bcryptjs**: Password hashing
- **stripe**: Payment processing
- **cloudinary**: Image CDN
- **multer**: File uploads

### Frontend
- **react**: UI library
- **redux-toolkit**: State management
- **@reduxjs/toolkit/query**: API caching
- **react-router-dom**: Client routing
- **tailwindcss**: Utility CSS
- **vite**: Build tool

---

## 📋 Next Steps for Contributors

1. Review the architecture in this file
2. Understand the folder structure
3. Follow the naming conventions used
4. Maintain the separation of concerns (models, controllers, services)
5. Add new features in the appropriate directories
6. Update this document when adding major features
