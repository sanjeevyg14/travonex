/**
 * @file This component renders the "My Bookings" page. It's the central hub for users to view their trip history.
 *
 * --- How It Works ---
 * 1.  **Authentication**: It uses the `useAuth` hook to ensure a user is logged in. If not, it displays a prompt to log in.
 * 2.  **Specialized Data Hook**: It relies on the `useUserBookings` hook. This is a crucial architectural decision.
 *     Instead of performing complex data filtering and processing within this component, all that logic is encapsulated
 *     in the `useUserBookings` hook. This keeps the page component clean and focused purely on rendering UI.
 * 3.  **Tabbed Interface**: It uses a `Tabs` component to separate bookings into two logical categories: "Upcoming" and "Completed".
 *     This is powered by the two separate lists (`upcomingBookings`, `completedBookings`) provided by the `useUserBookings` hook.
 * 4.  **Component Composition**: It renders a `BookingCard` for each booking. This follows the React principle of breaking down
 *     the UI into smaller, reusable components. `BookingCard` is responsible for the layout and actions of a single booking item.
 * 5.  **Empty State**: If a user has no bookings, it renders a helpful `EmptyState` component, which in turn suggests other trips,
 *     preventing a dead-end experience for the user.
 */

"use client";

import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Booking, Review, Trip } from "@/lib/types";
import { useUserBookings, type EnrichedBooking } from "@/hooks/use-user-bookings";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Wallet, CheckCircle, AlertCircle, ArrowRight, Search, Star, PenSquare, Eye, PackageOpen } from "lucide-react";
import { format } from 'date-fns';
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Separator } from "@/components/ui/separator";
import { ReviewDialog } from "@/components/review-dialog";
import { useMockData } from "@/hooks/use-mock-data";
import { EmptyState } from "@/components/empty-state";


