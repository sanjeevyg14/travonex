

"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function OrganizerDashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        // This page now acts as a router for Trip Organizers.
        router.replace('/organizer/trips');
    }, [user, loading, router]);
    
    // Display a generic loading message while the redirect is happening.
    return <div className="flex h-screen items-center justify-center">Redirecting to your dashboard...</div>;
}
