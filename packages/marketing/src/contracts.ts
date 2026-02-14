/**
 * @sdods/marketing - Provider Contracts
 * 
 * Vendor-agnostic interfaces for marketing service providers.
 */

import type {
  MarketingResult,
  PaginatedResult,
  DateRange,
  // SEO
  Backlink,
  KeywordRanking,
  DomainMetrics,
  SiteAuditIssue,
  GetBacklinksInput,
  TrackKeywordsInput,
  // Email
  EmailContact,
  EmailList,
  EmailCampaign,
  EmailMetrics,
  CreateCampaignInput,
  CreateContactInput,
  // Ads
  AdAccount,
  AdCampaign,
  AdSet,
  AdCreative,
  AdMetrics,
  AdPlatform,
  CreateAdCampaignInput,
  // Social
  SocialAccount,
  SocialPost,
  SocialMetrics,
  AudienceInsights,
  SocialPlatform,
  CreatePostInput,
  // Analytics
  TrafficSource,
  ConversionFunnel,
  CampaignPerformance,
} from './types';

// ============================================================
// SEO PROVIDER CONTRACT
// ============================================================

/**
 * SEO Provider Interface
 * 
 * Implementations: Ahrefs, SEMrush, Moz, Majestic, Ubersuggest
 */
export interface SEOProvider {
  /** Provider name */
  readonly name: string;
  /** Check if provider is configured */
  readonly isConfigured: boolean;

  // Backlink Analysis
  getBacklinks(input: GetBacklinksInput): Promise<MarketingResult<PaginatedResult<Backlink>>>;
  getNewBacklinks(domain: string, days?: number): Promise<MarketingResult<Backlink[]>>;
  getLostBacklinks(domain: string, days?: number): Promise<MarketingResult<Backlink[]>>;
  getReferringDomains(domain: string): Promise<MarketingResult<PaginatedResult<{ domain: string; backlinks: number; rating: number }>>>;

  // Keyword Research
  trackKeywords(input: TrackKeywordsInput): Promise<MarketingResult<KeywordRanking[]>>;
  getKeywordSuggestions(seed: string, limit?: number): Promise<MarketingResult<{ keyword: string; volume: number; difficulty: number }[]>>;
  getCompetitorKeywords(domain: string): Promise<MarketingResult<KeywordRanking[]>>;

  // Domain Analysis
  getDomainMetrics(domain: string): Promise<MarketingResult<DomainMetrics>>;
  compareDomains(domains: string[]): Promise<MarketingResult<DomainMetrics[]>>;

  // Site Audit
  runSiteAudit(domain: string): Promise<MarketingResult<{ auditId: string }>>;
  getSiteAuditResults(auditId: string): Promise<MarketingResult<SiteAuditIssue[]>>;
}

// ============================================================
// EMAIL PROVIDER CONTRACT
// ============================================================

/**
 * Email Marketing Provider Interface
 * 
 * Implementations: Mailchimp, SendGrid, ConvertKit, Klaviyo, ActiveCampaign
 */
export interface EmailProvider {
  readonly name: string;
  readonly isConfigured: boolean;

  // Contacts
  createContact(input: CreateContactInput): Promise<MarketingResult<EmailContact>>;
  getContact(contactId: string): Promise<MarketingResult<EmailContact>>;
  updateContact(contactId: string, input: Partial<CreateContactInput>): Promise<MarketingResult<EmailContact>>;
  deleteContact(contactId: string): Promise<MarketingResult<void>>;
  listContacts(listId?: string, page?: number): Promise<MarketingResult<PaginatedResult<EmailContact>>>;
  addTagToContact(contactId: string, tag: string): Promise<MarketingResult<void>>;
  removeTagFromContact(contactId: string, tag: string): Promise<MarketingResult<void>>;

  // Lists
  createList(name: string, description?: string): Promise<MarketingResult<EmailList>>;
  getLists(): Promise<MarketingResult<EmailList[]>>;
  deleteList(listId: string): Promise<MarketingResult<void>>;
  addContactToList(contactId: string, listId: string): Promise<MarketingResult<void>>;
  removeContactFromList(contactId: string, listId: string): Promise<MarketingResult<void>>;

