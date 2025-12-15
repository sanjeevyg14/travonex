
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Organizer, OrganizerApplication } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Download } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";

function ApplicationDetails({ application }: { application: OrganizerApplication | undefined }) {
    if (!application) {
        return <p className="text-muted-foreground">No application data found for this organizer.</p>
    }

    const DocumentLink = ({ fileName }: { fileName: string | undefined }) => {
        if (!fileName) return <span className="text-muted-foreground">Not Provided</span>;
        return (
            <a href="#" className="flex items-center gap-2 text-primary hover:underline" onClick={(e) => e.preventDefault()}>
                <Download className="h-4 w-4" />
                <span>{fileName}</span>
            </a>
        )
    }

    return (
        <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label className="text-muted-foreground">Brand/Company Name</Label>
                    <p className="font-medium">{application.companyName}</p>
                </div>
                <div>
                    <Label className="text-muted-foreground">Organizer Type</Label>
                    <p className="font-medium capitalize">{application.organizerType}</p>
                </div>
            </div>
            <div>
                <Label className="text-muted-foreground">Website/Social</Label>
                <p className="font-medium">{application.website || 'Not Provided'}</p>
            </div>
            <div>
                <h4 className="font-semibold mb-2">KYC Documents Submitted</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {application.organizerType === 'individual' ? (
                        <>
                            <li>PAN Card: <DocumentLink fileName={application.panCard} /></li>
                            <li>ID Proof: <DocumentLink fileName={application.idProof} /></li>
                            <li>Bank Statement: <DocumentLink fileName={application.bankStatement} /></li>
                        </>
                    ) : (
                        <>
                            <li>Business PAN: <DocumentLink fileName={application.businessPan} /></li>
                            <li>GST Certificate: <DocumentLink fileName={application.gstCertificate} /></li>
                            <li>Business Registration: <DocumentLink fileName={application.businessRegistration} /></li>
                            <li>Bank Statement: <DocumentLink fileName={application.bankStatement} /></li>
                        </>
                    )}
                </ul>
            </div>
            <Separator className="my-4" />
            <Button variant="outline">View Onboarding Agreement</Button>
        </div>
    )
}


export default function OrganizerSettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentOrganizer, setCurrentOrganizer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [commissionRate, setCommissionRate] = useState(10);
    const [publicBio, setPublicBio] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchData() {
            if (!user?.organizerId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const [orgResponse, settingsResponse] = await Promise.all([
                    fetch(`/api/organizers/${user.organizerId}`, { credentials: 'include' }),
                    fetch('/api/settings', { credentials: 'include' }),
                ]);

                if (orgResponse.ok) {
                    const orgData = await orgResponse.json();
                    setCurrentOrganizer(orgData.organizer);
                    setPublicBio(orgData.organizer?.bio || "");
                }

                if (settingsResponse.ok) {
                    const settingsData = await settingsResponse.json();
                    setCommissionRate(settingsData.settings?.commissionRate || 10);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast({ variant: "destructive", title: "Error", description: "Failed to load organizer data." });
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [user?.organizerId, toast]);

    const organizerAvatar = currentOrganizer?.avatar ? PlaceHolderImages.find((p) => p.id === currentOrganizer.avatar) : null;

    const handleSaveChanges = async () => {
        if (!currentOrganizer || !user?.organizerId) return;

        setSaving(true);
        try {
            const response = await fetch(`/api/organizers/${user.organizerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    bio: publicBio,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update organizer');
            }

            // Refresh organizer data
            const orgResponse = await fetch(`/api/organizers/${user.organizerId}`, {
                credentials: 'include',
            });
            if (orgResponse.ok) {
                const orgData = await orgResponse.json();
                setCurrentOrganizer(orgData.organizer);
            }

            toast({
                title: "Profile Updated",
                description: "Your public profile bio has been saved.",
            });
        } catch (error: any) {
            console.error("Failed to save changes:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to update profile. Please try again."
            });
        } finally {
            setSaving(false);
        }
    };

    const handleLogoChange = () => {
        toast({
            title: "Logo Updated",
            description: "Your new logo has been saved.",
        });
    };

    if (!currentOrganizer) {
        return (
            <div className="container py-12">
                <Card>
                    <CardHeader>
                        <CardTitle>Organizer Not Found</CardTitle>
                        <CardDescription>We couldn't load your organizer profile. Please contact support.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <input type="file" ref={fileInputRef} onChange={handleLogoChange} className="hidden" accept="image/*" />
            <div>
                <h1 className="text-3xl font-bold">Organizer Settings</h1>
                <p className="text-muted-foreground">Manage your public profile, business details, and notification preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Public Brand Profile</CardTitle>
                    <CardDescription>This information is displayed on your trip pages and your main organizer profile.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24">
                            {organizerAvatar && <AvatarImage src={organizerAvatar.imageUrl} alt={currentOrganizer.name} />}
                            <AvatarFallback className="text-3xl">{currentOrganizer.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <Button onClick={() => fileInputRef.current?.click()}>Change Logo</Button>
                            <p className="text-xs text-muted-foreground mt-2">PNG, JPG, GIF up to 5MB.</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="brandName">Brand Name</Label>
                        <Input id="brandName" value={currentOrganizer.name} disabled />
                        <p className="text-xs text-muted-foreground">Your brand name cannot be changed after approval. Please contact support for assistance.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="publicBio">Public Bio / Description</Label>
                        <Textarea id="publicBio" value={publicBio} onChange={(e) => setPublicBio(e.target.value)} rows={5} placeholder="Tell travelers what makes your trips special..." />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveChanges} disabled={saving}>
                        {saving ? "Saving..." : "Save Profile"}
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Application & Agreements</CardTitle>
                    <CardDescription>A read-only record of your submitted onboarding information. Contact support to make changes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ApplicationDetails application={currentOrganizer.application} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payout & Commission</CardTitle>
                    <CardDescription>
                        Our standard platform commission rate is currently <strong>{commissionRate}%</strong>. This is deducted from the traveler price before your payout.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Payout Information</AlertTitle>
                        <AlertDescription>
                            To update your bank details for payouts, please contact our support team at <a href="mailto:contact@travonex.com" className="font-semibold underline">contact@travonex.com</a> for security reasons.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Choose how you want to be notified about new bookings and leads.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <Label htmlFor="email-notifications" className="font-medium">New Booking Emails</Label>
                        <Switch id="email-notifications" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <Label htmlFor="whatsapp-notifications" className="font-medium">New Booking WhatsApp Alerts</Label>
                        <Switch id="whatsapp-notifications" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


