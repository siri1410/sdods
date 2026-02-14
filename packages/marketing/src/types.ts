/**
 * @sdods/marketing - Universal Marketing Types
 * 
 * Vendor-agnostic type definitions for marketing automation.
 */

// ============================================================
// COMMON TYPES
// ============================================================

export interface MarketingResult<T = void> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    providerError?: unknown;
    retriable?: boolean;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface DateRange {
  start: Date;
  end: Date;
}

// ============================================================
// SEO TYPES
// ============================================================

export interface Backlink {
  id: string;
  sourceUrl: string;
  targetUrl: string;
  anchorText: string;
  domainRating: number;
  pageRating: number;
  isDoFollow: boolean;
  isLost: boolean;
  firstSeen: Date;
  lastSeen: Date;
  providerId?: string;
}

export interface KeywordRanking {
  keyword: string;
  position: number;
  previousPosition?: number;
  change: number;
  url: string;
  searchVolume: number;
  difficulty: number;
  cpc?: number;
  updatedAt: Date;
}

export interface DomainMetrics {
  domain: string;
  domainRating: number;
  organicTraffic: number;
  organicKeywords: number;
  backlinks: number;
  referringDomains: number;
  updatedAt: Date;
}

export interface SiteAuditIssue {
  id: string;
  type: 'error' | 'warning' | 'notice';
  category: 'technical' | 'content' | 'performance' | 'mobile' | 'security';
  title: string;
  description: string;
  affectedUrls: string[];
  howToFix: string;
  priority: 'high' | 'medium' | 'low';
}

export interface GetBacklinksInput {
  domain: string;
  limit?: number;
  offset?: number;
  orderBy?: 'domain_rating' | 'first_seen' | 'last_seen';
}

export interface TrackKeywordsInput {
  keywords: string[];
  domain: string;
  location?: string;
  language?: string;
}

// ============================================================
// EMAIL MARKETING TYPES
// ============================================================

export interface EmailContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: 'subscribed' | 'unsubscribed' | 'pending' | 'bounced';
  tags: string[];
  customFields: Record<string, string>;
  subscribedAt?: Date;
  unsubscribedAt?: Date;
  providerId?: string;
}

export interface EmailList {
  id: string;
  name: string;
  description?: string;
  contactCount: number;
  createdAt: Date;
  providerId?: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  previewText?: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  htmlContent: string;
  textContent?: string;
  listIds: string[];
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  scheduledAt?: Date;
  sentAt?: Date;
  providerId?: string;
}

export interface EmailMetrics {
  campaignId: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  complained: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
}

export interface CreateCampaignInput {
  name: string;
  subject: string;
  previewText?: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  htmlContent: string;
  textContent?: string;
  listIds: string[];
  scheduledAt?: Date;
}

export interface CreateContactInput {
  email: string;
  firstName?: string;
  lastName?: string;
  listIds?: string[];
  tags?: string[];
  customFields?: Record<string, string>;
}

// ============================================================
// ADVERTISING TYPES
// ============================================================

export type AdPlatform = 'meta' | 'google' | 'tiktok' | 'linkedin' | 'twitter';
export type AdObjective = 'awareness' | 'traffic' | 'engagement' | 'leads' | 'sales' | 'app_installs';
export type AdStatus = 'active' | 'paused' | 'archived' | 'pending' | 'rejected';

export interface AdAccount {
  id: string;
  name: string;
  platform: AdPlatform;
  currency: string;
  timezone: string;
  status: 'active' | 'disabled';
  providerId?: string;
}

export interface AdCampaign {
  id: string;
  accountId: string;
  name: string;
  objective: AdObjective;
  status: AdStatus;
  budget: {
    type: 'daily' | 'lifetime';
    amount: number;
    currency: string;
  };
  startDate?: Date;
  endDate?: Date;
  providerId?: string;
}

export interface AdSet {
  id: string;
  campaignId: string;
  name: string;
  status: AdStatus;
  targeting: AdTargeting;
  budget?: {
    type: 'daily' | 'lifetime';
    amount: number;
  };
  bidStrategy: 'lowest_cost' | 'target_cost' | 'bid_cap';
  bidAmount?: number;
  providerId?: string;
}

export interface AdTargeting {
  locations?: string[];
  ageMin?: number;
  ageMax?: number;
  genders?: ('male' | 'female' | 'all')[];
  interests?: string[];
  behaviors?: string[];
  customAudiences?: string[];
  excludedAudiences?: string[];
  languages?: string[];
  devices?: ('mobile' | 'desktop' | 'tablet')[];
}

export interface AdCreative {
  id: string;
  adSetId: string;
  name: string;
  type: 'image' | 'video' | 'carousel' | 'collection';
  headline: string;
  description?: string;
  callToAction: string;
  destinationUrl: string;
  mediaUrls: string[];
  status: AdStatus;
  providerId?: string;
}

export interface AdMetrics {
  adId: string;
  impressions: number;
  reach: number;
  clicks: number;
  spend: number;
  conversions: number;
  ctr: number; // Click-through rate
  cpc: number; // Cost per click
  cpm: number; // Cost per mille
  cpa: number; // Cost per acquisition
  roas: number; // Return on ad spend
  dateRange: DateRange;
}

export interface CreateAdCampaignInput {
  accountId: string;
  name: string;
  objective: AdObjective;
  budget: {
    type: 'daily' | 'lifetime';
    amount: number;
  };
  startDate?: Date;
  endDate?: Date;
}

// ============================================================
// SOCIAL MEDIA TYPES
// ============================================================

export type SocialPlatform = 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube' | 'pinterest';
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';
export type PostType = 'text' | 'image' | 'video' | 'carousel' | 'story' | 'reel' | 'link';

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  username: string;
  displayName: string;
  profileUrl: string;
  avatarUrl?: string;
  followers: number;
  following: number;
  isConnected: boolean;
  providerId?: string;
}

export interface SocialPost {
  id: string;
  accountId: string;
  platform: SocialPlatform;
  type: PostType;
  content: string;
  mediaUrls: string[];
  hashtags: string[];
  mentions: string[];
  linkUrl?: string;
  status: PostStatus;
  scheduledAt?: Date;
  publishedAt?: Date;
  providerId?: string;
}

export interface SocialMetrics {
  postId: string;
  impressions: number;
  reach: number;
  engagements: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  engagementRate: number;
  updatedAt: Date;
}

export interface AudienceInsights {
  accountId: string;
  totalFollowers: number;
  followerGrowth: number;
  demographics: {
    ageRanges: { range: string; percentage: number }[];
    genders: { gender: string; percentage: number }[];
    locations: { location: string; percentage: number }[];
  };
  activeHours: { hour: number; engagement: number }[];
  topInterests: string[];
}

export interface CreatePostInput {
  accountId: string;
  content: string;
  mediaUrls?: string[];
  hashtags?: string[];
  mentions?: string[];
  linkUrl?: string;
  scheduledAt?: Date;
  publishNow?: boolean;
}

// ============================================================
// ANALYTICS TYPES
// ============================================================

export interface TrafficSource {
  source: string;
  medium: string;
  sessions: number;
  users: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
}

export interface ConversionFunnel {
  name: string;
  steps: {
    name: string;
    users: number;
    conversionRate: number;
  }[];
  overallConversionRate: number;
}

export interface CampaignPerformance {
  campaignName: string;
  source: string;
  medium: string;
  sessions: number;
  conversions: number;
  revenue: number;
  cost: number;
  roi: number;
}
