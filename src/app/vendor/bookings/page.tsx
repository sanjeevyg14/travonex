

"use client";

import { useAuth } from "@/hooks/use-auth";
import { useMockData } from "@/hooks/use-mock-data";
import { useMemo, useState } from "react";
import type { ExperienceBooking } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { DollarSign, Activity, Users, Mail, Phone, CircleUser } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function ExperienceBookingDashboard() {
    const { user } = useAuth();
    const { experienceBookings } = useMockData();
    const [selectedBooking, setSelectedBooking] = useState<ExperienceBooking | null>(null);

    const organizerBookings = useMemo(() => {
        if (!user || user.role !== 'organizer') return [];
        // This is a placeholder; experience bookings need to be linked to an organizer/vendor
        return experienceBookings;
    }, [experienceBookings, user]);

    const { totalRevenue, totalBookingsCount } = useMemo(() => {
        const revenue = organizerBookings.reduce((acc, b) => acc + b.totalPrice, 0);
        return { totalRevenue: revenue, totalBookingsCount: organizerBookings.length };
    }, [organizerBookings]);

    return (
        <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedBooking(null)}>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Manage Experience Bookings</h1>
                    <p className="text-muted-foreground">View all bookings for your single-day activities and tours.</p>
                </div>
                 <div className="grid gap-4 md:grid-cols-2">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalBookingsCount}</div>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Booking Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Traveler</TableHead>
                                    <TableHead>Experience</TableHead>
                                    <TableHead>Activity Date</TableHead>
                                    <TableHead className="text-center">Participants</TableHead>
                                    <TableHead className="text-right">Total Price</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {organizerBookings.length > 0 ? organizerBookings.map((booking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium">{booking.travelerName}</TableCell>
                                        <TableCell>{booking.experienceTitle}</TableCell>
                                        <TableCell>{format(new Date(booking.activityDate), 'dd MMM yyyy')}</TableCell>
                                        <TableCell className="text-center">{booking.participants}</TableCell>
                                        <TableCell className="text-right">₹{booking.totalPrice.toLocaleString()}</TableCell>
                                        <TableCell className="text-center">
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" onClick={() => setSelectedBooking(booking)}>View Details</Button>
                                            </DialogTrigger>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                        No bookings found for your experiences.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {selectedBooking && (
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Booking: {selectedBooking.id.slice(-6).toUpperCase()}</DialogTitle>
                            <DialogDescription>{selectedBooking.experienceTitle}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-2">
                                <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2"><Users/>Traveler Manifest</h3>
                                <div className="p-4 bg-muted rounded-lg space-y-4 text-sm">
                                    <p className="font-semibold text-base flex items-center gap-2"><CircleUser/>Lead Traveler</p>
                                    <div className="p-3 bg-background/50 rounded-md grid grid-cols-1 gap-2">
                                        <span className="font-medium">{selectedBooking.travelerName}</span>
                                        <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /><span>{selectedBooking.travelerPhone}</span></div>
                                    </div>
                                    {/* Co-traveler details would go here if collected for experiences */}
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <h3 className="font-semibold text-sm text-muted-foreground">Booking & Payment Summary</h3>
                                <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                                    <div className="flex justify-between"><span>Participants:</span><span className="font-medium">{selectedBooking.participants}</span></div>
                                    <div className="flex justify-between"><span>Activity Date:</span><span className="font-medium">{format(new Date(selectedBooking.activityDate), 'dd MMM yyyy')} at {selectedBooking.timeSlot}</span></div>
                                    <Separator className="my-2"/>
                                    <div className="flex justify-between font-bold"><span>Total Paid:</span><span className="text-green-600">₹{selectedBooking.totalPrice.toLocaleString('en-IN')}</span></div>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                )}
            </div>
        </Dialog>
    );
}
