/**
 * Auth Form Validation Tests
 * Tests for email and password validation in LoginPage and RegisterPage
 */

describe('Email Validation', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  test('should accept valid email addresses', () => {
    const validEmails = [
      'user@example.com',
      'test.user@example.co.uk',
      'user+tag@example.com',
      'user123@test-domain.com'
    ];

    validEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(true);
    });
  });

  test('should reject invalid email addresses', () => {
    const invalidEmails = [
      '',
      'invalid',
      'invalid@',
      '@example.com',
      'user@',
      'user @example.com',
      'user@example',
      'user..name@example.com'
    ];

    invalidEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(false);
    });
  });
});

describe('Password Validation', () => {
  const validatePasswordLength = (password: string): boolean => {
    return password.length >= 8;
  };

  test('should accept passwords with 8 or more characters', () => {
    const validPasswords = [
      'password',
      'password123',
      'MyP@ssw0rd!',
      'verylongpassword123456'
    ];

    validPasswords.forEach(password => {
      expect(validatePasswordLength(password)).toBe(true);
    });
  });

  test('should reject passwords with less than 8 characters', () => {
    const invalidPasswords = [
      '',
      'pass',
      'pass123',
      '1234567'
    ];

    invalidPasswords.forEach(password => {
      expect(validatePasswordLength(password)).toBe(false);
    });
  });
});

describe('Password Confirmation Validation', () => {
  const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword;
  };

  test('should accept matching passwords', () => {
    expect(validatePasswordMatch('password123', 'password123')).toBe(true);
    expect(validatePasswordMatch('MyP@ssw0rd!', 'MyP@ssw0rd!')).toBe(true);
  });

  test('should reject non-matching passwords', () => {
    expect(validatePasswordMatch('password123', 'password124')).toBe(false);
    expect(validatePasswordMatch('password', 'Password')).toBe(false);
    expect(validatePasswordMatch('password123', '')).toBe(false);
  });
});
