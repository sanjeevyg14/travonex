

"use client";

import { useMemo, useState, useEffect } from "react";
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
import type { Booking, Trip, Organizer } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, DollarSign, BookOpen, Banknote, ArrowUpDown, Download, MoreHorizontal, Calendar as CalendarIcon, MessageSquare, Eye, Users, Phone, Mail, CircleUser } from "lucide-react";
import { format } from 'date-fns';
import Link from "next/link";
import { useAdminAnalytics } from "@/hooks/use-admin-analytics";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

type SortableKeys = 'bookingDate' | 'totalPrice';

function ViewBookingDialog({ booking, onOpenChange }: { booking: EnrichedAdminBooking, onOpenChange: (open: boolean) => void }) {
    if (!booking) return null;
    return (
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Booking Details: {booking?.id.slice(-6).toUpperCase()}</DialogTitle>
                <DialogDescription>
                    Full traveler manifest for the trip: {booking?.tripTitle}.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2"><Users/>Traveler Manifest</h3>
                    <div className="p-4 bg-muted rounded-lg space-y-4 text-sm">
                        <p className="font-semibold text-base flex items-center gap-2"><CircleUser/>Lead Traveler</p>
                        <div className="p-3 bg-background/50 rounded-md grid grid-cols-1 gap-2">
                            <span className="font-medium">{booking.travelerName}</span>
                            <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /><span>{booking.travelerPhone}</span></div>
                        </div>
                        {booking.coTravelers && booking.coTravelers.length > 0 && (
                            <div className="space-y-3 pt-3">
                                <p className="font-semibold text-base">Co-Travelers ({booking.coTravelers.length})</p>
                                {booking.coTravelers.map((traveler, index) => (
                                    <div key={index} className="p-3 bg-background/50 rounded-md grid grid-cols-1 gap-2">
                                        <div className="font-medium flex justify-between items-center">
                                            <span>{traveler.name}</span>
                                            <Badge variant="outline">{traveler.gender}</Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /><span>{traveler.phone}</span></div>
                                        <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /><span>{traveler.email}</span></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <Separator />
                <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground">Booking & Payment Summary</h3>
                    <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between"><span>Number of Travelers:</span><span className="font-medium">{booking.numberOfTravelers}</span></div>
                        <div className="flex justify-between"><span>Booking Date:</span><span className="font-medium">{booking.bookingDate}</span></div>
                        <div className="flex justify-between items-center"><span>Payment Status:</span><Badge>{booking.paymentStatus}</Badge></div>
                        <Separator className="my-2"/>
                        <div className="flex justify-between"><span>Total Price:</span><span className="font-medium">₹{booking.totalPrice.toLocaleString('en-IN')}</span></div>
                        <div className="flex justify-between text-green-600"><span>Amount Paid:</span><span className="font-medium">₹{booking.amountPaid.toLocaleString('en-IN')}</span></div>
                        <div className="flex justify-between text-destructive"><span>Balance Due:</span><span className="font-medium">₹{booking.balanceDue.toLocaleString('en-IN')}</span></div>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
    )
}

type EnrichedAdminBooking = Booking & {
    organizerName: string;
};

export default function AdminAllBookingsPage() {
    const { toast } = useToast();
    const { stats } = useAdminAnalytics();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [organizers, setOrganizers] = useState<Record<string, Organizer>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'asc' | 'desc' }>({ key: 'bookingDate', direction: 'desc' });
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [cancellationTarget, setCancellationTarget] = useState<Booking | null>(null);
    const [cancellationRemarks, setCancellationRemarks] = useState("");
    const [viewingBooking, setViewingBooking] = useState<EnrichedAdminBooking | null>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Fetch all bookings
                const bookingsResponse = await fetch('/api/bookings', { credentials: 'include' });
                if (!bookingsResponse.ok) throw new Error('Failed to fetch bookings');
                const bookingsData = await bookingsResponse.json();
                setBookings(bookingsData.bookings || []);

                // Fetch all trips
                const tripsResponse = await fetch('/api/trips', { credentials: 'include' });
                if (!tripsResponse.ok) throw new Error('Failed to fetch trips');
                const tripsData = await tripsResponse.json();
                setTrips(tripsData.trips || []);

                // Fetch all organizers
                const organizersResponse = await fetch('/api/organizers', { credentials: 'include' });
                if (!organizersResponse.ok) throw new Error('Failed to fetch organizers');
                const organizersData = await organizersResponse.json();
                
                // Convert array to object keyed by ID
                const organizersMap: Record<string, Organizer> = {};
                (organizersData.organizers || []).forEach((org: Organizer) => {
                    organizersMap[org.id] = org;
                });
                setOrganizers(organizersMap);
            } catch (error) {
                console.error("Failed to fetch admin data:", error);
                toast({ variant: "destructive", title: "Error", description: "Failed to load data." });
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [toast]);

    const enrichedBookings = useMemo((): EnrichedAdminBooking[] => {
        if (loading) return [];
        
        return bookings.map(booking => {
            const trip = trips.find(t => t.id === booking.tripId);
            const organizer = trip ? organizers[trip.organizer?.id || ''] : null;
            return {
                ...booking,
                organizerName: organizer?.name || "N/A",
            };
        });
    }, [bookings, trips, organizers, loading]);

    const filteredBookings = useMemo(() => {
        let filtered = enrichedBookings;

        // Date Range Filter
        if (dateRange?.from) {
            filtered = filtered.filter(b => {
                const bookingDate = new Date(b.bookingDate);
                const fromDate = new Date(dateRange.from!);
                const toDate = dateRange.to ? new Date(dateRange.to) : fromDate;
                
                // Set hours to 0 to compare dates only
                bookingDate.setHours(0,0,0,0);
                fromDate.setHours(0,0,0,0);
                toDate.setHours(0,0,0,0);

                if (dateRange.to) {
                     return bookingDate >= fromDate && bookingDate <= toDate;
                }
                return bookingDate.getTime() === fromDate.getTime();
            });
        }
        
        // Search and Status Filter
        filtered = filtered.filter(booking => {
            const searchLower = searchTerm.toLowerCase();
            const displayId = `TRVNX${booking.id.slice(-6).toUpperCase()}`;

            const matchesSearch = searchTerm === "" ||
                booking.tripTitle.toLowerCase().includes(searchLower) ||
                booking.travelerName.toLowerCase().includes(searchLower) ||
                booking.organizerName.toLowerCase().includes(searchLower) ||
                displayId.toLowerCase().includes(searchLower);
            
            const matchesStatus = statusFilter === "all" || booking.paymentStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });

        // Sorting
        filtered.sort((a, b) => {
            let aValue: string | number | Date = a[sortConfig.key];
            let bValue: string | number | Date = b[sortConfig.key];

            if (sortConfig.key === 'bookingDate') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return filtered;
    }, [enrichedBookings, searchTerm, statusFilter, sortConfig, dateRange]);

    const { totalBookingValue, totalPendingValue } = useMemo(() => {
      const totalBookingValue = bookings.reduce(
        (sum, b) => sum + (b.totalPrice ?? 0),
        0
      );
      const totalPendingValue = bookings.reduce(
        (sum, b) => sum + (b.balanceDue ?? 0),
        0
      );
      return { totalBookingValue, totalPendingValue };
    }, [bookings]);
    
    const handleSort = (key: SortableKeys) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };
    
    const downloadCSV = () => {
        const headers = ["Booking ID", "Traveler Name", "Trip Title", "Organizer", "Booking Date", "Status", "Total Price", "Amount Paid", "Balance Due"];
        const rows = filteredBookings.map(b => [
            `TRVNX${b.id.slice(-6).toUpperCase()}`,
            b.travelerName,
            b.tripTitle,
            b.organizerName,
            b.bookingDate,
            b.paymentStatus,
            b.totalPrice,
            b.amountPaid,
            b.balanceDue,
        ]);
        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getBadgeVariant = (status: Booking['paymentStatus']) => {
        switch (status) {
            case 'Paid in Full': return 'default';
            case 'Reserved': return 'secondary';
            case 'Cancelled': return 'destructive';
            default: return 'outline';
        }
    };
    
    const handleCancelBooking = async () => {
        if (!cancellationTarget || !cancellationRemarks) {
             toast({
                variant: 'destructive',
                title: 'Remarks are required',
                description: 'Please provide a reason for cancelling this booking.',
            });
            return;
        }

        try {
            const response = await fetch(`/api/bookings/${cancellationTarget.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ 
                    paymentStatus: 'Cancelled',
                    cancellationReason: cancellationRemarks,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to cancel booking');
            }

            // Refresh bookings
            const refreshResponse = await fetch('/api/bookings', { credentials: 'include' });
            if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                setBookings(refreshData.bookings || []);
            }

            toast({
                title: 'Booking Cancelled',
                description: `The booking for ${cancellationTarget.travelerName} has been cancelled.`,
            });

            setCancellationTarget(null);
            setCancellationRemarks("");
        } catch (error: any) {
            console.error("Failed to cancel booking:", error);
            toast({
                variant: 'destructive',
                title: 'Cancellation Failed',
                description: error.message || 'Failed to cancel booking. Please try again.',
            });
        }
    }

    return (
        <Dialog onOpenChange={(open) => {
            if (!open) {
                setCancellationTarget(null);
                setViewingBooking(null);
            }
        }}>
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold">All Bookings</h1>
                <p className="text-muted-foreground">A complete log of all bookings across the entire platform.</p>
            </div>
             <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{bookings.length}</div>
                        <p className="text-xs text-muted-foreground">Total individual bookings made.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Booking Value (GMV)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalBookingValue)}</div>
                        <p className="text-xs text-muted-foreground">Gross Merchandise Value.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.platformCommission)}</div>
                        <p className="text-xs text-muted-foreground">Estimated gross revenue.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pending Payments</CardTitle>
                        <DollarSign className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{formatCurrency(totalPendingValue)}</div>
                        <p className="text-xs text-muted-foreground">Total balance due from reservations.</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by trip, traveler, or booking ID..." 
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Paid in Full">Paid in Full</SelectItem>
                                <SelectItem value="Reserved">Reserved</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn("w-full md:w-[300px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                    {format(dateRange.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(dateRange.from, "LLL dd, y")
                                )
                                ) : (
                                <span>Pick a date</span>
                                )}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                            />
                            </PopoverContent>
                        </Popover>
                         <Button onClick={downloadCSV} variant="outline" className="ml-auto">
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('bookingDate')}>
                                            Booking <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>Trip / Organizer</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        <Button variant="ghost" onClick={() => handleSort('totalPrice')}>
                                            Total Price <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-right">Amount Paid</TableHead>
                                    <TableHead className="text-right">Balance Due</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBookings.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell>
                                        <div className="font-medium">{booking.travelerName}</div>
                                        <div className="text-xs text-muted-foreground font-mono">
                                            TRVNX{booking.id.slice(-6).toUpperCase()}
                                        </div>
                                         <div className="text-xs text-muted-foreground">{format(new Date(booking.bookingDate), 'dd MMM yyyy')}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{booking.tripTitle}</div>
                                        <div className="text-xs text-muted-foreground">by {booking.organizerName}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getBadgeVariant(booking.paymentStatus)}>
                                            {booking.paymentStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">{formatCurrency(booking.totalPrice)}</TableCell>
                                    <TableCell className="text-right text-green-600">{formatCurrency(booking.amountPaid)}</TableCell>
                                    <TableCell className="text-right text-destructive">{formatCurrency(booking.balanceDue)}</TableCell>
                                     <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DialogTrigger asChild>
                                                     <DropdownMenuItem onSelect={() => setViewingBooking(booking)}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                                    </DropdownMenuItem>
                                                </DialogTrigger>
                                                 <DropdownMenuItem asChild><Link href={`/management/refunds?bookingId=${booking.id}`}>View Refund Status</Link></DropdownMenuItem>
                                                 <DropdownMenuSeparator />
                                                 <DropdownMenuItem onSelect={() => alert(`Manually marking ${booking.id} as paid`)}>
                                                    Mark as Paid
                                                </DropdownMenuItem>
                                                <DialogTrigger asChild>
                                                    <DropdownMenuItem className="text-destructive" onSelect={() => setCancellationTarget(booking)}>
                                                        Cancel Booking
                                                    </DropdownMenuItem>
                                                </DialogTrigger>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                ))}
                                {filteredBookings.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No bookings match your criteria.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
             {cancellationTarget && (
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Booking for {cancellationTarget.travelerName}</DialogTitle>
                        <DialogDescription>
                            This action is irreversible and will start the refund process. Provide a mandatory reason for this action.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="cancellation-remarks">Reason for Cancellation</Label>
                        <Textarea 
                            id="cancellation-remarks" 
                            placeholder="e.g., Trip cancelled due to unforeseen circumstances." 
                            value={cancellationRemarks}
                            onChange={(e) => setCancellationRemarks(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Back</Button></DialogClose>
                        <Button variant="destructive" onClick={handleCancelBooking}>Confirm Cancellation</Button>
                    </DialogFooter>
                </DialogContent>
            )}
            {viewingBooking && <ViewBookingDialog booking={viewingBooking} onOpenChange={() => setViewingBooking(null)} />}
        </div>
        </Dialog>
    );
}
