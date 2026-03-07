/**
 * @sdods/ui
 * Portable, accessible UI components built on Radix + Tailwind
 */

// Utilities
export { cn } from './lib/cn';

// Primitives
export { Button, buttonVariants, type ButtonProps } from './components/primitives/button';
export { Input, type InputProps } from './components/primitives/input';
export { Label } from './components/primitives/label';
export { Separator } from './components/primitives/separator';
export { Switch } from './components/primitives/switch';
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './components/primitives/card';
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './components/primitives/dialog';

// Patterns
export { GoogleOneTap, GoogleOneTapPrompt, type GoogleOneTapProps } from './components/patterns/google-one-tap';
