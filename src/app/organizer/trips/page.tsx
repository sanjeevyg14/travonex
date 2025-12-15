

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
import { useAuth } from "@/hooks/use-auth";
import { useApiTrips } from "@/hooks/use-api-trips";
import type { Trip, Batch, Booking } from "@/lib/types";
import { PlusCircle, ChevronDown, ChevronRight, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";


type EnrichedBatch = Batch & {
  bookingsCount: number;
  revenue: number;
};

type EnrichedTrip = Trip & {
  bookingsCount: number;
  totalRevenue: number;
  balanceDue: number;
  enrichedBatches: EnrichedBatch[];
  hasLastMinuteDeal: boolean;
};

function TripRow({ trip }: { trip: EnrichedTrip }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleEdit = (e: React.MouseEvent, slug: string) => {
        e.stopPropagation(); // Prevent the collapsible from toggling
        router.push(`/organizer/trips/edit/${slug}`);
    };

    const handleView = (e: React.MouseEvent, slug: string) => {
        e.stopPropagation(); // Prevent the collapsible from toggling
        router.push(`/discover/${slug}`);
    };

     const getStatusBadge = (status: Trip['status']) => {
        switch (status) {
            case 'published': return 'default';
            case 'pending': return 'secondary';
            case 'draft': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <Collapsible asChild key={trip.id} open={isOpen} onOpenChange={setIsOpen}>
            <tbody className="border-b">
                <CollapsibleTrigger asChild>
                    <tr className="cursor-pointer hover:bg-muted/50" data-state={isOpen ? "open" : "closed"}>
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                <span>{trip.title}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={getStatusBadge(trip.status)}>
                            {trip.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-center">{trip.bookingsCount}</TableCell>
                        <TableCell className="text-right">₹{trip.totalRevenue.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right text-destructive">₹{trip.balanceDue.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="flex gap-2 justify-center">
                            <Button variant="outline" size="sm" onClick={(e) => handleEdit(e, trip.slug)}>Edit</Button>
                            <Button variant="ghost" size="sm" onClick={(e) => handleView(e, trip.slug)}>View</Button>
                        </TableCell>
                    </tr>
                </CollapsibleTrigger>
                <CollapsibleContent asChild>
                     <tr className="bg-muted/30 hover:bg-muted/40">
                        <TableCell colSpan={6} className="p-0">
                           <div className="p-4">
                                <h4 className="font-semibold text-sm mb-2 ml-2">Batch Performance</h4>
                                {trip.enrichedBatches.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Start Date</TableHead>
                                            <TableHead>End Date</TableHead>
                                            <TableHead>Slots Filled</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Batch Revenue</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {trip.enrichedBatches.map(batch => {
                                            const slotsFilledPercentage = batch.availableSlots > 0 ? (batch.bookingsCount / batch.availableSlots) * 100 : 0;
                                            return (
                                                <TableRow key={batch.id} className={batch.isLastMinuteDeal ? "bg-primary/10" : ""}>
                                                    <TableCell>{format(new Date(batch.startDate), 'dd MMM yyyy')}</TableCell>
                                                    <TableCell>{format(new Date(batch.endDate), 'dd MMM yyyy')}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Progress value={slotsFilledPercentage} className="h-2 w-20" />
                                                            <span className="text-xs text-muted-foreground">{batch.bookingsCount}/{batch.availableSlots}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant={batch.status === 'Active' ? 'secondary' : 'outline'}>{batch.status}</Badge>
                                                            {batch.isLastMinuteDeal && <Badge variant="destructive" className="gap-1"><Zap className="h-3 w-3" />DEAL</Badge>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">₹{batch.revenue.toLocaleString('en-IN')}</TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center p-4">This trip has no batches defined yet.</p>
                                )}
                            </div>
                        </TableCell>
                    </tr>
                </CollapsibleContent>
            </tbody>
        </Collapsible>
    )
}


export default function OrganizerTripsPage() {
  const { user } = useAuth();
  const { trips, loading: tripsLoading, fetchTrips } = useApiTrips({ 
    organizerId: user?.organizerId,
    autoFetch: !!user?.organizerId 
  });
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("all");

  // Fetch bookings for this organizer
  useEffect(() => {
    async function fetchBookings() {
      if (!user?.organizerId) {
        setBookingsLoading(false);
        return;
      }

      setBookingsLoading(true);
      try {
        const response = await fetch(`/api/bookings?organizerId=${user.organizerId}`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch bookings');
        const data = await response.json();
        setBookings(data.bookings || []);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setBookingsLoading(false);
      }
    }

    fetchBookings();
  }, [user?.organizerId]);

  const enrichedOrganizerTrips = useMemo(() => {
    if (!user || user.role !== 'organizer' || !user.organizerId || tripsLoading || bookingsLoading) return [];

    return trips.map(trip => {
      const tripBookings = bookings.filter(b => b.tripId === trip.id);
      const totalBookingsCount = tripBookings.reduce((sum, b) => sum + b.numberOfTravelers, 0);
      const totalRevenue = tripBookings.reduce((acc, b) => acc + (b.amountPaid || 0), 0);
      const balanceDue = tripBookings.reduce((acc, b) => acc + (b.balanceDue || 0), 0);
      
      const enrichedBatches: EnrichedBatch[] = (trip.batches || []).map(batch => {
          const batchBookings = tripBookings.filter(b => b.batchId === batch.id);
          const batchBookingsCount = batchBookings.reduce((sum, b) => sum + b.numberOfTravelers, 0);
          const batchRevenue = batchBookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
          return {
            ...batch,
            bookingsCount: batchBookingsCount,
            revenue: batchRevenue
          }
      });
      
      const hasLastMinuteDeal = enrichedBatches.some(b => b.isLastMinuteDeal);

      return {
        ...trip,
        bookingsCount: totalBookingsCount,
        totalRevenue,
        balanceDue,
        enrichedBatches,
        hasLastMinuteDeal,
      };
    });
  }, [trips, bookings, user, tripsLoading, bookingsLoading]);

  const filteredTrips = useMemo(() => {
    if (currentTab === 'all') return enrichedOrganizerTrips;
    if (currentTab === 'deals') return enrichedOrganizerTrips.filter(trip => trip.hasLastMinuteDeal);
    return enrichedOrganizerTrips.filter(trip => trip.status === currentTab);
  }, [enrichedOrganizerTrips, currentTab]);


  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
            <CardTitle>My Trips</CardTitle>
            <CardDescription>
            A list of all trips you have created on Travonex, with their financial performance.
            </CardDescription>
        </div>
        <Button asChild className="mt-4 md:mt-0">
            <Link href="/organizer/trips/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Trip
            </Link>
        </Button>
      </CardHeader>
      <CardContent>
         <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-5 md:w-fit mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="deals" className="text-destructive">Deals</TabsTrigger>
          </TabsList>
          
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trip Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Travelers</TableHead>
                  <TableHead className="text-right">Total Revenue</TableHead>
                  <TableHead className="text-right">Balance Due</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
                {filteredTrips.length > 0 ? (
                  filteredTrips.map((trip) => (
                    <TripRow key={trip.id} trip={trip} />
                  ))
                ) : (
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No trips found for the "{currentTab}" filter.
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
            </Table>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
