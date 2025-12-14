

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { useMockData } from "@/hooks/use-mock-data";
import { useMemo, useState } from "react";
import type { Booking, Trip, Batch } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, Mail, Phone, DollarSign, BookOpen, User, CircleUser } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isBefore, startOfDay } from "date-fns";

// This "Enriched" type combines booking data with the related trip and batch details.
// It's a "view model" created specifically for the UI.
export type EnrichedBooking = Booking & {
  trip?: Trip;
  batch?: Batch;
  isCancelled?: boolean;
};

export default function TripBookingDashboard() {
    const { user } = useAuth();
    const { bookings, organizers, trips } = useMockData();
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const {
        upcomingBookings,
        pastBookings,
        totalRevenue,
        pendingPayments,
        totalBookingsCount
    } = useMemo(() => {
        if (!user || user.role !== 'organizer' || !user.organizerId) {
        return { upcomingBookings: [], pastBookings: [], totalRevenue: 0, pendingPayments: 0, totalBookingsCount: 0 };
        }
        
        const organizerBookings = bookings.filter(booking => booking.organizerId === user.organizerId);
        
        const revenue = organizerBookings.reduce((acc, b) => acc + b.amountPaid, 0);
        const pending = organizerBookings.reduce((acc, b) => acc + b.balanceDue, 0);
        
        const now = new Date();
        const today = startOfDay(now);
        const upcoming: EnrichedBooking[] = [];
        const past: EnrichedBooking[] = [];

        const enrichedBookings: EnrichedBooking[] = organizerBookings.map(booking => {
        const trip = trips.find(t => t.id === booking.tripId);
        const batch = trip?.batches?.find(b => b.id === booking.batchId);
        
        const enrichedBooking: EnrichedBooking = { ...booking, trip, batch };
        if (booking.paymentStatus === "Reserved" && trip?.balanceDueDays !== undefined && batch) {
                const startDate = new Date(batch.startDate);
                const dueDate = new Date(startDate.setDate(startDate.getDate() - trip.balanceDueDays));
                if (isBefore(dueDate, now)) {
                enrichedBooking.isCancelled = true;
                }
            }
        return enrichedBooking;
        });

        for (const booking of enrichedBookings) {
            if (!booking.batch) {
                past.push(booking);
                continue;
            }

            const isPast = new Date(booking.batch.endDate) < today;

            if (isPast || booking.isCancelled) {
                past.push(booking);
            } else {
                upcoming.push(booking);
            }
        }
        
        upcoming.sort((a, b) => new Date(a.batch!.startDate).getTime() - new Date(b.batch!.startDate).getTime());
        past.sort((a, b) => new Date(b.batch!.endDate).getTime() - new Date(a.batch!.endDate).getTime());

        return { 
            upcomingBookings: upcoming, 
            pastBookings: past, 
            totalRevenue: revenue, 
            pendingPayments: pending,
            totalBookingsCount: organizerBookings.length
        };

    }, [bookings, user, organizers, trips]);
    
     const getBadgeVariant = (status: Booking['paymentStatus']) => {
        switch (status) {
            case 'Paid in Full': return 'default';
            case 'Reserved': return 'secondary';
            case 'Pending Balance': return 'outline';
            case 'Cancelled': return 'destructive';
            default: return 'secondary';
        }
    }
    
    const renderBookingTable = (bookingList: EnrichedBooking[]) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Lead Traveler</TableHead>
                <TableHead>Trip</TableHead>
                <TableHead>Traveler Contact</TableHead>
                <TableHead>Booking Date</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead className="text-right">Total Price</TableHead>
                <TableHead className="text-center">Actions</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {bookingList.map((booking) => (
                <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.travelerName}</TableCell>
                    <TableCell>{booking.tripTitle}</TableCell>
                    <TableCell>{booking.travelerPhone}</TableCell>
                    <TableCell>{booking.bookingDate}</TableCell>
                    <TableCell>
                        <Badge variant={getBadgeVariant(booking.isCancelled ? 'Cancelled' : booking.paymentStatus)}>
                            {booking.isCancelled ? 'Cancelled' : booking.paymentStatus}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">₹{booking.totalPrice.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedBooking(booking)}>View Details</Button>
                        </DialogTrigger>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
    );

    return (
        <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedBooking(null)}>
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold">Manage Trip Bookings</h1>
                <p className="text-muted-foreground">View and manage all bookings for your trips.</p>
            </div>
             <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</div>
                        <p className="text-xs text-muted-foreground">Total amount received from all bookings.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalBookingsCount}</div>
                        <p className="text-xs text-muted-foreground">Across all of your trips.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                        <DollarSign className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">₹{pendingPayments.toLocaleString('en-IN')}</div>
                        <p className="text-xs text-muted-foreground">Total balance due from reserved bookings.</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <Tabs defaultValue="upcoming">
                    <CardHeader>
                        <CardTitle>All Bookings</CardTitle>
                        <CardDescription>
                            A complete log of all traveler bookings for your trips.
                        </CardDescription>
                        <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 mt-4 md:w-[400px]">
                            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                            <TabsTrigger value="past">Past</TabsTrigger>
                        </TabsList>
                    </CardHeader>
                    <CardContent>
                        <TabsContent value="upcoming">
                            {upcomingBookings.length > 0 ? renderBookingTable(upcomingBookings) : <div className="text-center p-8 text-muted-foreground">No upcoming bookings.</div>}
                        </TabsContent>
                        <TabsContent value="past">
                            {pastBookings.length > 0 ? renderBookingTable(pastBookings) : <div className="text-center p-8 text-muted-foreground">No past bookings found.</div>}
                        </TabsContent>
                    </CardContent>
                </Tabs>
            </Card>
      
            {selectedBooking && (
                <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Booking Details: {selectedBooking?.id.slice(-6).toUpperCase()}</DialogTitle>
                    <DialogDescription>
                        Full traveler manifest for the trip: {selectedBooking?.tripTitle}.
                    </DialogDescription>
                </DialogHeader>
                    <div className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto">
                        {/* --- Traveler Manifest --- */}
                         <div className="space-y-2">
                            <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2"><Users/>Traveler Manifest</h3>
                             <div className="p-4 bg-muted rounded-lg space-y-4 text-sm">
                                <p className="font-semibold text-base flex items-center gap-2"><CircleUser/>Lead Traveler</p>
                                <div className="p-3 bg-background/50 rounded-md grid grid-cols-1 gap-2">
                                    <span className="font-medium">{selectedBooking.travelerName}</span>
                                    <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /><span>{selectedBooking.travelerPhone}</span></div>
                                    {/* Mock email */}
                                    <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /><span>{selectedBooking.travelerName.split(' ')[0].toLowerCase()}@example.com</span></div>
                                </div>
                                
                                {selectedBooking.coTravelers && selectedBooking.coTravelers.length > 0 && (
                                    <div className="space-y-3 pt-3">
                                        <p className="font-semibold text-base">Co-Travelers ({selectedBooking.coTravelers.length})</p>
                                        {selectedBooking.coTravelers.map((traveler, index) => (
                                            <div key={index} className="p-3 bg-background/50 rounded-md grid grid-cols-1 gap-2">
                                                <div className="font-medium flex justify-between items-center">
                                                    <span>{traveler.name}</span>
                                                    <Badge variant="outline">{traveler.gender}</Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /><span>{traveler.phone}</span></div>
                                                <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /><span>{traveler.email}</span></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />
                        
                        {/* --- Booking & Payment Summary --- */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm text-muted-foreground">Booking & Payment Summary</h3>
                            <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                                <div className="flex justify-between"><span>Number of Travelers:</span><span className="font-medium">{selectedBooking.numberOfTravelers}</span></div>
                                <div className="flex justify-between"><span>Booking Date:</span><span className="font-medium">{selectedBooking.bookingDate}</span></div>
                                <div className="flex justify-between items-center"><span>Payment Status:</span><Badge variant={getBadgeVariant(selectedBooking.paymentStatus)}>{selectedBooking.paymentStatus}</Badge></div>
                                <Separator className="my-2"/>
                                <div className="flex justify-between"><span>Total Price:</span><span className="font-medium">₹{selectedBooking.totalPrice.toLocaleString('en-IN')}</span></div>
                                <div className="flex justify-between text-green-600"><span>Amount Paid:</span><span className="font-medium">₹{selectedBooking.amountPaid.toLocaleString('en-IN')}</span></div>
                                <div className="flex justify-between text-destructive"><span>Balance Due:</span><span className="font-medium">₹{selectedBooking.balanceDue.toLocaleString('en-IN')}</span></div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            )}
        </div>
    </Dialog>
    )
}