  // Campaigns
  createCampaign(input: CreateCampaignInput): Promise<MarketingResult<EmailCampaign>>;
  getCampaign(campaignId: string): Promise<MarketingResult<EmailCampaign>>;
  updateCampaign(campaignId: string, input: Partial<CreateCampaignInput>): Promise<MarketingResult<EmailCampaign>>;
  deleteCampaign(campaignId: string): Promise<MarketingResult<void>>;
  sendCampaign(campaignId: string): Promise<MarketingResult<void>>;
  scheduleCampaign(campaignId: string, scheduledAt: Date): Promise<MarketingResult<void>>;
  pauseCampaign(campaignId: string): Promise<MarketingResult<void>>;
  getCampaignMetrics(campaignId: string): Promise<MarketingResult<EmailMetrics>>;
  listCampaigns(status?: EmailCampaign['status']): Promise<MarketingResult<EmailCampaign[]>>;

  // Transactional
  sendTransactionalEmail(to: string, templateId: string, data: Record<string, unknown>): Promise<MarketingResult<{ messageId: string }>>;
}

// ============================================================
// ADVERTISING PROVIDER CONTRACT
// ============================================================

/**
 * Advertising Platform Provider Interface
 * 
 * Implementations: Meta Ads, Google Ads, TikTok Ads, LinkedIn Ads
 */
export interface AdsProvider {
  readonly name: string;
  readonly platform: AdPlatform;
  readonly isConfigured: boolean;

  // Accounts
  getAccounts(): Promise<MarketingResult<AdAccount[]>>;
  getAccount(accountId: string): Promise<MarketingResult<AdAccount>>;

  // Campaigns
  createCampaign(input: CreateAdCampaignInput): Promise<MarketingResult<AdCampaign>>;
  getCampaign(campaignId: string): Promise<MarketingResult<AdCampaign>>;
  updateCampaign(campaignId: string, input: Partial<CreateAdCampaignInput>): Promise<MarketingResult<AdCampaign>>;
  pauseCampaign(campaignId: string): Promise<MarketingResult<void>>;
  resumeCampaign(campaignId: string): Promise<MarketingResult<void>>;
  deleteCampaign(campaignId: string): Promise<MarketingResult<void>>;
  listCampaigns(accountId: string): Promise<MarketingResult<AdCampaign[]>>;

  // Ad Sets
  createAdSet(campaignId: string, input: Omit<AdSet, 'id' | 'campaignId' | 'providerId'>): Promise<MarketingResult<AdSet>>;
  getAdSet(adSetId: string): Promise<MarketingResult<AdSet>>;
  updateAdSet(adSetId: string, input: Partial<AdSet>): Promise<MarketingResult<AdSet>>;
  deleteAdSet(adSetId: string): Promise<MarketingResult<void>>;

  // Creatives
  createCreative(adSetId: string, input: Omit<AdCreative, 'id' | 'adSetId' | 'providerId' | 'status'>): Promise<MarketingResult<AdCreative>>;
  getCreative(creativeId: string): Promise<MarketingResult<AdCreative>>;
  updateCreative(creativeId: string, input: Partial<AdCreative>): Promise<MarketingResult<AdCreative>>;
  deleteCreative(creativeId: string): Promise<MarketingResult<void>>;

  // Metrics
  getCampaignMetrics(campaignId: string, dateRange: DateRange): Promise<MarketingResult<AdMetrics>>;
  getAdSetMetrics(adSetId: string, dateRange: DateRange): Promise<MarketingResult<AdMetrics>>;
  getCreativeMetrics(creativeId: string, dateRange: DateRange): Promise<MarketingResult<AdMetrics>>;
  getAccountMetrics(accountId: string, dateRange: DateRange): Promise<MarketingResult<AdMetrics>>;

