// Load environment variables first
require('dotenv').config();

// Test Google Sheets access
const { google } = require('googleapis');

async function testGoogleSheetsAccess() {
  try {
    console.log('Testing Google Sheets access...');
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets('v4');
    
    // Test reading from your sheet
    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: '1zVEy5pHm2a_HHPGnVd7ftqjUYMYenrVTNMHr4ae1_ek',
      range: 'EmployeeData!A1:N10', // Read first 10 rows for testing
    });

    console.log('Successfully accessed Google Sheets!');
    console.log('Data retrieved:', response.data.values);
    
    return true;
  } catch (error) {
    console.error('Error accessing Google Sheets:', error);
    return false;
  }
}

// Run the test
testGoogleSheetsAccess().then(success => {
  process.exit(success ? 0 : 1);
});