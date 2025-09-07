// Google Sheets integration with Firebase sync
const { google } = require('googleapis');
const { database } = require('./firebase');
const { ref, set } = require('firebase/database');

// Configuration
const GOOGLE_SHEETS = {
  EMPLOYEE_SHEET_ID: '1zVEy5pHm2a_HHPGnVd7ftqjUYMYenrVTNMHr4ae1_ek',
  EMPLOYEE_RANGE: 'EmployeeData!A:N',
  ATTENDANCE_SHEET_ID: '1zVEy5pHm2a_HHPGnVd7ftqjUYMYenrVTNMHr4ae1_ek',
  ATTENDANCE_RANGE: 'Attendance!A:BV'
};

const FIREBASE_PATHS = {
  ATTENDANCE: 'attendance',
  BREAKS: 'breaks',
  LEAVES: 'leaves',
  WORKSTATIONS: 'workstations',
  USERS: 'users',
  SYNC_LOG: 'syncLog'
};

// Initialize Google Sheets auth
const getAuth = () => {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/spreadsheets'
    ],
  });
};

// Sync employees from Google Sheets to Firebase
async function syncEmployeesToFirebase() {
  try {
    const auth = getAuth();
    const sheets = google.sheets('v4');
    
    // Fetch employee data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: GOOGLE_SHEETS.EMPLOYEE_SHEET_ID,
      range: GOOGLE_SHEETS.EMPLOYEE_RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No data found in Google Sheet');
    }

    // Parse employee data
    const employees = {};
    
    // Skip header row (index 0)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length >= 14) {
        const employeeId = row[1]; // OPS ID from column B
        if (employeeId) {
          employees[employeeId] = {
            id: employeeId,
            name: row[2] || '', // NAME from column C
            department: row[11] || '', // Area from column L
            position: row[5] || '', // ROLE from column F
            status: row[7] === 'Active' ? 'Active' : 'Inactive', // Status from column H
            email: '', // Not in sheet
            phone: '', // Not in sheet
            hireDate: row[4] || '', // Deployment Date from column E
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
      }
    }

    // Sync to Firebase
    await set(ref(database, 'employees'), employees);
    
    // Log sync
    await set(ref(database, `${FIREBASE_PATHS.SYNC_LOG}/employees`), {
      lastSync: new Date().toISOString(),
      employeeCount: Object.keys(employees).length
    });

    console.log(`Synced ${Object.keys(employees).length} employees to Firebase`);
    return employees;
  } catch (error) {
    console.error('Error syncing employees to Firebase:', error);
    throw error;
  }
}

// Get attendance data from Google Sheets
async function getAttendanceDataFromSheet(date) {
  try {
    const auth = getAuth();
    const sheets = google.sheets('v4');
    
    // Get the entire Attendance sheet
    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: GOOGLE_SHEETS.ATTENDANCE_SHEET_ID,
      range: GOOGLE_SHEETS.ATTENDANCE_RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No data found in Attendance sheet');
    }

    // Parse headers
    const employeeHeaders = rows[2]; // A3:N3 contains employee headers
    const dateHeaders = rows[0]; // P1:BV1 contains dates
    const timeHeaders = rows[2]; // P3:BV3 contains Time In/Time Out headers

    const attendanceData = [];

    // Process each employee row (starting from row 3, which is index 3)
    for (let i = 3; i < rows.length; i++) {
      const row = rows[i];
      const employeeId = row[1]; // OPS ID from column B
      
      if (!employeeId) continue;

      // Process each date column (starting from column P, which is index 15)
      for (let j = 15; j < Math.min(row.length, dateHeaders.length); j += 2) {
        const dateValue = dateHeaders[j]; // Date from row 1
        const timeInValue = row[j]; // Time In from current row
        const timeOutValue = row[j + 1]; // Time Out from current row
        
        if (dateValue && (timeInValue || timeOutValue)) {
          // Parse date - assuming format like "September 01, 2025"
          const parsedDate = new Date(dateValue);
          
          // If date filter is provided, only include matching dates
          if (date && parsedDate.toISOString().split('T')[0] !== date) {
            continue;
          }
          
          const attendanceRecord = {
            employeeId: employeeId,
            date: parsedDate.toISOString().split('T')[0],
            timeIn: timeInValue || '',
            timeOut: timeOutValue || '',
            shift: parsedDate.getHours() < 12 ? 'Day' : 'Night',
            status: timeInValue ? (timeInValue > '08:00' ? 'late' : 'present') : 'absent',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          attendanceData.push(attendanceRecord);
        }
      }
    }

    return attendanceData;
  } catch (error) {
    console.error('Error fetching Google Sheets attendance data:', error);
    throw error;
  }
}

// Record attendance to Google Sheets
async function recordAttendanceToSheet(employeeId, timeIn, timeOut) {
  try {
    const auth = getAuth();
    const sheets = google.sheets('v4');
    
    // Get today's date
    const today = new Date();
    const todayString = today.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: '2-digit' 
    });
    
    // Find the date column in row 1
    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: GOOGLE_SHEETS.ATTENDANCE_SHEET_ID,
      range: 'Attendance!P1:BV1',
    });

    const dateHeaders = response.data.values?.[0] || [];
    let dateColumnIndex = -1;
    
    // Find if today's date already exists
    for (let i = 0; i < dateHeaders.length; i++) {
      if (dateHeaders[i] === todayString) {
        dateColumnIndex = i + 15; // +15 because we start from column P (index 15)
        break;
      }
    }
    
    // Find the employee row
    const employeeResponse = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: GOOGLE_SHEETS.ATTENDANCE_SHEET_ID,
      range: 'Attendance!B:B',
    });

    const employeeIds = employeeResponse.data.values?.flat() || [];
    let employeeRowIndex = -1;
    
    for (let i = 3; i < employeeIds.length; i++) { // Start from row 4 (index 3)
      if (employeeIds[i] === employeeId) {
        employeeRowIndex = i + 1; // +1 because Sheets is 1-indexed
        break;
      }
    }
    
    if (employeeRowIndex === -1) {
      throw new Error('Employee not found in Attendance sheet');
    }
    
    // Update the attendance data
    if (timeIn) {
      const timeInCell = `${String.fromCharCode(65 + dateColumnIndex)}${employeeRowIndex}`;
      await sheets.spreadsheets.values.update({
        auth,
        spreadsheetId: GOOGLE_SHEETS.ATTENDANCE_SHEET_ID,
        range: `Attendance!${timeInCell}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[timeIn]],
        },
      });
    }
    
    if (timeOut) {
      const timeOutCell = `${String.fromCharCode(65 + dateColumnIndex + 1)}${employeeRowIndex}`;
      await sheets.spreadsheets.values.update({
        auth,
        spreadsheetId: GOOGLE_SHEETS.ATTENDANCE_SHEET_ID,
        range: `Attendance!${timeOutCell}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[timeOut]],
        },
      });
    }

    return true;
  } catch (error) {
    console.error('Error recording attendance to Google Sheets:', error);
    throw error;
  }
}

module.exports = {
  syncEmployeesToFirebase,
  getAttendanceDataFromSheet,
  recordAttendanceToSheet
};