// Firebase configuration and Google Sheets integration
export const GOOGLE_SHEETS = {
  EMPLOYEE_SHEET_ID: '1zVEy5pHm2a_HHPGnVd7ftqjUYMYenrVTNMHr4ae1_ek',
  EMPLOYEE_RANGE: 'EmployeeData!A:N',
  ATTENDANCE_SHEET_ID: '1zVEy5pHm2a_HHPGnVd7ftqjUYMYenrVTNMHr4ae1_ek',
  ATTENDANCE_RANGE: 'Attendance!A:BV'
} as const;

export const FIREBASE_PATHS = {
  ATTENDANCE: 'attendance',
  BREAKS: 'breaks',
  LEAVES: 'leaves',
  WORKSTATIONS: 'workstations',
  USERS: 'users',
  SYNC_LOG: 'syncLog'
} as const;

export const FIREBASE_ROLES = {
  SUPERVISOR: 'supervisor',
  HIGH_ADMIN: 'high_admin',
  PIC: 'pic'
} as const;

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late'
} as const;

export const BREAK_STATUS = {
  ON_BREAK: 'on_break',
  COMPLETED: 'completed'
} as const;

export const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;