

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMockData } from "@/hooks/use-mock-data";
import { Banknote, CheckCircle, Clock, Download, ChevronRight, CreditCard, AlertCircle, BookCheck } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import type { ProcessedBatch } from "@/lib/types";
import { isBefore, startOfToday, format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";


function SettlementRow({ settlement, isCollapsible }: { settlement: ProcessedBatch, isCollapsible: boolean}) {
    const [isOpen, setIsOpen] = useState(false);

    const getStatusBadge = (status: ProcessedBatch['status']) => {
        switch (status) {
            case 'Paid': return <Badge variant="default">Paid</Badge>;
            case 'Available for Payout': return <Badge variant="secondary">Pending Payout</Badge>;
            case 'Processing': return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Processing</Badge>;
        }
    };
    
    return (
        <Collapsible asChild key={settlement.id} open={isOpen} onOpenChange={setIsOpen}>
             <tbody className="border-b">
                <CollapsibleTrigger asChild>
                    <TableRow className={cn("cursor-pointer hover:bg-muted/50")} data-state={isOpen ? "open" : "closed"}>
                        <TableCell>
                             <div className="flex items-center gap-2">
                                {isCollapsible && <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />}
                                <div>
                                    <div className="font-medium">{settlement.tripTitle}</div>
                                    <div className="text-sm text-muted-foreground">Ended: {format(new Date(settlement.batchEndDate), 'dd MMM yyyy')}</div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="font-semibold">₹{settlement.netEarning.toLocaleString('en-IN')}</TableCell>
                        <TableCell>{getStatusBadge(settlement.status)}</TableCell>
                        <TableCell className="text-right">
                             {settlement.status === 'Paid' && (
                                <div className="flex items-center justify-end gap-2">
                                     <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <BookCheck className="h-3 w-3" />
                                        <span className="font-mono">{settlement.utrNumber}</span>
                                    </div>
                                    {settlement.invoiceUrl && (
                                        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                            <Link href={settlement.invoiceUrl} target="_blank">
                                                <Download className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            )}
                            {settlement.status !== 'Paid' && (
                                <span className="text-xs text-muted-foreground">Awaiting admin action</span>
                            )}
                        </TableCell>
                    </TableRow>
                </CollapsibleTrigger>
                <CollapsibleContent asChild>
                    <tr className="bg-muted/30 hover:bg-muted/40">
                        <TableCell colSpan={6} className="p-0">
                           <div className="p-6">
                                <h4 className="font-semibold mb-3">Financial Breakdown for this Batch</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm p-4 bg-background rounded-lg border">
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground">Successful Bookings</p>
                                        <p className="font-medium">{settlement.successfulBookingsCount}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground">Cancelled Bookings</p>
                                        <p className="font-medium">{settlement.cancelledBookingsCount}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground">Gross Revenue</p>
                                        <p className="font-medium text-green-600">+ ₹{settlement.grossRevenue.toLocaleString('en-IN')}</p>
                                    </div>
                                     <div className="space-y-1">
                                        <p className="text-muted-foreground">Platform Commission</p>
                                        <p className="font-medium text-destructive">- ₹{settlement.commission.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                    </tr>
                </CollapsibleContent>
            </tbody>
        </Collapsible>
    )
}

export default function OrganizerPayoutsPage() {
    const { user } = useAuth();
    const { bookings, trips, commissionRate, organizers } = useMockData();
    const [settlements, setSettlements] = useState<ProcessedBatch[]>([]);
    const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
    
    useEffect(() => {
        if (!user?.organizerId) return;

        const today = startOfToday();
        const processedBatches: ProcessedBatch[] = [];
        
        const organizer = organizers[user.organizerId];
        const organizerTrips = trips.filter(t => t.organizer.id === user.organizerId);

        organizerTrips.forEach(trip => {
            (trip.batches || []).forEach(batch => {
                const isCompleted = isBefore(new Date(batch.endDate), today);
                if (!isCompleted) return;

                const batchBookings = bookings.filter(b => b.batchId === batch.id && b.tripId === trip.id);
                if (batchBookings.length === 0) return;

                // NEW LOGIC: Check for unresolved disputes in this batch
                const hasOpenDispute = batchBookings.some(b => b.refundStatus === 'requested' || b.refundStatus === 'approved_by_organizer');
                
                // If a dispute is open, skip this batch from settlement calculation for now
                if (hasOpenDispute) return;

                const successfulBookings = batchBookings.filter(b => b.paymentStatus === 'Paid in Full');
                const cancelledBookings = batchBookings.filter(b => b.paymentStatus === 'Cancelled');
                
                const successfulRevenue = successfulBookings.reduce((sum, b) => sum + b.totalPrice, 0);
                const cancellationRevenue = cancelledBookings.reduce((sum, b) => sum + b.amountPaid, 0);

                const grossRevenue = successfulRevenue + cancellationRevenue;
                
                const effectiveCommissionRate = organizer?.commissionRate ?? commissionRate;
                const commission = grossRevenue * (effectiveCommissionRate / 100);

                const netEarning = grossRevenue - commission;

                let status: ProcessedBatch['status'] = 'Available for Payout';
                let invoiceUrl: string | undefined = undefined;
                let utrNumber: string | undefined = undefined;

                // This mock data simulates different payout statuses for demonstration
                if (batch.id === 'batch-1-1') { 
                    status = 'Paid';
                    invoiceUrl = '/invoices/mock-invoice.pdf';
                    utrNumber = 'HDFC1234567890';
                } else if (batch.id === 'batch-4-2') {
                    status = 'Processing';
                    invoiceUrl = '/invoices/mock-invoice.pdf';
                }
                
                processedBatches.push({
                    id: `${trip.id}-${batch.id}`,
                    tripTitle: trip.title,
                    batchEndDate: batch.endDate,
                    grossRevenue,
                    commission,
                    netEarning,
                    status,
                    invoiceUrl,
                    utrNumber,
                    successfulBookingsCount: successfulBookings.length,
                    cancelledBookingsCount: cancelledBookings.length,
                    successfulRevenue,
                    cancellationRevenue,
                });
            });
        });
        
        setSettlements(processedBatches.sort((a,b) => new Date(b.batchEndDate).getTime() - new Date(a.batchEndDate).getTime()));

    }, [user, trips, bookings, commissionRate, organizers]);
    
    const settlementQueue = useMemo(() => settlements.filter(s => s.status === 'Available for Payout'), [settlements]);
    const payoutHistory = useMemo(() => settlements.filter(s => s.status === 'Processing' || s.status === 'Paid'), [settlements]);
    const availableForPayout = useMemo(() => settlementQueue.reduce((sum, s) => sum + s.netEarning, 0), [settlementQueue]);
    const lifetimeEarnings = useMemo(() => settlements.reduce((sum, s) => sum + s.netEarning, 0), [settlements]);
    const currentList = activeTab === 'queue' ? settlementQueue : payoutHistory;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Payouts &amp; Earnings</h1>
                <p className="text-muted-foreground">Track your earnings and payouts on a batch-by-batch basis.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Next Payout Amount</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{availableForPayout.toLocaleString('en-IN')}</div>
                        <p className="text-xs text-muted-foreground">From {settlementQueue.length} completed batches.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lifetime Net Earnings</CardTitle>
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{lifetimeEarnings.toLocaleString('en-IN')}</div>
                        <p className="text-xs text-muted-foreground">Total earnings after commission.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Payout Method</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-semibold">Bank Transfer</div>
                        <p className="text-xs text-muted-foreground">To HDFC Bank A/C ...1234</p>
                    </CardContent>
                </Card>
            </div>
            
             <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>New Weekly Payout Schedule</AlertTitle>
                <AlertDescription>
                    We've moved to an automated weekly payout system. Payouts for all batches completed in a week are automatically processed on the following Wednesday. To change your bank details, please email <a href="mailto:support@travonex.com" className="font-semibold underline">support@travonex.com</a>.
                </AlertDescription>
            </Alert>


            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'queue' | 'history')}>
                <Card>
                    <CardHeader>
                        <CardTitle>Financial Ledger</CardTitle>
                        <CardDescription>A complete financial record of your earnings and payouts. Click a row to see details.</CardDescription>
                         <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 mt-4 md:w-[400px]">
                            <TabsTrigger value="queue">Settlement Queue</TabsTrigger>
                            <TabsTrigger value="history">Payout History</TabsTrigger>
                        </TabsList>
                    </CardHeader>
                    <CardContent>
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50%]">Trip Batch</TableHead>
                                    <TableHead>Net Earning</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Reference</TableHead>
                                </TableRow>
                            </TableHeader>
                           
                           {currentList.length > 0 ? (
                                currentList.map((item) => (
                                    <SettlementRow
                                        key={item.id}
                                        settlement={item} 
                                        isCollapsible={true}
                                    />
                                ))
                            ) : (
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            {activeTab === 'queue' ? 'All caught up! No settlements are currently pending.' : 'You have no payout history yet.'}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            )}
                        </Table>
                    </CardContent>
                </Card>
            </Tabs>
        </div>
    );
}
