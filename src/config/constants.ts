export const randomDefaults = {
    MIN: 0,
    MAX: 100,
};

// config.ts
const config = {
    apiUrl: 'https://goldfish-app-pg2bo.ondigitalocean.app',
    googleOAuthUrl: process.env.GOOGLE_OAUTH_URL || "https://goldfish-app-pg2bo.ondigitalocean.app/auth/google",
};

export default config;