function BookingCard({ booking, isCompletedTab }: { booking: EnrichedBooking, isCompletedTab: boolean }) {
    const router = useRouter();
    const { addReview } = useMockData();
    const placeholder = booking.trip ? PlaceHolderImages.find(p => p.id === booking.trip.image) : null;
    const [isReviewDialogOpen, setReviewDialogOpen] = useState(false);

    const getBadgeVariant = (status: Booking['paymentStatus'], isCancelled?: boolean) => {
        if (isCancelled) return 'destructive';
        switch (status) {
            case 'Paid in Full': return 'default';
            case 'Reserved': return 'secondary';
            case 'Pending Balance': return 'outline';
            case 'Cancelled': return 'destructive';
            default: return 'outline';
        }
    };

    const finalStatus = booking.isCancelled ? 'Cancelled' : booking.paymentStatus;
    const isCompletedTrip = isCompletedTab && !booking.isCancelled;

    const handlePayBalance = () => {
        if (booking.trip) {
            router.push(`/book/${booking.trip.slug}?batchId=${booking.batchId}&paymentType=balance&bookingId=${booking.id}`);
        }
    };

    const handleReviewSubmit = (rating: number, comment: string) => {
      if (!booking.tripId) return;
      const review: Review = {
        id: `rev-${Date.now()}`,
        tripId: booking.tripId,
        author: booking.travelerName,
        avatar: "user1",
        rating,
        comment,
        date: new Date().toISOString(),
      };
      addReview(booking.tripId, review);
      setReviewDialogOpen(false);
    };

    const userHasReviewed = booking.trip?.reviews?.some(r => r.author === booking.travelerName);
    
    return (
        <>
        <Card className="overflow-hidden flex flex-col">
            <CardHeader className="p-0">
                <div className="relative h-40 w-full">
                    {placeholder ? (
                        <Image
                            src={placeholder.imageUrl}
                            alt={booking.tripTitle}
                            fill
                            className="object-cover"
                            data-ai-hint={placeholder.imageHint}
                        />
                    ) : (
                        <div className="bg-muted h-full w-full flex items-center justify-center text-muted-foreground text-sm">
                            No Image
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4 flex-grow">
                 <div className="space-y-2">
                    <Badge variant={getBadgeVariant(booking.paymentStatus, booking.isCancelled)}>
                        {finalStatus === 'Paid in Full' && <CheckCircle className="mr-1 h-3 w-3"/>}
                        {finalStatus === 'Reserved' && <AlertCircle className="mr-1 h-3 w-3"/>}
                        {finalStatus}
                    </Badge>
                    <h3 className="text-xl font-bold">{booking.tripTitle}</h3>
                </div>
                 <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{booking.batch ? `${format(new Date(booking.batch.startDate), 'MMM dd')} - ${format(new Date(booking.batch.endDate), 'MMM dd, yyyy')}` : 'Date N/A'}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{booking.numberOfTravelers} Traveler{booking.numberOfTravelers > 1 ? 's' : ''}</span>
                    </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Trip Cost:</span>
                        <span className="font-semibold">₹{booking.totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount Paid:</span>
                        <span className="font-medium text-green-600">₹{booking.amountPaid.toLocaleString('en-IN')}</span>
                    </div>
                    {booking.balanceDue > 0 && !booking.isCancelled && (
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Balance Due:</span>
                            <span className="font-semibold text-destructive">₹{booking.balanceDue.toLocaleString('en-IN')}</span>
                        </div>
                    )}
                </div>

                {booking.dueDate && !booking.isCancelled && booking.paymentStatus === 'Reserved' && (
                    <div className="text-center text-xs text-primary bg-primary/10 p-2 rounded-md">
                        Please pay the balance by {format(booking.dueDate, 'MMM d, yyyy')} to confirm your spot.
                    </div>
                )}
                 {booking.isCancelled && (
                    <div className="text-center text-xs text-destructive bg-destructive/10 p-2 rounded-md">
                       This booking was automatically cancelled due to non-payment of the balance.
                    </div>
                )}

            </CardContent>
            
            <Separator />
            <CardFooter className="p-2 grid gap-2">
                {!booking.isCancelled && !isCompletedTrip && (
                    <div className="grid grid-cols-2 gap-2">
                        {booking.paymentStatus === 'Reserved' ? (
                            <Button className="w-full col-span-2" onClick={handlePayBalance}>
                                <Wallet className="mr-2 h-4 w-4" />
                                Pay Remaining Balance
                            </Button>
                        ) : (
                             <Button variant="outline" className="w-full" asChild>
                                <Link href={booking.trip ? `/discover/${booking.trip.slug}` : '#'}>
                                    View Trip Page
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                        <Button variant="outline" className="w-full col-span-2" asChild>
                           <Link href={`/bookings/${booking.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </Link>
                        </Button>
                    </div>
                )}
                {isCompletedTrip && !booking.isCancelled && (
                     <>
                        <div className="w-full grid grid-cols-2 gap-2">
                            {userHasReviewed ? (
                                <Button variant="secondary" disabled>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Review Submitted
                                </Button>
                            ) : (
                                <Button onClick={() => setReviewDialogOpen(true)}>
                                    <Star className="mr-2 h-4 w-4" />
                                    Leave a Review
                                </Button>
                            )}
                            <Button variant="outline" asChild>
                                <Link href="/blog/new">
                                    <PenSquare className="mr-2 h-4 w-4" />
                                    Write a Story
                                </Link>
                            </Button>
                        </div>
                         <Button variant="outline" className="w-full" asChild>
                           <Link href={`/bookings/${booking.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </Link>
                        </Button>
                    </>
                )}
                 {booking.isCancelled && (
                    <div className="w-full grid grid-cols-2 gap-2">
                        <Button variant="outline" className="w-full" asChild>
                           <Link href={`/bookings/${booking.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </Link>
                        </Button>
                        <Button variant="secondary" className="w-full" asChild>
                           <Link href={booking.trip ? `/discover?category=${booking.trip.category}` : '/discover'}>
                                <Search className="mr-2 h-4 w-4" />
                                Find Similar Trips
                            </Link>
                        </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
        {booking.trip && <ReviewDialog 
            isOpen={isReviewDialogOpen}
            onOpenChange={setReviewDialogOpen}
            tripTitle={booking.trip.title}
            onSubmit={handleReviewSubmit}
        /> }
        </>
    )
}

export default function BookingsPage() {
    const { user } = useAuth();
    const { upcomingBookings, completedBookings } = useUserBookings();

    if (!user) {
        return (
             <div className="container py-12 text-center">
                <h1 className="text-2xl font-bold">Please Log In</h1>
                <p className="text-muted-foreground mt-2">You need to be logged in to view your bookings.</p>
                <Button asChild className="mt-4"><Link href="/login">Login</Link></Button>
            </div>
        )
    }

    const renderBookingsList = (bookingsToRender: EnrichedBooking[], isCompleted: boolean) => {
        if (bookingsToRender.length === 0) {
            return (
                <EmptyState 
                    icon={<PackageOpen className="h-12 w-12 text-muted-foreground" />}
                    title={isCompleted ? "No past adventures yet" : "You have no upcoming trips"}
                    description="Ready to find your next adventure? Your journey begins here."
                    actionButton={
                        <Button asChild>
                            <Link href="/discover">Explore Trips</Link>
                        </Button>
                    }
                />
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookingsToRender.map(booking => (
                    <BookingCard key={booking.id} booking={booking} isCompletedTab={isCompleted} />
                ))}
            </div>
        );
    }
    
    return (
        <div className="container py-12 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">My Adventures</h1>
                <p className="text-muted-foreground">Here are all your past and upcoming trips and experiences.</p>
            </div>

            <Tabs defaultValue="upcoming">
                <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 md:w-[400px]">
                    <TabsTrigger value="upcoming">Upcoming &amp; Pending</TabsTrigger>
                    <TabsTrigger value="completed">Completed &amp; Cancelled</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming" className="pt-6">
                   {renderBookingsList(upcomingBookings, false)}
                </TabsContent>
                <TabsContent value="completed" className="pt-6">
                    {renderBookingsList(completedBookings, true)}
                </TabsContent>
            </Tabs>
        </div>
    );
}
