

/**
 * @file This component renders the Admin-facing dashboard for the user referral program.
 *
 * --- How It Works ---
 * 1.  **Data Fetching**: It uses the `useMockData` hook to get the master list of all successful referrals.
 * 2.  **Data Aggregation**: It calculates aggregate metrics, such as the total bonus amount paid out, by reducing the referrals data.
 * 3.  **Rendering**:
 *     - Displays high-level statistics in summary cards (e.g., "Total Referrals", "Total Bonus Paid").
 *     - Renders a detailed data table of every referral, showing who referred whom, the date, and the bonus amount.
 *
 * This provides admins with a clear, at-a-glance overview of the referral program's performance and activity.
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Gift, Users, IndianRupee } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { Referral } from "@/lib/types";

export default function AdminReferralsPage() {
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReferrals() {
            setLoading(true);
            try {
                const response = await fetch('/api/admin/referrals', { credentials: 'include' });
                if (!response.ok) throw new Error('Failed to fetch referrals');
                const data = await response.json();
                setReferrals(data.referrals || []);
            } catch (error) {
                console.error("Failed to fetch referrals:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchReferrals();
    }, []);

    // Calculate total bonus amount paid out from the referrals data.
    const totalBonusAmount = useMemo(() => {
        return referrals.reduce((sum, ref) => sum + (ref.bonusAmount || 0), 0);
    }, [referrals]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Referral Program</h1>
                <p className="text-muted-foreground">Monitor the performance of the user referral program.</p>
            </div>

            {/* Stat cards for a high-level overview. */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{referrals.length}</div>
                        <p className="text-xs text-muted-foreground">New users joined via referral</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bonus Paid</CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalBonusAmount.toLocaleString('en-IN')}</div>
                         <p className="text-xs text-muted-foreground">Amount credited to user wallets</p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed log of all referrals. */}
            <Card>
                <CardHeader>
                    <CardTitle>Referral Log</CardTitle>
                    <CardDescription>A complete log of all successful user-to-user referrals.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Referrer</TableHead>
                                <TableHead>Referred User</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Bonus Amount</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">Loading referrals...</TableCell>
                                </TableRow>
                            ) : referrals.length > 0 ? referrals.map(ref => (
                                <TableRow key={ref.id}>
                                    <TableCell className="font-medium">{ref.referrerName}</TableCell>
                                    <TableCell className="font-medium">{ref.referredUserName}</TableCell>
                                    <TableCell>{format(new Date(ref.date), 'MMM dd, yyyy')}</TableCell>
                                    <TableCell>₹{ref.bonusAmount.toLocaleString('en-IN')}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="default">{ref.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                    No referral data available.
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
