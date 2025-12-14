
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Globe, DollarSign, ShieldCheck, Zap, Gift } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAdminAnalytics } from "@/hooks/use-admin-analytics";

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;


export default function AdminDashboardPage() {
    const { stats, recentActivity } = useAdminAnalytics();
    
    const kpiCards = [
        { title: "Total Revenue (GMV)", value: formatCurrency(stats.totalRevenue), icon: DollarSign, description: "All-time gross bookings value" },
        { title: "Platform Commission", value: formatCurrency(stats.platformCommission), icon: DollarSign, description: "All-time gross commission earned" },
        { title: "Total Cashback Issued", value: formatCurrency(stats.totalCashback), icon: Gift, description: "Total loyalty cashback paid out" },
        { title: "Pending Approvals", value: stats.pendingApprovals, icon: ShieldCheck, description: "Trips awaiting review" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Platform-wide overview, financial KPIs, and actionable insights.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>The latest bookings and trip submissions that may require your attention.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Value/Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentActivity.map((activity) => (
                                <TableRow key={activity.id}>
                                    <TableCell>
                                        <Badge variant={activity.type === 'New Booking' ? 'default' : 'secondary'}>{activity.type}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{activity.title}</div>
                                        <div className="text-sm text-muted-foreground">{activity.subtitle}</div>
                                    </TableCell>
                                    <TableCell className="font-medium">{activity.value}</TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={activity.actionUrl}>View</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                             {recentActivity.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                    No recent activity.
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
