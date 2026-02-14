/**
 * @sdods/payments - Universal Payment Abstraction Layer
 * 
 * Vendor-agnostic payment contracts and implementations.
 * Use across multiple projects with consistent interfaces.
 * 
 * @example
 * ```typescript
 * import { createPaymentService } from '@sdods/payments';
 * import { createStripeProvider } from '@sdods/payments/stripe';
 * 
 * const stripe = createStripeProvider({ secretKey: 'sk_...' });
 * const payments = createPaymentService({ defaultProvider: 'stripe', providers: { stripe } });
 * 
 * // Create customer
 * const { data: customer } = await payments.createCustomer({ email: 'user@example.com' });
 * 
 * // Create payment
 * const { data: payment } = await payments.createPaymentIntent({
 *   amount: { amount: 2000, currency: 'USD' },
 *   customerId: customer.id,
 * });
 * ```
 */

// Types
export * from './types';

// Contract
export * from './contract';

// Payment Service Factory
import type { PaymentProvider, PaymentService, PaymentServiceConfig } from './contract';

/**
 * Create a payment service with multiple providers
 */
export function createPaymentService(config: PaymentServiceConfig): PaymentService {
  let defaultProviderName = config.defaultProvider;
  
  const getDefaultProvider = (): PaymentProvider => {
    const provider = config.providers[defaultProviderName];
    if (!provider) {
      throw new Error(`Default provider '${defaultProviderName}' not found`);
    }
    return provider;
  };

  return {
    // Metadata
    get name() { return defaultProviderName; },
    get isConfigured() { return getDefaultProvider().isConfigured; },
    
    // Provider management
    getProvider(name: string) {
      return config.providers[name];
    },
    
    setDefaultProvider(name: string) {
      if (!config.providers[name]) {
        throw new Error(`Provider '${name}' not found`);
      }
      defaultProviderName = name;
    },
    
    listProviders() {
      return Object.keys(config.providers);
    },
    
    // Delegate all methods to default provider
    createCustomer: (input) => getDefaultProvider().createCustomer(input),
    getCustomer: (id) => getDefaultProvider().getCustomer(id),
    updateCustomer: (id, input) => getDefaultProvider().updateCustomer(id, input),
    deleteCustomer: (id) => getDefaultProvider().deleteCustomer(id),
    
    attachPaymentMethod: (input) => getDefaultProvider().attachPaymentMethod(input),
    listPaymentMethods: (customerId) => getDefaultProvider().listPaymentMethods(customerId),
    detachPaymentMethod: (id) => getDefaultProvider().detachPaymentMethod(id),
    setDefaultPaymentMethod: (customerId, pmId) => getDefaultProvider().setDefaultPaymentMethod(customerId, pmId),
    
    createPaymentIntent: (input) => getDefaultProvider().createPaymentIntent(input),
    getPaymentIntent: (id) => getDefaultProvider().getPaymentIntent(id),
    confirmPayment: (input) => getDefaultProvider().confirmPayment(input),
    cancelPayment: (id) => getDefaultProvider().cancelPayment(id),
    capturePayment: (id, amount) => getDefaultProvider().capturePayment(id, amount),
    
    createSubscription: (input) => getDefaultProvider().createSubscription(input),
    getSubscription: (id) => getDefaultProvider().getSubscription(id),
    updateSubscription: (input) => getDefaultProvider().updateSubscription(input),
    cancelSubscription: (id, immediately) => getDefaultProvider().cancelSubscription(id, immediately),
    listSubscriptions: (customerId) => getDefaultProvider().listSubscriptions(customerId),
    
    createRefund: (input) => getDefaultProvider().createRefund(input),
    getRefund: (id) => getDefaultProvider().getRefund(id),
    listRefunds: (paymentIntentId) => getDefaultProvider().listRefunds(paymentIntentId),
    
    getInvoice: (id) => getDefaultProvider().getInvoice(id),
    listInvoices: (customerId) => getDefaultProvider().listInvoices(customerId),
    
    getPrice: (id) => getDefaultProvider().getPrice(id),
    listPrices: (productId) => getDefaultProvider().listPrices(productId),
    
    createCheckoutSession: (input) => getDefaultProvider().createCheckoutSession(input),
    getCheckoutSession: (id) => getDefaultProvider().getCheckoutSession(id),
    
    verifyWebhook: (input) => getDefaultProvider().verifyWebhook(input),
  };
}
