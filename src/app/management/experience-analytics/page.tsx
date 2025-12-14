
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { DollarSign, Activity, Users, TrendingUp } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useExperienceAnalytics } from "@/hooks/use-experience-analytics";

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

export default function AdminExperienceAnalyticsPage() {
    // This hook can be reused as it calculates platform-wide experience data, which is what an admin needs.
    const { 
        stats, 
        monthlyRevenue, 
        topExperiencesByRevenue, 
        topExperiencesByBookings 
    } = useExperienceAnalytics();

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
                <h1 className="text-3xl font-bold">Experience Analytics</h1>
                <p className="text-muted-foreground">Platform-wide insights for all single-day activities.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue (Experiences)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalBookings}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalParticipants}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Revenue / Booking</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.avgRevenuePerBooking)}</div>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Monthly Revenue from Experiences</CardTitle>
                    <CardDescription>Gross revenue over the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <BarChart accessibilityLayer data={chartData}>
                             <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
                            <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))}/>} />
                            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
             <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><TrendingUp/> Top Experiences by Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Experience</TableHead>
                                    <TableHead className="text-right">Revenue</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topExperiencesByRevenue.map(exp => (
                                    <TableRow key={exp.id}>
                                        <TableCell className="font-medium">{exp.title}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(exp.totalRevenue)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users/> Top Experiences by Participants</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Experience</TableHead>
                                    <TableHead className="text-right">Participants</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topExperiencesByBookings.map(exp => (
                                    <TableRow key={exp.id}>
                                        <TableCell className="font-medium">{exp.title}</TableCell>
                                        <TableCell className="text-right">{exp.participantsCount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
