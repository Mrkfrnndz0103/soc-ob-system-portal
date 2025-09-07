export interface Employee {
    id: string;
    name: string;
    department: string;
    position: string;
    status: 'Active' | 'On Leave' | 'Inactive';
    email?: string;
    phone?: string;
    hireDate?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface AttendanceRecord {
    id: string;
    employeeId: string;
    date: any; // Firebase Timestamp
    timeIn: string;
    timeOut: string;
    shift: 'Day' | 'Night';
    status: 'Present' | 'Absent' | 'Late';
    createdAt: any; // Firebase Timestamp
    updatedAt: any; // Firebase Timestamp
  }
  
  export interface BreakRecord {
    id: string;
    employeeId: string;
    startTime: string;
    endTime: string;
    duration: number;
    status: 'Completed' | 'On Break';
    createdAt: string;
    updatedAt: string;
  }
  
  export interface LeaveRequest {
    id: string;
    employeeId: string;
    type: 'Annual' | 'Sick' | 'Personal' | 'Maternity' | 'Paternity';
    startDate: string;
    endDate: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    reason: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Workstation {
    id: string;
    name: string;
    location: string;
    capacity: number;
    assignedEmployees: string[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface User {
    id: string;
    name: string;
    email: string;
    role: 'Supervisor' | 'High Admin' | 'PIC';
    department: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface DashboardStats {
    totalEmployees: number;
    presentToday: number;
    lateArrivals: number;
    attendanceRate: number;
    pendingLeaves: number;
    activeBreaks: number;
    allocatedWorkstations: number;
  }