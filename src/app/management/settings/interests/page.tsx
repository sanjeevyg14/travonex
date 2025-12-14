
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMockData } from "@/hooks/use-mock-data";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

export default function ManageInterestsPage() {
    const { 
        travelCities, 
        setTravelCities, 
        travelInterests, 
        setTravelInterests 
    } = useMockData();
    
    const { toast } = useToast();

    const [newCity, setNewCity] = useState("");
    const [newInterest, setNewInterest] = useState("");

    const handleAddCity = () => {
        if (newCity && !travelCities.includes(newCity)) {
            setTravelCities(prev => [...prev, newCity].sort());
            setNewCity("");
             toast({ title: "City Added", description: `"${newCity}" has been added to the list.` });
        }
    };
    
    const handleRemoveCity = (cityToRemove: string) => {
        setTravelCities(prev => prev.filter(city => city !== cityToRemove));
        toast({ variant: "destructive", title: "City Removed", description: `"${cityToRemove}" has been removed.` });
    };

    const handleAddInterest = () => {
        if (newInterest && !travelInterests.includes(newInterest)) {
            setTravelInterests(prev => [...prev, newInterest].sort());
            setNewInterest("");
            toast({ title: "Interest Added", description: `"${newInterest}" has been added to the list.` });
        }
    };

    const handleRemoveInterest = (interestToRemove: string) => {
        setTravelInterests(prev => prev.filter(interest => interest !== interestToRemove));
        toast({ variant: "destructive", title: "Interest Removed", description: `"${interestToRemove}" has been removed.` });
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Manage User Interests</h1>
                <p className="text-muted-foreground">Control the tags available for users in their profile preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Manage Cities Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Cities</CardTitle>
                        <CardDescription>Add or remove preferred cities for users to select.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input 
                                placeholder="Enter a new city name"
                                value={newCity}
                                onChange={e => setNewCity(e.target.value)}
                            />
                            <Button onClick={handleAddCity}>Add City</Button>
                        </div>
                        <div className="p-4 bg-muted rounded-lg min-h-[150px]">
                             <div className="flex flex-wrap gap-2">
                                {travelCities.map(city => (
                                    <Badge key={city} variant="secondary" className="text-base">
                                        {city}
                                        <button onClick={() => handleRemoveCity(city)} className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Manage Interests Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Interests</CardTitle>
                        <CardDescription>Add or remove travel activities and types.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                             <Input 
                                placeholder="Enter a new interest"
                                value={newInterest}
                                onChange={e => setNewInterest(e.target.value)}
                            />
                            <Button onClick={handleAddInterest}>Add Interest</Button>
                        </div>
                        <div className="p-4 bg-muted rounded-lg min-h-[150px]">
                            <div className="flex flex-wrap gap-2">
                                {travelInterests.map(interest => (
                                    <Badge key={interest} variant="secondary" className="text-base">
                                        {interest}
                                         <button onClick={() => handleRemoveInterest(interest)} className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
