
"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMockData } from "@/hooks/use-mock-data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Handshake, HelpCircle, Lock, Package, ShoppingCart, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import Link from "next/link";

export default function OrganizerLeadsPage() {
    const { user } = useAuth();
    const { leads, setLeads, organizers, setOrganizers } = useMockData();
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

    const organizer = useMemo(() => {
        if (!user || user.role !== 'organizer') return null;
        // This logic matches the user's name to the organizer ID in the prototype
        const organizerId = Object.values(organizers).find(o => o.name === user.name)?.id;
        return organizerId ? organizers[organizerId] : null;
    }, [user, organizers]);

    const organizerLeads = useMemo(() => {
        if (!organizer) return [];
        return leads
            .filter(lead => lead.organizerId === organizer.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [leads, organizer]);

    const handleUnlockLead = () => {
        if (!selectedLeadId || !organizer) return;
        
        // 1. Decrement credits
        setOrganizers(prev => ({
            ...prev,
            [organizer.id]: {
                ...organizer,
                leadCredits: (organizer.leadCredits || 0) - 1,
            }
        }));

        // 2. Update lead status
        setLeads(prev => prev.map(lead => 
            lead.id === selectedLeadId ? { ...lead, status: 'unlocked' } : lead
        ));
        
        setSelectedLeadId(null);
    };

    const getStatusBadge = (status: 'new' | 'unlocked' | 'converted' | 'archived') => {
        switch (status) {
            case 'new': return <Badge variant="secondary">New</Badge>;
            case 'unlocked': return <Badge variant="outline">Unlocked</Badge>;
            case 'converted': return <Badge variant="default">Converted</Badge>;
            case 'archived': return <Badge variant="destructive">Archived</Badge>;
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">Manage Leads</h1>
                    <p className="text-muted-foreground">Connect with travelers who have shown interest in your trips.</p>
                </div>
                 <Card className="p-4 bg-card w-fit">
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Available Lead Credits</p>
                            <p className="text-2xl font-bold">{organizer?.leadCredits || 0}</p>
                        </div>
                        <Button asChild>
                            <Link href="/organizer/credits">
                                <ShoppingCart className="mr-2"/> Buy More Credits
                            </Link>
                        </Button>
                    </div>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Incoming Leads</CardTitle>
                    <CardDescription>
                        Unlock a lead to view the traveler's contact details. One credit will be used.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {organizerLeads.length > 0 ? (
                         <div className="space-y-4">
                            {organizerLeads.map(lead => (
                                <Card key={lead.id} className="flex flex-col md:flex-row">
                                    <CardHeader className="flex-1">
                                        <CardTitle className="text-lg">{lead.tripTitle}</CardTitle>
                                        <CardDescription>Inquiry received on {new Date(lead.date).toLocaleDateString()}</CardDescription>
                                        <div className="p-4 bg-muted rounded-lg mt-2">
                                            <p className="text-sm text-foreground font-medium italic">"{lead.message}"</p>
                                        </div>
                                    </CardHeader>
                                    <Separator orientation="vertical" className="hidden md:block mx-4 h-auto"/>
                                    <Separator className="block md:hidden"/>
                                    <CardFooter className="p-6 w-full md:w-64 flex flex-col items-center justify-center bg-muted/50">
                                        {getStatusBadge(lead.status)}
                                        {lead.status === 'new' && (
                                            <div className="text-center mt-4">
                                                 <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button onClick={() => setSelectedLeadId(lead.id)}>
                                                            <Lock className="mr-2" />
                                                            Unlock Contact
                                                        </Button>
                                                    </DialogTrigger>
                                                    {organizer && organizer.leadCredits && organizer.leadCredits > 0 ? (
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Unlock this Lead?</DialogTitle>
                                                                <DialogDescription>
                                                                    This will use 1 lead credit. Your remaining balance will be {organizer.leadCredits - 1}.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter>
                                                                <Button variant="outline" onClick={() => setSelectedLeadId(null)}>Cancel</Button>
                                                                <Button onClick={handleUnlockLead}>Confirm & View Lead</Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    ) : (
                                                         <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Out of Lead Credits</DialogTitle>
                                                                <DialogDescription>
                                                                    You need to purchase a lead package to view this traveler's contact information.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter>
                                                                <Button variant="outline" onClick={() => setSelectedLeadId(null)}>Cancel</Button>
                                                                <Button asChild>
                                                                    <Link href="/organizer/credits">
                                                                        <ShoppingCart className="mr-2"/> Purchase Credits
                                                                    </Link>
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    )}
                                                </Dialog>
                                            </div>
                                        )}
                                        {lead.status === 'unlocked' && (
                                            <div className="text-center mt-4 space-y-2">
                                                <p className="font-semibold">{lead.travelerName}</p>
                                                <Button asChild variant="outline" size="sm">
                                                    <a href={`https://wa.me/${lead.travelerPhone.replace('+', '')}`} target="_blank" rel="noopener noreferrer">
                                                        <WhatsAppIcon className="mr-2 h-5 w-5"/>
                                                        {lead.travelerPhone}
                                                    </a>
                                                </Button>
                                            </div>
                                        )}
                                         {lead.status === 'converted' && (
                                            <div className="text-center mt-4 space-y-2">
                                                <p className="font-semibold text-green-600">Booked!</p>
                                                <p className="text-sm text-muted-foreground">1 credit was returned.</p>
                                            </div>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                         </div>
                    ) : (
                        <div className="text-center py-12">
                            <Handshake className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mt-4">No leads yet.</h3>
                            <p className="text-muted-foreground mt-2">When a traveler asks a question about one of your trips, it will appear here as a new lead.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
