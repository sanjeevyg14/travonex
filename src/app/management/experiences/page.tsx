
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
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Experience } from "@/lib/types";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

export default function AdminExperiencesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchExperiences() {
      setLoading(true);
      try {
        const response = await fetch('/api/experiences', { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch experiences');
        const data = await response.json();
        setExperiences(data.experiences || []);
      } catch (error) {
        console.error("Failed to fetch experiences:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to load experiences." });
      } finally {
        setLoading(false);
      }
    }

    fetchExperiences();
  }, [toast]);

  const filteredExperiences = useMemo(() => {
    if (loading) return [];
    
    let experiencesByStatus: Experience[];
    if (currentTab === 'all') {
      experiencesByStatus = experiences;
    } else {
      experiencesByStatus = experiences.filter(exp => exp.status === currentTab);
    }
    
    if (searchTerm) {
        return experiencesByStatus.filter(exp => exp.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    return experiencesByStatus;
  }, [experiences, currentTab, searchTerm, loading]);

  const handleApprove = async (experienceId: string) => {
    const experience = experiences.find(e => e.id === experienceId);
    if (!experience || !user) return;
    
    try {
      const response = await fetch(`/api/admin/experiences/${experienceId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve experience');
      }

      // Refresh experiences list
      const refreshResponse = await fetch('/api/experiences', { credentials: 'include' });
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setExperiences(refreshData.experiences || []);
      }

      toast({ title: "Experience Approved", description: "The experience is now live on the platform." });
    } catch (error: any) {
      console.error("Failed to approve experience:", error);
      toast({ 
        variant: "destructive", 
        title: "Approval Failed", 
        description: error.message || "Failed to approve experience. Please try again." 
      });
    }
  };
  
  const handleReject = async (experienceId: string) => {
    const experience = experiences.find(e => e.id === experienceId);
    if (!experience || !user) return;

    try {
      const response = await fetch(`/api/admin/experiences/${experienceId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ remarks: 'Rejected by admin' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject experience');
      }

      // Refresh experiences list
      const refreshResponse = await fetch('/api/experiences', { credentials: 'include' });
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setExperiences(refreshData.experiences || []);
      }

      toast({ variant: "destructive", title: "Experience Rejected", description: "The experience has been moved to drafts." });
    } catch (error: any) {
      console.error("Failed to reject experience:", error);
      toast({ 
        variant: "destructive", 
        title: "Rejection Failed", 
        description: error.message || "Failed to reject experience. Please try again." 
      });
    }
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
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">Loading experiences...</TableCell>
                                </TableRow>
                            ) : filteredExperiences.length > 0 ? filteredExperiences.map((exp) => (
                            <TableRow key={exp.id}>
                                <TableCell className="font-medium">{exp.title}</TableCell>
                                <TableCell>{exp.vendor.name}</TableCell>
                                <TableCell>{exp.location}</TableCell>
                                <TableCell>₹{exp.price.toLocaleString('en-IN')}</TableCell>
                                <TableCell>
                                    <Badge variant={exp.status === 'published' ? 'default' : exp.status === 'pending' ? 'secondary' : 'outline'}>
                                        {exp.status || 'draft'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="flex gap-2 justify-center">
                                    <Button onClick={() => handleApprove(exp.id)} variant="outline" size="sm">Approve</Button>
                                    <Button onClick={() => handleReject(exp.id)} variant="destructive" size="sm">Reject</Button>
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={`/experiences/${exp.slug}`} target="_blank">View</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                            )) : (
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
