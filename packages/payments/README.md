# @sdods/payments

Universal payment abstraction layer — vendor-agnostic payment contracts for use across multiple projects.

## Features

- 🔄 **Vendor Agnostic** — Switch between Stripe, PayPal, etc. without code changes
- 📝 **Strong Contracts** — TypeScript interfaces for all payment operations
- 🔒 **PCI Compliant Patterns** — Follows industry standards
- 🏗️ **Multi-Provider Support** — Run multiple providers with fallback
- 💰 **Full Payment Lifecycle** — Customers, payments, subscriptions, refunds, invoices

## Installation

```bash
npm install @sdods/payments
# For Stripe support:
npm install stripe
```

## Quick Start

```typescript
import { createPaymentService } from '@sdods/payments';
import { createStripeProvider } from '@sdods/payments/stripe';

// Initialize provider
const stripe = createStripeProvider({
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
});

// Create payment service
const payments = createPaymentService({
  defaultProvider: 'stripe',
  providers: { stripe },
});

// Use consistent API across all providers
const { data: customer } = await payments.createCustomer({
  email: 'user@example.com',
  name: 'John Doe',
});

const { data: payment } = await payments.createPaymentIntent({
  amount: { amount: 2000, currency: 'USD' }, // $20.00
  customerId: customer.id,
  description: 'Premium subscription',
});

console.log('Client secret:', payment.clientSecret);
```

## API Reference

### Customers

```typescript
// Create
const { data } = await payments.createCustomer({ email, name, phone, metadata });

// Read
const { data } = await payments.getCustomer(customerId);

// Update
const { data } = await payments.updateCustomer(customerId, { name: 'New Name' });

// Delete
await payments.deleteCustomer(customerId);
```

### Payment Methods

```typescript
// Attach (from frontend token)
const { data } = await payments.attachPaymentMethod({
  customerId,
  paymentMethodToken: 'pm_xxx',
  setAsDefault: true,
});

// List
const { data: methods } = await payments.listPaymentMethods(customerId);

// Detach
await payments.detachPaymentMethod(paymentMethodId);
```

### Payments (One-time)

```typescript
// Create payment intent
const { data: intent } = await payments.createPaymentIntent({
  amount: { amount: 5000, currency: 'USD' },
  customerId,
  paymentMethodId,
  confirm: true, // Auto-confirm
});

// Or manual confirmation
const { data } = await payments.confirmPayment({
  paymentIntentId: intent.id,
  paymentMethodId,
  returnUrl: 'https://example.com/return',
});

// Cancel
await payments.cancelPayment(paymentIntentId);

// Capture (for manual capture)
await payments.capturePayment(paymentIntentId);
```

### Subscriptions

```typescript
// Create
const { data: sub } = await payments.createSubscription({
  customerId,
  priceId: 'price_xxx',
  trialDays: 14,
});

// Update
await payments.updateSubscription({
  subscriptionId: sub.id,
  priceId: 'price_new', // Upgrade/downgrade
});

// Cancel at period end
await payments.cancelSubscription(sub.id, false);

// Cancel immediately
await payments.cancelSubscription(sub.id, true);

// List
const { data: subs } = await payments.listSubscriptions(customerId);
```

### Refunds

```typescript
// Full refund
const { data } = await payments.createRefund({
  paymentIntentId,
});

// Partial refund
const { data } = await payments.createRefund({
  paymentIntentId,
  amount: { amount: 1000, currency: 'USD' }, // $10.00
  reason: 'Customer requested',
});
```

### Hosted Checkout

```typescript
const { data: session } = await payments.createCheckoutSession({
  mode: 'subscription',
  customerId,
  lineItems: [{ priceId: 'price_xxx', quantity: 1 }],
  successUrl: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
  cancelUrl: 'https://example.com/cancel',
  allowPromoCodes: true,
});

// Redirect user to session.url
```

### Webhooks

```typescript
// In your webhook handler
const { data: event } = await payments.verifyWebhook({
  payload: req.body,
  signature: req.headers['stripe-signature'],
  secret: process.env.STRIPE_WEBHOOK_SECRET!,
});

switch (event.type) {
  case 'payment.succeeded':
    // Handle successful payment
    break;
  case 'subscription.canceled':
    // Handle cancellation
    break;
}
```

## Universal Types

All money values use a consistent format:

```typescript
interface Money {
  amount: number;    // Smallest unit (cents)
  currency: string;  // ISO 4217 (USD, EUR, etc.)
}
```

All results use a consistent wrapper:

```typescript
interface PaymentResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    retriable?: boolean;
  };
}
```

## Adding Custom Providers

Implement the `PaymentProvider` interface:

```typescript
import type { PaymentProvider } from '@sdods/payments';

export function createMyProvider(config: MyConfig): PaymentProvider {
  return {
    name: 'my-provider',
    isConfigured: true,
    
    async createCustomer(input) { /* ... */ },
    async getCustomer(id) { /* ... */ },
    // ... implement all methods
  };
}
```

## License

MIT © Yarlis
