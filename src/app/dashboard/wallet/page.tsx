/**
 * @file This component renders the user's personal wallet page.
 *
 * --- How It Works ---
 * 1.  **Authentication**: It uses the `useAuth` hook to get the current user's data, including their wallet balance. It redirects to login if no user is found.
 * 2.  **Data Fetching**: It uses the `useMockData` hook to get the master list of all wallet transactions.
 * 3.  **Data Processing**: It uses `useMemo` to filter the master transaction list to find only those belonging to the current user and sorts them by date.
 * 4.  **Rendering**:
 *     - Displays the current wallet balance in a prominent summary card.
 *     - Renders a table of the user's transaction history, showing details for each credit and debit.
 *     - Provides helpful UI states for when the user has no transactions yet.
 */

"use client";

import { useAuth } from "@/hooks/use-auth";
import { useMockData } from "@/hooks/use-mock-data";
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function WalletPage() {
    const { user, loading } = useAuth();
    const { walletTransactions } = useMockData();
    const router = useRouter();

    // Filter and sort transactions for the current user.
    const userTransactions = useMemo(() => {
        if (!user) return [];
        return walletTransactions
            .filter(tx => tx.userId === user.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Most recent first
    }, [user, walletTransactions]);

    // Handle loading and unauthenticated states.
    if (loading) {
        return <div className="container py-12 text-center">Loading wallet...</div>;
    }
    
    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <div className="container py-12 max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold">My Wallet</h1>
                <p className="text-muted-foreground">Track your earnings, bonuses, and spending.</p>
            </div>
            
            {/* Balance Summary Card */}
            <Card className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Wallet />
                        Available Balance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-5xl font-bold tracking-tight">₹{(user.walletBalance || 0).toLocaleString('en-IN')}</p>
                </CardContent>
            </Card>

            {/* Transaction History Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>A complete log of all your wallet activity.</CardDescription>
                </CardHeader>
                <CardContent>
                    {userTransactions.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {userTransactions.map(tx => (
                                    <TableRow key={tx.id}>
                                        <TableCell>{format(new Date(tx.date), 'MMM dd, yyyy')}</TableCell>
                                        <TableCell className="font-medium">{tx.description}</TableCell>
                                        <TableCell className={cn(
                                            "text-right font-bold flex items-center justify-end gap-2",
                                            tx.type === 'credit' ? 'text-green-600' : 'text-destructive'
                                        )}>
                                            {tx.type === 'credit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                            ₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                         // Empty state for users with no transactions
                        <div className="text-center py-12">
                            <h3 className="text-lg font-semibold">No transactions yet.</h3>
                            <p className="text-muted-foreground mt-2">Refer a friend or get bonuses to start earning!</p>
                             <Button asChild className="mt-4">
                                <Link href="/dashboard">Go to Dashboard</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
