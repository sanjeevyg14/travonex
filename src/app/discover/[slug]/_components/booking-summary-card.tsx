
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Booking } from "@/lib/types";
import { CheckCircle, Wallet, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";


export function BookingSummaryCard({ booking }: { booking: Booking }) {
    const router = useRouter();

    const handlePayBalance = () => {
        if (booking.tripId) { // Assuming tripId is on booking, need to get slug
             // This is a simplification. In a real app, you'd look up the trip slug from the ID.
            const tripSlug = booking.tripTitle.toLowerCase().replace(/\s+/g, '-');
            router.push(`/book/${tripSlug}?batchId=${booking.batchId}&paymentType=balance&bookingId=${booking.id}`);
        }
    };


    const getBadgeVariant = (status: Booking['paymentStatus']) => {
        if (status === 'Paid in Full') return 'default';
        if (status === 'Reserved') return 'secondary';
        return 'outline';
    };

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="text-green-500" />
                    You've Booked This Trip!
                </CardTitle>
                <CardDescription>
                    Here is a summary of your booking. You can view full details in your dashboard.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={getBadgeVariant(booking.paymentStatus)}>{booking.paymentStatus}</Badge>
                    </div>
                     <Separator />
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Cost:</span>
                        <span className="font-semibold">₹{booking.totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount Paid:</span>
                        <span className="font-medium text-green-600">₹{booking.amountPaid.toLocaleString('en-IN')}</span>
                    </div>
                    {booking.balanceDue > 0 && (
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Balance Due:</span>
                            <span className="font-semibold text-destructive">₹{booking.balanceDue.toLocaleString('en-IN')}</span>
                        </div>
                    )}
                </div>

                {booking.paymentStatus === "Reserved" && booking.balanceDue > 0 && (
                    <Button className="w-full" onClick={handlePayBalance}>
                        <Wallet className="mr-2 h-4 w-4" />
                        Pay Remaining Balance
                    </Button>
                )}
            </CardContent>
            <CardFooter>
                 <Button variant="outline" className="w-full" asChild>
                    <Link href="/bookings">
                       View All My Bookings
                       <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

    