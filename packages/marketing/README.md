# @sdods/marketing

Universal marketing automation abstraction layer — vendor-agnostic contracts for SEO, email, ads, and social media.

## Features

- 🔄 **Vendor Agnostic** — Switch between providers without code changes
- 📊 **SEO Tools** — Backlinks, keywords, domain analysis, site audits
- 📧 **Email Marketing** — Campaigns, contacts, lists, automation
- 📢 **Ad Platforms** — Meta, Google, TikTok, LinkedIn campaigns
- 📱 **Social Media** — Multi-platform publishing and analytics
- 🔗 **Unified API** — Single interface for all marketing operations

## Installation

```bash
npm install @sdods/marketing
```

## Quick Start

```typescript
import { createMarketingService } from '@sdods/marketing';
import { createAhrefsProvider } from '@sdods/marketing/seo';
import { createMailchimpProvider } from '@sdods/marketing/email';
import { createMetaAdsProvider } from '@sdods/marketing/ads';
import { createBufferProvider } from '@sdods/marketing/social';

// Initialize providers
const marketing = createMarketingService({
  seoProviders: {
    ahrefs: createAhrefsProvider({ apiKey: process.env.AHREFS_API_KEY }),
  },
  emailProviders: {
    mailchimp: createMailchimpProvider({ apiKey: process.env.MAILCHIMP_API_KEY }),
  },
  adsProviders: {
    meta: createMetaAdsProvider({ accessToken: process.env.META_ACCESS_TOKEN }),
  },
  socialProviders: {
    buffer: createBufferProvider({ accessToken: process.env.BUFFER_ACCESS_TOKEN }),
  },
  defaultSEO: 'ahrefs',
  defaultEmail: 'mailchimp',
});
```

## Provider Contracts

### SEO Provider

```typescript
interface SEOProvider {
  // Backlinks
  getBacklinks(input: GetBacklinksInput): Promise<MarketingResult<PaginatedResult<Backlink>>>;
  getNewBacklinks(domain: string, days?: number): Promise<MarketingResult<Backlink[]>>;
  getLostBacklinks(domain: string, days?: number): Promise<MarketingResult<Backlink[]>>;
  
  // Keywords
  trackKeywords(input: TrackKeywordsInput): Promise<MarketingResult<KeywordRanking[]>>;
  getKeywordSuggestions(seed: string): Promise<MarketingResult<KeywordSuggestion[]>>;
  
  // Domain Analysis
  getDomainMetrics(domain: string): Promise<MarketingResult<DomainMetrics>>;
  
  // Site Audit
  runSiteAudit(domain: string): Promise<MarketingResult<{ auditId: string }>>;
  getSiteAuditResults(auditId: string): Promise<MarketingResult<SiteAuditIssue[]>>;
}
```

**Supported Providers:** Ahrefs, SEMrush, Moz, Majestic, Ubersuggest

### Email Provider

```typescript
interface EmailProvider {
  // Contacts
  createContact(input: CreateContactInput): Promise<MarketingResult<EmailContact>>;
  listContacts(listId?: string): Promise<MarketingResult<PaginatedResult<EmailContact>>>;
  
  // Lists
  createList(name: string): Promise<MarketingResult<EmailList>>;
  getLists(): Promise<MarketingResult<EmailList[]>>;
  
  // Campaigns
  createCampaign(input: CreateCampaignInput): Promise<MarketingResult<EmailCampaign>>;
  sendCampaign(campaignId: string): Promise<MarketingResult<void>>;
  getCampaignMetrics(campaignId: string): Promise<MarketingResult<EmailMetrics>>;
  
  // Transactional
  sendTransactionalEmail(to: string, templateId: string, data: Record<string, unknown>): Promise<MarketingResult<{ messageId: string }>>;
}
```

**Supported Providers:** Mailchimp, SendGrid, ConvertKit, Klaviyo, ActiveCampaign

### Ads Provider

```typescript
interface AdsProvider {
  // Campaigns
  createCampaign(input: CreateAdCampaignInput): Promise<MarketingResult<AdCampaign>>;
  getCampaignMetrics(campaignId: string, dateRange: DateRange): Promise<MarketingResult<AdMetrics>>;
  
  // Ad Sets & Creatives
  createAdSet(campaignId: string, input: AdSetInput): Promise<MarketingResult<AdSet>>;
  createCreative(adSetId: string, input: CreativeInput): Promise<MarketingResult<AdCreative>>;
  
  // Audiences
  createCustomAudience(accountId: string, name: string, emails: string[]): Promise<MarketingResult<{ audienceId: string }>>;
  createLookalikeAudience(sourceAudienceId: string, name: string, size: number): Promise<MarketingResult<{ audienceId: string }>>;
}
```

