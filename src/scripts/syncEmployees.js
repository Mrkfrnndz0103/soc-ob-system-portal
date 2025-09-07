// Load environment variables manually
const { loadEnv } = require('./loadEnv');
loadEnv();

// Sync employees from Google Sheets to Firebase
const { syncEmployeesToFirebase } = require('../lib/googleSheetsSync');

async function syncEmployees() {
  try {
    console.log('Starting employee sync from Google Sheets to Firebase...');
    console.log('Database URL:', process.env.FIREBASE_DATABASE_URL || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL);
    
    const employees = await syncEmployeesToFirebase();
    
    console.log(`Successfully synced ${Object.keys(employees).length} employees!`);
    console.log('Sample employees:', Object.values(employees).slice(0, 3));
    
    return true;
  } catch (error) {
    console.error('Error syncing employees:', error);
    return false;
  }
}

// Run the sync
syncEmployees().then(success => {
  process.exit(success ? 0 : 1);
});