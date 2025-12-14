

"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { useMockData } from "@/hooks/use-mock-data";
import type { Booking } from "@/lib/types";
import { format } from "date-fns";
import { Check, RotateCcw, X, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function OrganizerRefundsPage() {
  const { user } = useAuth();
  const { bookings, approveRefund, rejectRefund } = useMockData();
  const [actionTarget, setActionTarget] = useState<{booking: Booking, type: 'approve' | 'reject'} | null>(null);
  const [remarks, setRemarks] = useState("");
  const [approvedAmount, setApprovedAmount] = useState<number | string>("");
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");


  const { pendingRefunds, historicalRefunds } = useMemo(() => {
    if (!user || user.role !== "organizer" || !user.organizerId) {
      return { pendingRefunds: [], historicalRefunds: [] };
    }
    const organizerBookings = bookings.filter(b => b.organizerId === user.organizerId);

    const pending = organizerBookings.filter(b => b.refundStatus === "requested");
    const history = organizerBookings.filter(b => b.refundStatus && b.refundStatus !== 'requested' && b.refundStatus !== 'none');
    
    return { pendingRefunds: pending, historicalRefunds: history };
  }, [bookings, user]);
  
  const filteredHistoricalRefunds = useMemo(() => {
    if (!searchTerm) return historicalRefunds;
    const searchLower = searchTerm.toLowerCase();
    return historicalRefunds.filter(b => 
      b.travelerName.toLowerCase().includes(searchLower) ||
      b.tripTitle.toLowerCase().includes(searchLower)
    );
  }, [historicalRefunds, searchTerm]);

  const handleAction = () => {
    if (!actionTarget) return;

    const { booking, type } = actionTarget;

    if (type === 'reject') {
      if (!remarks.trim()) {
        toast({ variant: 'destructive', title: "Remarks are required for rejection."});
        return;
      }
      rejectRefund(booking.id, remarks);
    } else { // approve
      const finalAmount = Number(approvedAmount);
      if (isNaN(finalAmount) || finalAmount < 0 || finalAmount > booking.amountPaid) {
          toast({ variant: 'destructive', title: "Invalid Amount", description: `Amount must be between 0 and ${booking.amountPaid}.`});
          return;
      }
      approveRefund(booking.id, finalAmount, remarks);
    }
    
    // Reset and close
    setActionTarget(null);
    setRemarks("");
    setApprovedAmount("");
  };
  
  const openDialog = (booking: Booking, type: 'approve' | 'reject') => {
      setApprovedAmount(booking.amountPaid); // Default to full amount
      setRemarks(""); // Clear previous remarks
      setActionTarget({ booking, type });
  }

  const getStatusBadge = (status: Booking["refundStatus"]) => {
    switch (status) {
      case "approved_by_organizer":
        return <Badge variant="secondary">Pending Admin Processing</Badge>;
      case "processed":
        return <Badge variant="default">Refund Processed</Badge>;
      case "rejected_by_organizer":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog onOpenChange={(isOpen) => !isOpen && setActionTarget(null)}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Refund Requests</h1>
          <p className="text-muted-foreground">
            Review and take action on refund requests from travelers for your trips.
          </p>
        </div>

         <Tabs defaultValue="pending">
           <Card>
            <CardHeader>
              <CardTitle>Refund Requests</CardTitle>
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 mt-4 md:w-[400px]">
                <TabsTrigger value="pending">Pending Action ({pendingRefunds.length})</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="pending">
                {pendingRefunds.length > 0 ? (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Traveler</TableHead>
                          <TableHead>Trip</TableHead>
                          <TableHead>Request Date</TableHead>
                          <TableHead className="text-right">Amount Paid</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingRefunds.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">
                              <p>{booking.travelerName}</p>
                              <p className="text-xs text-muted-foreground">{booking.travelerPhone}</p>
                            </TableCell>
                            <TableCell>{booking.tripTitle}</TableCell>
                            <TableCell>
                              {booking.refundRequestDate ? format(new Date(booking.refundRequestDate), "dd MMM yyyy") : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right">
                              ₹{booking.amountPaid.toLocaleString("en-IN")}
                            </TableCell>
                            <TableCell className="text-center flex gap-2 justify-center">
                              <DialogTrigger asChild>
                                  <Button size="sm" variant="outline" onClick={() => openDialog(booking, 'approve')}>
                                      <Check className="mr-2 h-4 w-4" /> Approve
                                  </Button>
                              </DialogTrigger>
                              <DialogTrigger asChild>
                                  <Button size="sm" variant="destructive" onClick={() => openDialog(booking, 'reject')}>
                                      <X className="mr-2 h-4 w-4" /> Reject
                                  </Button>
                              </DialogTrigger>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <RotateCcw className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mt-4">
                      No pending refund requests.
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      When a traveler requests a refund, it will appear here.
                    </p>
                  </div>
                )}
              </TabsContent>
               <TabsContent value="history">
                 <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by trip or traveler..." 
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                 {filteredHistoricalRefunds.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Traveler</TableHead>
                        <TableHead>Trip</TableHead>
                        <TableHead>Final Status</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistoricalRefunds.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>{booking.travelerName}</TableCell>
                          <TableCell>{booking.tripTitle}</TableCell>
                          <TableCell>{getStatusBadge(booking.refundStatus)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground italic">
                            {booking.refundStatus === 'rejected_by_organizer' ? `Reason: ${booking.refundRejectionReason}` : 
                            (booking.refundStatus === 'processed' ? `Processed on ${booking.refundProcessedDate ? format(new Date(booking.refundProcessedDate), "dd MMM yyyy") : 'N/A'}` : 'Awaiting admin action')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                      <p>No historical refund data found.</p>
                  </div>
                )}
              </TabsContent>
            </CardContent>
           </Card>
        </Tabs>
      </div>

       {actionTarget && (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{actionTarget.type === 'approve' ? 'Approve Refund' : 'Reject Refund'} for {actionTarget.booking.tripTitle}</DialogTitle>
                <DialogDescription>
                  {actionTarget.type === 'approve' 
                    ? "Specify the amount to be refunded and add optional remarks." 
                    : "Provide a mandatory reason for rejecting this refund request."
                  }
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                {actionTarget.type === 'approve' && (
                    <div className="space-y-2">
                        <Label htmlFor="refund-amount">Refund Amount (₹)</Label>
                        <Input 
                            id="refund-amount" 
                            type="number"
                            value={approvedAmount}
                            onChange={e => setApprovedAmount(e.target.value)}
                            max={actionTarget.booking.amountPaid}
                        />
                        <p className="text-xs text-muted-foreground">Max: ₹{actionTarget.booking.amountPaid.toLocaleString()}</p>
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="remarks">
                        {actionTarget.type === 'approve' ? 'Remarks (Optional)' : 'Reason for Rejection (Mandatory)'}
                    </Label>
                    <Textarea
                        id="remarks"
                        placeholder={actionTarget.type === 'approve' ? "e.g., Approved as a goodwill gesture." : "e.g., Cancellation window has passed as per the trip policy."}
                        value={remarks}
                        onChange={e => setRemarks(e.target.value)}
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setActionTarget(null)}>Cancel</Button>
                <Button
                    variant={actionTarget.type === 'reject' ? 'destructive' : 'default'}
                    onClick={handleAction}
                    disabled={actionTarget.type === 'reject' && !remarks.trim()}
                >
                    Confirm {actionTarget.type === 'approve' ? 'Approval' : 'Rejection'}
                </Button>
            </DialogFooter>
        </DialogContent>
       )}
    </Dialog>
  );
}

    