/**
 * Client-side theme injection
 * Call early (before React hydration) to prevent flash
 */
import { resolveThemeFromHostname, resolveDefaultSection } from '../registry';

export function applyThemeFromLocation() {
  if (typeof window === 'undefined') return;
  
  const theme = resolveThemeFromHostname(window.location.hostname);
  const section = resolveDefaultSection(window.location.pathname);
  
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.section = section;
}

export function setTheme(theme: string) {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme;
  }
}

export function setSection(section: string) {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.section = section;
  }
}
