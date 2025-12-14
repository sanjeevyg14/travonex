
"use client";

import { notFound, useParams } from "next/navigation";
import { useMockData } from "@/hooks/use-mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowLeft, Calendar, Users, Star, Repeat, FileText, Gift, Wallet, CircleUser, Phone, Mail, RotateCcw, AlertCircle, Info } from "lucide-react";
import { format, isBefore, differenceInHours } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useMemo, useState, useEffect } from "react";
import { ReviewDialog } from "@/components/review-dialog";
import { Review, ExperienceBooking, Experience } from "@/lib/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


type EnrichedExperienceBooking = ExperienceBooking & {
    experience?: Experience;
}

export default function ExperienceBookingDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const bookingId = params.bookingId as string;
    
    const { experienceBookings, experiences, addReview, requestExperienceRefund } = useMockData();
    const { user } = useAuth();
    
    const [isReviewDialogOpen, setReviewDialogOpen] = useState(false);

    const booking = useMemo((): EnrichedExperienceBooking | undefined => {
        const foundBooking = experienceBookings.find(b => b.id === bookingId);
        if (!foundBooking) return undefined;
        
        const experience = experiences.find(e => e.id === foundBooking.experienceId);
        return { ...foundBooking, experience };
    }, [experienceBookings, experiences, bookingId]);

    // This effect handles the redirect if the user does not own the booking.
    useEffect(() => {
        if (user && booking && user.phone !== booking.travelerPhone) {
            router.push('/bookings');
        }
    }, [user, booking, router]);


    if (!booking || !booking.experience) {
        notFound();
    }
    
    // Check if the current user owns this booking. If not, render nothing while redirecting.
    if (user?.phone !== booking.travelerPhone) {
        return null;
    }
    
    const placeholder = PlaceHolderImages.find(p => p.id === booking.experience!.images[0]);
    const displayId = `TRVNX${booking.id.slice(-6).toUpperCase()}`;

    const now = new Date();
    const isActivityCompleted = isBefore(new Date(booking.activityDate), now);
    
    const getBadgeVariant = (status: string) => {
        if (status === 'Confirmed') return 'default';
        if (status === 'Cancelled') return 'destructive';
        if (status.includes('Refund')) return 'outline';
        return 'secondary';
    }
    
    const handleReviewSubmit = (rating: number, comment: string) => {
      // Logic to add review for an experience
    };

    const handleRefundRequest = () => {
        requestExperienceRefund(booking.id);
    }

    const RefundStatusAlert = () => {
        if (!booking.refundStatus || booking.refundStatus === 'none') return null;

        const statusMap = {
            'requested': {
                variant: "default",
                title: "Refund Requested",
                description: `Your refund request was submitted on ${booking.refundRequestDate ? format(new Date(booking.refundRequestDate), 'dd MMM yyyy') : 'N/A'}. The vendor is reviewing it.`
            },
            'approved_by_organizer': {
                variant: "default",
                title: "Refund Approved by Vendor",
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
                description: `Your refund of ₹${(booking.approvedRefundAmount || booking.totalPrice).toLocaleString()} was processed on ${booking.refundProcessedDate ? format(new Date(booking.refundProcessedDate), 'dd MMM yyyy') : 'N/A'}.`
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
                        <h1 className="text-3xl font-bold">Experience Booking Details</h1>
                    </div>
                    
                    <RefundStatusAlert />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2 space-y-8">
                            {/* Trip Summary Card */}
                            <Card>
                                <CardHeader className="flex-row items-center gap-4">
                                     {placeholder && 
                                        <div className="relative h-24 w-24 rounded-lg overflow-hidden shrink-0">
                                            <Image src={placeholder.imageUrl} alt={booking.experienceTitle} fill className="object-cover" />
                                        </div>
                                    }
                                    <div className="space-y-1">
                                        <CardTitle>{booking.experienceTitle}</CardTitle>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>{format(new Date(booking.activityDate), 'MMM dd, yyyy')} at {booking.timeSlot}</span>
                                            </div>
                                             <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                <span>{booking.participants} Participant{booking.participants > 1 ? 's' : ''}</span>
                                            </div>
                                        </div>
                                         <Badge variant={getBadgeVariant(booking.status)}>
                                            {booking.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                            </Card>

                            {/* Cost Breakdown Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><FileText /> Cost Breakdown</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{booking.participants} x ₹{(booking.totalPrice / booking.participants).toLocaleString('en-IN')}</span>
                                        <span>₹{booking.totalPrice.toLocaleString('en-IN')}</span>
                                    </div>
                                    <Separator />
                                     <div className="flex justify-between font-bold text-base">
                                        <span>Total Amount Paid</span>
                                        <span className="text-green-600">₹{booking.totalPrice.toLocaleString('en-IN')}</span>
                                    </div>
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
                                     {isActivityCompleted && (
                                        <Button className="w-full" onClick={() => setReviewDialogOpen(true)}>
                                            <Star className="mr-2" /> Leave a Review
                                        </Button>
                                    )}
                                     {!isActivityCompleted && (!booking.refundStatus || booking.refundStatus === 'none') && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" className="w-full">
                                                    <RotateCcw className="mr-2" /> Request Refund
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will send a refund request to the experience vendor. Approval is subject to the cancellation policy.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleRefundRequest}>Yes, Request Refund</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                     )}
                                </CardContent>
                            </Card>

                             {/* Traveler Info Card */}
                             <Card>
                                <CardHeader>
                                    <CardTitle>Lead Traveler</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <CircleUser className="text-muted-foreground" />
                                        <span className="font-medium">{booking.travelerName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="text-muted-foreground" />
                                        <span>{booking.travelerPhone}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
             <ReviewDialog 
                isOpen={isReviewDialogOpen}
                onOpenChange={setReviewDialogOpen}
                tripTitle={booking.experienceTitle}
                onSubmit={handleReviewSubmit}
            />
        </>
    );
}

    