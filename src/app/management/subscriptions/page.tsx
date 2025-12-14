

"use client";

import { useSubscriptionAnalytics } from "@/hooks/use-subscription-analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown, DollarSign, Users, Calendar } from "lucide-react";
import { format } from "date-fns";

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;


export default function AdminSubscriptionsPage() {
    const { stats, proUsers, recentSubscriptions } = useSubscriptionAnalytics();

    const kpiCards = [
        { title: "Total Pro Subscribers", value: stats.totalProSubscribers, icon: Users, description: "Currently active premium members." },
        { title: "Monthly Recurring Revenue (MRR)", value: formatCurrency(stats.mrr), icon: DollarSign, description: "Estimated monthly revenue." },
        { title: "Total Subscription Revenue", value: formatCurrency(stats.totalRevenue), icon: DollarSign, description: "All-time revenue from subscriptions." },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Subscriptions Dashboard</h1>
                <p className="text-muted-foreground">Monitor the health and revenue of the Travonex Pro membership.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Subscription Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentSubscriptions.map(sub => (
                                    <TableRow key={sub.user.id + sub.subscription.id}>
                                        <TableCell className="font-medium">{sub.user.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={sub.subscription.planName.includes('Annual') ? 'default' : 'secondary'}>{sub.subscription.planName}</Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(sub.subscription.startDate), "dd MMM, yyyy")}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>All Pro Subscribers</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Renews On</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {proUsers.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6"><AvatarFallback>{user.name.charAt(0)}</AvatarFallback></Avatar>
                                            <span className="font-medium">{user.name}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.subscriptionHistory?.find(s => s.status === 'active')?.planName.includes('Annual') ? 'default' : 'secondary'}>
                                                {user.subscriptionHistory?.find(s => s.status === 'active')?.planName || 'Pro'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(user.subscriptionHistory?.find(s => s.status === 'active')?.endDate || ''), "dd MMM, yyyy")}</TableCell>
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