  // Audiences
  createCustomAudience(accountId: string, name: string, emails: string[]): Promise<MarketingResult<{ audienceId: string }>>;
  createLookalikeAudience(sourceAudienceId: string, name: string, size: number): Promise<MarketingResult<{ audienceId: string }>>;
}

// ============================================================
// SOCIAL MEDIA PROVIDER CONTRACT
// ============================================================

/**
 * Social Media Provider Interface
 * 
 * Implementations: Buffer, Hootsuite, Sprout Social, Later, native APIs
 */
export interface SocialProvider {
  readonly name: string;
  readonly supportedPlatforms: SocialPlatform[];
  readonly isConfigured: boolean;

  // Accounts
  getConnectedAccounts(): Promise<MarketingResult<SocialAccount[]>>;
  getAccount(accountId: string): Promise<MarketingResult<SocialAccount>>;
  disconnectAccount(accountId: string): Promise<MarketingResult<void>>;

  // Posts
  createPost(input: CreatePostInput): Promise<MarketingResult<SocialPost>>;
  getPost(postId: string): Promise<MarketingResult<SocialPost>>;
  updatePost(postId: string, input: Partial<CreatePostInput>): Promise<MarketingResult<SocialPost>>;
  deletePost(postId: string): Promise<MarketingResult<void>>;
  schedulePost(postId: string, scheduledAt: Date): Promise<MarketingResult<void>>;
  publishNow(postId: string): Promise<MarketingResult<void>>;
  listPosts(accountId: string, status?: PostStatus): Promise<MarketingResult<SocialPost[]>>;
  getScheduledPosts(accountId: string): Promise<MarketingResult<SocialPost[]>>;

  // Metrics
  getPostMetrics(postId: string): Promise<MarketingResult<SocialMetrics>>;
  getAccountMetrics(accountId: string, dateRange: DateRange): Promise<MarketingResult<SocialMetrics[]>>;
  getAudienceInsights(accountId: string): Promise<MarketingResult<AudienceInsights>>;
  getBestPostingTimes(accountId: string): Promise<MarketingResult<{ day: string; hour: number; engagement: number }[]>>;

  // Engagement
  replyToComment(postId: string, commentId: string, message: string): Promise<MarketingResult<void>>;
  likeComment(postId: string, commentId: string): Promise<MarketingResult<void>>;
  getComments(postId: string): Promise<MarketingResult<{ id: string; author: string; content: string; createdAt: Date }[]>>;
}

// ============================================================
// MARKETING SERVICE CONFIG
// ============================================================

export interface MarketingServiceConfig {
  seoProviders?: Record<string, SEOProvider>;
  emailProviders?: Record<string, EmailProvider>;
  adsProviders?: Record<string, AdsProvider>;
  socialProviders?: Record<string, SocialProvider>;
  defaultSEO?: string;
  defaultEmail?: string;
  defaultAds?: string;
  defaultSocial?: string;
}

// ============================================================
// UNIFIED MARKETING SERVICE
// ============================================================

/**
 * Unified Marketing Service
 * 
 * Aggregates all marketing providers with fallback support.
 */
export interface MarketingService {
  // Provider Management
  getSEOProvider(name?: string): SEOProvider | undefined;
  getEmailProvider(name?: string): EmailProvider | undefined;
  getAdsProvider(name?: string): AdsProvider | undefined;
  getSocialProvider(name?: string): SocialProvider | undefined;
  
  listSEOProviders(): string[];
  listEmailProviders(): string[];
  listAdsProviders(): string[];
  listSocialProviders(): string[];

  // Analytics Aggregation
  getTrafficSources(dateRange: DateRange): Promise<MarketingResult<TrafficSource[]>>;
  getConversionFunnel(funnelName: string, dateRange: DateRange): Promise<MarketingResult<ConversionFunnel>>;
  getCampaignPerformance(dateRange: DateRange): Promise<MarketingResult<CampaignPerformance[]>>;
  
  // Cross-Platform
  publishToAllPlatforms(content: string, mediaUrls?: string[]): Promise<MarketingResult<{ platform: SocialPlatform; postId: string }[]>>;
}
