
"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { apiPost } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowLeft, Calendar, Users, Star, Repeat, FileText, Gift, Wallet, CircleUser, Phone, Mail, RotateCcw, AlertCircle, Info, User } from "lucide-react";
import { format, isBefore, differenceInHours } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMemo, useState, useEffect } from "react";
import { ReviewDialog } from "@/components/review-dialog";
import { Review } from "@/lib/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { EnrichedBooking } from "@/hooks/use-user-bookings";

export default function BookingDetailsClient({ booking: initialBooking }: { booking: EnrichedBooking }) {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [isReviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [booking, setBooking] = useState(initialBooking);

    // Update booking state if initialBooking changes
    useEffect(() => {
        setBooking(initialBooking);
    }, [initialBooking]);

    const { trip, batch } = useMemo(() => {
        return { trip: initialBooking.trip, batch: initialBooking.batch };
    }, [initialBooking]);

    // This effect handles the redirect if the user does not own the booking.
    useEffect(() => {
        if (user && booking && user.phone !== booking.travelerPhone) {
            router.push('/bookings');
        }
    }, [user, booking, router]);


    if (!booking || !trip || !batch) {
        notFound();
    }
    
    // Check if the current user owns this booking. If not, render nothing while redirecting.
    if (user?.phone !== booking.travelerPhone) {
        return null;
    }
    
    const placeholder = PlaceHolderImages.find(p => p.id === trip.image);
    const displayId = `TRVNX${booking.id.slice(-6).toUpperCase()}`;

    // --- NEW Refund & Review Logic ---
    const now = new Date();
    const isTripUpcoming = isBefore(now, new Date(batch.startDate));
    const isTripCompleted = isBefore(new Date(batch.endDate), now);
    const hoursSinceTripEnded = isTripCompleted ? differenceInHours(now, new Date(batch.endDate)) : 0;
    const isWithinDisputeWindow = isTripCompleted && hoursSinceTripEnded <= 48;
    // --- End of New Logic ---

    // Dummy data for breakdown as it's not stored on the booking object
    const taxAmount = booking.totalPrice * 0.18;
    const priceAfterCoupon = booking.totalPrice - taxAmount;
    const couponDiscount = 0; // Assume no coupon for simplicity for now
    const basePrice = priceAfterCoupon + couponDiscount;
    const walletAmountUsed = 0; // Assume no wallet for simplicity for now

    const getBadgeVariant = (status: string) => {
        if (status === 'Paid in Full') return 'default';
        if (status === 'Cancelled') return 'destructive';
        if (status.includes('Refund')) return 'outline';
        return 'secondary';
    }
    
    const userHasReviewed = trip.reviews?.some(r => r.author === booking.travelerName);

    const handleReviewSubmit = async (rating: number, comment: string) => {
      if (!booking.tripId) return;
      
      try {
        await apiPost('/api/reviews', {
          tripId: booking.tripId,
          rating,
          comment,
        });

        toast({
          title: "Review Submitted",
          description: "Thank you for your feedback!",
        });
        setReviewDialogOpen(false);
      } catch (error: any) {
        console.error("Failed to submit review:", error);
        toast({
          variant: "destructive",
          title: "Review Failed",
          description: error.message || "Failed to submit review. Please try again.",
        });
      }
    };

    const handleRefundRequest = async () => {
        try {
            const response = await apiPost(`/api/bookings/${booking.id}/refund?action=request`, {
                reason: "Requested by traveler",
            });

            setBooking(prev => ({
                ...prev,
                refundStatus: 'requested',
                refundRequestDate: new Date().toISOString(),
            }));

            toast({
                title: "Refund Requested",
                description: "Your refund request has been submitted. The organizer will review it.",
            });
        } catch (error: any) {
            console.error("Failed to request refund:", error);
            toast({
                variant: "destructive",
                title: "Request Failed",
                description: error.message || "Failed to submit refund request. Please try again.",
            });
        }
    }

    const RefundStatusAlert = () => {
        if (!booking.refundStatus || booking.refundStatus === 'none') return null;

        const statusMap = {
            'requested': {
                variant: "default",
                title: "Refund Requested",
                description: `Your refund request was submitted on ${booking.refundRequestDate ? format(new Date(booking.refundRequestDate), 'dd MMM yyyy') : 'N/A'}. The organizer is reviewing it.`
            },
            'approved_by_organizer': {
                variant: "default",
                title: "Refund Approved by Organizer",
                description: "Your request has been approved and sent to our finance team for final processing."
            },
            'rejected_by_organizer': {
                variant: "destructive",
                title: "Refund Request Rejected",
                description: `Reason: ${booking.refundRejectionReason || 'No reason provided.'}`
            },
             'rejected_by_admin': {
                variant: "destructive",
                title: "Refund Request Rejected by Admin",
                description: `Reason: ${booking.refundRejectionReason || 'Please contact support for more details.'}`
            },
            'processed': {
                variant: "default",
                title: "Refund Processed",
                description: `Your refund of ₹${(booking.approvedRefundAmount || booking.amountPaid).toLocaleString()} was processed on ${booking.refundProcessedDate ? format(new Date(booking.refundProcessedDate), 'dd MMM yyyy') : 'N/A'}.`
            }
        };

        const statusInfo = statusMap[booking.refundStatus];
        if (!statusInfo) return null;

        return (
            <Alert variant={statusInfo.variant as any} className="bg-muted/30">
                <Info className="h-4 w-4"/>
                <AlertTitle>{statusInfo.title}</AlertTitle>
                <AlertDescription>{statusInfo.description}</AlertDescription>
            </Alert>
        )
    }

    return (
        <>
            <div className="bg-muted/40">
                <div className="container py-12 max-w-4xl mx-auto space-y-8">
                    {/* Header */}
                    <div>
                        <p className="text-sm text-muted-foreground">Booking ID: {displayId}</p>
                        <h1 className="text-3xl font-bold">Booking Details</h1>
                    </div>
                    
                    <RefundStatusAlert />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Trip Summary Card */}
                            <Card>
                                <CardHeader className="flex-row items-center gap-4">
                                     {placeholder && 
                                        <div className="relative h-24 w-24 rounded-lg overflow-hidden shrink-0">
                                        <Image src={placeholder.imageUrl} alt={trip.title} fill className="object-cover" />
                                        </div>
                                    }
                                    <div className="space-y-1">
                                        <CardTitle>{trip.title}</CardTitle>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>{format(new Date(batch.startDate), 'MMM dd')} - {format(new Date(batch.endDate), 'MMM dd, yyyy')}</span>
                                            </div>
                                             <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                <span>{booking.numberOfTravelers} Traveler{booking.numberOfTravelers > 1 ? 's' : ''}</span>
                                            </div>
                                        </div>
                                         <Badge variant={getBadgeVariant(booking.paymentStatus)}>
                                            {booking.paymentStatus}
                                        </Badge>
                                    </div>
                                </CardHeader>
                            </Card>

                            {/* Traveler Manifest Card */}
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Users /> Traveler Manifest</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div className="space-y-3">
                                        <p className="font-semibold text-base flex items-center gap-2"><CircleUser/>Lead Traveler</p>
                                        <div className="p-3 bg-muted/50 rounded-md grid grid-cols-1 md:grid-cols-3 gap-2">
                                            <span className="font-medium">{booking.travelerName}</span>
                                            <span className="text-muted-foreground">{user.email || 'N/A'}</span>
                                            <span className="text-muted-foreground">{booking.travelerPhone}</span>
                                        </div>
                                    </div>
                                    {booking.coTravelers && booking.coTravelers.length > 0 && (
                                        <div className="space-y-3">
                                            <p className="font-semibold text-base mt-4">Co-Travelers</p>
                                            {booking.coTravelers.map((traveler, index) => (
                                                <div key={index} className="p-3 bg-muted/50 rounded-md grid grid-cols-1 md:grid-cols-3 gap-2">
                                                     <span className="font-medium">{traveler.name} ({traveler.gender})</span>
                                                     <span className="text-muted-foreground">{traveler.email}</span>
                                                     <span className="text-muted-foreground">{traveler.phone}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>


                            {/* Cost Breakdown Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><FileText /> Cost Breakdown</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Base Price ({booking.numberOfTravelers} x ₹{(basePrice / booking.numberOfTravelers).toLocaleString('en-IN')})</span>
                                        <span>₹{basePrice.toLocaleString('en-IN')}</span>
                                    </div>
                                    {couponDiscount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span className="flex items-center gap-2"><Gift /> Coupon Applied</span>
                                            <span>- ₹{couponDiscount.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Taxes & Fees (18%)</span>
                                        <span>₹{taxAmount.toLocaleString('en-IN')}</span>
                                    </div>
                                    <Separator />
                                     <div className="flex justify-between font-bold text-base">
                                        <span>Total Trip Cost</span>
                                        <span>₹{booking.totalPrice.toLocaleString('en-IN')}</span>
                                    </div>
                                </CardContent>
                            </Card>
                            
                             {/* Payment Summary Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><Wallet /> Payment Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    {walletAmountUsed > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Paid from Wallet</span>
                                            <span className="text-green-600">- ₹{walletAmountUsed.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Paid via Gateway</span>
                                        <span>₹{booking.amountPaid.toLocaleString('en-IN')}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-bold text-base">
                                        <span>Total Amount Paid</span>
                                        <span className="text-green-600">₹{booking.amountPaid.toLocaleString('en-IN')}</span>
                                    </div>
                                    {booking.balanceDue > 0 && (
                                         <div className="flex justify-between font-bold text-base">
                                            <span className="text-destructive">Balance Due</span>
                                            <span className="text-destructive">₹{booking.balanceDue.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                        </div>
                        <div className="space-y-6">
                            {/* Actions Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Next Steps</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                     {isTripCompleted && !isWithinDisputeWindow && !userHasReviewed && (
                                        <Button className="w-full" onClick={() => setReviewDialogOpen(true)}>
                                            <Star className="mr-2" /> Leave a Review
                                        </Button>
                                    )}
                                     {(isTripUpcoming || isWithinDisputeWindow) && (!booking.refundStatus || booking.refundStatus === 'none') && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" className="w-full">
                                                    <RotateCcw className="mr-2" /> Request Refund
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure you want to request a refund?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will send a refund request to the trip organizer. Approval is subject to the trip's cancellation policy. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleRefundRequest}>Yes, Request Refund</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                     )}
                                     {userHasReviewed && (
                                         <Button className="w-full" variant="secondary" disabled>
                                            Review Submitted
                                        </Button>
                                    )}
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href={`/discover/${trip.slug}`}>
                                            <Repeat className="mr-2" />
                                            Book Again
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
             <ReviewDialog 
                isOpen={isReviewDialogOpen}
                onOpenChange={setReviewDialogOpen}
                tripTitle={trip.title}
                onSubmit={handleReviewSubmit}
            />
        </>
    );

    
}
