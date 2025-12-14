

/**
 * @file This file is the cornerstone of the application's state management for this prototype.
 * It creates a React Context (`MockDataContext`) that serves as a centralized, in-memory "database".
 *
 * --- How It Works ---
 * 1.  **Data Initialization**: It imports the raw, static data from `src/lib/data.ts`.
 * 2.  **Stateful Storage**: It loads this raw data into React's `useState` hooks. This makes the data "live" and reactive.
 * 3.  **Global Provider**: The `MockDataProvider` component wraps the entire application (`src/app/layout.tsx`), making the live data and its setter functions available to all child components.
 * 4.  **Data Consumption**: Components access this live data and the functions to modify it by using the `useMockData` custom hook.
 *
 * This architecture decouples the UI components from the data source, allowing for a clean, scalable, and predictable
 * state management solution perfect for a frontend-only prototype. When a component updates the state (e.g., adding a booking),
 * the change is reflected globally, and all components using that piece of state automatically re-render.
 */

"use client";

import type { Trip, Organizer, Booking, BlogStory, Coupon, WalletTransaction, Referral, Review, Lead, LeadPackage, FAQ, User, AuditLog, Experience, ExperienceVendor, ExperienceBooking } from "@/lib/types";
import { initialTrips, initialOrganizers, initialBookings, initialBlogStories, initialCoupons, initialWalletTransactions, initialReferrals, initialTravelCities, initialTravelInterests, initialTripCategories, initialTripDifficulties, initialLeads, initialLeadPackages, initialFaqs, initialUsers, initialAuditLogs, initialExperiences, initialExperienceBookings, initialExperienceVendors } from "@/lib/data";
import React, { useState, createContext, useContext, ReactNode } from "react";
import { useToast } from "./use-toast";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// --- TYPE DEFINITION ---
// Defines the shape of the data and functions that will be available through the context.
interface MockDataContextType {
    // Trips
    trips: Trip[];
    setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
    addTrip: (trip: Trip) => void;
    addReview: (tripId: string, review: Review) => void;
    // Organizers
    organizers: Record<string, Organizer>;
    setOrganizers: React.Dispatch<React.SetStateAction<Record<string, Organizer>>>;
    // Users
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    // Bookings
    bookings: Booking[];
    setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
    addBooking: (booking: Booking, couponCode?: string) => void; // Modified to accept coupon code
    requestRefund: (bookingId: string, travelerName: string, tripTitle: string) => void;
    approveRefund: (bookingId: string, amount: number, remarks?: string) => void;
    rejectRefund: (bookingId: string, remarks: string) => void;
    processRefund: (bookingId: string) => void;
    // Experiences
    experiences: Experience[];
    setExperiences: React.Dispatch<React.SetStateAction<Experience[]>>;
    addExperience: (experience: Experience) => void;
    experienceVendors: Record<string, ExperienceVendor>;
    experienceBookings: ExperienceBooking[];
    setExperienceBookings: React.Dispatch<React.SetStateAction<ExperienceBooking[]>>;
    requestExperienceRefund: (bookingId: string) => void;
    approveExperienceRefund: (bookingId: string, amount: number, remarks?: string) => void;
    rejectExperienceRefund: (bookingId: string, remarks: string) => void;
    processExperienceRefund: (bookingId: string) => void;
    // Blog
    blogStories: BlogStory[];
    setBlogStories: React.Dispatch<React.SetStateAction<BlogStory[]>>;
    addBlogStory: (story: BlogStory) => void;
    // Saved Trips (Wishlist)
    savedTrips: string[]; // An array of trip IDs
    toggleSaveTrip: (tripId: string) => void;
    // Coupons
    coupons: Coupon[];
    setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
    addCoupon: (coupon: Coupon) => void;
    // Wallet & Referrals
    walletTransactions: WalletTransaction[];
    setWalletTransactions: React.Dispatch<React.SetStateAction<WalletTransaction[]>>;
    referrals: Referral[];
    setReferrals: React.Dispatch<React.SetStateAction<Referral[]>>;
    referralBonusAmount: number; // Admin-controllable value
    setReferralBonusAmount: React.Dispatch<React.SetStateAction<number>>;
    // Leads
    leads: Lead[];
    setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
    addLead: (lead: Lead) => void;
    checkForLeadConversion: (booking: Booking) => void;
    leadPackages: LeadPackage[];
    setLeadPackages: React.Dispatch<React.SetStateAction<LeadPackage[]>>;
    // Platform Content
    faqs: FAQ[];
    setFaqs: React.Dispatch<React.SetStateAction<FAQ[]>>;
    // Admin-managed Tags
    travelCities: string[];
    setTravelCities: React.Dispatch<React.SetStateAction<string[]>>;
    travelInterests: string[];
    setTravelInterests: React.Dispatch<React.SetStateAction<string[]>>;
    tripCategories: string[];
    setTripCategories: React.Dispatch<React.SetStateAction<string[]>>;
    tripDifficulties: string[];
    setTripDifficulties: React.Dispatch<React.SetStateAction<string[]>>;
    // Platform Settings
    commissionRate: number;
    setCommissionRate: React.Dispatch<React.SetStateAction<number>>;
    cashbackRateStandard: number;
    setCashbackRateStandard: React.Dispatch<React.SetStateAction<number>>;
    cashbackRatePro: number;
    setCashbackRatePro: React.Dispatch<React.SetStateAction<number>>;
    proPriceMonthly: number;
    setProPriceMonthly: React.Dispatch<React.SetStateAction<number>>;
    proPriceAnnual: number;
    setProPriceAnnual: React.Dispatch<React.SetStateAction<number>>;
    proSubscriptionEnabled: boolean;
    setProSubscriptionEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    // Audit Logs
    auditLogs: AuditLog[];
    addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
}

