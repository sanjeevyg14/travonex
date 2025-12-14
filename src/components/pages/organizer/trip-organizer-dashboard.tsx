
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Globe, ArrowRight, Wallet, BookOpen } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrganizerAnalytics } from "@/hooks/use-organizer-analytics";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { useMockData } from "@/hooks/use-mock-data";


export default function TripOrganizerDashboard() {
    const { user } = useAuth();
    const { stats, recentBookings } = useOrganizerAnalytics();
    const { organizers } = useMockData();
    const currentOrganizer = user?.organizerId ? organizers[user.organizerId] : null;


    const kpiCards = [
        { title: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, description: "All-time gross revenue received" },
        { title: "Total Bookings", value: stats.totalBookings, icon: BookOpen, description: "Total bookings for all your trips" },
        { title: "Active Trips", value: stats.activeTrips, icon: Globe, description: "Trips currently live on the platform" },
    ];


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Welcome Back, {user?.name.split(' ')[0]}!</h1>
                <p className="text-muted-foreground">Here's a snapshot of your Trip Organizer business on Travonex.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
                {kpiCards.map((stat) => (
                     <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                         <p className="text-xs text-muted-foreground">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
                 <Card className="md:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lead Credits</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{currentOrganizer?.leadCredits || 0}</div>
                     <p className="text-xs text-muted-foreground">Available to unlock new leads</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Bookings</CardTitle>
                        <CardDescription>A list of the latest travelers for your trips.</CardDescription>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/organizer/bookings">View All <ArrowRight className="ml-2"/></Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Traveler</TableHead>
                            <TableHead>Trip</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentBookings.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell className="font-medium">{booking.travelerName}</TableCell>
                                    <TableCell>{booking.tripTitle}</TableCell>
                                    <TableCell>
                                        <Badge variant={booking.paymentStatus === 'Paid in Full' ? 'default' : 'secondary'}>
                                            {booking.paymentStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">₹{booking.amountPaid.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                            {recentBookings.length === 0 && (
                                 <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                    You have no recent bookings.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
