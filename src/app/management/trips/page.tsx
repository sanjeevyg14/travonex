

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMockData } from "@/hooks/use-mock-data";
import { useToast } from "@/hooks/use-toast";
import type { Trip, Batch } from "@/lib/types";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Globe, CheckCircle, Clock, DollarSign, Search, Zap, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";


type EnrichedAdminTrip = Trip & {
  totalTravelers: number;
  totalRevenue: number;
  activeDealBatch?: Batch;
};

function RejectionDialog({ trip, onConfirm }: { trip: Trip, onConfirm: (tripId: string, remarks: string) => void }) {
    const [remarks, setRemarks] = useState("");
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Reject Trip: {trip.title}</DialogTitle>
                <DialogDescription>
                    Provide a reason for rejection. This will be sent to the organizer to help them improve their listing.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Label htmlFor="rejection-remarks">Rejection Reason</Label>
                <Textarea
                    id="rejection-remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g., The itinerary is unclear, cover image quality is low, etc."
                />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button variant="destructive" onClick={() => onConfirm(trip.id, remarks)} disabled={!remarks.trim()}>
                        Confirm Rejection
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}

export default function AdminTripsPage() {
  const { trips, setTrips, bookings, addAuditLog } = useMockData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [rejectionTarget, setRejectionTarget] = useState<Trip | null>(null);

  const enrichedTrips = useMemo((): EnrichedAdminTrip[] => {
    return trips.map(trip => {
        const tripBookings = bookings.filter(b => b.tripId === trip.id);
        const totalTravelers = tripBookings.reduce((sum, b) => sum + b.numberOfTravelers, 0);
        const totalRevenue = tripBookings.reduce((sum, b) => sum + b.totalPrice, 0);
        
        // An active deal exists if a batch has the deal flag and is currently active.
        const activeDealBatch = trip.batches?.find(b => b.isLastMinuteDeal && b.status === 'Active');

        return {
            ...trip,
            totalTravelers,
            totalRevenue,
            activeDealBatch,
        }
    })
  }, [trips, bookings]);

  const filteredTrips = useMemo(() => {
    let tripsByStatus: EnrichedAdminTrip[];
    if (currentTab === 'all') {
      tripsByStatus = enrichedTrips;
    } else if (currentTab === 'deals') {
      tripsByStatus = enrichedTrips.filter(trip => trip.activeDealBatch);
    } else {
      tripsByStatus = enrichedTrips.filter(trip => trip.status === currentTab);
    }
    
    if (searchTerm) {
        return tripsByStatus.filter(trip => trip.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    return tripsByStatus;
  }, [enrichedTrips, currentTab, searchTerm]);

  const { totalTrips, publishedTrips, pendingApprovals, totalDeals } = useMemo(() => {
    return {
        totalTrips: trips.length,
        publishedTrips: trips.filter(t => t.status === 'published').length,
        pendingApprovals: trips.filter(t => t.status === 'pending').length,
        totalDeals: enrichedTrips.filter(t => t.activeDealBatch).length,
    }
  }, [trips, enrichedTrips]);


  const handleApprove = (tripId: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip || !user) return;
    
    setTrips(currentTrips => currentTrips.map(t => 
      t.id === tripId ? { ...t, status: 'published', adminRemarks: undefined } : t
    ));
    addAuditLog({
        adminName: user.name,
        action: 'Trip Approved',
        entityType: 'Trip',
        entityId: tripId,
        entityName: trip.title,
    });
    toast({ title: "Trip Approved", description: "The trip is now live on the platform." });
  };
  
  const handleReject = (tripId: string, remarks: string) => {
     const trip = trips.find(t => t.id === tripId);
    if (!trip || !user) return;

    setTrips(currentTrips => currentTrips.map(t => 
      t.id === tripId ? { ...t, status: 'draft', adminRemarks: remarks } : t
    ));
    addAuditLog({
        adminName: user.name,
        action: 'Trip Rejected',
        entityType: 'Trip',
        entityId: tripId,
        entityName: trip.title,
        details: remarks,
    });
    toast({ variant: "destructive", title: "Trip Rejected", description: "The trip has been moved to drafts with your feedback." });
    setRejectionTarget(null);
  };
  
  const handleSuspend = (tripId: string) => {
    setTrips(currentTrips => currentTrips.map(t => 
      t.id === tripId ? { ...t, status: 'draft' } : t
    ));
     toast({ variant: "destructive", title: "Trip Suspended", description: "The trip is no longer visible to travelers." });
  };
  
   const kpiCards = [
      { title: "Total Trips", value: totalTrips, icon: Globe },
      { title: "Published Trips", value: publishedTrips, icon: CheckCircle },
      { title: "Pending Approvals", value: pendingApprovals, icon: Clock },
      { title: "Active Deals", value: totalDeals, icon: Zap },
  ];

  return (
    <Dialog onOpenChange={(open) => !open && setRejectionTarget(null)}>
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Trip Management Center</h1>
                <p className="text-muted-foreground">Oversee the platform's entire trip inventory and manage their statuses.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpiCards.map(card => (
                    <Card key={card.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <card.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Trip Listings</CardTitle>
                    <CardDescription>
                    Review, approve, or suspend trip listings from all organizers.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={currentTab} onValueChange={setCurrentTab}>
                        <div className="flex justify-between items-center mb-4 gap-4">
                            <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 md:w-fit">
                                <TabsTrigger value="pending">Pending ({pendingApprovals})</TabsTrigger>
                                <TabsTrigger value="published">Published</TabsTrigger>
                                <TabsTrigger value="deals" className="text-primary">Deals ({totalDeals})</TabsTrigger>
                                <TabsTrigger value="draft">Drafts</TabsTrigger>
                                <TabsTrigger value="all">All</TabsTrigger>
                            </TabsList>
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search by trip title..." 
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="border rounded-lg">
                            <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Trip Title</TableHead>
                                    <TableHead>Organizer</TableHead>
                                    {currentTab === 'deals' ? (
                                        <>
                                            <TableHead className="text-right">Deal Price</TableHead>
                                            <TableHead className="text-center">Slots Left</TableHead>
                                            <TableHead>Batch Dates</TableHead>
                                        </>
                                    ) : (
                                        <>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-center">Travelers</TableHead>
                                            <TableHead className="text-right">Revenue</TableHead>
                                        </>
                                    )}
                                    <TableHead className="text-center w-[160px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTrips.map((trip) => (
                                <TableRow key={trip.id}>
                                    <TableCell className="font-medium">{trip.title}</TableCell>
                                    <TableCell>{trip.organizer.name}</TableCell>
                                    
                                    {currentTab === 'deals' ? (
                                        <>
                                            <TableCell className="text-right font-semibold text-primary">
                                                ₹{trip.activeDealBatch?.dealPrice?.toLocaleString('en-IN')}
                                                <span className="ml-2 text-xs text-muted-foreground line-through">
                                                    ₹{trip.price.toLocaleString('en-IN')}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">{trip.activeDealBatch?.availableSlots}</TableCell>
                                            <TableCell>
                                                 <div className="flex items-center gap-2 text-xs">
                                                    <Calendar className="h-3 w-3"/>
                                                    {format(new Date(trip.activeDealBatch!.startDate), 'dd MMM')} - {format(new Date(trip.activeDealBatch!.endDate), 'dd MMM, yyyy')}
                                                 </div>
                                            </TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                    trip.status === "published"
                                                        ? "default"
                                                        : trip.status === "pending"
                                                        ? "secondary"
                                                        : "destructive"
                                                    }
                                                    className={trip.status === "pending" ? "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100/80" : ""}
                                                >
                                                    {trip.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">{trip.totalTravelers}</TableCell>
                                            <TableCell className="text-right">₹{trip.totalRevenue.toLocaleString('en-IN')}</TableCell>
                                        </>
                                    )}

                                    <TableCell className="flex gap-2 justify-center">
                                        {trip.status === 'pending' && (
                                        <>
                                            <Button onClick={() => handleApprove(trip.id)} variant="outline" size="sm">Approve</Button>
                                            <DialogTrigger asChild>
                                                <Button onClick={() => setRejectionTarget(trip)} variant="destructive" size="sm">Reject</Button>
                                            </DialogTrigger>
                                        </>
                                        )}
                                        {trip.status === 'published' && <Button onClick={() => handleSuspend(trip.id)} variant="destructive" size="sm">Suspend</Button>}
                                        {trip.status === 'draft' && <Button onClick={() => handleApprove(trip.id)} variant="outline" size="sm">Re-approve</Button>}
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={`/discover/${trip.slug}`} target="_blank">View</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                ))}
                                {filteredTrips.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                        No trips found for the current filter.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                            </Table>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
            {rejectionTarget && <RejectionDialog trip={rejectionTarget} onConfirm={handleReject} />}
        </div>
    </Dialog>
  );
}
