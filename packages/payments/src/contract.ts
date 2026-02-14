/**
 * @sdods/payments - Payment Provider Contract
 * 
 * Universal interface that all payment providers must implement.
 * Enables seamless switching between Stripe, PayPal, Adyen, etc.
 */

import type {
  Customer,
  CreateCustomerInput,
  PaymentMethod,
  AttachPaymentMethodInput,
  PaymentIntent,
  CreatePaymentIntentInput,
  ConfirmPaymentInput,
  Subscription,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  Refund,
  CreateRefundInput,
  Invoice,
  Price,
  CheckoutSession,
  CreateCheckoutSessionInput,
  WebhookEvent,
  WebhookVerifyInput,
  PaymentResult,
} from './types';

// ============================================================
// PAYMENT PROVIDER CONTRACT
// ============================================================

/**
 * Universal Payment Provider Interface
 * 
 * All payment providers (Stripe, PayPal, etc.) must implement this contract.
 * This ensures consistent behavior across different payment backends.
 */
export interface PaymentProvider {
  /** Provider identifier (e.g., 'stripe', 'paypal') */
  readonly name: string;
  
  /** Whether the provider is properly configured */
  readonly isConfigured: boolean;

  // ──────────────────────────────────────────────────────────
  // CUSTOMERS
  // ──────────────────────────────────────────────────────────
  
  /** Create a new customer */
  createCustomer(input: CreateCustomerInput): Promise<PaymentResult<Customer>>;
  
  /** Get customer by ID */
  getCustomer(customerId: string): Promise<PaymentResult<Customer>>;
  
  /** Update customer */
  updateCustomer(customerId: string, input: Partial<CreateCustomerInput>): Promise<PaymentResult<Customer>>;
  
  /** Delete customer */
  deleteCustomer(customerId: string): Promise<PaymentResult<void>>;
  
  /** Get customer by provider ID (e.g., Stripe customer ID) */
  getCustomerByProviderId?(providerId: string): Promise<PaymentResult<Customer>>;

  // ──────────────────────────────────────────────────────────
  // PAYMENT METHODS
  // ──────────────────────────────────────────────────────────
  
  /** Attach a payment method to a customer */
  attachPaymentMethod(input: AttachPaymentMethodInput): Promise<PaymentResult<PaymentMethod>>;
  
  /** List payment methods for a customer */
  listPaymentMethods(customerId: string): Promise<PaymentResult<PaymentMethod[]>>;
  
  /** Detach/remove a payment method */
  detachPaymentMethod(paymentMethodId: string): Promise<PaymentResult<void>>;
  
  /** Set default payment method for a customer */
  setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<PaymentResult<void>>;

  // ──────────────────────────────────────────────────────────
  // PAYMENTS (One-time)
  // ──────────────────────────────────────────────────────────
  
  /** Create a payment intent */
  createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentResult<PaymentIntent>>;
  
  /** Get payment intent by ID */
  getPaymentIntent(paymentIntentId: string): Promise<PaymentResult<PaymentIntent>>;
  
  /** Confirm a payment intent */
  confirmPayment(input: ConfirmPaymentInput): Promise<PaymentResult<PaymentIntent>>;
  
  /** Cancel a payment intent */
  cancelPayment(paymentIntentId: string): Promise<PaymentResult<PaymentIntent>>;
  
  /** Capture a previously authorized payment */
  capturePayment(paymentIntentId: string, amount?: number): Promise<PaymentResult<PaymentIntent>>;

  // ──────────────────────────────────────────────────────────
  // SUBSCRIPTIONS
  // ──────────────────────────────────────────────────────────
  
  /** Create a subscription */
  createSubscription(input: CreateSubscriptionInput): Promise<PaymentResult<Subscription>>;
  
  /** Get subscription by ID */
  getSubscription(subscriptionId: string): Promise<PaymentResult<Subscription>>;
  
  /** Update subscription */
  updateSubscription(input: UpdateSubscriptionInput): Promise<PaymentResult<Subscription>>;
  
  /** Cancel subscription */
  cancelSubscription(subscriptionId: string, immediately?: boolean): Promise<PaymentResult<Subscription>>;
  
  /** Pause subscription (if supported) */
  pauseSubscription?(subscriptionId: string): Promise<PaymentResult<Subscription>>;
  
  /** Resume subscription (if supported) */
  resumeSubscription?(subscriptionId: string): Promise<PaymentResult<Subscription>>;
  
  /** List subscriptions for a customer */
  listSubscriptions(customerId: string): Promise<PaymentResult<Subscription[]>>;

  // ──────────────────────────────────────────────────────────
  // REFUNDS
  // ──────────────────────────────────────────────────────────
  
  /** Create a refund */
  createRefund(input: CreateRefundInput): Promise<PaymentResult<Refund>>;
  
  /** Get refund by ID */
  getRefund(refundId: string): Promise<PaymentResult<Refund>>;
  
  /** List refunds for a payment */
  listRefunds(paymentIntentId: string): Promise<PaymentResult<Refund[]>>;

  // ──────────────────────────────────────────────────────────
  // INVOICES
  // ──────────────────────────────────────────────────────────
  
  /** Get invoice by ID */
  getInvoice(invoiceId: string): Promise<PaymentResult<Invoice>>;
  
  /** List invoices for a customer */
  listInvoices(customerId: string): Promise<PaymentResult<Invoice[]>>;
  
  /** Get upcoming invoice (preview) */
  getUpcomingInvoice?(customerId: string, subscriptionId?: string): Promise<PaymentResult<Invoice>>;

  // ──────────────────────────────────────────────────────────
  // PRICES / PRODUCTS
  // ──────────────────────────────────────────────────────────
  
  /** Get price by ID */
  getPrice(priceId: string): Promise<PaymentResult<Price>>;
  
  /** List prices for a product */
  listPrices(productId?: string): Promise<PaymentResult<Price[]>>;

  // ──────────────────────────────────────────────────────────
  // CHECKOUT (Hosted)
  // ──────────────────────────────────────────────────────────
  
  /** Create a hosted checkout session */
  createCheckoutSession(input: CreateCheckoutSessionInput): Promise<PaymentResult<CheckoutSession>>;
  
  /** Get checkout session by ID */
  getCheckoutSession(sessionId: string): Promise<PaymentResult<CheckoutSession>>;

  // ──────────────────────────────────────────────────────────
  // WEBHOOKS
  // ──────────────────────────────────────────────────────────
  
  /** Verify webhook signature and parse event */
  verifyWebhook(input: WebhookVerifyInput): Promise<PaymentResult<WebhookEvent>>;
}

// ============================================================
// PAYMENT SERVICE (Orchestration Layer)
// ============================================================

/**
 * Payment Service Configuration
 */
export interface PaymentServiceConfig {
  /** Default provider to use */
  defaultProvider: string;
  /** All configured providers */
  providers: Record<string, PaymentProvider>;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Payment Service - Main entry point
 * 
 * Orchestrates multiple payment providers with fallback support.
 */
export interface PaymentService extends PaymentProvider {
  /** Get a specific provider by name */
  getProvider(name: string): PaymentProvider | undefined;
  
  /** Set the default provider */
  setDefaultProvider(name: string): void;
  
  /** List all configured providers */
  listProviders(): string[];
}
