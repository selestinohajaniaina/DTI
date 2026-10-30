import { HttpErrorResponse } from '@angular/common/http';

/**
 * Friendly message for a failed API call: surfaces the backend's own message
 * when present (backend envelopes are crafted safe-to-display), otherwise a
 * contextual fallback. Never leaks status codes or URLs.
 */
export function toUserMessage(
  error: unknown,
  messages: { unreachable: string; generic: string },
): string {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'You appear to be offline. Reconnect and try again.';
  }
  if (error instanceof HttpErrorResponse) {
    const envelope = error.error as { error?: { message?: unknown } } | null;
    const backendMessage = envelope?.error?.message;
    if (typeof backendMessage === 'string' && backendMessage.length > 0) {
      return backendMessage;
    }
    if (error.status === 0) {
      return messages.unreachable;
    }
  }
  return messages.generic;
}
