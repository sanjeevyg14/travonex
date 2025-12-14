

"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import { useMockData } from "@/hooks/use-mock-data";
import type { Booking, ExperienceBooking } from "@/lib/types";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw, Globe, Activity, CreditCard, Info, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";


type UnifiedBooking = (Booking | ExperienceBooking) & { bookingType: 'trip' | 'experience' };

function ProcessRefundDialog({
  booking,
  onConfirm,
}: {
  booking: UnifiedBooking;
  onConfirm: (bookingId: string, type: 'trip' | 'experience') => void;
}) {

  const handleConfirm = () => {
    onConfirm(booking.id, booking.bookingType);
  };
  
  const title = booking.bookingType === 'trip' ? booking.tripTitle : (booking as ExperienceBooking).experienceTitle;
  const amount = booking.approvedRefundAmount || booking.amountPaid || 0;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Process Refund for {title}</DialogTitle>
        <DialogDescription>
          This will trigger an automated refund via the payment gateway for the approved amount.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 space-y-4">
        <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-sm text-muted-foreground">Approved Refund Amount</p>
            <p className="text-3xl font-bold">₹{amount.toLocaleString('en-IN')}</p>
        </div>
        <div className="space-y-2">
            <Label>Original Payment ID</Label>
            <div className="flex items-center gap-2 p-3 rounded-md bg-muted text-muted-foreground font-mono text-sm">
                <CreditCard className="h-4 w-4" />
                <span>{booking.paymentGatewayId || 'pay_mock_xxxxxxxxxx'}</span>
            </div>
        </div>
         <div className="text-xs text-muted-foreground italic space-y-1">
            <p className="font-semibold">Organizer Remarks:</p>
            <p>{booking.cancellationReason || 'N/A'}</p>
        </div>
      </div>
      <DialogFooter>
        <DialogTrigger asChild>
            <Button variant="outline">Cancel</Button>
        </DialogTrigger>
        <DialogTrigger asChild>
             <Button onClick={handleConfirm}>
                Process Refund via Gateway
            </Button>
        </DialogTrigger>
      </DialogFooter>
    </DialogContent>
  );
}