**Supported Platforms:** Meta Ads, Google Ads, TikTok Ads, LinkedIn Ads

### Social Provider

```typescript
interface SocialProvider {
  // Accounts
  getConnectedAccounts(): Promise<MarketingResult<SocialAccount[]>>;
  
  // Posts
  createPost(input: CreatePostInput): Promise<MarketingResult<SocialPost>>;
  schedulePost(postId: string, scheduledAt: Date): Promise<MarketingResult<void>>;
  publishNow(postId: string): Promise<MarketingResult<void>>;
  
  // Metrics
  getPostMetrics(postId: string): Promise<MarketingResult<SocialMetrics>>;
  getAudienceInsights(accountId: string): Promise<MarketingResult<AudienceInsights>>;
  getBestPostingTimes(accountId: string): Promise<MarketingResult<PostingTime[]>>;
}
```

**Supported Providers:** Buffer, Hootsuite, Sprout Social, Later, native APIs

## Usage Examples

### SEO: Track Backlinks

```typescript
const seo = marketing.getSEOProvider();

// Get all backlinks
const { data: backlinks } = await seo.getBacklinks({
  domain: 'yarlis.com',
  limit: 100,
  orderBy: 'domain_rating',
});

// Track new backlinks
const { data: newLinks } = await seo.getNewBacklinks('yarlis.com', 7);

// Get domain metrics
const { data: metrics } = await seo.getDomainMetrics('competitor.com');
console.log(`DR: ${metrics.domainRating}, Traffic: ${metrics.organicTraffic}`);
```

### Email: Run a Campaign

```typescript
const email = marketing.getEmailProvider();

// Create campaign
const { data: campaign } = await email.createCampaign({
  name: 'Product Launch',
  subject: '🚀 Introducing Yarlis AI',
  fromName: 'Siri',
  fromEmail: 'siri@yarlis.com',
  htmlContent: '<h1>Welcome!</h1>...',
  listIds: ['list_123'],
});

// Send it
await email.sendCampaign(campaign.id);

// Check metrics
const { data: metrics } = await email.getCampaignMetrics(campaign.id);
console.log(`Open rate: ${metrics.openRate}%`);
```

### Ads: Launch a Campaign

```typescript
const ads = marketing.getAdsProvider();

// Create campaign
const { data: campaign } = await ads.createCampaign({
  accountId: 'act_123',
  name: 'Yarlis Launch',
  objective: 'leads',
  budget: { type: 'daily', amount: 50 },
});

// Add targeting
const { data: adSet } = await ads.createAdSet(campaign.id, {
  name: 'Tech Founders',
  targeting: {
    interests: ['startups', 'saas', 'ai'],
    ageMin: 25,
    ageMax: 54,
  },
});

// Get metrics
const { data: metrics } = await ads.getCampaignMetrics(campaign.id, {
  start: new Date('2026-01-01'),
  end: new Date(),
});
console.log(`ROAS: ${metrics.roas}x`);
```

### Social: Cross-Platform Publishing

```typescript
const social = marketing.getSocialProvider();

// Publish to all platforms at once
const { data: posts } = await marketing.publishToAllPlatforms(
  '🚀 Just launched Yarlis Research Copilot! Try it free at yarlis.com',
  ['https://yarlis.com/og-image.png']
);

// Schedule a post
const { data: post } = await social.createPost({
  accountId: 'twitter_123',
  content: 'Building in public! Day 1 of the 22-day portfolio challenge.',
  scheduledAt: new Date('2026-02-15T09:00:00'),
});

// Get best posting times
const { data: times } = await social.getBestPostingTimes('instagram_456');
```

## Implementing Custom Providers

```typescript
import type { SEOProvider } from '@sdods/marketing';

export function createCustomSEOProvider(config: { apiKey: string }): SEOProvider {
  return {
    name: 'custom-seo',
    isConfigured: !!config.apiKey,

    async getBacklinks(input) {
      // Your implementation
      const response = await fetch(`https://api.custom-seo.com/backlinks?domain=${input.domain}`);
      const data = await response.json();
      return { success: true, data };
    },

    // ... implement other methods
  };
}
```

## License

MIT © Yarlis
