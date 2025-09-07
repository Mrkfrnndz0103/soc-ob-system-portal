import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
    const q = query(collection(db, 'employees'), orderBy('name'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const employeeData: Employee[] = [];
        snapshot.forEach((doc) => {
          employeeData.push({ id: doc.id, ...doc.data() } as Employee);
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

  const addEmployee = async (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newEmployee = {
        ...employee,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      await addDoc(collection(db, 'employees'), newEmployee);
    } catch (err) {
      throw new Error('Failed to add employee');
    }
  };

  const updateEmployee = async (id: string, employee: Partial<Employee>) => {
    try {
      const employeeRef = doc(db, 'employees', id);
      await updateDoc(employeeRef, {
        ...employee,
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      throw new Error('Failed to update employee');
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'employees', id));
    } catch (err) {
      throw new Error('Failed to delete employee');
    }
  };

  return { employees, loading, error, addEmployee, updateEmployee, deleteEmployee };
}

// Attendance hooks
export function useAttendance(date?: string) {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let q;
    
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      
      q = query(
        collection(db, 'attendance'),
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay)),
        orderBy('date', 'desc')
      );
    } else {
      // Get today's records by default
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      
      q = query(
        collection(db, 'attendance'),
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay)),
        orderBy('date', 'desc')
      );
    }
    
    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const attendanceData: AttendanceRecord[] = [];
        snapshot.forEach((doc) => {
          attendanceData.push({ id: doc.id, ...doc.data() } as AttendanceRecord);
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

  const addAttendanceRecord = async (record: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newRecord = {
        ...record,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      await addDoc(collection(db, 'attendance'), newRecord);
    } catch (err) {
      throw new Error('Failed to add attendance record');
    }
  };

  const updateAttendanceRecord = async (id: string, record: Partial<AttendanceRecord>) => {
    try {
      const recordRef = doc(db, 'attendance', id);
      await updateDoc(recordRef, {
        ...record,
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      throw new Error('Failed to update attendance record');
    }
  };

  return { attendanceRecords, loading, error, addAttendanceRecord, updateAttendanceRecord };
}

// Break hooks
export function useBreaks() {
  const [breakRecords, setBreakRecords] = useState<BreakRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'breaks'),
      where('status', '==', 'on_break'),
      orderBy('startTime', 'desc')
    );
    
    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const breakData: BreakRecord[] = [];
        snapshot.forEach((doc) => {
          breakData.push({ id: doc.id, ...doc.data() } as BreakRecord);
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

  const addBreakRecord = async (record: Omit<BreakRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newRecord = {
        ...record,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      await addDoc(collection(db, 'breaks'), newRecord);
    } catch (err) {
      throw new Error('Failed to add break record');
    }
  };

  const updateBreakRecord = async (id: string, record: Partial<BreakRecord>) => {
    try {
      const recordRef = doc(db, 'breaks', id);
      await updateDoc(recordRef, {
        ...record,
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      throw new Error('Failed to update break record');
    }
  };

  return { breakRecords, loading, error, addBreakRecord, updateBreakRecord };
}

// Leave hooks
export function useLeaves() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'leaves'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const leaveData: LeaveRequest[] = [];
        snapshot.forEach((doc) => {
          leaveData.push({ id: doc.id, ...doc.data() } as LeaveRequest);
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

  const addLeaveRequest = async (request: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newRequest = {
        ...request,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      await addDoc(collection(db, 'leaves'), newRequest);
    } catch (err) {
      throw new Error('Failed to add leave request');
    }
  };

  const updateLeaveRequest = async (id: string, request: Partial<LeaveRequest>) => {
    try {
      const requestRef = doc(db, 'leaves', id);
      await updateDoc(requestRef, {
        ...request,
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      throw new Error('Failed to update leave request');
    }
  };

  return { leaveRequests, loading, error, addLeaveRequest, updateLeaveRequest };
}

// Workstation hooks
export function useWorkstations() {
  const [workstations, setWorkstations] = useState<Workstation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'workstations'), orderBy('name'));
    
    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const workstationData: Workstation[] = [];
        snapshot.forEach((doc) => {
          workstationData.push({ id: doc.id, ...doc.data() } as Workstation);
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

  const addWorkstation = async (workstation: Omit<Workstation, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newWorkstation = {
        ...workstation,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      await addDoc(collection(db, 'workstations'), newWorkstation);
    } catch (err) {
      throw new Error('Failed to add workstation');
    }
  };

  const updateWorkstation = async (id: string, workstation: Partial<Workstation>) => {
    try {
      const workstationRef = doc(db, 'workstations', id);
      await updateDoc(workstationRef, {
        ...workstation,
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      throw new Error('Failed to update workstation');
    }
  };

  return { workstations, loading, error, addWorkstation, updateWorkstation };
}