export default function AdminRefundsPage() {
  const { bookings, experienceBookings, processRefund, processExperienceRefund, organizers } = useMockData();
  const [selectedBooking, setSelectedBooking] = useState<UnifiedBooking | null>(null);
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("all");
  const [historyOrganizerFilter, setHistoryOrganizerFilter] = useState("all");


  const { pendingRefunds, historicalRefunds } = useMemo(() => {
    const pending: UnifiedBooking[] = [];
    const history: UnifiedBooking[] = [];
    
    bookings.forEach((b) => {
        const booking = {...b, bookingType: 'trip' as const};
        if (b.refundStatus === "approved_by_organizer") {
            pending.push(booking);
        } else if ( b.refundStatus && b.refundStatus !== 'none' && b.refundStatus !== 'requested') {
            history.push(booking);
        }
    });
    
    experienceBookings.forEach((b) => {
        const booking = {...b, bookingType: 'experience' as const};
         if (b.refundStatus === "approved_by_organizer") {
            pending.push(booking);
        } else if ( b.refundStatus && b.refundStatus !== 'none' && b.refundStatus !== 'requested') {
            history.push(booking);
        }
    });

    history.sort((a,b) => new Date(b.refundRequestDate || 0).getTime() - new Date(a.refundRequestDate || 0).getTime());
    return { pendingRefunds: pending, historicalRefunds: history };
  }, [bookings, experienceBookings]);
  
  const filteredHistoricalRefunds = useMemo(() => {
      let filtered = historicalRefunds;

      if (historyStatusFilter !== 'all') {
          filtered = filtered.filter(b => b.refundStatus === historyStatusFilter);
      }

      if (historyOrganizerFilter !== 'all') {
           filtered = filtered.filter(b => {
             if (b.bookingType === 'trip') {
               return (b as Booking).organizerId === historyOrganizerFilter;
             }
             if (b.bookingType === 'experience') {
                // This logic needs to be adapted if experiences have organizers
                return true; 
             }
             return false;
           });
      }
      
      if (historySearchTerm) {
          const searchLower = historySearchTerm.toLowerCase();
          filtered = filtered.filter(b => {
              const title = b.bookingType === 'trip' ? (b as Booking).tripTitle : (b as ExperienceBooking).experienceTitle;
              return b.travelerName.toLowerCase().includes(searchLower) || title.toLowerCase().includes(searchLower);
          });
      }

      return filtered;
  }, [historicalRefunds, historySearchTerm, historyStatusFilter, historyOrganizerFilter]);


  const getStatusBadge = (status: UnifiedBooking["refundStatus"]) => {
    switch (status) {
      case "approved_by_organizer":
        return <Badge variant="secondary">Pending Admin Processing</Badge>;
      case "processed":
        return <Badge variant="default">Refund Processed</Badge>;
      case "rejected_by_organizer":
        return <Badge variant="destructive">Rejected by Organizer</Badge>;
      case "rejected_by_admin":
        return <Badge variant="destructive">Rejected by Admin</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const handleProcessRefund = (bookingId: string, type: 'trip' | 'experience') => {
      if (type === 'trip') {
          processRefund(bookingId);
      } else {
          processExperienceRefund(bookingId);
      }
  }

  return (
    <Dialog onOpenChange={(open) => !open && setSelectedBooking(null)}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Unified Refund Management</h1>
          <p className="text-muted-foreground">
            Process approved refunds for both Trips and Experiences in one place.
          </p>
        </div>

        <Tabs defaultValue="pending">
          <Card>
            <CardHeader>
              <CardTitle>Refund Ledger</CardTitle>
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 mt-4 md:w-[400px]">
                <TabsTrigger value="pending">Pending Action ({pendingRefunds.length})</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="pending">
                {pendingRefunds.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Traveler</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Request Date</TableHead>
                        <TableHead className="text-right">Approved Amount</TableHead>
                        <TableHead className="text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRefunds.map((booking) => {
                        const amount = booking.approvedRefundAmount || booking.amountPaid || 0;
                        return (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <Badge variant="outline" className="capitalize flex items-center gap-1 w-fit">
                                {booking.bookingType === 'trip' ? <Globe className="h-3 w-3"/> : <Activity className="h-3 w-3"/>}
                                {booking.bookingType}
                            </Badge>
                          </TableCell>
                          <TableCell>{booking.travelerName}</TableCell>
                          <TableCell>{booking.bookingType === 'trip' ? booking.tripTitle : (booking as ExperienceBooking).experienceTitle}</TableCell>
                          <TableCell>
                            {booking.refundRequestDate ? format(new Date(booking.refundRequestDate), "dd MMM yyyy") : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ₹{amount.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-center">
                            <DialogTrigger asChild>
                                <Button
                                    size="sm"
                                    onClick={() => setSelectedBooking(booking)}
                                >
                                    Process Refund
                                </Button>
                            </DialogTrigger>
                          </TableCell>
                        </TableRow>
                      )})}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <RotateCcw className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mt-4">
                      No refunds awaiting processing.
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      When an organizer approves a refund, it will appear here.
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
                            value={historySearchTerm}
                            onChange={(e) => setHistorySearchTerm(e.target.value)}
                        />
                    </div>
                     <Select value={historyStatusFilter} onValueChange={setHistoryStatusFilter}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="processed">Processed</SelectItem>
                            <SelectItem value="rejected_by_organizer">Rejected by Organizer</SelectItem>
                            <SelectItem value="rejected_by_admin">Rejected by Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {filteredHistoricalRefunds.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Traveler</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Final Status</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistoricalRefunds.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{booking.bookingType}</Badge>
                          </TableCell>
                          <TableCell>{booking.travelerName}</TableCell>
                          <TableCell>{booking.bookingType === 'trip' ? (booking as Booking).tripTitle : (booking as ExperienceBooking).experienceTitle}</TableCell>
                          <TableCell>{getStatusBadge(booking.refundStatus)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground italic">
                              {booking.refundStatus === 'rejected_by_organizer' || booking.refundStatus === 'rejected_by_admin' ? `Reason: ${booking.refundRejectionReason}` : 
                              (booking.refundStatus === 'processed' ? `Processed on ${booking.refundProcessedDate ? format(new Date(booking.refundProcessedDate), "dd MMM yyyy") : 'N/A'} (Ref: ${booking.refundUtr})` : 'N/A')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                      <p>No historical refund data matching your filters.</p>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
        {selectedBooking && <ProcessRefundDialog booking={selectedBooking} onConfirm={handleProcessRefund} />}
      </div>
    </Dialog>
  );
}
