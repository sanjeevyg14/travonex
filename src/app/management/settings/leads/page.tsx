
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMockData } from "@/hooks/use-mock-data";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Star, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { LeadPackage } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";

export default function ManageLeadsPage() {
    const { leadPackages, setLeadPackages } = useMockData();
    const { toast } = useToast();

    // Use local state to manage edits before saving.
    const [localPackages, setLocalPackages] = useState<LeadPackage[]>([]);

    useEffect(() => {
        // Deep copy to avoid direct mutation of the context state.
        setLocalPackages(JSON.parse(JSON.stringify(leadPackages)));
    }, [leadPackages]);
    
    const handlePackageChange = (index: number, field: keyof LeadPackage, value: string | number | boolean) => {
        const updatedPackages = [...localPackages];
        const pkg = updatedPackages[index];
        
        if (typeof pkg[field] === 'number') {
            updatedPackages[index] = { ...pkg, [field]: Number(value) };
        } else {
            updatedPackages[index] = { ...pkg, [field]: value };
        }

        setLocalPackages(updatedPackages);
    };

    const addNewPackage = () => {
        const newPackage: LeadPackage = {
            id: `pkg-${Date.now()}`,
            name: "New Package",
            description: "A short, catchy description for this package.",
            credits: 0,
            price: 0,
            originalPrice: 0,
            popular: false,
        };
        setLocalPackages([...localPackages, newPackage]);
    };

    const removePackage = (id: string) => {
        if (localPackages.length <= 1) {
            toast({ variant: 'destructive', title: "Cannot remove last package" });
            return;
        }
        setLocalPackages(localPackages.filter(p => p.id !== id));
    };

    const saveChanges = () => {
        setLeadPackages(localPackages);
        toast({ title: "Lead Packages Saved", description: "The changes have been applied across the platform." });
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Manage Lead Packages</h1>
                <p className="text-muted-foreground">Set the pricing and credit amounts for organizer lead packages.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lead Credit Packages</CardTitle>
                    <CardDescription>
                        Edit the packages available for organizers to purchase. Changes will be reflected immediately.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {localPackages.map((pkg, index) => (
                        <div key={pkg.id} className="rounded-lg border p-4 space-y-4 bg-muted/20 relative">
                             <div className="absolute top-4 right-4 flex gap-2">
                                <div className="flex items-center gap-2">
                                    <Switch 
                                        id={`popular-${pkg.id}`} 
                                        checked={pkg.popular}
                                        onCheckedChange={(checked) => handlePackageChange(index, 'popular', checked)}
                                    />
                                    <Label htmlFor={`popular-${pkg.id}`} className="flex items-center gap-1 text-sm"><Star className="h-4 w-4 text-yellow-500" /> Popular</Label>
                                </div>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removePackage(pkg.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`name-${pkg.id}`}>Package Name</Label>
                                    <Input
                                        id={`name-${pkg.id}`}
                                        value={pkg.name}
                                        onChange={(e) => handlePackageChange(index, 'name', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`description-${pkg.id}`}>Description / Tagline</Label>
                                    <Input
                                        id={`description-${pkg.id}`}
                                        value={pkg.description}
                                        onChange={(e) => handlePackageChange(index, 'description', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`credits-${pkg.id}`}>Credits</Label>
                                    <Input
                                        id={`credits-${pkg.id}`}
                                        type="number"
                                        value={pkg.credits}
                                        onChange={(e) => handlePackageChange(index, 'credits', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`price-${pkg.id}`}>Price (₹)</Label>
                                    <Input
                                        id={`price-${pkg.id}`}
                                        type="number"
                                        value={pkg.price}
                                        onChange={(e) => handlePackageChange(index, 'price', e.target.value)}
                                    />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor={`originalPrice-${pkg.id}`}>Original Price (₹) (Optional)</Label>
                                    <Input
                                        id={`originalPrice-${pkg.id}`}
                                        type="number"
                                        value={pkg.originalPrice}
                                        onChange={(e) => handlePackageChange(index, 'originalPrice', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-start">
                        <Button variant="outline" onClick={addNewPackage}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New Package
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={saveChanges}>Save All Changes</Button>
            </div>
        </div>
    );
}
