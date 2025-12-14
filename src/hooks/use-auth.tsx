"use client";

import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/lib/types';
import { useToast } from './use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { auth } from '@/lib/firebase/client';
import { onAuthStateChanged, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, signOut } from 'firebase/auth';
import { userService } from '@/services/user-service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithPhone: (phone: string, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  verifyOtp: (confirmationResult: ConfirmationResult, otp: string, additionalData?: Partial<User> & { referralCode?: string }) => Promise<void>;
  logout: () => void;
  updateUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const appUser = await userService.getUser(firebaseUser.uid);
          if (appUser) {
            setUser(appUser);

            // GA Tracking
            if (typeof window !== 'undefined' && window.dataLayer) {
              window.dataLayer.push({
                event: 'user_login',
                user_id: appUser.id
              });
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithPhone = async (phone: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
      return confirmationResult;
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      throw error;
    }
  };

  const verifyOtp = async (confirmationResult: ConfirmationResult, otp: string, additionalData?: Partial<User> & { referralCode?: string }) => {
    try {
      const result = await confirmationResult.confirm(otp);
      const firebaseUser = result.user;

      let appUser: User | null = null;
      const isSignupIntent = !!(additionalData && additionalData.name);

      const token = await firebaseUser.getIdToken();

      if (isSignupIntent) {
        // Call Signup API (Handled referrals + creates user)
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken: token,
            name: additionalData.name,
            referralCode: additionalData.referralCode
          })
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Signup failed");
        }

        const data = await response.json();
        appUser = data.user;
      } else {
        // Sync logic
        appUser = await userService.syncUser(firebaseUser.uid, firebaseUser.phoneNumber || "");
      }

      // Set Session Cookie for Middleware
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token })
      });

      if (appUser) {
        setUser(appUser);

        // Handle Redirection based on Role
        if (appUser.role === 'organizer' && appUser.organizerStatus === 'approved') {
          if (appUser.partnerType === 'experience') {
            router.push('/vendor/dashboard');
          } else {
            router.push('/organizer/trips');
          }
        } else if (appUser.role === 'organizer' && appUser.organizerStatus !== 'approved') {
          router.push('/dashboard');
        } else if (appUser.role === 'admin') {
          router.push('/management');
        } else {
          const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/';
          router.push(redirectUrl);
        }
      }

    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Clear cookie
      // We can implement a server-side logout route to clear cookie too
      document.cookie = 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'user_logout',
          user_id: undefined
        });
      }
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const updateUser = async (updatedUser: User | null) => {
    setUser(updatedUser);
    if (updatedUser) {
      try {
        await userService.updateUser(updatedUser.id, updatedUser);
      } catch (e) {
        console.error("Failed to update user in backend", e);
      }
    }
  };

  const value = { user, loading, signInWithPhone, verifyOtp, logout, updateUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
