/**
 * Email Provider Contract
 * Vendor-agnostic email interface
 */

export interface EmailMessage {
  to: string | string[];
  from?: string;
  replyTo?: string;
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  templateVars?: Record<string, unknown>;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
  raw?: unknown;
}

export interface EmailContact {
  email: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface EmailList {
  id: string;
  name: string;
  memberCount?: number;
}

export interface EmailProvider {
  readonly name: string;
  
  // Transactional
  send(message: EmailMessage): Promise<EmailSendResult>;
  sendBatch?(messages: EmailMessage[]): Promise<EmailSendResult[]>;
  
  // Marketing / Lists
  addContact?(listId: string, contact: EmailContact): Promise<{ success: boolean; error?: string }>;
  removeContact?(listId: string, email: string): Promise<{ success: boolean; error?: string }>;
  getLists?(): Promise<EmailList[]>;
  
  // Templates
  getTemplates?(): Promise<{ id: string; name: string }[]>;
}

export interface EmailConfig {
  provider: 'mailchimp' | 'sendgrid' | 'resend' | 'ses';
  apiKey: string;
  defaultFrom?: string;
  // Mailchimp specific
  serverPrefix?: string; // e.g., 'us21'
  audienceId?: string;
}
