
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Activity, Users, ArrowRight } from "lucide-react";
import { useExperienceAnalytics } from "@/hooks/use-experience-analytics";
import { useAuth } from "@/hooks/use-auth";
import { useMockData } from "@/hooks/use-mock-data";

export default function ExperienceVendorDashboard() {
    const { user } = useAuth();
    const { stats, recentBookings } = useExperienceAnalytics();
    const { organizers } = useMockData();
    const currentOrganizer = user?.organizerId ? organizers[user.organizerId] : null;

    const kpiCards = [
        { title: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, description: "All-time gross revenue received" },
        { title: "Total Bookings", value: stats.totalBookings, icon: Activity, description: "Total bookings for all your activities" },
        { title: "Total Participants", value: stats.totalParticipants, icon: Users, description: "Total people who have attended" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Welcome Back, {user?.name.split(' ')[0]}!</h1>
                <p className="text-muted-foreground">Here's a snapshot of your Experience Vendor business.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
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
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Bookings</CardTitle>
                        <CardDescription>A list of the latest participants for your activities.</CardDescription>
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
                            <TableHead>Experience</TableHead>
                            <TableHead>Participants</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentBookings.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell className="font-medium">{booking.travelerName}</TableCell>
                                    <TableCell>{booking.experienceTitle}</TableCell>
                                    <TableCell className="text-center">{booking.participants}</TableCell>
                                    <TableCell className="text-right">₹{booking.totalPrice.toLocaleString()}</TableCell>
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
