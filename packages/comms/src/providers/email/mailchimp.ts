/**
 * Mailchimp Email Provider
 * Supports both Marketing (lists/audiences) and Transactional (Mandrill)
 */

import type { 
  EmailProvider, 
  EmailMessage, 
  EmailSendResult, 
  EmailContact, 
  EmailList,
  EmailConfig 
} from '../../contracts/email';

export interface MailchimpConfig {
  apiKey: string;
  serverPrefix: string; // e.g., 'us21' from API key suffix
  defaultFrom?: string;
  defaultAudienceId?: string;
  // For transactional (Mandrill)
  mandrillApiKey?: string;
}

export class MailchimpProvider implements EmailProvider {
  readonly name = 'mailchimp';
  private config: MailchimpConfig;
  private baseUrl: string;

  constructor(config: MailchimpConfig) {
    this.config = config;
    this.baseUrl = `https://${config.serverPrefix}.api.mailchimp.com/3.0`;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const auth = Buffer.from(`anystring:${this.config.apiKey}`).toString('base64');
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Mailchimp API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Send transactional email via Mandrill (Mailchimp Transactional)
   * Requires mandrillApiKey in config
   */
  async send(message: EmailMessage): Promise<EmailSendResult> {
    if (!this.config.mandrillApiKey) {
      return {
        success: false,
        provider: this.name,
        error: 'Mandrill API key required for transactional emails. Use addContact for marketing.',
      };
    }

    try {
      const recipients = Array.isArray(message.to) ? message.to : [message.to];
      
      const response = await fetch('https://mandrillapp.com/api/1.0/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: this.config.mandrillApiKey,
          message: {
            from_email: message.from || this.config.defaultFrom,
            to: recipients.map(email => ({ email, type: 'to' })),
            subject: message.subject,
            html: message.html,
            text: message.text,
            tags: message.tags,
            metadata: message.metadata,
          },
        }),
      });

      const result = await response.json();
      
      if (result[0]?.status === 'sent' || result[0]?.status === 'queued') {
        return {
          success: true,
          messageId: result[0]._id,
          provider: this.name,
          raw: result,
        };
      }

      return {
        success: false,
        provider: this.name,
        error: result[0]?.reject_reason || 'Send failed',
        raw: result,
      };
    } catch (error) {
      return {
        success: false,
        provider: this.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Add contact to Mailchimp audience (list)
   */
  async addContact(
    listId: string, 
    contact: EmailContact
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const subscriberHash = await this.hashEmail(contact.email);
      
      await this.request(`/lists/${listId}/members/${subscriberHash}`, {
        method: 'PUT',
        body: JSON.stringify({
          email_address: contact.email,
          status_if_new: 'subscribed',
          status: 'subscribed',
          merge_fields: {
            FNAME: contact.firstName || '',
            LNAME: contact.lastName || '',
          },
          tags: contact.tags || [],
        }),
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Remove contact from audience
   */
  async removeContact(
    listId: string, 
    email: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const subscriberHash = await this.hashEmail(email);
      
      await this.request(`/lists/${listId}/members/${subscriberHash}`, {
        method: 'DELETE',
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all audiences (lists)
   */
  async getLists(): Promise<EmailList[]> {
    const response = await this.request<{ lists: Array<{ id: string; name: string; stats: { member_count: number } }> }>('/lists');
    
    return response.lists.map(list => ({
      id: list.id,
      name: list.name,
      memberCount: list.stats.member_count,
    }));
  }

  /**
   * Get campaign templates
   */
  async getTemplates(): Promise<{ id: string; name: string }[]> {
    const response = await this.request<{ templates: Array<{ id: number; name: string }> }>('/templates');
    
    return response.templates.map(t => ({
      id: String(t.id),
      name: t.name,
    }));
  }

  /**
   * Hash email for Mailchimp subscriber operations (MD5)
   */
  private async hashEmail(email: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(email.toLowerCase());
    const hashBuffer = await crypto.subtle.digest('MD5', data).catch(() => {
      // Fallback for environments without crypto.subtle.digest MD5
      // Use simple hash
      let hash = 0;
      for (let i = 0; i < email.length; i++) {
        const char = email.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash.toString(16);
    });
    
    if (typeof hashBuffer === 'string') return hashBuffer;
    
    const hashArray = Array.from(new Uint8Array(hashBuffer as ArrayBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

/**
 * Create Mailchimp provider from config
 */
export function createMailchimpProvider(config: MailchimpConfig): MailchimpProvider {
  return new MailchimpProvider(config);
}
