import { CartItem } from "@/types/Cart.types";
import { CheckoutSession, ShippingMethod } from "@/types/Checkout.types";

// Mock cart items for cart snapshot
const mockCartItems: CartItem[] = [
  {
    productId: "prod_123",
    sku: "SKU-BLACK-M",
    quantity: 2,
    price: 49.99,
    discountedPrice: 39.99,
    productName: "Classic T-Shirt",
    productImages: [
      "/images/products/tshirt-black-1.jpg",
      "/images/products/tshirt-black-2.jpg",
    ],
    attributes: {
      color: "black",
      size: "M",
    },
    isVariant: true,
  },
  {
    productId: "prod_456",
    sku: "SKU-BLUE-L",
    quantity: 1,
    price: 79.99,
    productName: "Premium Jeans",
    productImages: ["/images/products/jeans-blue-1.jpg"],
    attributes: {
      color: "blue",
      size: "L",
    },
    isVariant: true,
  },
];

// Mock shipping methods
export const mockShippingMethods: ShippingMethod[] = [
  {
    _id: "ship_standard_001",
    name: "Standard Delivery",
    carrier: "USPS",
    description: "Regular shipping with tracking",
    estimatedDays: "5-7 business days",
    price: 5.99,
    isFree: false,
  },
  {
    _id: "ship_express_002",
    name: "Express Delivery",
    carrier: "DHL",
    description: "Fast delivery to your door",
    estimatedDays: "2-3 business days",
    price: 15.99,
    isFree: false,
  },
  {
    _id: "ship_free_003",
    name: "Free Shipping",
    carrier: "Standard Mail",
    description: "Free shipping on orders over $100",
    estimatedDays: "7-10 business days",
    price: 0,
    isFree: true,
  },
];

// Mock checkout session - Initial state (after create-session)
export const mockCheckoutSessionInitial: CheckoutSession = {
  sessionToken: "chk_7f8e9d0a1b2c3d4e5f6a7b8c",
  userId: null, // Guest checkout
  guestEmail: "guest@example.com",
  cartId: "cart_abc123",
  currentStep: "shipping",
  status: "active",
  shippingAddress: null,
  billingAddress: null,
  shippingMethodId: null,
  paymentMethodType: null,
  cartSnapshot: {
    items: mockCartItems,
    subtotal: 179.97, // (49.99 * 2) + 79.99
    totalItems: 3,
  },
  pricing: {
    subtotal: 179.97,
    shippingCost: 0,
    discount: 20.0, // (49.99 - 39.99) * 2
    total: 159.97,
  },
  expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
  completedAt: null,
  orderId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock checkout session - After Step 1 (Shipping Info filled)
export const mockCheckoutSessionAfterShipping: CheckoutSession = {
  ...mockCheckoutSessionInitial,
  currentStep: "shipping_method",
  shippingAddress: {
    firstName: "John",
    lastName: "Doe",
    phone: "+1234567890",
    email: "guest@example.com",
    addressLine1: "123 Main Street",
    addressLine2: "Apt 4B",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "USA",
  },
  billingAddress: {
    firstName: "John",
    lastName: "Doe",
    phone: "+1234567890",
    email: "guest@example.com",
    addressLine1: "123 Main Street",
    addressLine2: "Apt 4B",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "USA",
  },
  updatedAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes later
};

// Mock checkout session - After Step 2 (Shipping Method selected)
export const mockCheckoutSessionAfterShippingMethod: CheckoutSession = {
  ...mockCheckoutSessionAfterShipping,
  currentStep: "payment",
  shippingMethodId: "ship_express_002",
  pricing: {
    subtotal: 179.97,
    shippingCost: 15.99,
    discount: 20.0,
    total: 175.96, // 179.97 - 20.0 + 15.99
  },
  updatedAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes later
};

// Mock checkout session - Completed
export const mockCheckoutSessionCompleted: CheckoutSession = {
  ...mockCheckoutSessionAfterShippingMethod,
  currentStep: "completed",
  status: "completed",
  paymentMethodType: "credit_card",
  orderId: "673e8f9a1b2c3d4e5f6a7b8c",
  completedAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
};

// Mock checkout session - Logged-in user (for comparison)
export const mockCheckoutSessionLoggedIn: CheckoutSession = {
  ...mockCheckoutSessionInitial,
  userId: "user_123456",
  guestEmail: null,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
};
