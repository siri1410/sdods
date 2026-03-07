/**
 * @sdods/comms
 * Unified communications layer with vendor abstraction
 * 
 * Supported channels:
 * - Email: Mailchimp (marketing + transactional via Mandrill)
 * - SMS: Coming soon (Twilio, Vonage)
 * - Push: Coming soon (FCM, OneSignal)
 */

// Contracts
export * from './contracts/email';

// Providers
export * from './providers/email/mailchimp';

// Factory
import { MailchimpProvider, type MailchimpConfig } from './providers/email/mailchimp';
import type { EmailProvider, EmailConfig } from './contracts/email';

export type CommsConfig = {
  email?: EmailConfig & { mailchimp?: MailchimpConfig };
};

export interface CommsClient {
  email?: EmailProvider;
}

/**
 * Create a unified comms client
 */
export function createComms(config: CommsConfig): CommsClient {
  const client: CommsClient = {};

  if (config.email) {
    if (config.email.provider === 'mailchimp' && config.email.mailchimp) {
      client.email = new MailchimpProvider(config.email.mailchimp);
    }
    // Add other providers here as they're implemented
  }

  return client;
}
