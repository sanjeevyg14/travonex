

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMockData } from "@/hooks/use-mock-data";
import { Banknote, CheckCircle, Clock, Download, ChevronRight, FileUp, CircleUser, Phone, BookCheck, AlertCircle } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import type { Trip, Booking, Batch, ProcessedBatch } from "@/lib/types";
import { isBefore, startOfToday, format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";


function PayoutDialog({ settlement, onProcessPayout }: { settlement: ProcessedBatch, onProcessPayout: (id: string, invoiceUrl: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const { bookings } = useMockData();
    
    const [tripId, batchId] = settlement.id.split('::');
    
    const batchBookings = bookings.filter(b => b.tripId === tripId && b.batchId === batchId);
    
    const handleConfirm = () => {
        // In a real app, you would get the URL from the file upload response.
        // For this simulation, we'll use a placeholder.
        onProcessPayout(settlement.id, '/invoices/mock-invoice.pdf');
        setIsOpen(false);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm">Process Payout</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Step 1: Process Payout for {settlement.tripTitle}</DialogTitle>
                    <DialogDescription>
                        Confirm details, upload the invoice, and move this to the "Processing" state.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Financial Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>Gross Revenue:</span><span className="font-medium">₹{settlement.grossRevenue.toLocaleString('en-IN')}</span></div>
                            <div className="flex justify-between"><span>Platform Commission:</span><span className="font-medium text-destructive">- ₹{settlement.commission.toLocaleString('en-IN')}</span></div>
                            <Separator/>
                            <div className="flex justify-between font-bold text-lg"><span>Net Payout Amount:</span><span>₹{settlement.netEarning.toLocaleString('en-IN')}</span></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Bookings in this Batch ({batchBookings.length})</CardTitle>
                            <CardDescription>Cross-validate these bookings with your payment gateway records.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             {batchBookings.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Traveler</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Amount Paid</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {batchBookings.map(b => (
                                            <TableRow key={b.id}>
                                                <TableCell>
                                                    <div className="font-medium">{b.travelerName}</div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3"/>{b.travelerPhone}</div>
                                                </TableCell>
                                                <TableCell><Badge variant={b.paymentStatus === 'Paid in Full' ? 'default' : 'secondary'}>{b.paymentStatus}</Badge></TableCell>
                                                <TableCell className="text-right">₹{b.amountPaid.toLocaleString('en-IN')}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : <p className="text-sm text-muted-foreground text-center py-4">No bookings found for this batch.</p>}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Upload Invoice</CardTitle>
                            <CardDescription>Upload the final invoice/summary for the organizer's records.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="invoice-file">Invoice Document (PDF)</Label>
                                <div className="flex items-center gap-2">
                                    <Input id="invoice-file" type="file" />
                                    <Button variant="secondary" size="icon" type="button"><FileUp/></Button>
                                </div>
                                <p className="text-xs text-muted-foreground">This will be available for the organizer to download.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirm}>Confirm & Mark as Processing</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function UTRDialog({ settlement, onProcessUTR }: { settlement: ProcessedBatch, onProcessUTR: (id: string, utr: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [utr, setUtr] = useState("");

    const handleConfirm = () => {
        if (!utr) return;
        onProcessUTR(settlement.id, utr);
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">Submit UTR</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Step 2: Submit UTR for {settlement.tripTitle}</DialogTitle>
                    <DialogDescription>
                        Enter the Unique Transaction Reference number from the bank transfer to complete this payout.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                        <p className="text-sm text-muted-foreground">Net Payout Amount</p>
                        <p className="text-2xl font-bold">₹{settlement.netEarning.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="utr">Bank UTR / Transaction ID</Label>
                        <Input
                            id="utr"
                            value={utr}
                            onChange={(e) => setUtr(e.target.value)}
                            placeholder="e.g., HDFC1234567890"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={!utr}>Confirm & Mark as Paid</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


function SettlementRow({ settlement, isCollapsible, onProcessPayout, onProcessUTR, defaultOpen = false }: { settlement: ProcessedBatch, isCollapsible: boolean, onProcessPayout?: any, onProcessUTR?: any, defaultOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const getStatusBadge = (status: ProcessedBatch['status']) => {
        switch (status) {
            case 'Paid': return <Badge variant="default">Paid</Badge>;
            case 'Available for Payout': return <Badge variant="secondary">Pending</Badge>;
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
                        <TableCell>{settlement.organizerName}</TableCell>
                        <TableCell className="font-semibold">₹{settlement.netEarning.toLocaleString('en-IN')}</TableCell>
                        <TableCell>{getStatusBadge(settlement.status)}</TableCell>
                        <TableCell className="text-right">
                             {onProcessPayout && settlement.status === 'Available for Payout' && (
                                <PayoutDialog settlement={settlement} onProcessPayout={onProcessPayout} />
                            )}
                            {onProcessUTR && settlement.status === 'Processing' && (
                                <UTRDialog settlement={settlement} onProcessUTR={onProcessUTR} />
                            )}
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
    );
}


export default function AdminSettlementsPage() {
    const { toast } = useToast();
    const { trips, bookings, commissionRate, organizers } = useMockData();
    const [settlements, setSettlements] = useState<ProcessedBatch[]>([]);
    const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
    const [openCollapsibleId, setOpenCollapsibleId] = useState<string | null>(null);

    useEffect(() => {
        const today = startOfToday();
        const allSettlements: ProcessedBatch[] = [];

        trips.forEach(trip => {
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

                const organizer = organizers[trip.organizer.id];
                const effectiveCommissionRate = organizer?.commissionRate ?? commissionRate;
                const commission = grossRevenue * (effectiveCommissionRate / 100);

                const netEarning = grossRevenue - commission;
                
                let status: ProcessedBatch['status'] = 'Available for Payout';
                let invoiceUrl: string | undefined = undefined;
                let utrNumber: string | undefined = undefined;

                if (batch.id === 'batch-1-1') { 
                    status = 'Paid';
                    invoiceUrl = '/invoices/mock-invoice.pdf';
                    utrNumber = 'HDFC1234567890';
                } else if (batch.id === 'batch-4-2') {
                    status = 'Processing';
                    invoiceUrl = '/invoices/mock-invoice.pdf';
                }

                allSettlements.push({
                    id: `${trip.id}::${batch.id}`,
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
                    organizerId: trip.organizer.id,
                    organizerName: trip.organizer.name,
                });
            });
        });
        setSettlements(allSettlements.sort((a,b) => new Date(b.batchEndDate).getTime() - new Date(a.batchEndDate).getTime()));
    }, [trips, bookings, commissionRate, organizers]);

    const handleProcessPayout = (settlementId: string, invoiceUrl: string) => {
        setSettlements(prev => prev.map(s => {
            if (s.id === settlementId) {
                return { 
                    ...s, 
                    status: 'Processing',
                    invoiceUrl: invoiceUrl
                };
            }
            return s;
        }));
        
        const settlement = settlements.find(s => s.id === settlementId);
        toast({
            title: "Payout Processing",
            description: `Settlement for ${settlement?.tripTitle} has been moved to history.`,
        });
    };
    
    const handleProcessUTR = (settlementId: string, utr: string) => {
        setSettlements(prev => prev.map(s => {
            if (s.id === settlementId) {
                return { 
                    ...s, 
                    status: 'Paid',
                    utrNumber: utr,
                };
            }
            return s;
        }));
        
        const settlement = settlements.find(s => s.id === settlementId);
        toast({
            title: "UTR Submitted!",
            description: `Payout for ${settlement?.tripTitle} has been marked as paid.`,
        });
    };
    
    const pendingSettlements = useMemo(() => settlements.filter(s => s.status === 'Available for Payout'), [settlements]);
    const payoutHistory = useMemo(() => settlements.filter(s => s.status === 'Processing' || s.status === 'Paid').sort((a, b) => (a.status === 'Processing' ? -1 : 1)), [settlements]);
    const totalPendingAmount = useMemo(() => pendingSettlements.reduce((acc, s) => acc + s.netEarning, 0), [pendingSettlements]);
    const totalPaidAmount = useMemo(() => payoutHistory.filter(s => s.status === 'Paid').reduce((acc, s) => acc + s.netEarning, 0), [payoutHistory]);
    const currentList = activeTab === 'queue' ? pendingSettlements : payoutHistory;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Settlements</h1>
                <p className="text-muted-foreground">Review and process payouts for each completed trip batch.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Settlements Queue</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalPendingAmount.toLocaleString('en-IN')}</div>
                        <p className="text-xs text-muted-foreground">{pendingSettlements.length} completed batches awaiting payout.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalPaidAmount.toLocaleString('en-IN')}</div>
                        <p className="text-xs text-muted-foreground">Across {payoutHistory.filter(s => s.status === 'Paid').length} transactions.</p>
                    </CardContent>
                </Card>
            </div>

             <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'queue' | 'history')}>
                <Card>
                    <CardHeader>
                        <CardTitle>Financial Ledger</CardTitle>
                         <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 mt-4 md:w-[400px]">
                            <TabsTrigger value="queue">Settlement Queue</TabsTrigger>
                            <TabsTrigger value="history">Payout History</TabsTrigger>
                        </TabsList>
                    </CardHeader>
                    <CardContent>
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[30%]">Trip Batch</TableHead>
                                    <TableHead>Organizer</TableHead>
                                    <TableHead>Net Payout</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right w-[20%]">Action/Reference</TableHead>
                                </TableRow>
                            </TableHeader>
                           
                                {currentList.length > 0 ? (
                                    currentList.map((item) => (
                                         <SettlementRow
                                            key={item.id}
                                            settlement={item} 
                                            isCollapsible={true} 
                                            onProcessPayout={handleProcessPayout} 
                                            onProcessUTR={handleProcessUTR}
                                            defaultOpen={item.status === 'Processing'}
                                        />
                                    ))
                                ) : (
                                    <TableBody>
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                {activeTab === 'queue' ? 'The settlement queue is empty. All completed batches have been processed.' : 'No payout history found.'}
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
    



    

