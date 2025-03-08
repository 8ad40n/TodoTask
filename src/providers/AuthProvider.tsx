"use client";
import { app } from "@/firebase/firebase.config";
import { AuthContextType } from "@/types";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { createContext, ReactNode, useEffect, useState } from "react";

const auth = getAuth(app);

const defaultAuthContext: AuthContextType = {
  LoginWithGoogle: async () => {
    throw new Error("Not implemented");
  },
  Logout: async () => {
    throw new Error("Not implemented");
  },
  loading: true,
  user: null,
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export default function AuthProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const googleProvider = new GoogleAuthProvider();

  // Login with google
  const LoginWithGoogle = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider);
  };

  // Sign Out
  const Logout = () => {
    setLoading(true);
    return signOut(auth);
  };

  // Manage user
  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("User in Auth state change ", currentUser);
        setUser(currentUser);
        setLoading(false);
      }
      else {
        console.log("User logged out");
        setUser(null);
        setLoading(false);
      }
    });
  }, []);

  const authInfo: AuthContextType = {
    LoginWithGoogle,
    Logout,
    loading,
    user,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
}
