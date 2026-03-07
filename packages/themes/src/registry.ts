/**
 * Theme Registry
 * Maps domains to themes and sections
 */

export type ThemeName = 'default' | 'yarlis' | 'mybotbox' | 'rapidtriage';
export type SectionName = 'marketing' | 'dashboard' | 'docs' | 'auth';

export const THEMES: Record<ThemeName, { label: string; primary: string }> = {
  default: { label: 'Default', primary: '#0A7CFF' },
  yarlis: { label: 'Yarlis', primary: '#316FA7' },
  mybotbox: { label: 'MyBotBox', primary: '#0A7CFF' },
  rapidtriage: { label: 'RapidTriage', primary: '#10B981' },
};

export function resolveThemeFromHostname(hostname: string): ThemeName {
  const host = hostname.toLowerCase();
  if (host.includes('yarlis.com') || host.includes('yarlis.ai')) return 'yarlis';
  if (host.includes('mybotbox')) return 'mybotbox';
  if (host.includes('rapidtriage')) return 'rapidtriage';
  return 'default';
}

export function resolveDefaultSection(pathname: string): SectionName {
  if (pathname.startsWith('/docs')) return 'docs';
  if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/auth')) return 'auth';
  if (pathname === '/' || pathname.startsWith('/pricing') || pathname.startsWith('/features')) return 'marketing';
  return 'dashboard';
}

export function getThemeConfig(theme: ThemeName) {
  return THEMES[theme] || THEMES.default;
}
