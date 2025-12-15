

"use client";

import { useMemo, useState, useEffect } from "react";
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
import type { ExperienceBooking } from "@/lib/types";
import { format } from "date-fns";
import { Check, RotateCcw, X, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function VendorRefundsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<ExperienceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionTarget, setActionTarget] = useState<{booking: ExperienceBooking, type: 'approve' | 'reject'} | null>(null);
  const [remarks, setRemarks] = useState("");
  const [approvedAmount, setApprovedAmount] = useState<number | string>("");
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchBookings() {
      if (!user?.organizerId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/experiences/bookings?vendorId=${user.organizerId}`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch bookings');
        const data = await response.json();
        setBookings(data.bookings || []);
      } catch (error) {
        console.error("Failed to fetch experience bookings:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to load bookings." });
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [user?.organizerId, toast]);

  const { pendingRefunds, historicalRefunds } = useMemo(() => {
    if (!user || user.role !== "organizer" || !user.organizerId || loading) {
      return { pendingRefunds: [], historicalRefunds: [] };
    }
    const pending = bookings.filter(b => b.refundStatus === "requested");
    const history = bookings.filter(b => b.refundStatus && b.refundStatus !== 'requested' && b.refundStatus !== 'none');
    
    return { pendingRefunds: pending, historicalRefunds: history };
  }, [bookings, user, loading]);

  const filteredHistoricalRefunds = useMemo(() => {
    if (!searchTerm) return historicalRefunds;
    const searchLower = searchTerm.toLowerCase();
    return historicalRefunds.filter(b => 
      b.travelerName.toLowerCase().includes(searchLower) ||
      b.experienceTitle.toLowerCase().includes(searchLower)
    );
  }, [historicalRefunds, searchTerm]);

  const handleAction = async () => {
    if (!actionTarget) return;

    const { booking, type } = actionTarget;

    if (type === 'reject') {
      if (!remarks.trim()) {
        toast({ variant: 'destructive', title: "Remarks are required for rejection."});
        return;
      }

      try {
        const response = await fetch(`/api/experiences/bookings/${booking.id}/refund?action=reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            reason: remarks,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to reject refund');
        }

        // Refresh bookings
        const refreshResponse = await fetch(`/api/experiences/bookings?vendorId=${user?.organizerId}`, {
          credentials: 'include',
        });
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setBookings(refreshData.bookings || []);
        }

        toast({ title: "Refund Rejected", description: "The refund request has been rejected." });
      } catch (error: any) {
        console.error("Failed to reject refund:", error);
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to reject refund. Please try again." });
        return;
      }
    } else { // approve
      const finalAmount = Number(approvedAmount);
      if (isNaN(finalAmount) || finalAmount < 0 || finalAmount > booking.totalPrice) {
          toast({ variant: 'destructive', title: "Invalid Amount", description: `Amount must be between 0 and ${booking.totalPrice}.`});
          return;
      }

      try {
        const response = await fetch(`/api/experiences/bookings/${booking.id}/refund?action=approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            approvedAmount: finalAmount,
            remarks: remarks,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to approve refund');
        }

        // Refresh bookings
        const refreshResponse = await fetch(`/api/experiences/bookings?vendorId=${user?.organizerId}`, {
          credentials: 'include',
        });
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setBookings(refreshData.bookings || []);
        }

        toast({ title: "Refund Approved", description: "The refund request has been approved and sent to admin for processing." });
      } catch (error: any) {
        console.error("Failed to approve refund:", error);
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to approve refund. Please try again." });
        return;
      }
    }
    
    // Reset and close
    setActionTarget(null);
    setRemarks("");
    setApprovedAmount("");
  };
  
  const openDialog = (booking: ExperienceBooking, type: 'approve' | 'reject') => {
      setApprovedAmount(booking.totalPrice); // Default to full amount
      setRemarks(""); // Clear previous remarks
      setActionTarget({ booking, type });
  }

  const getStatusBadge = (status: ExperienceBooking["refundStatus"]) => {
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
            Review and take action on refund requests for your experiences.
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
                          <TableHead>Experience</TableHead>
                          <TableHead>Activity Date</TableHead>
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
                            <TableCell>{booking.experienceTitle}</TableCell>
                            <TableCell>
                              {format(new Date(booking.activityDate), "dd MMM yyyy")}
                            </TableCell>
                            <TableCell className="text-right">
                              ₹{booking.totalPrice.toLocaleString("en-IN")}
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
                            placeholder="Search by experience or traveler..." 
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
                        <TableHead>Experience</TableHead>
                        <TableHead>Final Status</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistoricalRefunds.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>{booking.travelerName}</TableCell>
                          <TableCell>{booking.experienceTitle}</TableCell>
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
                      <p>No historical refund data matching your search.</p>
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
                <DialogTitle>{actionTarget.type === 'approve' ? 'Approve Refund' : 'Reject Refund'} for {actionTarget.booking.experienceTitle}</DialogTitle>
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
                            max={actionTarget.booking.totalPrice}
                        />
                        <p className="text-xs text-muted-foreground">Max: ₹{actionTarget.booking.totalPrice.toLocaleString()}</p>
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="remarks">
                        {actionTarget.type === 'approve' ? 'Remarks (Optional)' : 'Reason for Rejection (Mandatory)'}
                    </Label>
                    <Textarea
                        id="remarks"
                        placeholder={actionTarget.type === 'approve' ? "e.g., Approved as a goodwill gesture." : "e.g., Cancellation window has passed as per the policy."}
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

    