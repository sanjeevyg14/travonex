
"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMockData } from "@/hooks/use-mock-data";
import { useToast } from "@/hooks/use-toast";
import type { Experience } from "@/lib/types";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

export default function AdminExperiencesPage() {
  const { experiences, setExperiences, addAuditLog } = useMockData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredExperiences = useMemo(() => {
    let experiencesByStatus: Experience[];
    if (currentTab === 'all') {
      experiencesByStatus = experiences;
    } else {
      // For now, we use a mock status. Replace with experience.status when available.
      const mockStatusMap: { [key: string]: 'published' | 'pending' | 'draft' } = {
          'exp-scuba-goa': 'published',
          'exp-paragliding-bir': 'published',
          'exp-kayaking-rishikesh': 'pending',
          'exp-jungle-safari-jim-corbett': 'draft',
      };
      experiencesByStatus = experiences.filter(exp => (mockStatusMap[exp.id] || 'pending') === currentTab);
    }
    
    if (searchTerm) {
        return experiencesByStatus.filter(exp => exp.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    return experiencesByStatus;
  }, [experiences, currentTab, searchTerm]);

  const handleApprove = (experienceId: string) => {
    const experience = experiences.find(e => e.id === experienceId);
    if (!experience || !user) return;
    
    // In a real app, you would update the status property of the experience object.
    // setExperiences(current => current.map(e => e.id === experienceId ? { ...e, status: 'published' } : e));
    
    addAuditLog({
        adminName: user.name,
        action: 'Trip Approved', // Using 'Trip' action for now. Could be 'Experience Approved'.
        entityType: 'Trip',
        entityId: experienceId,
        entityName: experience.title,
    });
    toast({ title: "Experience Approved", description: "The experience is now live on the platform." });
  };
  
  const handleReject = (experienceId: string) => {
    const experience = experiences.find(e => e.id === experienceId);
    if (!experience || !user) return;

    // Simulate rejection
    toast({ variant: "destructive", title: "Experience Rejected", description: "The experience has been moved to drafts." });
  };
  
  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold">Manage Experiences</h1>
            <p className="text-muted-foreground">Review, approve, or suspend single-day activity listings.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Experience Listings</CardTitle>
                <CardDescription>
                Review and manage all single-day activities submitted by vendors.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={currentTab} onValueChange={setCurrentTab}>
                    <div className="flex justify-between items-center mb-4 gap-4">
                        <TabsList className="grid w-full grid-cols-4 md:w-fit">
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                            <TabsTrigger value="published">Published</TabsTrigger>
                            <TabsTrigger value="draft">Drafts</TabsTrigger>
                            <TabsTrigger value="all">All</TabsTrigger>
                        </TabsList>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by experience title..." 
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="border rounded-lg">
                        <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center w-[160px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredExperiences.map((exp) => (
                            <TableRow key={exp.id}>
                                <TableCell className="font-medium">{exp.title}</TableCell>
                                <TableCell>{exp.vendor.name}</TableCell>
                                <TableCell>{exp.location}</TableCell>
                                <TableCell>₹{exp.price.toLocaleString('en-IN')}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">Pending</Badge>
                                </TableCell>
                                <TableCell className="flex gap-2 justify-center">
                                    <Button onClick={() => handleApprove(exp.id)} variant="outline" size="sm">Approve</Button>
                                    <Button onClick={() => handleReject(exp.id)} variant="destructive" size="sm">Reject</Button>
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={`/experiences/${exp.slug}`} target="_blank">View</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                            ))}
                            {filteredExperiences.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                    No experiences found for the current filter.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        </Table>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    </div>
  );
}
