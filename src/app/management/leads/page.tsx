
"use client";

import { useMemo, useState, useEffect } from "react";
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
import { useState, useEffect, useMemo } from "react";
import { Handshake, Unlock, CheckCircle } from "lucide-react";
import type { Lead } from "@/lib/types";

export default function AdminLeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeads() {
            setLoading(true);
            try {
                const response = await fetch('/api/leads', { credentials: 'include' });
                if (!response.ok) throw new Error('Failed to fetch leads');
                const data = await response.json();
                setLeads(data.leads || []);
            } catch (error) {
                console.error("Failed to fetch leads:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchLeads();
    }, []);

    const { totalLeads, unlockedLeads, convertedLeads } = useMemo(() => {
        if (loading) return { totalLeads: 0, unlockedLeads: 0, convertedLeads: 0 };
        
        return {
            totalLeads: leads.length,
            unlockedLeads: leads.filter(l => l.status === 'unlocked' || l.status === 'converted').length,
            convertedLeads: leads.filter(l => l.status === 'converted').length,
        }
    }, [leads, loading]);

    const getStatusBadge = (status: Lead['status']) => {
        switch (status) {
            case 'new': return <Badge variant="secondary">New</Badge>;
            case 'unlocked': return <Badge variant="outline">Unlocked</Badge>;
            case 'converted': return <Badge variant="default">Converted</Badge>;
            case 'archived': return <Badge variant="destructive">Archived</Badge>;
        }
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Platform-Wide Leads</CardTitle>
                    <CardDescription>
                    A log of all leads generated across the platform.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="grid gap-4 md:grid-cols-3 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Leads Generated</CardTitle>
                                <Handshake className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalLeads}</div>
                                <p className="text-xs text-muted-foreground">Total inquiries from travelers.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Leads Unlocked</CardTitle>
                                <Unlock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{unlockedLeads}</div>
                                <p className="text-xs text-muted-foreground">Leads purchased by organizers.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Leads Converted</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{convertedLeads}</div>
                                <p className="text-xs text-muted-foreground">Unlocked leads that resulted in a booking.</p>
                            </CardContent>
                        </Card>
                    </div>
                     {loading ? (
                        <div className="text-center py-12">Loading leads...</div>
                     ) : leads.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Traveler</TableHead>
                                    <TableHead>Organizer</TableHead>
                                    <TableHead>Trip</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leads.map((lead) => (
                                <TableRow key={lead.id}>
                                    <TableCell className="font-medium">{lead.travelerName}</TableCell>
                                    <TableCell>{lead.organizerId}</TableCell>
                                    <TableCell>{lead.tripTitle}</TableCell>
                                    <TableCell>{new Date(lead.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                     ) : (
                        <div className="text-center py-12">
                            <Handshake className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mt-4">No leads generated yet.</h3>
                            <p className="text-muted-foreground mt-2">When travelers ask questions about trips, they will appear here.</p>
                        </div>
                     )}
                </CardContent>
            </Card>
        </div>
    )
}