// Create the React Context.
const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

// --- DATA PROVIDER COMPONENT ---
// This component will wrap the application to provide all the mock data.
export const MockDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { toast } = useToast();
    // --- STATE INITIALIZATION ---
    // Load the initial static data into live React state.
    const [trips, setTrips] = useState<Trip[]>(initialTrips);
    const [organizers, setOrganizers] = useState<Record<string, Organizer>>(initialOrganizers);
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [bookings, setBookings] = useState<Booking[]>(initialBookings);
    const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
    const [experienceVendors, setExperienceVendors] = useState<Record<string, ExperienceVendor>>(initialExperienceVendors);
    const [experienceBookings, setExperienceBookings] = useState<ExperienceBooking[]>(initialExperienceBookings);
    const [blogStories, setBlogStories] = useState<BlogStory[]>(initialBlogStories);
    const [savedTrips, setSavedTrips] = useState<string[]>([]); // Starts empty
    const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
    const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(initialWalletTransactions);
    const [referrals, setReferrals] = useState<Referral[]>(initialReferrals);
    const [referralBonusAmount, setReferralBonusAmount] = useState<number>(500); // Default bonus amount
    const [travelCities, setTravelCities] = useState<string[]>(initialTravelCities);
    const [travelInterests, setTravelInterests] = useState<string[]>(initialTravelInterests);
    const [tripCategories, setTripCategories] = useState<string[]>(initialTripCategories);
    const [tripDifficulties, setTripDifficulties] = useState<string[]>(initialTripDifficulties);
    const [commissionRate, setCommissionRate] = useState<number>(10);
    const [cashbackRateStandard, setCashbackRateStandard] = useState<number>(2);
    const [cashbackRatePro, setCashbackRatePro] = useState<number>(5);
    const [proPriceMonthly, setProPriceMonthly] = useState<number>(599);
    const [proPriceAnnual, setProPriceAnnual] = useState<number>(499);
    const [proSubscriptionEnabled, setProSubscriptionEnabled] = useState<boolean>(true);
    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const [leadPackages, setLeadPackages] = useState<LeadPackage[]>(initialLeadPackages);
    const [faqs, setFaqs] = useState<FAQ[]>(initialFaqs);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);


    // --- HELPER FUNCTIONS ---
    // These functions provide a clean API for components to modify the state.

    const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
        const newLog: AuditLog = {
            ...log,
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
        };
        setAuditLogs(prev => [newLog, ...prev]);
    };

    // Adds a new trip to the beginning of the trips array.
    const addTrip = (trip: Trip) => {
        setTrips(currentTrips => [trip, ...currentTrips]);
    };

    const addExperience = (experience: Experience) => {
        setExperiences(currentExperiences => [experience, ...currentExperiences]);
    };

    // Adds a new booking and checks for lead conversion.
    const addBooking = (booking: Booking, couponCode?: string) => {
        setBookings(currentBookings => [booking, ...currentBookings]);
        checkForLeadConversion(booking);

        if (couponCode) {
            setCoupons(prevCoupons => prevCoupons.map(c => {
                if (c.code.toLowerCase() === couponCode.toLowerCase()) {
                    return { ...c, timesUsed: (c.timesUsed || 0) + 1 };
                }
                return c;
            }));
        }
    }

    // Adds a new blog story.
    const addBlogStory = (story: BlogStory) => {
        setBlogStories(currentStories => [story, ...currentStories]);
    }
    
    // Toggles a trip's saved status.
    const toggleSaveTrip = (tripId: string) => {
        setSavedTrips(currentSavedTrips => {
            if (currentSavedTrips.includes(tripId)) {
                toast({ title: "Removed from Wishlist", description: "This trip has been removed from your saved trips."});
                return currentSavedTrips.filter(id => id !== tripId);
            } else {
                 toast({ title: "Added to Wishlist!", description: "You can find this trip in your saved trips."});
                return [...currentSavedTrips, tripId];
            }
        });
    };
    
    const addReview = (tripId: string, review: Review) => {
        setTrips(currentTrips => {
            return currentTrips.map(trip => {
                if (trip.id === tripId) {
                    const updatedReviews = [...(trip.reviews || []), review];
                    return { ...trip, reviews: updatedReviews };
                }
                return trip;
            });
        });
        toast({
            title: "Review Submitted!",
            description: "Thank you for sharing your experience.",
        });
    };
    
    const addLead = (lead: Lead) => {
        setLeads(prev => [lead, ...prev]);
         toast({ title: "Message Sent!", description: "Your question has been sent to the organizer." });
    };

    const checkForLeadConversion = (booking: Booking) => {
        if (!booking.travelerId || !booking.tripId) return;

        const matchingLeadIndex = leads.findIndex(lead => 
            lead.travelerId === booking.travelerId &&
            lead.tripId === booking.tripId &&
            lead.status === 'unlocked'
        );

        if (matchingLeadIndex !== -1) {
            const lead = leads[matchingLeadIndex];

            // 1. Update lead status to 'converted'
            setLeads(prev => prev.map((l, index) => 
                index === matchingLeadIndex ? { ...l, status: 'converted' } : l
            ));

            // 2. Credit back the lead credit to the organizer
            setOrganizers(prev => {
                const organizer = prev[lead.organizerId];
                if (organizer) {
                    return {
                        ...prev,
                        [lead.organizerId]: {
                            ...organizer,
                            leadCredits: (organizer.leadCredits || 0) + 1
                        }
                    };
                }
                return prev;
            });
            
            // In a real app, you'd trigger a proper notification. For now, a console log or toast.
            console.log(`Lead ${lead.id} converted! 1 credit returned to organizer ${lead.organizerId}.`);
            toast({
                title: "Lead Converted!",
                description: `A traveler you unlocked has booked a trip. 1 lead credit has been returned to your account.`
            });
        }
    };
    
    const addCoupon = (coupon: Coupon) => {
        setCoupons(prev => [coupon, ...prev]);
    };

    const requestRefund = (bookingId: string, travelerName: string, tripTitle: string) => {
        const booking = bookings.find(b => b.id === bookingId);
        if (!booking) return;

        setBookings(prev => prev.map(b => 
            b.id === bookingId ? { ...b, refundStatus: 'requested', refundRequestDate: new Date().toISOString() } : b
        ));
        addAuditLog({
            adminName: travelerName,
            action: 'Refund Requested',
            entityType: 'Booking',
            entityId: bookingId,
            entityName: tripTitle,
            details: `Traveler ${travelerName} requested a refund.`,
        });
        toast({
            title: "Refund Requested",
            description: "Your request has been sent to the trip organizer for review."
        });
    };

     const approveRefund = (bookingId: string, amount: number, remarks?: string) => {
        const booking = bookings.find(b => b.id === bookingId);
        const organizer = booking ? organizers[booking.organizerId] : null;
        if (!booking || !organizer) return;
        
        setBookings(prev => prev.map(b => 
            b.id === bookingId ? { ...b, refundStatus: 'approved_by_organizer', approvedRefundAmount: amount, cancellationReason: remarks } : b
        ));
        addAuditLog({
            adminName: organizer.name,
            action: 'Refund Approved by Organizer',
            entityType: 'Booking',
            entityId: bookingId,
            entityName: booking.tripTitle,
            details: `Approved refund amount: ₹${amount}. Remarks: ${remarks || 'N/A'}`
        });
        toast({ title: "Refund Approved", description: "Request has been sent to the admin for final processing." });
    };

    const rejectRefund = (bookingId: string, remarks: string) => {
        const booking = bookings.find(b => b.id === bookingId);
        const organizer = booking ? organizers[booking.organizerId] : null;
        if (!booking || !organizer) return;
        
        setBookings(prev => prev.map(b => 
            b.id === bookingId ? { ...b, refundStatus: 'rejected_by_organizer', refundRejectionReason: remarks, cancellationReason: remarks } : b
        ));
        addAuditLog({
            adminName: organizer.name,
            action: 'Refund Rejected by Organizer',
            entityType: 'Booking',
            entityId: bookingId,
            entityName: booking.tripTitle,
            details: `Reason: ${remarks}`,
        });
        toast({ variant: "destructive", title: "Refund Rejected", description: "The request has been rejected." });
    };
    
    const processRefund = (bookingId: string) => {
        const booking = bookings.find(b => b.id === bookingId);
        if (!booking) return;
        
        setBookings(prev => prev.map(b => 
            b.id === bookingId ? { ...b, refundStatus: 'processed', paymentStatus: 'Cancelled', refundProcessedDate: new Date().toISOString(), refundUtr: `rfnd_${Math.random().toString(36).substring(2, 16)}` } : b
        ));
        addAuditLog({
            adminName: 'Admin',
            action: 'Refund Processed by Admin',
            entityType: 'Booking',
            entityId: bookingId,
            entityName: booking.tripTitle,
            details: `Processed refund of ₹${booking.approvedRefundAmount || booking.amountPaid}.`,
        });
        toast({ title: "Refund Processed", description: `A refund has been processed for booking ${booking.id.slice(-6)}.` });
    };
    
    // --- EXPERIENCE REFUND LOGIC ---
    const requestExperienceRefund = (bookingId: string) => {
        const booking = experienceBookings.find(b => b.id === bookingId);
        if (!booking) return;

        setExperienceBookings(prev => prev.map(b => 
            b.id === bookingId ? { ...b, refundStatus: 'requested', refundRequestDate: new Date().toISOString() } : b
        ));
        toast({
            title: "Refund Requested",
            description: "Your request has been sent to the experience vendor for review."
        });
    }
    
    const approveExperienceRefund = (bookingId: string, amount: number, remarks?: string) => {
        const booking = experienceBookings.find(b => b.id === bookingId);
        if (!booking) return;

        setExperienceBookings(prev => prev.map(b => 
            b.id === bookingId ? { ...b, refundStatus: 'approved_by_organizer', approvedRefundAmount: amount, cancellationReason: remarks } : b
        ));
        toast({ title: "Refund Approved", description: "Request has been sent to the admin for final processing." });
    }
    
    const rejectExperienceRefund = (bookingId: string, remarks: string) => {
        setExperienceBookings(prev => prev.map(b => 
            b.id === bookingId ? { ...b, refundStatus: 'rejected_by_organizer', refundRejectionReason: remarks, cancellationReason: remarks } : b
        ));
        toast({ variant: "destructive", title: "Refund Rejected", description: "The request has been rejected." });
    };

    const processExperienceRefund = (bookingId: string) => {
        const booking = experienceBookings.find(b => b.id === bookingId);
        if (!booking) return;
        
        setExperienceBookings(prev => prev.map(b => 
            b.id === bookingId ? { ...b, refundStatus: 'processed', status: 'Cancelled', refundProcessedDate: new Date().toISOString(), refundUtr: `rfnd_${Math.random().toString(36).substring(2, 16)}` } : b
        ));
        toast({ title: "Refund Processed", description: `A refund of ₹${booking.approvedRefundAmount || booking.totalPrice} has been processed.` });
    };


    // The value object holds all the state and functions to be provided to consumers.
    const value = { 
        trips, setTrips, addTrip, addReview,
        organizers, setOrganizers, 
        users, setUsers,
        bookings, setBookings, addBooking, requestRefund, approveRefund, rejectRefund, processRefund,
        experiences, setExperiences, addExperience, experienceVendors,
        experienceBookings, setExperienceBookings,
        requestExperienceRefund, approveExperienceRefund, rejectExperienceRefund, processExperienceRefund,
        blogStories, setBlogStories, addBlogStory,
        savedTrips, toggleSaveTrip, 
        coupons, setCoupons, addCoupon,
        walletTransactions, setWalletTransactions,
        referrals, setReferrals,
        referralBonusAmount, setReferralBonusAmount,
        leads, setLeads, addLead, checkForLeadConversion,
        leadPackages, setLeadPackages,
        faqs, setFaqs,
        travelCities, setTravelCities,
        travelInterests, setTravelInterests,
        tripCategories, setTripCategories,
        tripDifficulties, setTripDifficulties,
        commissionRate, setCommissionRate,
        cashbackRateStandard, setCashbackRateStandard,
        cashbackRatePro, setCashbackRatePro,
        proPriceMonthly, setProPriceMonthly,
        proPriceAnnual, setProPriceAnnual,
        proSubscriptionEnabled, setProSubscriptionEnabled,
        auditLogs, addAuditLog,
    };

    return (
        <MockDataContext.Provider value={value}>
            {children}
        </MockDataContext.Provider>
    );
};


// --- CUSTOM HOOK ---
// A custom hook for easily accessing the mock data context from any component.
export const useMockData = () => {
    const context = useContext(MockDataContext);
    if (context === undefined) {
        throw new Error('useMockData must be used within a MockDataProvider');
    }
    return context;
};

