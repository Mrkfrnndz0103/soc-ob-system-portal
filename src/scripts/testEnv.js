// Load environment variables manually
const { loadEnv } = require('./loadEnv');
loadEnv();

console.log('Testing environment variables...');
console.log('FIREBASE_DATABASE_URL:', process.env.FIREBASE_DATABASE_URL);
console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
console.log('GOOGLE_PRIVATE_KEY exists:', !!process.env.GOOGLE_PRIVATE_KEY);