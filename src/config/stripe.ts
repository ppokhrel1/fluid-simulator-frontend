// src/config/stripe.ts

// For Create React App, use REACT_APP_ prefix
export const STRIPE_CONFIG = {
  publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here'
};