# Checkout Flow

## Overview

Backend-driven checkout session system that supports both guest and authenticated users with different persistence strategies.

## Flow Diagram

```
Cart Page
  └─> "Proceed to Checkout"
      ├─> Guest: Show modal (Login or Continue as Guest)
      └─> Logged-in: Direct checkout
          │
          └─> POST /api/checkout/create-session
              └─> Returns: sessionToken
                  │
                  └─> Navigate: /checkout?session={token}
                      │
                      ├─> Step 1: Shipping Info
                      │   └─> POST /session/:token/shipping
                      │       └─> Backend: currentStep = 'shipping_method'
                      │
                      ├─> Step 2: Shipping Method
                      │   └─> POST /session/:token/shipping-method
                      │       └─> Backend: currentStep = 'payment'
                      │
                      └─> Step 3: Payment
                          └─> POST /session/:token/payment
                              └─> Backend: Create Order
                                  └─> currentStep = 'completed'
```

## Session Storage

| User Type     | Storage     | TTL    | Resume |
| ------------- | ----------- | ------ | ------ |
| **Guest**     | Cache/Redis | 30 min | ❌ No  |
| **Logged-in** | MongoDB     | 7 days | ✅ Yes |

## Key Points

- **Backend controls state:** Frontend renders based on `currentStep` from server
- **Progressive steps:** Each step updates session and advances `currentStep`
- **Guest limitation:** If guest leaves, session expires (no resume)
- **Logged-in benefit:** Can resume incomplete checkouts from profile page
- **Session token:** Used in URL to identify checkout session

## CheckoutSession Model

Full session model that gets progressively filled as user completes each step.

### Initial State (After `create-session`)

```typescript
{
  sessionToken: "chk_7f8e9d0a1b2c3d4e",
  userId: "user_123" | null,              // null for guest
  guestEmail: "guest@example.com" | null,  // only for guest
  cartId: "cart_abc123",

  // Session State
  currentStep: "shipping",                 // Initial step
  status: "active",

  // Step Data (empty initially)
  shippingAddress: null,                   // ← Filled in Step 1
  billingAddress: null,                    // ← Filled in Step 1
  shippingMethodId: null,                 // ← Filled in Step 2
  paymentMethodType: null,                 // ← Filled in Step 3

  // Cart Snapshot (filled at creation - immutable)
  cartSnapshot: {
    items: [...],
    subtotal: 150.00,
    totalItems: 3
  },

  // Pricing (updated progressively)
  pricing: {
    subtotal: 150.00,                      // From cartSnapshot
    shippingCost: 0,                       // ← Updated in Step 2
    discount: 0,
    total: 150.00                          // ← Updated in Step 2
  },

  // Metadata
  expiresAt: "2024-11-22T15:30:00Z",
  completedAt: null,                       // ← Set when order created
  orderId: null                            // ← Set when order created

  createdAt: "2024-11-22T15:00:00Z",
  updatedAt: "2024-11-22T15:00:00Z"
}
```

### After Step 1 (Shipping Info)

```typescript
{
  // ... same fields ...
  currentStep: "shipping_method",          // ← Updated
  shippingAddress: { ... },                // ← Filled
  billingAddress: { ... },                  // ← Filled
  updatedAt: "2024-11-22T15:05:00Z"       // ← Updated
}
```

### After Step 2 (Shipping Method)

```typescript
{
  // ... same fields ...
  currentStep: "payment",                  // ← Updated
  shippingMethodId: "ship_express_123",   // ← Filled
  pricing: {
    subtotal: 150.00,
    shippingCost: 15.00,                   // ← Updated
    discount: 0,
    total: 165.00                          // ← Updated
  },
  updatedAt: "2024-11-22T15:10:00Z"       // ← Updated
}
```

### After Step 3 (Payment - Completed)

```typescript
{
  // ... same fields ...
  currentStep: "completed",               // ← Updated
  status: "completed",                      // ← Updated
  paymentMethodType: "credit_card",        // ← Filled
  orderId: "673e8f9a1b2c3d4e5f6a7b8c",    // ← Filled
  completedAt: "2024-11-22T15:15:00Z",    // ← Filled
  updatedAt: "2024-11-22T15:15:00Z"       // ← Updated
}
```

**Note:** Fields marked with `←` are the ones that get updated/filled in that step.

## Step 1: Shipping Information

### Data Model

**Shipping Address:**

- `firstName` (required)
- `lastName` (required)
- `phone` (required)
- `email` (optional - guest already provided, logged-in from user)
- `addressLine1` (required)
- `addressLine2` (optional - Apt, Suite, etc.)
- `city` (required)
- `state` (required)
- `postalCode` (required)
- `country` (required)

**Billing Address:**

- Same structure as shipping address
- Optional if `billingIsSameAsShipping = true`

**Request Payload:**

```json
{
  "shippingAddress": { ... },
  "billingAddress": { ... },  // Optional
  "billingIsSameAsShipping": true
}
```

## Step 2: Shipping Method

### Data Model

**Shipping Method Object:**

- `_id` (required)
- `name` (required) - e.g., "Express Delivery"
- `carrier` (required) - e.g., "DHL", "FedEx", "UPS"
- `description` (optional)
- `estimatedDays` (required) - e.g., "2-3 business days"
- `price` (required)
- `isFree` (required) - boolean

**Request Payload:**

```json
{
  "shippingMethodId": "ship_express_123"
}
```

**Response (from GET session):**
Backend returns `availableShippingMethods` array when `currentStep = 'shipping_method'`

## Step 3: Payment

### Data Model

**Payment Method Types:**

- `credit_card` - Credit/Debit card payment
- `bank_transfer` - Bank transfer / Wire transfer
- `cash_on_delivery` - Cash on delivery

**Request Payload:**

```json
{
  "paymentMethodType": "credit_card",
  "paymentToken": "tok_visa_4242", // From payment gateway (Stripe, etc.)
  "notes": "Please ring the doorbell" // Optional order notes
}
```

**For Credit Card:**

- Frontend integrates with payment gateway (Stripe, iyzico, etc.)
- Payment gateway returns `paymentToken`
- Token is sent to backend for processing

**For Bank Transfer:**

- No paymentToken needed
- Backend creates order with `paymentStatus = 'pending'`
- User receives bank account details via email

**For Cash on Delivery:**

- No paymentToken needed
- Backend creates order with `paymentStatus = 'pending'`

**Response:**

```json
{
  "success": true,
  "data": {
    "orderId": "673e8f9a1b2c3d4e5f6a7b8c",
    "orderNumber": "GR-2024-00123"
  }
}
```

## API Endpoints

1. `POST /api/checkout/create-session` - Create new session
2. `GET /api/checkout/session/:token` - Get session data
3. `POST /api/checkout/session/:token/shipping` - Update address
4. `POST /api/checkout/session/:token/shipping-method` - Select carrier
5. `POST /api/checkout/session/:token/payment` - Complete payment
6. `GET /api/checkout/incomplete` - Get user's incomplete sessions (logged-in only)
