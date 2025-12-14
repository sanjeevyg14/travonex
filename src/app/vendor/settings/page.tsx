
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
import { useMockData } from "@/hooks/use-mock-data";
import type { OrganizerApplication } from "@/lib/types";
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
       <Separator className="my-4"/>
       <div>
            <h4 className="font-semibold mb-2">Safety & Compliance Documents</h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Activity Licenses: <DocumentLink fileName={application.activityLicenses} /></li>
                <li>Equipment Certificates: <DocumentLink fileName={application.equipmentCertificates} /></li>
                <li>Insurance Documents: <DocumentLink fileName={application.insuranceDocs} /></li>
                <li>Staff Certifications: <DocumentLink fileName={application.staffCerts} /></li>
            </ul>
       </div>
       <Separator className="my-4"/>
        <Button variant="outline">View Onboarding Agreement</Button>
    </div>
  )
}


export default function VendorSettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { commissionRate, organizers, setOrganizers } = useMockData();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentOrganizer = useMemo(() => {
        if (!user || !user.organizerId) return null;
        return organizers[user.organizerId] || null;
    }, [user, organizers]);
    
    // State is now only for fields that can be edited.
    const [publicBio, setPublicBio] = useState("");
    
    // Use useEffect to set initial state once the currentOrganizer is loaded.
    useEffect(() => {
        if (currentOrganizer) {
            setPublicBio(currentOrganizer.bio || "");
        }
    }, [currentOrganizer]);


    const organizerAvatar = PlaceHolderImages.find((p) => p.id === currentOrganizer?.avatar);

    const handleSaveChanges = () => {
        if (!currentOrganizer) return;
        setOrganizers(prev => ({
            ...prev,
            [currentOrganizer.id]: {
                ...currentOrganizer,
                bio: publicBio, // Only update the bio
            }
        }));
        toast({
            title: "Profile Updated",
            description: "Your public profile bio has been saved.",
        });
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
                <h1 className="text-3xl font-bold">Vendor Settings</h1>
                <p className="text-muted-foreground">Manage your public profile, business details, and notification preferences.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Public Brand Profile</CardTitle>
                    <CardDescription>This information is displayed on your experience pages.</CardDescription>
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
                        <Textarea id="publicBio" value={publicBio} onChange={(e) => setPublicBio(e.target.value)} rows={5} placeholder="Tell travelers what makes your experiences special..." />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveChanges}>Save Profile</Button>
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
                    <CardDescription>Choose how you want to be notified about new bookings.</CardDescription>
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
