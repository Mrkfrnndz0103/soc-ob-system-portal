import { useEffect, useState, useCallback } from 'react';
import { 
  ref, 
  onValue, 
  push, 
  update,
  query,
  orderByChild,
  equalTo
} from 'firebase/database';
import { database } from '@/lib/firebase';
import { recordAttendanceToSheet, getAttendanceDataFromSheet } from '@/lib/googleSheetsSync';
import { AttendanceRecord } from '@/types';

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
          attendanceData.push(childSnapshot.val() as AttendanceRecord);
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

  const recordClockIn = useCallback(async (employeeId: string) => {
    try {
      const now = new Date();
      const dateString = now.toISOString().split('T')[0];
      const timeString = now.toTimeString().substring(0, 5); // HH:MM format
      
      // Determine if late (after 8:00 AM)
      const lateThreshold = new Date();
      lateThreshold.setHours(8, 0, 0, 0);
      const status = now > lateThreshold ? 'late' : 'present';
      
      // Record in Firebase
      const attendanceRef = ref(database, 'attendance');
      const newRecordRef = push(attendanceRef);
      const recordId = newRecordRef.key;
      
      if (!recordId) {
        throw new Error('Failed to generate record ID');
      }
      
      const recordData = {
        id: recordId,
        employeeId,
        date: dateString,
        timeIn: timeString,
        timeOut: '',
        shift: now.getHours() < 12 ? 'Day' : 'Night',
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await update(newRecordRef, recordData);
      
      // Also record in Google Sheets
      await recordAttendanceToSheet(employeeId, timeString);
      
      return recordData;
    } catch (err) {
      console.error('Error recording clock-in:', err);
      throw new Error('Failed to record clock-in');
    }
  }, []);

  const recordClockOut = useCallback(async (employeeId: string) => {
    try {
      const now = new Date();
      const dateString = now.toISOString().split('T')[0];
      const timeString = now.toTimeString().substring(0, 5); // HH:MM format
      
      // Find existing record for today and update timeOut
      const attendanceRef = query(
        ref(database, 'attendance'),
        orderByChild('employeeId'),
        equalTo(employeeId)
      );
      
      // In a real implementation, you'd want to find the specific record for today
      // For now, we'll create a new record with only timeOut
      const newRecordRef = push(ref(database, 'attendance'));
      const recordId = newRecordRef.key;
      
      if (!recordId) {
        throw new Error('Failed to generate record ID');
      }
      
      const recordData = {
        id: recordId,
        employeeId,
        date: dateString,
        timeIn: '',
        timeOut: timeString,
        shift: now.getHours() < 12 ? 'Day' : 'Night',
        status: 'present',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await update(newRecordRef, recordData);
      
      // Also record in Google Sheets
      await recordAttendanceToSheet(employeeId, undefined, timeString);
      
      return recordData;
    } catch (err) {
      console.error('Error recording clock-out:', err);
      throw new Error('Failed to record clock-out');
    }
  }, []);

  const loadFromGoogleSheets = useCallback(async () => {
    try {
      setLoading(true);
      const sheetData = await getAttendanceDataFromSheet(date);
      setAttendanceRecords(sheetData as AttendanceRecord[]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  return { 
    attendanceRecords, 
    loading, 
    error, 
    recordClockIn,
    recordClockOut,
    loadFromGoogleSheets
  };
}