'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ProtectedRoute({ 
  children,
  requiredRole
}: { 
  children: React.ReactNode;
  requiredRole?: 'Supervisor' | 'High Admin' | 'PIC';
}) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
    
    if (requiredRole && user && user.role !== requiredRole) {
      // Check role hierarchy
      const roleHierarchy = {
        'PIC': 1,
        'Supervisor': 2,
        'High Admin': 3
      };
      
      if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, requiredRole, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}