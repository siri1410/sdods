/**
 * @sdods/payments - Stripe Provider Implementation
 * 
 * Implements the PaymentProvider contract for Stripe.
 */

import type Stripe from 'stripe';
import type { PaymentProvider, PaymentServiceConfig } from '../contract';
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
  PaymentStatus,
  SubscriptionStatus,
  WebhookEventType,
} from '../types';

// ============================================================
// STRIPE CONFIGURATION
// ============================================================

export interface StripeProviderConfig {
  /** Stripe secret key */
  secretKey: string;
  /** Webhook signing secret */
  webhookSecret?: string;
  /** API version */
  apiVersion?: string;
  /** Enable test mode logging */
  debug?: boolean;
}

// ============================================================
// MAPPERS
// ============================================================

const mapPaymentStatus = (status: Stripe.PaymentIntent.Status): PaymentStatus => {
  const map: Record<string, PaymentStatus> = {
    'requires_payment_method': 'requires_payment_method',
    'requires_confirmation': 'pending',
    'requires_action': 'requires_action',
    'processing': 'processing',
    'requires_capture': 'pending',
    'canceled': 'canceled',
    'succeeded': 'succeeded',
  };
  return map[status] || 'pending';
};

const mapSubscriptionStatus = (status: Stripe.Subscription.Status): SubscriptionStatus => {
  const map: Record<string, SubscriptionStatus> = {
    'active': 'active',
    'trialing': 'trialing',
    'past_due': 'past_due',
    'paused': 'paused',
    'canceled': 'canceled',
    'unpaid': 'unpaid',
    'incomplete': 'incomplete',
    'incomplete_expired': 'canceled',
  };
  return map[status] || 'incomplete';
};

const mapWebhookEventType = (type: string): WebhookEventType | null => {
  const map: Record<string, WebhookEventType> = {
    'payment_intent.succeeded': 'payment.succeeded',
    'payment_intent.payment_failed': 'payment.failed',
    'charge.refunded': 'payment.refunded',
    'customer.subscription.created': 'subscription.created',
    'customer.subscription.updated': 'subscription.updated',
    'customer.subscription.deleted': 'subscription.canceled',
    'customer.subscription.trial_will_end': 'subscription.trial_ending',
    'invoice.paid': 'invoice.paid',
    'invoice.payment_failed': 'invoice.payment_failed',
    'customer.created': 'customer.created',
    'customer.updated': 'customer.updated',
    'customer.deleted': 'customer.deleted',
  };
  return map[type] || null;
};

// ============================================================
// STRIPE PROVIDER
// ============================================================

