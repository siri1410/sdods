/**
 * cn() - Class Name utility
 * Combines clsx for conditional classes + tailwind-merge for conflict resolution
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
