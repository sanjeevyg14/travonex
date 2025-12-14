
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMockData } from "@/hooks/use-mock-data";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

export default function ManageTripTagsPage() {
    const { 
        tripCategories, 
        setTripCategories, 
        tripDifficulties, 
        setTripDifficulties 
    } = useMockData();
    
    const { toast } = useToast();

    const [newCategory, setNewCategory] = useState("");
    const [newDifficulty, setNewDifficulty] = useState("");

    const handleAddCategory = () => {
        if (newCategory && !tripCategories.includes(newCategory)) {
            setTripCategories(prev => [...prev, newCategory].sort());
            setNewCategory("");
             toast({ title: "Category Added", description: `"${newCategory}" has been added to the list.` });
        }
    };
    
    const handleRemoveCategory = (categoryToRemove: string) => {
        setTripCategories(prev => prev.filter(cat => cat !== categoryToRemove));
        toast({ variant: "destructive", title: "Category Removed", description: `"${categoryToRemove}" has been removed.` });
    };

    const handleAddDifficulty = () => {
        if (newDifficulty && !tripDifficulties.includes(newDifficulty)) {
            setTripDifficulties(prev => [...prev, newDifficulty].sort());
            setNewDifficulty("");
            toast({ title: "Difficulty Added", description: `"${newDifficulty}" has been added to the list.` });
        }
    };

    const handleRemoveDifficulty = (difficultyToRemove: string) => {
        setTripDifficulties(prev => prev.filter(diff => diff !== difficultyToRemove));
        toast({ variant: "destructive", title: "Difficulty Removed", description: `"${difficultyToRemove}" has been removed.` });
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Manage Trip Tags</h1>
                <p className="text-muted-foreground">Control the categories and difficulties available for organizers to select.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Manage Categories Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Trip Categories</CardTitle>
                        <CardDescription>Add or remove categories for trip listings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input 
                                placeholder="Enter a new category name"
                                value={newCategory}
                                onChange={e => setNewCategory(e.target.value)}
                            />
                            <Button onClick={handleAddCategory}>Add Category</Button>
                        </div>
                        <div className="p-4 bg-muted rounded-lg min-h-[150px]">
                             <div className="flex flex-wrap gap-2">
                                {tripCategories.map(cat => (
                                    <Badge key={cat} variant="secondary" className="text-base">
                                        {cat}
                                        <button onClick={() => handleRemoveCategory(cat)} className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Manage Difficulties Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Difficulty Levels</CardTitle>
                        <CardDescription>Add or remove difficulty ratings for trips.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                             <Input 
                                placeholder="Enter a new difficulty"
                                value={newDifficulty}
                                onChange={e => setNewDifficulty(e.target.value)}
                            />
                            <Button onClick={handleAddDifficulty}>Add Difficulty</Button>
                        </div>
                        <div className="p-4 bg-muted rounded-lg min-h-[150px]">
                            <div className="flex flex-wrap gap-2">
                                {tripDifficulties.map(diff => (
                                    <Badge key={diff} variant="secondary" className="text-base">
                                        {diff}
                                         <button onClick={() => handleRemoveDifficulty(diff)} className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
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
