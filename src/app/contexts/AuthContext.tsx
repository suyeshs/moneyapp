import React, { createContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../utils/firebase';

interface AuthContextProps {
  user: User | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextProps>({ user: null, loading: true });

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
