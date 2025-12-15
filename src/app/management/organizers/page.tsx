

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { Organizer, OrganizerApplication } from "@/lib/types";
import { Download, Search, UserCheck, UserCog, Briefcase, MoreHorizontal, Percent, FileX, Send, Activity, Eye, Loader2 } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { organizerService } from "@/services/organizer-service";

function ApplicationDetails({ application }: { application: OrganizerApplication | undefined }) {
    if (!application) {
        return <p className="text-muted-foreground py-4">No application data found for this organizer.</p>
    }

    const DocumentLink = ({ fileName }: { fileName: string | undefined }) => {
        if (!fileName) return <span className="text-muted-foreground">Not Provided</span>;

        // Check if it is a URL (starts with http) or just a name
        const isUrl = fileName.startsWith('http');

        return (
            <a
                href={isUrl ? fileName : "#"}
                target={isUrl ? "_blank" : "_self"}
                className="flex items-center gap-2 text-primary hover:underline"
                onClick={(e) => !isUrl && e.preventDefault()}
            >
                <Download className="h-4 w-4" />
                <span>{isUrl ? "View Document" : fileName}</span>
            </a>
        )
    }

    const DetailItem = ({ label, value }: { label: string, value?: string | null }) => {
        if (!value) return null;
        return (
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium">{value}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 text-sm">
            <Card>
                <CardHeader><CardTitle className="text-base">Business & Contact Information</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem label="Brand/Company Name" value={application.companyName} />
                    <DetailItem label="Partner Type" value={application.partnerType} />
                    <DetailItem label="Organizer Type" value={application.organizerType} />
                    <DetailItem label="Website/Social" value={application.website} />
                    <DetailItem label="Contact Name" value={application.contactName} />
                    <DetailItem label="Contact Email" value={application.contactEmail} />
                    <DetailItem label="Contact Phone" value={application.contactPhone} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-base">Bank Details for Payout</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem label="Account Holder Name" value={application.bankAccountName} />
                    <DetailItem label="Account Number" value={application.bankAccountNumber} />
                    <DetailItem label="IFSC Code" value={application.bankIfscCode} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-base">KYC Documents</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between items-center"><span className="text-muted-foreground">Bank Statement:</span> <DocumentLink fileName={application.bankStatement} /></div>
                    {application.organizerType === 'individual' ? (
                        <>
                            <div className="flex justify-between items-center"><span className="text-muted-foreground">PAN Card:</span> <DocumentLink fileName={application.panCard} /></div>
                            <div className="flex justify-between items-center"><span className="text-muted-foreground">ID Proof (Aadhaar/Passport):</span> <DocumentLink fileName={application.idProof} /></div>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-between items-center"><span className="text-muted-foreground">Business PAN:</span> <DocumentLink fileName={application.businessPan} /></div>
                            <div className="flex justify-between items-center"><span className="text-muted-foreground">GST Certificate:</span> <DocumentLink fileName={application.gstCertificate} /></div>
                            <div className="flex justify-between items-center"><span className="text-muted-foreground">Company Registration:</span> <DocumentLink fileName={application.businessRegistration} /></div>
                        </>
                    )}
                    {application.partnerType === 'experience' && (
                        <>
                            <div className="flex justify-between items-center mt-4 pt-4 border-t"><span className="text-muted-foreground">Activity Licenses:</span> <DocumentLink fileName={application.activityLicenses} /></div>
                            <div className="flex justify-between items-center"><span className="text-muted-foreground">Equipment Certificates:</span> <DocumentLink fileName={application.equipmentCertificates} /></div>
                            <div className="flex justify-between items-center"><span className="text-muted-foreground">Insurance Documents:</span> <DocumentLink fileName={application.insuranceDocs} /></div>
                            <div className="flex justify-between items-center"><span className="text-muted-foreground">Staff Certifications:</span> <DocumentLink fileName={application.staffCerts} /></div>
                        </>
                    )}
                </CardContent>
            </Card>

            <div className="pt-2">
                <h4 className="font-semibold mb-2">Agreements</h4>
                <Button variant="outline">View Signed Onboarding Agreement</Button>
            </div>
        </div>
    )
}

function RejectionDialog({
    organizer,
    onConfirm,
}: {
    organizer: Organizer;
    onConfirm: (organizerId: string, remarks: string) => void;
}) {
    const [remarks, setRemarks] = useState('');
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Reject Agreement for: {organizer.name}</DialogTitle>
                <DialogDescription>
                    Provide a reason for rejection. This will be sent to the organizer.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Label htmlFor="rejection-remarks">Rejection Reason</Label>
                <Textarea
                    id="rejection-remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g., The signature on the agreement is missing or does not match."
                />
            </div>
            <DialogFooter>
                <Button variant="outline" asChild>
                    <DialogTrigger>Cancel</DialogTrigger>
                </Button>
                <Button
                    variant="destructive"
                    onClick={() => onConfirm(organizer.id, remarks)}
                    disabled={!remarks.trim()}
                    asChild
                >
                    <DialogTrigger>Confirm Rejection</DialogTrigger>
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}

function CommissionDialog({
    organizer,
    globalCommissionRate,
    onConfirm,
}: {
    organizer: Organizer;
    globalCommissionRate: number;
    onConfirm: (organizerId: string, rate: number | undefined) => void;
}) {
    const [rate, setRate] = useState(organizer.commissionRate?.toString() || "");

    const handleSave = () => {
        const rateValue = rate.trim() === "" ? undefined : Number(rate);
        onConfirm(organizer.id, rateValue);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Set Custom Commission for {organizer.name}</DialogTitle>
                <DialogDescription>
                    Override the global platform rate of {globalCommissionRate}%. Leave the field blank to revert to the global rate.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Label htmlFor="commission-rate">Custom Commission Rate (%)</Label>
                <Input
                    id="commission-rate"
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    placeholder={`Global Rate: ${globalCommissionRate}%`}
                />
            </div>
            <DialogFooter>
                <Button variant="outline" asChild>
                    <DialogTrigger>Cancel</DialogTrigger>
                </Button>
                <Button onClick={handleSave} asChild>
                    <DialogTrigger>Save Rate</DialogTrigger>
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}


export default function AdminOrganizersPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [commissionRate, setCommissionRate] = useState(10);
    const { user } = useAuth();
    const { toast } = useToast();

    const [organizers, setOrganizers] = useState<Organizer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState<'all' | 'trip' | 'experience'>("all");
    const [dialogAction, setDialogAction] = useState<'reject' | 'commission' | 'view' | null>(null);
    const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(null);

    async function fetchOrganizers() {
        setIsLoading(true);
        try {
            const data = await organizerService.getOrganizers();
            setOrganizers(data);
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "Failed to load organizers." });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchOrganizers();
    }, []);

    // Fetch trips, experiences, bookings, and settings
    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch trips
                const tripsResponse = await fetch('/api/trips', { credentials: 'include' });
                if (tripsResponse.ok) {
                    const tripsData = await tripsResponse.json();
                    setTrips(tripsData.trips || []);
                }

                // Fetch experiences
                const experiencesResponse = await fetch('/api/experiences', { credentials: 'include' });
                if (experiencesResponse.ok) {
                    const experiencesData = await experiencesResponse.json();
                    setExperiences(experiencesData.experiences || []);
                }

                // Fetch bookings
                const bookingsResponse = await fetch('/api/bookings', { credentials: 'include' });
                if (bookingsResponse.ok) {
                    const bookingsData = await bookingsResponse.json();
                    setBookings(bookingsData.bookings || []);
                }

                // Fetch settings for commission rate
                const settingsResponse = await fetch('/api/settings', { credentials: 'include' });
                if (settingsResponse.ok) {
                    const settingsData = await settingsResponse.json();
                    setCommissionRate(settingsData.settings?.commissionRate || 10);
                }
            } catch (error) {
                console.error("Failed to fetch admin data:", error);
            }
        }

        fetchData();
    }, []);


    const enrichedOrganizers = useMemo(() => {
        return organizers.map(organizer => {
            if (organizer.partnerType === 'experience') {
                const vendorExperiences = experiences.filter(e => e.vendor.id === organizer.id);
                return { ...organizer, listingsCount: vendorExperiences.length, totalRevenue: 0 };
            }
            // Logic for trip organizers
            const organizerTrips = trips.filter(t => t.organizer.id === organizer.id);
            const tripIds = organizerTrips.map(t => t.id);
            const organizerBookings = bookings.filter(b => tripIds.includes(b.tripId));
            const totalRevenue = organizerBookings.reduce((sum, b) => sum + b.totalPrice, 0);

            return { ...organizer, listingsCount: organizerTrips.length, totalRevenue };
        });
    }, [organizers, trips, experiences, bookings]);

    const filteredOrganizers = useMemo(() => {
        return enrichedOrganizers.filter(organizer => {
            const matchesSearch = searchTerm === "" || organizer.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "all" || organizer.status === statusFilter;
            const matchesType = typeFilter === "all" || organizer.partnerType === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [enrichedOrganizers, searchTerm, statusFilter, typeFilter]);

    const { totalOrganizerCount, pendingApplications } = useMemo(() => {
        return {
            totalOrganizerCount: organizers.filter(o => o.status === 'approved').length,
            pendingApplications: organizers.filter(o => o.status === 'pending').length,
        };
    }, [organizers]);

    const handleStatusChange = async (organizerId: string, status: Organizer['status'], remarks?: string) => {
        if (!user) return;

        try {
            await organizerService.updateOrganizerStatus(organizerId, status, remarks);

            // Optimistic update or refetch
            fetchOrganizers();

            let action: any = 'Organizer Approved';
            let toastTitle = "Organizer Activated";
            let toastDescription = `Profile is now live.`;

            if (status === 'rejected') {
                action = 'Organizer Rejected';
                toastTitle = "Application Rejected";
                toastDescription = `Application has been rejected.`;
            } else if (status === 'agreement_sent') {
                action = 'Organizer Agreement Sent';
                toastTitle = "Agreement Sent";
                toastDescription = `An agreement has been sent.`;
            } else if (status === 'agreement_review' && remarks) {
                action = 'Organizer Agreement Rejected';
                toastTitle = "Agreement Rejected";
                toastDescription = `Feedback has been sent.`;
            }

            addAuditLog({
                adminName: user.name,
                action: action,
                entityType: 'Organizer',
                entityId: organizerId,
                entityName: "Organizer",
                details: remarks,
            });

            toast({ title: toastTitle, description: toastDescription });
        } catch (e) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update status." });
        }
    };

    const handleCommissionUpdate = async (organizerId: string, rate: number | undefined) => {
        if (rate === undefined) return; // Resetting to global not fully impl in service yet
        try {
            await organizerService.updateCommissionRate(organizerId, rate);
            fetchOrganizers();
            toast({ title: "Commission Updated", description: "The commission rate has been updated." });
        } catch (e) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update commission." });
        }
    }

    const getBadgeVariant = (status: Organizer['status']) => {
        switch (status) {
            case 'approved': return 'default';
            case 'pending': return 'secondary';
            case 'agreement_sent': return 'outline';
            case 'agreement_review': return 'default';
            case 'rejected': return 'destructive';
            default: return 'secondary';
        }
    }

    const kpiCards = [
        { title: "Total Approved Partners", value: totalOrganizerCount, icon: UserCheck },
        { title: "Pending Applications", value: pendingApplications, icon: UserCog },
    ];

    if (isLoading) {
        return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <Dialog onOpenChange={(open) => !open && setSelectedOrganizer(null)}>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Partner Management</h1>
                    <p className="text-muted-foreground">Onboard, verify, and manage all partners on the platform.</p>
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
                        <CardTitle>Partner Directory</CardTitle>
                        <div className="flex flex-wrap items-center gap-4 pt-4">
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by partner name..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Partner Types</SelectItem>
                                    <SelectItem value="trip">Trip Organizers</SelectItem>
                                    <SelectItem value="experience">Experience Vendors</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="agreement_sent">Agreement Sent</SelectItem>
                                    <SelectItem value="agreement_review">Agreement Review</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Partner</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-center">Listings</TableHead>
                                    <TableHead>Commission</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrganizers.map((organizer) => {
                                    const organizerAvatar = PlaceHolderImages.find((p) => p.id === organizer.avatar);
                                    return (
                                        <TableRow key={organizer.id}>
                                            <TableCell className="font-medium flex items-center gap-3">
                                                <Avatar>
                                                    {organizerAvatar && <AvatarImage src={organizerAvatar.imageUrl} />}
                                                    <AvatarFallback>{organizer.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                {organizer.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize flex items-center gap-1 w-fit">
                                                    {organizer.partnerType === 'trip' ? <Briefcase className="h-3 w-3" /> : <Activity className="h-3 w-3" />}
                                                    {organizer.partnerType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">{organizer.listingsCount}</TableCell>
                                            <TableCell>
                                                {organizer.commissionRate !== undefined
                                                    ? <Badge variant="outline">{organizer.commissionRate}%</Badge>
                                                    : <span className="text-xs text-muted-foreground">{commissionRate}% (Global)</span>
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getBadgeVariant(organizer.status)} className="capitalize">
                                                    {organizer.status?.replace(/_/g, ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center gap-2">
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" onClick={() => { setSelectedOrganizer(organizer); setDialogAction('view'); }}>
                                                            View Application
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/organizer/${organizer.id}`} target="_blank">
                                                                    <Eye className="mr-2" />
                                                                    View Public Profile
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            {organizer.status === 'pending' && (
                                                                <DropdownMenuItem onClick={() => handleStatusChange(organizer.id, 'agreement_sent')}>
                                                                    <Send className="mr-2" />
                                                                    Send Agreement
                                                                </DropdownMenuItem>
                                                            )}
                                                            {organizer.status === 'agreement_review' && (
                                                                <DropdownMenuItem onClick={() => handleStatusChange(organizer.id, 'approved')}>
                                                                    <UserCheck className="mr-2" />
                                                                    Activate Partner
                                                                </DropdownMenuItem>
                                                            )}
                                                            {organizer.status === 'approved' && (
                                                                <DialogTrigger asChild>
                                                                    <DropdownMenuItem onSelect={() => { setSelectedOrganizer(organizer); setDialogAction('commission'); }}>
                                                                        <Percent className="mr-2" />Set Commission
                                                                    </DropdownMenuItem>
                                                                </DialogTrigger>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            {organizer.status === 'agreement_review' && (
                                                                <DialogTrigger asChild>
                                                                    <DropdownMenuItem onSelect={() => { setSelectedOrganizer(organizer); setDialogAction('reject'); }} className="text-destructive">
                                                                        <FileX className="mr-2" />
                                                                        Reject Agreement
                                                                    </DropdownMenuItem>
                                                                </DialogTrigger>
                                                            )}
                                                            {organizer.status === 'approved' && (
                                                                <DropdownMenuItem className="text-destructive">Suspend Partner</DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                                {filteredOrganizers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No partners match your criteria.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                {selectedOrganizer && dialogAction === 'reject' && (
                    <RejectionDialog
                        organizer={selectedOrganizer}
                        onConfirm={(id, remarks) => handleStatusChange(id, 'agreement_sent', remarks)}
                    />
                )}
                {selectedOrganizer && dialogAction === 'commission' && (
                    <CommissionDialog
                        organizer={selectedOrganizer}
                        globalCommissionRate={commissionRate}
                        onConfirm={(id, rate) => handleCommissionUpdate(id, rate)}
                    />
                )}
                {selectedOrganizer && dialogAction === 'view' && (
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Partner File: {selectedOrganizer.name}</DialogTitle>
                            <DialogDescription>
                                Application details, KYC documents, and signed agreements for this partner.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[80vh] overflow-y-auto p-1">
                            <ApplicationDetails application={selectedOrganizer.application} />
                        </div>
                    </DialogContent>
                )}
            </div>
        </Dialog>
    );
}
