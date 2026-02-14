/**
 * @sdods/payments - Universal Payment Types
 * 
 * Following industry standards:
 * - ISO 4217 for currency codes
 * - ISO 3166-1 for country codes
 * - PCI DSS compliance patterns
 */

// ============================================================
// CURRENCY & MONEY
// ============================================================

/** ISO 4217 Currency Codes */
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'INR' | string;

/** Money representation (always in smallest unit, e.g., cents) */
export interface Money {
  /** Amount in smallest currency unit (e.g., cents for USD) */
  amount: number;
  /** ISO 4217 currency code */
  currency: CurrencyCode;
}

// ============================================================
// CUSTOMER
// ============================================================

export interface Customer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
  createdAt: Date;
  /** Provider-specific customer ID */
  providerId?: string;
}

export interface CreateCustomerInput {
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
}

// ============================================================
// PAYMENT METHOD
// ============================================================

export type PaymentMethodType = 
  | 'card'
  | 'bank_transfer'
  | 'wallet'
  | 'bnpl' // Buy Now Pay Later
  | 'crypto'
  | 'other';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  customerId: string;
  isDefault: boolean;
  /** Last 4 digits for cards */
  last4?: string;
  /** Card brand (visa, mastercard, etc.) */
  brand?: string;
  /** Expiry month (1-12) */
  expiryMonth?: number;
  /** Expiry year (4 digits) */
  expiryYear?: number;
  metadata?: Record<string, string>;
  providerId?: string;
}

export interface AttachPaymentMethodInput {
  customerId: string;
  /** Provider-specific payment method token */
  paymentMethodToken: string;
  setAsDefault?: boolean;
}

// ============================================================
// PAYMENT INTENT / CHARGE
// ============================================================

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'requires_action'
  | 'requires_payment_method'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'refunded'
  | 'partially_refunded';

export interface PaymentIntent {
  id: string;
  amount: Money;
  status: PaymentStatus;
  customerId?: string;
  paymentMethodId?: string;
  description?: string;
  metadata?: Record<string, string>;
  /** Client secret for frontend confirmation */
  clientSecret?: string;
  /** URL for 3D Secure or redirect flows */
  nextActionUrl?: string;
  createdAt: Date;
  providerId?: string;
}

export interface CreatePaymentIntentInput {
  amount: Money;
  customerId?: string;
  paymentMethodId?: string;
  description?: string;
  metadata?: Record<string, string>;
  /** Auto-confirm the payment */
  confirm?: boolean;
  /** Return URL after 3DS/redirect */
  returnUrl?: string;
  /** Capture method: automatic or manual */
  captureMethod?: 'automatic' | 'manual';
}

export interface ConfirmPaymentInput {
  paymentIntentId: string;
  paymentMethodId?: string;
  returnUrl?: string;
}

// ============================================================
// SUBSCRIPTION
// ============================================================

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'paused'
  | 'canceled'
  | 'unpaid'
  | 'incomplete';

export type BillingInterval = 'day' | 'week' | 'month' | 'year';

export interface Price {
  id: string;
  productId: string;
  amount: Money;
  interval: BillingInterval;
  intervalCount: number;
  trialDays?: number;
  metadata?: Record<string, string>;
  providerId?: string;
}

export interface Subscription {
  id: string;
  customerId: string;
  priceId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  metadata?: Record<string, string>;
  providerId?: string;
}

export interface CreateSubscriptionInput {
  customerId: string;
  priceId: string;
  paymentMethodId?: string;
  trialDays?: number;
  metadata?: Record<string, string>;
  /** Promo/coupon code */
  couponCode?: string;
}

export interface UpdateSubscriptionInput {
  subscriptionId: string;
  priceId?: string;
  cancelAtPeriodEnd?: boolean;
  metadata?: Record<string, string>;
}

// ============================================================
// REFUND
// ============================================================

export type RefundStatus = 'pending' | 'succeeded' | 'failed' | 'canceled';

export interface Refund {
  id: string;
  paymentIntentId: string;
  amount: Money;
  status: RefundStatus;
  reason?: string;
  createdAt: Date;
  providerId?: string;
}

export interface CreateRefundInput {
  paymentIntentId: string;
  /** Amount to refund (defaults to full amount) */
  amount?: Money;
  reason?: string;
  metadata?: Record<string, string>;
}

// ============================================================
// INVOICE
// ============================================================

export type InvoiceStatus = 
  | 'draft'
  | 'open'
  | 'paid'
  | 'void'
  | 'uncollectible';

export interface InvoiceLineItem {
  id: string;
  description: string;
  amount: Money;
  quantity: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  subscriptionId?: string;
  status: InvoiceStatus;
  amount: Money;
  amountPaid: Money;
  amountDue: Money;
  lineItems: InvoiceLineItem[];
  dueDate?: Date;
  paidAt?: Date;
  hostedInvoiceUrl?: string;
  pdfUrl?: string;
  createdAt: Date;
  providerId?: string;
}

// ============================================================
// WEBHOOK
// ============================================================

export type WebhookEventType =
  | 'payment.succeeded'
  | 'payment.failed'
  | 'payment.refunded'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.canceled'
  | 'subscription.trial_ending'
  | 'invoice.paid'
  | 'invoice.payment_failed'
  | 'customer.created'
  | 'customer.updated'
  | 'customer.deleted';

export interface WebhookEvent<T = unknown> {
  id: string;
  type: WebhookEventType;
  data: T;
  createdAt: Date;
  /** Raw provider event for advanced use cases */
  rawEvent?: unknown;
}

export interface WebhookVerifyInput {
  payload: string | Buffer;
  signature: string;
  secret: string;
}

// ============================================================
// CHECKOUT SESSION (Hosted Checkout)
// ============================================================

export type CheckoutMode = 'payment' | 'subscription' | 'setup';

export interface CheckoutLineItem {
  priceId?: string;
  /** For one-time items without a price ID */
  name?: string;
  amount?: Money;
  quantity: number;
}

export interface CreateCheckoutSessionInput {
  mode: CheckoutMode;
  customerId?: string;
  customerEmail?: string;
  lineItems: CheckoutLineItem[];
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  /** Allow promo codes */
  allowPromoCodes?: boolean;
  /** Collect billing address */
  collectBillingAddress?: boolean;
  /** Collect shipping address */
  collectShippingAddress?: boolean;
}

export interface CheckoutSession {
  id: string;
  url: string;
  status: 'open' | 'complete' | 'expired';
  customerId?: string;
  paymentIntentId?: string;
  subscriptionId?: string;
  metadata?: Record<string, string>;
  expiresAt: Date;
  providerId?: string;
}

// ============================================================
// PROVIDER RESULT WRAPPER
// ============================================================

export interface PaymentResult<T> {
  success: boolean;
  data?: T;
  error?: PaymentError;
}

export interface PaymentError {
  code: string;
  message: string;
  /** Provider-specific error details */
  providerError?: unknown;
  /** Retriable error */
  retriable?: boolean;
}
