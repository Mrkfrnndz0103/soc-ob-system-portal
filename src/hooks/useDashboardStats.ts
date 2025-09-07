import { useEffect, useState } from 'react';
import { 
  ref, 
  onValue, 
  query,
  orderByChild,
  equalTo
} from 'firebase/database';
import { database } from '@/lib/firebase';

interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  lateArrivals: number;
  attendanceRate: number;
  pendingLeaves: number;
  activeBreaks: number;
  allocatedWorkstations: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = () => {
      try {
        // Get today's date
        const today = new Date().toISOString().split('T')[0];

        // Fetch total employees
        const employeesRef = ref(database, 'employees');
        onValue(employeesRef, (snapshot) => {
          const totalEmployees = snapshot.size;
          
          // Fetch attendance records for today
          const attendanceRef = query(
            ref(database, 'attendance'),
            orderByChild('date'),
            equalTo(today)
          );
          
          onValue(attendanceRef, (attendanceSnapshot) => {
            const attendanceRecords: any[] = [];
            attendanceSnapshot.forEach((childSnapshot) => {
              attendanceRecords.push(childSnapshot.val());
            });

            const presentToday = attendanceRecords.filter((record: any) => 
              record.status === 'present' || record.status === 'late'
            ).length;
            
            const lateArrivals = attendanceRecords.filter((record: any) => 
              record.status === 'late'
            ).length;
            
            const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 1000) / 10 : 0;

            // Fetch pending leaves
            const leavesRef = query(
              ref(database, 'leaves'),
              orderByChild('status'),
              equalTo('pending')
            );
            
            onValue(leavesRef, (leavesSnapshot) => {
              const pendingLeaves = leavesSnapshot.size;

              // Fetch active breaks
              const breaksRef = query(
                ref(database, 'breaks'),
                orderByChild('status'),
                equalTo('on_break')
              );
              
              onValue(breaksRef, (breaksSnapshot) => {
                const activeBreaks = breaksSnapshot.size;

                // Fetch workstation allocations
                const workstationsRef = ref(database, 'workstations');
                
                onValue(workstationsRef, (workstationsSnapshot) => {
                  let allocatedWorkstations = 0;
                  workstationsSnapshot.forEach((childSnapshot) => {
                    const data = childSnapshot.val();
                    allocatedWorkstations += data.assignedEmployees?.length || 0;
                  });

                  setStats({
                    totalEmployees,
                    presentToday,
                    lateArrivals,
                    attendanceRate,
                    pendingLeaves,
                    activeBreaks,
                    allocatedWorkstations
                  });
                  
                  setLoading(false);
                });
              });
            });
          });
        });
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}