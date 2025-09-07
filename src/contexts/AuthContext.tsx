'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { auth, db } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const appUser: User = {
              id: firebaseUser.uid,
              name: userData.name || firebaseUser.displayName || 'Admin User',
              email: firebaseUser.email || '',
              role: userData.role || 'pic',
              department: userData.department || 'Operations',
              createdAt: userData.createdAt?.toDate().toISOString() || new Date().toISOString(),
              updatedAt: userData.updatedAt?.toDate().toISOString() || new Date().toISOString()
            };
            setUser(appUser);
            setIsAuthenticated(true);
          } else {
            // Create default user if not exists
            const defaultUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Admin User',
              email: firebaseUser.email || '',
              role: 'pic',
              department: 'Operations',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setUser(defaultUser);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to basic user data
          const fallbackUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Admin User',
            email: firebaseUser.email || '',
            role: 'pic',
            department: 'Operations',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setUser(fallbackUser);
          setIsAuthenticated(true);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}