/**
 * @sdods/marketing - Universal Marketing Abstraction Layer
 * 
 * Vendor-agnostic marketing automation contracts and implementations.
 * 
 * @example
 * ```typescript
 * import { createMarketingService } from '@sdods/marketing';
 * import { createAhrefsProvider } from '@sdods/marketing/seo';
 * import { createMailchimpProvider } from '@sdods/marketing/email';
 * 
 * const marketing = createMarketingService({
 *   seoProviders: { ahrefs: createAhrefsProvider({ apiKey }) },
 *   emailProviders: { mailchimp: createMailchimpProvider({ apiKey }) },
 *   defaultSEO: 'ahrefs',
 *   defaultEmail: 'mailchimp',
 * });
 * 
 * // Get backlinks
 * const { data } = await marketing.getSEOProvider()?.getBacklinks({ domain: 'yarlis.com' });
 * 
 * // Send campaign
 * await marketing.getEmailProvider()?.sendCampaign(campaignId);
 * ```
 */

// Types
export * from './types';

// Contracts
export * from './contracts';

// Service Factory
import type {
  MarketingService,
  MarketingServiceConfig,
  SEOProvider,
  EmailProvider,
  AdsProvider,
  SocialProvider,
} from './contracts';
import type { MarketingResult, TrafficSource, ConversionFunnel, CampaignPerformance, DateRange, SocialPlatform } from './types';

/**
 * Create a unified marketing service with multiple providers
 */
export function createMarketingService(config: MarketingServiceConfig): MarketingService {
  const seoProviders = config.seoProviders || {};
  const emailProviders = config.emailProviders || {};
  const adsProviders = config.adsProviders || {};
  const socialProviders = config.socialProviders || {};

  return {
    // SEO
    getSEOProvider(name?: string): SEOProvider | undefined {
      const key = name || config.defaultSEO;
      return key ? seoProviders[key] : Object.values(seoProviders)[0];
    },
    listSEOProviders(): string[] {
      return Object.keys(seoProviders);
    },

    // Email
    getEmailProvider(name?: string): EmailProvider | undefined {
      const key = name || config.defaultEmail;
      return key ? emailProviders[key] : Object.values(emailProviders)[0];
    },
    listEmailProviders(): string[] {
      return Object.keys(emailProviders);
    },

    // Ads
    getAdsProvider(name?: string): AdsProvider | undefined {
      const key = name || config.defaultAds;
      return key ? adsProviders[key] : Object.values(adsProviders)[0];
    },
    listAdsProviders(): string[] {
      return Object.keys(adsProviders);
    },

    // Social
    getSocialProvider(name?: string): SocialProvider | undefined {
      const key = name || config.defaultSocial;
      return key ? socialProviders[key] : Object.values(socialProviders)[0];
    },
    listSocialProviders(): string[] {
      return Object.keys(socialProviders);
    },

    // Analytics Aggregation (stub - implement with analytics provider)
    async getTrafficSources(_dateRange: DateRange): Promise<MarketingResult<TrafficSource[]>> {
      return { success: true, data: [] };
    },

    async getConversionFunnel(_funnelName: string, _dateRange: DateRange): Promise<MarketingResult<ConversionFunnel>> {
      return {
        success: true,
        data: { name: _funnelName, steps: [], overallConversionRate: 0 },
      };
    },

    async getCampaignPerformance(_dateRange: DateRange): Promise<MarketingResult<CampaignPerformance[]>> {
      return { success: true, data: [] };
    },

    // Cross-Platform Publishing
    async publishToAllPlatforms(
      content: string,
      mediaUrls?: string[]
    ): Promise<MarketingResult<{ platform: SocialPlatform; postId: string }[]>> {
      const results: { platform: SocialPlatform; postId: string }[] = [];
      
      for (const provider of Object.values(socialProviders)) {
        const accounts = await provider.getConnectedAccounts();
        if (!accounts.success || !accounts.data) continue;

        for (const account of accounts.data.items || accounts.data) {
          const post = await provider.createPost({
            accountId: account.id,
            content,
            mediaUrls,
            publishNow: true,
          });
          
          if (post.success && post.data) {
            results.push({ platform: account.platform, postId: post.data.id });
          }
        }
      }

      return { success: true, data: results };
    },
  };
}
