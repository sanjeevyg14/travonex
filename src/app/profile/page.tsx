

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMockData } from "@/hooks/use-mock-data";
import { MultiSelect } from "@/components/ui/multi-select";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Crown, History, Wallet } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { User, Subscription } from "@/lib/types";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ProfilePage() {
    const { user, updateUser, loading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { travelCities, travelInterests } = useMockData();

    // Personal Info
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [dob, setDob] = useState<Date | undefined>();
    const [gender, setGender] = useState<string>("");
    const [homeCity, setHomeCity] = useState("");

    // Preferences
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([]);
    const [additionalNotes, setAdditionalNotes] = useState("");
    
    // Emergency & ID
    const [emergencyContactName, setEmergencyContactName] = useState("");
    const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
    const [govIdType, setGovIdType] = useState<string>("");
    const [govIdNumber, setGovIdNumber] = useState("");

    
    const cityOptions = useMemo(() => travelCities.map(c => ({ value: c, label: c })), [travelCities]);
    const interestOptions = useMemo(() => travelInterests.map(i => ({ value: i, label: i })), [travelInterests]);
    const dietaryOptions = useMemo(() => ["Vegetarian", "Vegan", "Jain", "No Beef", "No Pork"].map(d => ({ value: d, label: d })), []);
    
    const userAvatar = useMemo(() => PlaceHolderImages.find(p => p.id === "user1"), []);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user) {
            setName(user.name);
            setEmail(user.email || '');
            if (user.dateOfBirth) setDob(new Date(user.dateOfBirth));
            setGender(user.gender || "");
            setHomeCity(user.homeCity || "");
            setSelectedCities(user.preferredCities || []);
            setSelectedInterests(user.travelInterests || []);
            setDietaryPrefs(user.dietaryPreferences || []);
            setAdditionalNotes(user.additionalNotes || "");
            setEmergencyContactName(user.emergencyContact?.name || "");
            setEmergencyContactPhone(user.emergencyContact?.phone || "");
            setGovIdType(user.governmentId?.type || "");
            setGovIdNumber(user.governmentId?.number || "");
        }
    }, [user, loading, router]);


    const handleSaveChanges = async () => {
        if (!user) return;
        
        const updatedUserData = {
            name,
            email,
            dateOfBirth: dob ? format(dob, 'yyyy-MM-dd') : undefined,
            gender: gender as User['gender'],
            homeCity,
            preferredCities: selectedCities,
            travelInterests: selectedInterests,
            dietaryPreferences: dietaryPrefs,
            additionalNotes,
            emergencyContact: (emergencyContactName && emergencyContactPhone) ? { name: emergencyContactName, phone: emergencyContactPhone } : undefined,
            governmentId: (govIdType && govIdNumber) ? { type: govIdType as any, number: govIdNumber } : undefined,
        };
        
        try {
            const response = await fetch(`/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(updatedUserData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }

            const data = await response.json();
            updateUser(data.user); // Update local state
            
            toast({
                title: "Profile Updated",
                description: "Your changes have been saved successfully.",
            });
        } catch (error: any) {
            console.error("Profile update error:", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: error.message || "Failed to update profile. Please try again.",
            });
        }
    };
    
    if (loading || !user) {
        return <div className="container py-12 text-center">Loading...</div>;
    }

    const currentSubscription = user.subscriptionHistory?.find(s => s.status === 'active');

    return (
        <div className="container py-12 space-y-8 max-w-4xl mx-auto">
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
            <div>
                <h1 className="text-3xl font-bold">Profile & Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and travel preferences.</p>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your photo and personal details here.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24">
                           {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" />}
                           <AvatarFallback className="text-3xl">{name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <Button onClick={() => fileInputRef.current?.click()}>Change Photo</Button>
                            <p className="text-xs text-muted-foreground mt-2">JPG, PNG, or GIF. 5MB max.</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Date of Birth</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !dob && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dob ? format(dob, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={dob} onSelect={setDob} captionLayout="dropdown-buttons" fromYear={1950} toYear={2010} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="gender">Gender</Label>
                            <Select value={gender} onValueChange={setGender}>
                                <SelectTrigger><SelectValue placeholder="Select your gender" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="homeCity">Home City</Label>
                        <Input id="homeCity" value={homeCity} onChange={(e) => setHomeCity(e.target.value)} placeholder="e.g., Bangalore"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number (Cannot be changed)</Label>
                        <Input id="phone" type="tel" value={user.phone} disabled />
                    </div>
                </CardContent>
            </Card>

             <Card id="subscription-billing">
                <CardHeader>
                    <CardTitle>Subscription & Wallet</CardTitle>
                    <CardDescription>Manage your Travonex Pro subscription and wallet balance.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                            <p className="text-sm font-medium">Your Current Plan</p>
                            {user.subscriptionTier === 'pro' ? (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                                <p className="text-lg font-bold flex items-center gap-2">Travonex Pro <Crown className="h-5 w-5 text-yellow-500 fill-yellow-500" /></p>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>You have unlimited access to all Pro features.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ) : (
                                <p className="text-lg font-bold">Free Tier</p>
                            )}
                            {currentSubscription && (
                                <p className="text-xs text-muted-foreground">
                                    Member since {format(new Date(currentSubscription.startDate), 'dd MMM, yyyy')}. Renews on {format(new Date(currentSubscription.endDate), 'dd MMM, yyyy')}.
                                </p>
                            )}
                        </div>
                         <div className="p-4 border rounded-lg">
                            <p className="text-sm font-medium flex items-center gap-2"><Wallet className="h-4 w-4"/> Wallet Balance</p>
                            <p className="text-lg font-bold">₹{(user.walletBalance || 0).toLocaleString('en-IN')}</p>
                            
                            <Link href="/dashboard/wallet" className="text-xs text-primary underline font-semibold">
                                View History
                            </Link>
                        </div>
                    </div>
                     {user.subscriptionTier !== 'pro' && (
                        <Button asChild>
                            <Link href="/pro">Upgrade to Pro</Link>
                        </Button>
                    )}

                    <div>
                        <h3 className="text-base font-semibold flex items-center gap-2 mt-6 mb-2"><History className="h-4 w-4"/> Billing History</h3>
                        {user.subscriptionHistory && user.subscriptionHistory.length > 0 ? (
                            <div className="space-y-2">
                                {user.subscriptionHistory.map(sub => (
                                    <div key={sub.id} className="flex justify-between items-center text-sm p-3 bg-muted/50 rounded-md">
                                        <div>
                                            <p className="font-medium">{sub.planName}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(sub.startDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="font-mono text-xs">₹{sub.pricePaid.toLocaleString('en-IN')}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No billing history found.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Safety & Emergency</CardTitle>
                    <CardDescription>This information is confidential and will only be used in case of an emergency during a trip.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <Label htmlFor="emergencyName">Emergency Contact Name</Label>
                            <Input id="emergencyName" value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                            <Input id="emergencyPhone" type="tel" value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)} />
                        </div>
                    </div>
                     <div className="grid md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <Label htmlFor="govIdType">Government ID Type (Optional)</Label>
                             <Select value={govIdType} onValueChange={setGovIdType}>
                                <SelectTrigger><SelectValue placeholder="Select ID Type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Aadhaar">Aadhaar</SelectItem>
                                    <SelectItem value="Passport">Passport</SelectItem>
                                    <SelectItem value="Driving License">Driving License</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="govIdNumber">Government ID Number (Optional)</Label>
                            <Input id="govIdNumber" value={govIdNumber} onChange={(e) => setGovIdNumber(e.target.value)} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>Travel Preferences</CardTitle>
                    <CardDescription>This helps us recommend trips you'll love.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="space-y-2">
                        <Label htmlFor="cities">Preferred Cities</Label>
                        <MultiSelect 
                            options={cityOptions}
                            selected={selectedCities}
                            onChange={setSelectedCities}
                            placeholder="Select cities you're interested in..."
                            className="w-full"
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="interests">Travel Interests</Label>
                        <MultiSelect 
                            options={interestOptions}
                            selected={selectedInterests}
                            onChange={setSelectedInterests}
                            placeholder="Select activities you enjoy..."
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dietary">Dietary Preferences</Label>
                        <MultiSelect 
                            options={dietaryOptions}
                            selected={dietaryPrefs}
                            onChange={setDietaryPrefs}
                            placeholder="e.g., Vegetarian, Vegan..."
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea 
                            id="notes"
                            value={additionalNotes}
                            onChange={(e) => setAdditionalNotes(e.target.value)}
                            placeholder="e.g., I prefer pet-friendly trips, looking for photography tours, etc."
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Account Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between p-4 border rounded-lg bg-destructive/5 text-destructive">
                        <div>
                            <p className="font-medium">Delete Account</p>
                            <p className="text-sm">Permanently delete your account and all associated data.</p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                 <Button variant="destructive">Delete Account</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your account
                                    and remove your data from our servers.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
                 <CardFooter>
                     <Button onClick={handleSaveChanges}>Save All Changes</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
