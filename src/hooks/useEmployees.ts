import { useEffect, useState, useCallback } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { syncEmployeesToFirebase } from '@/lib/googleSheetsSync';
import { Employee } from '@/types';

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
          employeeData.push(childSnapshot.val() as Employee);
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

  const syncFromGoogleSheets = useCallback(async () => {
    try {
      setLoading(true);
      await syncEmployeesToFirebase();
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { employees, loading, error, syncFromGoogleSheets };
}