import { useEffect, useState, useCallback } from 'react';
import { 
  ref, 
  onValue, 
  push, 
  update, 
  remove,
  query,
  orderByChild,
  equalTo,
  startAt,
  endAt
} from 'firebase/database';
import { database } from '@/lib/firebase';
import { 
  Employee, 
  AttendanceRecord, 
  BreakRecord, 
  LeaveRequest, 
  Workstation 
} from '@/types';

// Employee hooks
export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const employeesRef = ref(database, 'employees');
    
    const unsubscribe = onValue(employeesRef, 
      (snapshot) => {
        const employeeData: Employee[] = [];
        snapshot.forEach((childSnapshot) => {
          employeeData.push({ id: childSnapshot.key, ...childSnapshot.val() } as Employee);
        });
        setEmployees(employeeData);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addEmployee = useCallback(async (employee: Omit<Employee, 'id'>) => {
    try {
      const employeesRef = ref(database, 'employees');
      const newEmployeeRef = push(employeesRef);
      await update(newEmployeeRef, {
        ...employee,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      throw new Error('Failed to add employee');
    }
  }, []);

  const updateEmployee = useCallback(async (id: string, employee: Partial<Employee>) => {
    try {
      const employeeRef = ref(database, `employees/${id}`);
      await update(employeeRef, {
        ...employee,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      throw new Error('Failed to update employee');
    }
  }, []);

  const deleteEmployee = useCallback(async (id: string) => {
    try {
      const employeeRef = ref(database, `employees/${id}`);
      await remove(employeeRef);
    } catch (err) {
      throw new Error('Failed to delete employee');
    }
  }, []);

  return { employees, loading, error, addEmployee, updateEmployee, deleteEmployee };
}

// Attendance hooks
export function useAttendance(date?: string) {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let attendanceRef;
    
    if (date) {
      // Filter by specific date
      attendanceRef = query(
        ref(database, 'attendance'),
        orderByChild('date'),
        equalTo(date)
      );
    } else {
      // Get today's records by default
      const today = new Date().toISOString().split('T')[0];
      attendanceRef = query(
        ref(database, 'attendance'),
        orderByChild('date'),
        equalTo(today)
      );
    }
    
    const unsubscribe = onValue(attendanceRef,
      (snapshot) => {
        const attendanceData: AttendanceRecord[] = [];
        snapshot.forEach((childSnapshot) => {
          attendanceData.push({ id: childSnapshot.key, ...childSnapshot.val() } as AttendanceRecord);
        });
        setAttendanceRecords(attendanceData);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [date]);

  const addAttendanceRecord = useCallback(async (record: Omit<AttendanceRecord, 'id'>) => {
    try {
      const attendanceRef = ref(database, 'attendance');
      const newRecordRef = push(attendanceRef);
      await update(newRecordRef, {
        ...record,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      throw new Error('Failed to add attendance record');
    }
  }, []);

  const updateAttendanceRecord = useCallback(async (id: string, record: Partial<AttendanceRecord>) => {
    try {
      const recordRef = ref(database, `attendance/${id}`);
      await update(recordRef, {
        ...record,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      throw new Error('Failed to update attendance record');
    }
  }, []);

  const recordClockIn = useCallback(async (employeeId: string) => {
    try {
      const now = new Date();
      const dateString = now.toISOString().split('T')[0];
      const timeString = now.toTimeString().substring(0, 5); // HH:MM format
      
      // Determine if late (after 8:00 AM)
      const lateThreshold = new Date();
      lateThreshold.setHours(8, 0, 0, 0);
      const status = now > lateThreshold ? 'late' : 'present';
      
      // Check if record already exists for today
      const attendanceRef = query(
        ref(database, 'attendance'),
        orderByChild('employeeId'),
        equalTo(employeeId)
      );
      
      // In a real implementation, you'd check for existing records
      // For now, we'll create a new record
      const newRecordRef = push(ref(database, 'attendance'));
      await update(newRecordRef, {
        employeeId,
        date: dateString,
        timeIn: timeString,
        timeOut: '',
        shift: now.getHours() < 12 ? 'Day' : 'Night',
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      throw new Error('Failed to record clock-in');
    }
  }, []);

  const recordClockOut = useCallback(async (employeeId: string) => {
    try {
      const now = new Date();
      const dateString = now.toISOString().split('T')[0];
      const timeString = now.toTimeString().substring(0, 5); // HH:MM format
      
      // Find existing record for today and update timeOut
      const attendanceRef = ref(database, 'attendance');
      
      // This is a simplified approach - in production, you'd want to query more specifically
      // For now, we'll create a new record with only timeOut
      const newRecordRef = push(attendanceRef);
      await update(newRecordRef, {
        employeeId,
        date: dateString,
        timeIn: '',
        timeOut: timeString,
        shift: now.getHours() < 12 ? 'Day' : 'Night',
        status: 'present',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      throw new Error('Failed to record clock-out');
    }
  }, []);

  return { 
    attendanceRecords, 
    loading, 
    error, 
    addAttendanceRecord, 
    updateAttendanceRecord,
    recordClockIn,
    recordClockOut
  };
}

// Break hooks
export function useBreaks() {
  const [breakRecords, setBreakRecords] = useState<BreakRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const breaksRef = query(
      ref(database, 'breaks'),
      orderByChild('status'),
      equalTo('on_break')
    );
    
    const unsubscribe = onValue(breaksRef,
      (snapshot) => {
        const breakData: BreakRecord[] = [];
        snapshot.forEach((childSnapshot) => {
          breakData.push({ id: childSnapshot.key, ...childSnapshot.val() } as BreakRecord);
        });
        setBreakRecords(breakData);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addBreakRecord = useCallback(async (record: Omit<BreakRecord, 'id'>) => {
    try {
      const breaksRef = ref(database, 'breaks');
      const newRecordRef = push(breaksRef);
      await update(newRecordRef, {
        ...record,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      throw new Error('Failed to add break record');
    }
  }, []);

  const updateBreakRecord = useCallback(async (id: string, record: Partial<BreakRecord>) => {
    try {
      const recordRef = ref(database, `breaks/${id}`);
      await update(recordRef, {
        ...record,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      throw new Error('Failed to update break record');
    }
  }, []);

  return { breakRecords, loading, error, addBreakRecord, updateBreakRecord };
}

// Leave hooks
export function useLeaves() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const leavesRef = ref(database, 'leaves');
    
    const unsubscribe = onValue(leavesRef,
      (snapshot) => {
        const leaveData: LeaveRequest[] = [];
        snapshot.forEach((childSnapshot) => {
          leaveData.push({ id: childSnapshot.key, ...childSnapshot.val() } as LeaveRequest);
        });
        setLeaveRequests(leaveData);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addLeaveRequest = useCallback(async (request: Omit<LeaveRequest, 'id'>) => {
    try {
      const leavesRef = ref(database, 'leaves');
      const newRequestRef = push(leavesRef);
      await update(newRequestRef, {
        ...request,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      throw new Error('Failed to add leave request');
    }
  }, []);

  const updateLeaveRequest = useCallback(async (id: string, request: Partial<LeaveRequest>) => {
    try {
      const requestRef = ref(database, `leaves/${id}`);
      await update(requestRef, {
        ...request,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      throw new Error('Failed to update leave request');
    }
  }, []);

  return { leaveRequests, loading, error, addLeaveRequest, updateLeaveRequest };
}

// Workstation hooks
export function useWorkstations() {
  const [workstations, setWorkstations] = useState<Workstation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const workstationsRef = ref(database, 'workstations');
    
    const unsubscribe = onValue(workstationsRef,
      (snapshot) => {
        const workstationData: Workstation[] = [];
        snapshot.forEach((childSnapshot) => {
          workstationData.push({ id: childSnapshot.key, ...childSnapshot.val() } as Workstation);
        });
        setWorkstations(workstationData);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addWorkstation = useCallback(async (workstation: Omit<Workstation, 'id'>) => {
    try {
      const workstationsRef = ref(database, 'workstations');
      const newWorkstationRef = push(workstationsRef);
      await update(newWorkstationRef, {
        ...workstation,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      throw new Error('Failed to add workstation');
    }
  }, []);

  const updateWorkstation = useCallback(async (id: string, workstation: Partial<Workstation>) => {
    try {
      const workstationRef = ref(database, `workstations/${id}`);
      await update(workstationRef, {
        ...workstation,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      throw new Error('Failed to update workstation');
    }
  }, []);

  return { workstations, loading, error, addWorkstation, updateWorkstation };
}