"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Heart, PenSquare, Gift, Wallet, FileCheck, Info, Briefcase, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import type { Booking, Trip } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { bookingService } from "@/services/booking-service";
import { tripService } from "@/services/trip-service";

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [upcomingTrip, setUpcomingTrip] = useState<Trip | null>(null);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user && user.role !== 'traveler') {
            router.push('/');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        async function fetchData() {
            if (!user) return;
            try {
                // Fetch User Bookings
                const userBookings = await bookingService.getUserBookings(user.id);
                setBookings(userBookings);

                // Find Upcoming Trip
                const now = new Date();
                const futureBookings = userBookings.filter(b => b.paymentStatus === 'Paid in Full' || b.paymentStatus === 'Reserved')
                    .sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime()); // Approximate since we need batch date

                // Ideally we should fetch trips for these bookings to get exact batch date. 
                // For simplicity, we just fetch the trip for the LAST booking or first future one.
                if (futureBookings.length > 0) {
                    const nextBooking = futureBookings[0];
                    // We need to fetch the trip to display it
                    const trip = await tripService.getTrip(nextBooking.tripId);
                    setUpcomingTrip(trip);
                }

            } catch (error) {
                console.error("Dashboard fetch error:", error);
            } finally {
                setLoadingData(false);
            }
        }

        if (user) {
            fetchData();
        }
    }, [user]);

    const handleCopyCode = () => {
        if (!user || !user.myReferralCode) return;
        navigator.clipboard.writeText(user.myReferralCode);
        toast({
            title: "Copied!",
            description: "Your referral code has been copied to your clipboard.",
        });
    };

    // Derived from user.myReferralCode now, not just referralCode field which might be unused
    const referralCode = user?.myReferralCode || "Generate One via Profile";

    if (authLoading || loadingData || !user || user.role !== 'traveler') {
        return <div className="container py-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    const stats = [
        { title: "My Bookings", value: bookings.length, icon: BookOpen, href: "/bookings" },
        { title: "Saved Trips", value: "0", icon: Heart, href: "/saved-trips" }, // Implement Saved Trips Service later
        { title: "My Stories", value: "0", icon: PenSquare, href: "/my-stories" },
    ];


    return (
        <div className="container py-12 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Welcome Back, {user?.name.split(' ')[0] || 'Traveler'}!</h1>
                <p className="text-muted-foreground">Here's a snapshot of your adventures.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <Link href={stat.href} className="text-xs text-muted-foreground hover:text-primary">
                                View All
                            </Link>
                        </CardContent>
                    </Card>
                ))}
                <Card className="md:col-span-1">
                    <Link href="/dashboard/wallet">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{user.walletBalance?.toLocaleString('en-IN') || 0}</div>
                            <p className="text-xs text-muted-foreground hover:text-primary">View History</p>
                        </CardContent>
                    </Link>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {upcomingTrip && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Next Adventure</CardTitle>
                            <CardDescription>Get ready for your upcoming trip!</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <div>
                                    <h3 className="font-semibold">{upcomingTrip.title}</h3>
                                    <p className="text-sm text-muted-foreground">{upcomingTrip.location}</p>
                                </div>
                                <Button asChild>
                                    <Link href={`/discover/${upcomingTrip.slug}`}>View Trip Details</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Gift /> Refer & Earn</CardTitle>
                        <CardDescription>Share your code and earn ₹100 for every friend who signs up!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <div>
                                <h3 className="font-semibold">Your Referral Code</h3>
                                <p className="text-2xl font-bold tracking-widest text-primary">{referralCode}</p>
                            </div>
                            <Button onClick={handleCopyCode}>Copy Code</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Briefcase /> Share Your Passion</CardTitle>
                        <CardDescription>Turn your love for travel into a business by listing your trips on Travonex.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <div>
                                <h3 className="font-semibold">Become an Organizer</h3>
                                <p className="text-sm text-muted-foreground">Reach thousands of travelers.</p>
                            </div>
                            <Button asChild>
                                <Link href="/partner-with-us">Start Application</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
