import { describe, it, expect } from 'vitest';

/**
 * Utility function tests
 * These are example tests - add more as you implement validators
 */

describe('Utility Functions', () => {
  describe('Email Validation', () => {
    it('validates correct email format', () => {
      const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('invalid.email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
    });
  });

  describe('Hedera Account ID Validation', () => {
    it('validates Hedera account ID format', () => {
      const isValidAccountId = (accountId) => /^0\.0\.\d+$/.test(accountId);

      expect(isValidAccountId('0.0.123456')).toBe(true);
      expect(isValidAccountId('0.0.1')).toBe(true);
      expect(isValidAccountId('0.0.999999999')).toBe(true);
      expect(isValidAccountId('0.1.123')).toBe(false);
      expect(isValidAccountId('123456')).toBe(false);
      expect(isValidAccountId('invalid')).toBe(false);
    });
  });

  describe('Price Formatting', () => {
    it('formats price correctly', () => {
      const formatPrice = (price) => {
        if (typeof price !== 'number') return '0.00';
        return price.toFixed(2);
      };

      expect(formatPrice(10)).toBe('10.00');
      expect(formatPrice(10.5)).toBe('10.50');
      expect(formatPrice(10.555)).toBe('10.56');
      expect(formatPrice('invalid')).toBe('0.00');
    });
  });
});
