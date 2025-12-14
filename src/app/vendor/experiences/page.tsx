
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useMockData } from "@/hooks/use-mock-data";
import { useMemo } from "react";
import type { Experience } from "@/lib/types";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, PlusCircle } from "lucide-react";

export default function ManageExperiencesPage() {
    const { user } = useAuth();
    const { experiences } = useMockData();

    const organizerExperiences = useMemo(() => {
        if (!user || !user.organizerId) return [];
        return experiences.filter(e => e.vendor.id === user.organizerId);
    }, [user, experiences]);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">Manage My Experiences</h1>
                    <p className="text-muted-foreground">View, edit, and manage all your listed activities.</p>
                </div>
                <Button asChild>
                    <Link href="/vendor/experiences/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        List New Experience
                    </Link>
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Your Listings</CardTitle>
                    <CardDescription>A list of all activities you have created on Travonex.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {organizerExperiences.length > 0 ? organizerExperiences.map(exp => (
                                    <TableRow key={exp.id}>
                                        <TableCell className="font-medium">{exp.title}</TableCell>
                                        <TableCell>
                                            {/* Mock status. In a real app, this would come from the exp object */}
                                            <Badge variant="secondary">Pending</Badge>
                                        </TableCell>
                                        <TableCell>₹{exp.price.toLocaleString('en-IN')}</TableCell>
                                        <TableCell>{exp.location}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/vendor/experiences/edit/${exp.slug}`}>
                                                        <Edit className="mr-2 h-3 w-3" />
                                                        Edit
                                                    </Link>
                                                </Button>
                                                 <Button asChild variant="ghost" size="sm">
                                                    <Link href={`/experiences/${exp.slug}`} target="_blank">
                                                        <Eye className="mr-2 h-3 w-3" />
                                                        View
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            You haven't created any experiences yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