export function createStripeProvider(config: StripeProviderConfig): PaymentProvider {
  // Dynamic import to avoid requiring stripe as a dependency
  let stripe: Stripe | null = null;
  
  const getStripe = async (): Promise<Stripe> => {
    if (!stripe) {
      const StripeModule = await import('stripe');
      const StripeClass = StripeModule.default || StripeModule;
      stripe = new StripeClass(config.secretKey, {
        apiVersion: (config.apiVersion || '2024-12-18.acacia') as Stripe.LatestApiVersion,
      });
    }
    return stripe;
  };

  const handleError = (error: unknown): PaymentResult<never> => {
    if (error instanceof Error) {
      const stripeError = error as Stripe.errors.StripeError;
      return {
        success: false,
        error: {
          code: stripeError.code || 'unknown_error',
          message: stripeError.message,
          providerError: stripeError,
          retriable: stripeError.type === 'StripeAPIError',
        },
      };
    }
    return {
      success: false,
      error: {
        code: 'unknown_error',
        message: String(error),
      },
    };
  };

  return {
    name: 'stripe',
    isConfigured: !!config.secretKey,

    // ────────────────────────────────────────────────────────
    // CUSTOMERS
    // ────────────────────────────────────────────────────────
    
    async createCustomer(input: CreateCustomerInput): Promise<PaymentResult<Customer>> {
      try {
        const s = await getStripe();
        const customer = await s.customers.create({
          email: input.email,
          name: input.name,
          phone: input.phone,
          metadata: input.metadata,
        });
        
        return {
          success: true,
          data: {
            id: customer.id,
            email: customer.email!,
            name: customer.name ?? undefined,
            phone: customer.phone ?? undefined,
            metadata: customer.metadata as Record<string, string>,
            createdAt: new Date(customer.created * 1000),
            providerId: customer.id,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },

    async getCustomer(customerId: string): Promise<PaymentResult<Customer>> {
      try {
        const s = await getStripe();
        const customer = await s.customers.retrieve(customerId) as Stripe.Customer;
        
        if (customer.deleted) {
          return {
            success: false,
            error: { code: 'customer_deleted', message: 'Customer has been deleted' },
          };
        }
        
        return {
          success: true,
          data: {
            id: customer.id,
            email: customer.email!,
            name: customer.name ?? undefined,
            phone: customer.phone ?? undefined,
            metadata: customer.metadata as Record<string, string>,
            createdAt: new Date(customer.created * 1000),
            providerId: customer.id,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },

    async updateCustomer(customerId: string, input: Partial<CreateCustomerInput>): Promise<PaymentResult<Customer>> {
      try {
        const s = await getStripe();
        const customer = await s.customers.update(customerId, {
          email: input.email,
          name: input.name,
          phone: input.phone,
          metadata: input.metadata,
        });
        
        return {
          success: true,
          data: {
            id: customer.id,
            email: customer.email!,
            name: customer.name ?? undefined,
            phone: customer.phone ?? undefined,
            metadata: customer.metadata as Record<string, string>,
            createdAt: new Date(customer.created * 1000),
            providerId: customer.id,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },

    async deleteCustomer(customerId: string): Promise<PaymentResult<void>> {
      try {
        const s = await getStripe();
        await s.customers.del(customerId);
        return { success: true };
      } catch (error) {
        return handleError(error);
      }
    },

    // ────────────────────────────────────────────────────────
    // PAYMENT METHODS
    // ────────────────────────────────────────────────────────

    async attachPaymentMethod(input: AttachPaymentMethodInput): Promise<PaymentResult<PaymentMethod>> {
      try {
        const s = await getStripe();
        const pm = await s.paymentMethods.attach(input.paymentMethodToken, {
          customer: input.customerId,
        });
        
        if (input.setAsDefault) {
          await s.customers.update(input.customerId, {
            invoice_settings: { default_payment_method: pm.id },
          });
        }
        
        return {
          success: true,
          data: {
            id: pm.id,
            type: pm.type as any,
            customerId: input.customerId,
            isDefault: input.setAsDefault || false,
            last4: pm.card?.last4,
            brand: pm.card?.brand,
            expiryMonth: pm.card?.exp_month,
            expiryYear: pm.card?.exp_year,
            providerId: pm.id,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },

    async listPaymentMethods(customerId: string): Promise<PaymentResult<PaymentMethod[]>> {
      try {
        const s = await getStripe();
        const methods = await s.paymentMethods.list({
          customer: customerId,
          type: 'card',
        });
        
        const customer = await s.customers.retrieve(customerId) as Stripe.Customer;
        const defaultPm = customer.invoice_settings?.default_payment_method;
        
        return {
          success: true,
          data: methods.data.map(pm => ({
            id: pm.id,
            type: pm.type as any,
            customerId,
            isDefault: pm.id === defaultPm,
            last4: pm.card?.last4,
            brand: pm.card?.brand,
            expiryMonth: pm.card?.exp_month,
            expiryYear: pm.card?.exp_year,
            providerId: pm.id,
          })),
        };
      } catch (error) {
        return handleError(error);
      }
    },

    async detachPaymentMethod(paymentMethodId: string): Promise<PaymentResult<void>> {
      try {
        const s = await getStripe();
        await s.paymentMethods.detach(paymentMethodId);
        return { success: true };
      } catch (error) {
        return handleError(error);
      }
    },

    async setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<PaymentResult<void>> {
      try {
        const s = await getStripe();
        await s.customers.update(customerId, {
          invoice_settings: { default_payment_method: paymentMethodId },
        });
        return { success: true };
      } catch (error) {
        return handleError(error);
      }
    },

    // ────────────────────────────────────────────────────────
    // PAYMENTS
    // ────────────────────────────────────────────────────────

    async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentResult<PaymentIntent>> {
      try {
        const s = await getStripe();
        const pi = await s.paymentIntents.create({
          amount: input.amount.amount,
          currency: input.amount.currency.toLowerCase(),
          customer: input.customerId,
          payment_method: input.paymentMethodId,
          description: input.description,
          metadata: input.metadata,
          confirm: input.confirm,
          return_url: input.returnUrl,
          capture_method: input.captureMethod,
          automatic_payment_methods: { enabled: true },
        });
        
        return {
          success: true,
          data: {
            id: pi.id,
            amount: { amount: pi.amount, currency: pi.currency.toUpperCase() },
            status: mapPaymentStatus(pi.status),
            customerId: pi.customer as string | undefined,
            paymentMethodId: pi.payment_method as string | undefined,
            description: pi.description ?? undefined,
            metadata: pi.metadata as Record<string, string>,
            clientSecret: pi.client_secret ?? undefined,
            nextActionUrl: pi.next_action?.redirect_to_url?.url ?? undefined,
            createdAt: new Date(pi.created * 1000),
            providerId: pi.id,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },

    async getPaymentIntent(paymentIntentId: string): Promise<PaymentResult<PaymentIntent>> {
      try {
        const s = await getStripe();
        const pi = await s.paymentIntents.retrieve(paymentIntentId);
        
        return {
          success: true,
          data: {
            id: pi.id,
            amount: { amount: pi.amount, currency: pi.currency.toUpperCase() },
            status: mapPaymentStatus(pi.status),
            customerId: pi.customer as string | undefined,
            paymentMethodId: pi.payment_method as string | undefined,
            description: pi.description ?? undefined,
            metadata: pi.metadata as Record<string, string>,
            clientSecret: pi.client_secret ?? undefined,
            createdAt: new Date(pi.created * 1000),
            providerId: pi.id,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },

    async confirmPayment(input: ConfirmPaymentInput): Promise<PaymentResult<PaymentIntent>> {
      try {
        const s = await getStripe();
        const pi = await s.paymentIntents.confirm(input.paymentIntentId, {
          payment_method: input.paymentMethodId,
          return_url: input.returnUrl,
        });
        
        return {
          success: true,
          data: {
            id: pi.id,
            amount: { amount: pi.amount, currency: pi.currency.toUpperCase() },
            status: mapPaymentStatus(pi.status),
            customerId: pi.customer as string | undefined,
            paymentMethodId: pi.payment_method as string | undefined,
            clientSecret: pi.client_secret ?? undefined,
            nextActionUrl: pi.next_action?.redirect_to_url?.url ?? undefined,
            createdAt: new Date(pi.created * 1000),
            providerId: pi.id,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },

    async cancelPayment(paymentIntentId: string): Promise<PaymentResult<PaymentIntent>> {
      try {
        const s = await getStripe();
        const pi = await s.paymentIntents.cancel(paymentIntentId);
        
        return {
          success: true,
          data: {
            id: pi.id,
            amount: { amount: pi.amount, currency: pi.currency.toUpperCase() },
            status: 'canceled',
            createdAt: new Date(pi.created * 1000),
            providerId: pi.id,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },

    async capturePayment(paymentIntentId: string, amount?: number): Promise<PaymentResult<PaymentIntent>> {
      try {
        const s = await getStripe();
        const pi = await s.paymentIntents.capture(paymentIntentId, {
          amount_to_capture: amount,
        });
        
        return {
          success: true,
          data: {
            id: pi.id,
            amount: { amount: pi.amount, currency: pi.currency.toUpperCase() },
            status: mapPaymentStatus(pi.status),
            createdAt: new Date(pi.created * 1000),
            providerId: pi.id,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },

    // ────────────────────────────────────────────────────────
    // SUBSCRIPTIONS
    // ────────────────────────────────────────────────────────

    async createSubscription(input: CreateSubscriptionInput): Promise<PaymentResult<Subscription>> {
      try {
        const s = await getStripe();
        const sub = await s.subscriptions.create({
          customer: input.customerId,
          items: [{ price: input.priceId }],
          default_payment_method: input.paymentMethodId,
          trial_period_days: input.trialDays,
          metadata: input.metadata,
          coupon: input.couponCode,
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
        });
        
        return {
          success: true,
          data: {
            id: sub.id,
            customerId: sub.customer as string,
            priceId: sub.items.data[0].price.id,
            status: mapSubscriptionStatus(sub.status),
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : undefined,
            trialStart: sub.trial_start ? new Date(sub.trial_start * 1000) : undefined,
            trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : undefined,
            metadata: sub.metadata as Record<string, string>,
            providerId: sub.id,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },

    async getSubscription(subscriptionId: string): Promise<PaymentResult<Subscription>> {
      try {
        const s = await getStripe();
        const sub = await s.subscriptions.retrieve(subscriptionId);
        
        return {
          success: true,
          data: {
            id: sub.id,
            customerId: sub.customer as string,
            priceId: sub.items.data[0].price.id,
            status: mapSubscriptionStatus(sub.status),
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : undefined,
            trialStart: sub.trial_start ? new Date(sub.trial_start * 1000) : undefined,
            trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : undefined,
            metadata: sub.metadata as Record<string, string>,
            providerId: sub.id,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },

    async updateSubscription(input: UpdateSubscriptionInput): Promise<PaymentResult<Subscription>> {
      try {
        const s = await getStripe();
        const updateParams: Stripe.SubscriptionUpdateParams = {
          cancel_at_period_end: input.cancelAtPeriodEnd,
          metadata: input.metadata,
        };
        
        if (input.priceId) {
          const sub = await s.subscriptions.retrieve(input.subscriptionId);
          updateParams.items = [{
            id: sub.items.data[0].id,
            price: input.priceId,
          }];
        }
        
        const sub = await s.subscriptions.update(input.subscriptionId, updateParams);
        
        return {
          success: true,
          data: {
            id: sub.id,
            customerId: sub.customer as string,
            priceId: sub.items.data[0].price.id,
            status: mapSubscriptionStatus(sub.status),
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            metadata: sub.metadata as Record<string, string>,
            providerId: sub.id,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },

    async cancelSubscription(subscriptionId: string, immediately = false): Promise<PaymentResult<Subscription>> {
      try {
        const s = await getStripe();
        let sub: Stripe.Subscription;
        
        if (immediately) {
          sub = await s.subscriptions.cancel(subscriptionId);
        } else {
          sub = await s.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
          });
        }
        
        return {
          success: true,
          data: {
            id: sub.id,
            customerId: sub.customer as string,
            priceId: sub.items.data[0].price.id,
            status: mapSubscriptionStatus(sub.status),
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : undefined,
            providerId: sub.id,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },

    async listSubscriptions(customerId: string): Promise<PaymentResult<Subscription[]>> {
      try {
        const s = await getStripe();
        const subs = await s.subscriptions.list({ customer: customerId });
        
        return {
          success: true,
          data: subs.data.map(sub => ({
            id: sub.id,
            customerId: sub.customer as string,
            priceId: sub.items.data[0].price.id,
            status: mapSubscriptionStatus(sub.status),
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            providerId: sub.id,
          })),
        };
      } catch (error) {
        return handleError(error);
      }
    },

    // ────────────────────────────────────────────────────────
    // REFUNDS
    // ────────────────────────────────────────────────────────

    async createRefund(input: CreateRefundInput): Promise<PaymentResult<Refund>> {
      try {
        const s = await getStripe();
        const refund = await s.refunds.create({
          payment_intent: input.paymentIntentId,
          amount: input.amount?.amount,
          reason: input.reason as Stripe.RefundCreateParams.Reason,
          metadata: input.metadata,
        });
        
        return {
          success: true,
          data: {
            id: refund.id,
            paymentIntentId: refund.payment_intent as string,
            amount: { amount: refund.amount, currency: refund.currency.toUpperCase() },
            status: refund.status as any,
            reason: refund.reason ?? undefined,
            createdAt: new Date(refund.created * 1000),
            providerId: refund.id,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },

    async getRefund(refundId: string): Promise<PaymentResult<Refund>> {
      try {
        const s = await getStripe();
        const refund = await s.refunds.retrieve(refundId);
        
        return {
          success: true,
          data: {
            id: refund.id,
            paymentIntentId: refund.payment_intent as string,
            amount: { amount: refund.amount, currency: refund.currency.toUpperCase() },
            status: refund.status as any,
            reason: refund.reason ?? undefined,
            createdAt: new Date(refund.created * 1000),
            providerId: refund.id,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },

    async listRefunds(paymentIntentId: string): Promise<PaymentResult<Refund[]>> {
      try {
        const s = await getStripe();
        const refunds = await s.refunds.list({ payment_intent: paymentIntentId });
        
        return {
          success: true,
          data: refunds.data.map(refund => ({
            id: refund.id,
            paymentIntentId: refund.payment_intent as string,
            amount: { amount: refund.amount, currency: refund.currency.toUpperCase() },
            status: refund.status as any,
            reason: refund.reason ?? undefined,
            createdAt: new Date(refund.created * 1000),
            providerId: refund.id,
          })),
        };
      } catch (error) {
        return handleError(error);
      }
    },

    // ────────────────────────────────────────────────────────
    // INVOICES
    // ────────────────────────────────────────────────────────

    async getInvoice(invoiceId: string): Promise<PaymentResult<Invoice>> {
      try {
        const s = await getStripe();
        const inv = await s.invoices.retrieve(invoiceId);
        
        return {
          success: true,
          data: {
            id: inv.id,
            customerId: inv.customer as string,
            subscriptionId: inv.subscription as string | undefined,
            status: inv.status as any,
            amount: { amount: inv.total, currency: inv.currency.toUpperCase() },
            amountPaid: { amount: inv.amount_paid, currency: inv.currency.toUpperCase() },
            amountDue: { amount: inv.amount_due, currency: inv.currency.toUpperCase() },
            lineItems: inv.lines.data.map(line => ({
              id: line.id,
              description: line.description || '',
              amount: { amount: line.amount, currency: inv.currency.toUpperCase() },
              quantity: line.quantity || 1,
            })),
            dueDate: inv.due_date ? new Date(inv.due_date * 1000) : undefined,
            hostedInvoiceUrl: inv.hosted_invoice_url ?? undefined,
            pdfUrl: inv.invoice_pdf ?? undefined,
            createdAt: new Date(inv.created * 1000),
            providerId: inv.id,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },

    async listInvoices(customerId: string): Promise<PaymentResult<Invoice[]>> {
      try {
        const s = await getStripe();
        const invoices = await s.invoices.list({ customer: customerId });
        
        return {
          success: true,
          data: invoices.data.map(inv => ({
            id: inv.id,
            customerId: inv.customer as string,
            subscriptionId: inv.subscription as string | undefined,
            status: inv.status as any,
            amount: { amount: inv.total, currency: inv.currency.toUpperCase() },
            amountPaid: { amount: inv.amount_paid, currency: inv.currency.toUpperCase() },
            amountDue: { amount: inv.amount_due, currency: inv.currency.toUpperCase() },
            lineItems: [],
            createdAt: new Date(inv.created * 1000),
            providerId: inv.id,
          })),
        };
      } catch (error) {
        return handleError(error);
      }
    },

    // ────────────────────────────────────────────────────────
    // PRICES
    // ────────────────────────────────────────────────────────

    async getPrice(priceId: string): Promise<PaymentResult<Price>> {
      try {
        const s = await getStripe();
        const price = await s.prices.retrieve(priceId);
        
        return {
          success: true,
          data: {
            id: price.id,
            productId: price.product as string,
            amount: { amount: price.unit_amount || 0, currency: price.currency.toUpperCase() },
            interval: price.recurring?.interval || 'month',
            intervalCount: price.recurring?.interval_count || 1,
            trialDays: price.recurring?.trial_period_days ?? undefined,
            metadata: price.metadata as Record<string, string>,
            providerId: price.id,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },

    async listPrices(productId?: string): Promise<PaymentResult<Price[]>> {
      try {
        const s = await getStripe();
        const prices = await s.prices.list({ product: productId, active: true });
        
        return {
          success: true,
          data: prices.data.map(price => ({
            id: price.id,
            productId: price.product as string,
            amount: { amount: price.unit_amount || 0, currency: price.currency.toUpperCase() },
            interval: price.recurring?.interval || 'month',
            intervalCount: price.recurring?.interval_count || 1,
            trialDays: price.recurring?.trial_period_days ?? undefined,
            metadata: price.metadata as Record<string, string>,
            providerId: price.id,
          })),
        };
      } catch (error) {
        return handleError(error);
      }
    },

    // ────────────────────────────────────────────────────────
    // CHECKOUT
    // ────────────────────────────────────────────────────────

    async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<PaymentResult<CheckoutSession>> {
      try {
        const s = await getStripe();
        const session = await s.checkout.sessions.create({
          mode: input.mode,
          customer: input.customerId,
          customer_email: input.customerEmail,
          line_items: input.lineItems.map(item => ({
            price: item.priceId,
            quantity: item.quantity,
          })),
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          metadata: input.metadata,
          allow_promotion_codes: input.allowPromoCodes,
          billing_address_collection: input.collectBillingAddress ? 'required' : 'auto',
          shipping_address_collection: input.collectShippingAddress 
            ? { allowed_countries: ['US', 'CA', 'GB', 'AU'] }
            : undefined,
        });
        
        return {
          success: true,
          data: {
            id: session.id,
            url: session.url!,
            status: session.status as any,
            customerId: session.customer as string | undefined,
            paymentIntentId: session.payment_intent as string | undefined,
            subscriptionId: session.subscription as string | undefined,
            metadata: session.metadata as Record<string, string>,
            expiresAt: new Date(session.expires_at * 1000),
            providerId: session.id,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },

    async getCheckoutSession(sessionId: string): Promise<PaymentResult<CheckoutSession>> {
      try {
        const s = await getStripe();
        const session = await s.checkout.sessions.retrieve(sessionId);
        
        return {
          success: true,
          data: {
            id: session.id,
            url: session.url || '',
            status: session.status as any,
            customerId: session.customer as string | undefined,
            paymentIntentId: session.payment_intent as string | undefined,
            subscriptionId: session.subscription as string | undefined,
            metadata: session.metadata as Record<string, string>,
            expiresAt: new Date(session.expires_at * 1000),
            providerId: session.id,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },

    // ────────────────────────────────────────────────────────
    // WEBHOOKS
    // ────────────────────────────────────────────────────────

    async verifyWebhook(input: WebhookVerifyInput): Promise<PaymentResult<WebhookEvent>> {
      try {
        const s = await getStripe();
        const event = s.webhooks.constructEvent(
          input.payload,
          input.signature,
          input.secret
        );
        
        const eventType = mapWebhookEventType(event.type);
        if (!eventType) {
          return {
            success: false,
            error: { code: 'unknown_event', message: `Unknown event type: ${event.type}` },
          };
        }
        
        return {
          success: true,
          data: {
            id: event.id,
            type: eventType,
            data: event.data.object,
            createdAt: new Date(event.created * 1000),
            rawEvent: event,
          },
        };
      } catch (error) {
        return handleError(error);
      }
    },
  };
}
