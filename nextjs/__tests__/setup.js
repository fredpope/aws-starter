// Import Jest DOM extensions
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
  }),
}));

// Global setup
global.fetch = jest.fn();
