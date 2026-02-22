# Technical Specification & Patterns

This document details the specific implementation patterns and "gotchas" found across the ecommerce-platform codebase.

## 1. Standardized Request Validation (Zod)
We use **Zod** for all request validations. The pattern is to define a schema at the top of the controller or in a separate schema file, then use `safeParse` inside the handler.

### Pattern Example:
```typescript
const createProductSchema = z.object({
  name: z.string().min(3),
  price: z.number().positive(),
  // ...
});

export const handleCreate = async (req, res) => {
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return ApiResponse.error(res, "Validation failed", parsed.error.flatten(), 400);
  }
  // Use parsed.data...
};
```

---

## 2. Cloudinary & Multer Integration
The `upload.middleware.ts` handles image uploads directly to Cloudinary.

**Key Gotcha**: The `multer-storage-cloudinary` package often lacks official types or has export mismatches.
- **Custom Types**: Located in `backend/src/types/multer-storage-cloudinary.d.ts`.
- **Import Pattern**: Must use default import: `import CloudinaryStorage from "multer-storage-cloudinary";`.
- **Usage**:
  ```typescript
  const storage = new CloudinaryStorage({
    cloudinary,
    params: { folder: "..." }
  });
  ```

---

## 3. Stripe Payment Flow
Payments are managed via **Stripe Checkout Sessions**.
- **Frontend**: Calls `createCheckoutSession` with `orderId`.
- **Backend (Controller)**: Creates a Stripe session with `metadata: { orderId }`.
- **Webhook**: Listen for `checkout.session.completed`. 
    - Verify signature using `stripe.webhooks.constructEvent`.
    - Extract `orderId` from metadata.
    - Use a **MongoDB Session (Transaction)** to update Order status and decrement Product stock simultaneously.

---

## 4. State Management (RTK Query)
Frontend uses Redux Toolkit Query for all server communication.

**Configuration**:
- Base API: `src/app/api.ts` defines `baseUrl` and `tagTypes`.
- Endpoints: Injected via `api.injectEndpoints`.
- **Tag Invalidation**: Mutations (like `addToCart`) must invalidate relevant tags (`Cart`) to trigger automatic re-fetching.

---

## 5. Middleware Chain
A typical route follows this sequence:
1. `requireAuth`: Verifies JWT cookie, attaches `userId` to `req`.
2. `requireAdmin`: Checks if `req.user.role === 'admin'`.
3. Handler: Performs validation and business logic.
4. `ApiResponse`: Standardized JSON response.

---

## 6. Development Tips
- **Port**: Backend runs on `5000`, Frontend on `5173`.
- **Database**: Ensure MongoDB is running. The app uses `mongoSession` for transactional operations in the webhook.
- **Node Version**: Recommended `v24+`.
