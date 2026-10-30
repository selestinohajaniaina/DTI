import { formatDate, formatPrice } from './format';

describe('formatDate', () => {
  it('formats ISO dates in US style', () => {
    expect(formatDate('2026-03-04T00:00:00.000Z')).toBe('Mar 4, 2026');
  });

  it('renders invalid input as Unknown date', () => {
    expect(formatDate('garbage')).toBe('Unknown date');
  });
});

describe('formatPrice', () => {
  it('formats ariary amounts with the Ar symbol', () => {
    expect(formatPrice(3000, 'MGA')).toBe('Ar 3,000');
    expect(formatPrice(800, 'MGA')).toBe('Ar 800');
  });

  it('formats dollar amounts with the $ symbol', () => {
    expect(formatPrice(25, 'USD')).toBe('$25');
  });

  it('falls back to the currency code for unknown currencies', () => {
    expect(formatPrice(100, 'EUR')).toBe('EUR 100');
  });

  it('rounds fractional values to whole amounts', () => {
    expect(formatPrice(1247.6, 'MGA')).toBe('Ar 1,248');
  });

  it('renders missing or invalid values as Not available', () => {
    expect(formatPrice(null, 'MGA')).toBe('Not available');
    expect(formatPrice(undefined, 'MGA')).toBe('Not available');
    expect(formatPrice(Number.NaN, 'MGA')).toBe('Not available');
  });
});
