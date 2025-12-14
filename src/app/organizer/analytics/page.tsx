

"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useOrganizerAnalytics } from "@/hooks/use-organizer-analytics";
import { DollarSign, BookOpen, Users, TrendingUp } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

export default function TripAnalyticsDashboard() {
    const { 
        stats, 
        monthlyRevenue, 
        topTripsByRevenue, 
        topTripsByBookings 
    } = useOrganizerAnalytics();

    const chartData = useMemo(() => {
        const data = monthlyRevenue.map(item => ({
            month: item.month,
            revenue: item.totalRevenue,
        }));
        return data.reverse();
    }, [monthlyRevenue]);

    const chartConfig = {
      revenue: {
        label: "Revenue",
        color: "hsl(var(--primary))",
      },
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Trip Analytics Dashboard</h1>
                <p className="text-muted-foreground">Insights into your multi-day trip performance and revenue.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">All-time gross revenue</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalBookings}</div>
                         <p className="text-xs text-muted-foreground">Total individual bookings made</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Travelers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalTravelers}</div>
                         <p className="text-xs text-muted-foreground">Total people who have traveled</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Revenue / Booking</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.avgRevenuePerBooking)}</div>
                        <p className="text-xs text-muted-foreground">Average booking value</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Monthly Revenue</CardTitle>
                    <CardDescription>Your gross revenue over the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <BarChart accessibilityLayer data={chartData}>
                             <XAxis
                                dataKey="month"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                            />
                            <ChartTooltip 
                                cursor={{ fill: 'hsl(var(--muted))' }}
                                content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))}/>}
                            />
                            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><TrendingUp/> Top Trips by Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Trip</TableHead>
                                    <TableHead className="text-right">Revenue</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topTripsByRevenue.map(trip => (
                                    <TableRow key={trip.id}>
                                        <TableCell className="font-medium">{trip.title}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(trip.totalRevenue)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users/> Top Trips by Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Trip</TableHead>
                                    <TableHead className="text-right">Bookings</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topTripsByBookings.map(trip => (
                                    <TableRow key={trip.id}>
                                        <TableCell className="font-medium">{trip.title}</TableCell>
                                        <TableCell className="text-right">{trip.bookingsCount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
