
"use client";

import { useMemo, useState } from "react";
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
import { useMockData } from "@/hooks/use-mock-data";
import type { BlogStory } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MoreHorizontal, Eye, Trash2, CheckCircle, XCircle, Edit } from "lucide-react";
import { format } from 'date-fns';
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

// Let's assume BlogStory can have a status, we'll add it dynamically for now
type ManagedBlogStory = BlogStory & { status: 'published' | 'draft' | 'pending' };

export default function AdminManageStoriesPage() {
    const { blogStories, setBlogStories: setGlobalBlogStories } = useMockData();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Add a mock status to each story for demonstration purposes
    const managedStories = useMemo((): ManagedBlogStory[] => {
        return blogStories.map((story, index) => ({
            ...story,
            status: index % 3 === 0 ? 'pending' : (index % 3 === 1 ? 'published' : 'draft'),
        }));
    }, [blogStories]);

    const filteredStories = useMemo(() => {
        let filtered = managedStories;
        
        if (statusFilter !== "all") {
            filtered = filtered.filter(story => story.status === statusFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(story => 
                story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                story.author.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [managedStories, searchTerm, statusFilter]);

    const handleStatusChange = (storyId: string, newStatus: ManagedBlogStory['status']) => {
        // This is a simplified update. In a real app, you'd update the source.
        // For this prototype, the status is mocked, so this action is simulated with a toast.
        const story = blogStories.find(s => s.id === storyId);
        toast({
            title: `Story Status Changed`,
            description: `"${story?.title}" has been set to ${newStatus}.`,
        });
    };
    
    const handleDelete = (storyId: string) => {
        const story = blogStories.find(s => s.id === storyId);
        // This is a visual-only removal for the prototype
        toast({
            variant: "destructive",
            title: `Story Deleted`,
            description: `"${story?.title}" has been removed.`,
        });
    }

    const getStatusBadgeVariant = (status: ManagedBlogStory['status']) => {
        switch (status) {
            case 'published': return 'default';
            case 'pending': return 'secondary';
            case 'draft': return 'outline';
            default: return 'secondary';
        }
    };

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold">Manage Stories</h1>
                <p className="text-muted-foreground">Review and moderate all user-submitted travel stories.</p>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by title or author..." 
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Date Published</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStories.length > 0 ? filteredStories.map((story) => (
                                <TableRow key={story.id}>
                                    <TableCell className="font-medium">{story.title}</TableCell>
                                    <TableCell>{story.author}</TableCell>
                                    <TableCell>{format(new Date(story.date), 'dd MMM yyyy')}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(story.status)}>
                                            {story.status}
                                        </Badge>
                                    </TableCell>
                                     <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem asChild>
                                                     <Link href={`/blog/${story.slug}`} target="_blank">
                                                        <Eye className="mr-2 h-4 w-4" /> View Story
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                     <Link href={`/my-stories/edit/${story.slug}`} target="_blank">
                                                        <Edit className="mr-2 h-4 w-4" /> Edit Story
                                                    </Link>
                                                </DropdownMenuItem>
                                                {story.status !== 'published' && (
                                                    <DropdownMenuItem onClick={() => handleStatusChange(story.id, 'published')}>
                                                        <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                                    </DropdownMenuItem>
                                                )}
                                                {story.status === 'published' && (
                                                    <DropdownMenuItem onClick={() => handleStatusChange(story.id, 'draft')}>
                                                        <XCircle className="mr-2 h-4 w-4" /> Unpublish
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(story.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No stories match your criteria.
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
