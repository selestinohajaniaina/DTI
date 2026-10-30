import { HttpErrorResponse } from '@angular/common/http';

import { toUserMessage } from './http-errors';

const MESSAGES = { unreachable: 'UNREACHABLE', generic: 'GENERIC' };

describe('toUserMessage', () => {
  it('surfaces the backend message when present', () => {
    const error = new HttpErrorResponse({
      status: 502,
      error: { error: { code: 'AI_UPSTREAM_ERROR', message: 'Meta AI failed' } },
    });
    expect(toUserMessage(error, MESSAGES)).toBe('Meta AI failed');
  });

  it('reports unreachable servers without internals', () => {
    expect(toUserMessage(new HttpErrorResponse({ status: 0 }), MESSAGES)).toBe('UNREACHABLE');
  });

  it('falls back to the generic message otherwise', () => {
    expect(toUserMessage(new Error('boom'), MESSAGES)).toBe('GENERIC');
    expect(toUserMessage(new HttpErrorResponse({ status: 500, error: null }), MESSAGES)).toBe(
      'GENERIC',
    );
  });

  it('detects offline browsers', () => {
    Object.defineProperty(window.navigator, 'onLine', { value: false, configurable: true });
    try {
      expect(toUserMessage(new Error('boom'), MESSAGES)).toContain('offline');
    } finally {
      Object.defineProperty(window.navigator, 'onLine', { value: true, configurable: true });
    }
  });
});
