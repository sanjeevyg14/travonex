
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useMockData } from "@/hooks/use-mock-data";
import { CheckCircle, Gift, Crown } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";

function BookingSuccessContent() {
    const searchParams = useSearchParams();
    const bookingId = searchParams.get("bookingId");
    const displayId = bookingId ? `TRVNX${bookingId.slice(-6).toUpperCase()}` : `TRVNX${Math.floor(100000 + Math.random() * 900000)}`;
    const { user, updateUser } = useAuth();
    const { bookings } = useMockData();
    
    // Grant AI credits on successful booking
    useEffect(() => {
        if (user) {
            const updatedUser = {
                ...user,
                aiCredits: (user.aiCredits || 0) + 10,
            };
            updateUser(updatedUser);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const currentBooking = useMemo(() => {
        return bookings.find(b => b.id === bookingId);
    }, [bookings, bookingId]);


    return (
        <div className="container flex items-center justify-center py-24">
            <Card className="max-w-md text-center">
                <CardHeader className="items-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <CardTitle className="text-3xl">Booking Successful!</CardTitle>
                    <CardDescription>Thank you for choosing Travonex. Your adventure awaits!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">Your booking has been confirmed. A confirmation email with all the details has been sent to your registered email address.</p>
                     <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-700">🎉 You've earned **10 bonus AI Planner credits** for this booking!</p>
                    </div>
                     {currentBooking?.proDiscount && currentBooking.proDiscount > 0 && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm text-green-700 flex items-center justify-center gap-2">
                                <Crown size={16}/> As a Pro member, you saved **₹{currentBooking.proDiscount.toLocaleString('en-IN')}** on this booking!
                            </p>
                        </div>
                    )}
                    <div className="p-4 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground">Your Booking ID is:</p>
                        <p className="text-lg font-bold tracking-widest">{displayId}</p>
                    </div>
                    <Button asChild className="w-full">
                        <Link href="/bookings">View My Bookings</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}


export default function BookingSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BookingSuccessContent />
        </Suspense>
    )
}
