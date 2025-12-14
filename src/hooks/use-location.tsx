

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useAuth } from './use-auth';

// --- TYPE DEFINITION ---
interface LocationContextType {
  selectedCity: string | null;
  setSelectedCity: (city: string | null) => void;
  isLoading: boolean;
}

// Create the React Context
const LocationContext = createContext<LocationContextType | undefined>(undefined);


// --- LOCATION PROVIDER COMPONENT ---
export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- LOCALSTORAGE & PROFILE HYDRATION ---
  useEffect(() => {
    setIsLoading(true);
    let cityToSet: string | null = null;
    
    // 1. Check for logged-in user's profile first.
    if (user?.homeCity) {
      cityToSet = user.homeCity;
    } else {
      // 2. If no user profile, check localStorage.
      try {
        const storedCity = localStorage.getItem('travonex-location');
        if (storedCity) {
          cityToSet = storedCity;
        }
      } catch (error) {
        console.error("Failed to read location from localStorage", error);
      }
    }
    
    // 3. Set the city if one was found.
    if (cityToSet) {
        setSelectedCity(cityToSet);
    }

    setIsLoading(false);
  }, [user]);

  // --- City Update Handler ---
  const handleSetSelectedCity = (city: string | null) => {
    setSelectedCity(city);
    if (city) {
      try {
        localStorage.setItem('travonex-location', city);
      } catch (error) {
        console.error("Failed to write location to localStorage", error);
      }
    } else {
      localStorage.removeItem('travonex-location');
    }
  };

  const value = useMemo(() => ({
    selectedCity,
    setSelectedCity: handleSetSelectedCity,
    isLoading,
  }), [selectedCity, isLoading]);

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

// --- CUSTOM HOOK ---
export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
