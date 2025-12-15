
"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import type { AuditLog } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { format } from 'date-fns';
import Link from "next/link";


export default function AdminAuditLogPage() {
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAuditLogs() {
            setLoading(true);
            try {
                const response = await fetch('/api/admin/audit-logs', { credentials: 'include' });
                if (!response.ok) throw new Error('Failed to fetch audit logs');
                const data = await response.json();
                setAuditLogs(data.logs || []);
            } catch (error) {
                console.error("Failed to fetch audit logs:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchAuditLogs();
    }, []);
    const [searchTerm, setSearchTerm] = useState("");
    const [actionFilter, setActionFilter] = useState("all");

    const filteredLogs = useMemo(() => {
        let filtered = auditLogs;

        if (actionFilter !== "all") {
            filtered = filtered.filter(log => log.action === actionFilter);
        }
        
        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(log => 
                log.adminName.toLowerCase().includes(lowercasedTerm) ||
                log.entityName.toLowerCase().includes(lowercasedTerm) ||
                (log.details && log.details.toLowerCase().includes(lowercasedTerm))
            );
        }
        
        return filtered;
    }, [auditLogs, searchTerm, actionFilter]);

    const getActionBadgeVariant = (action: AuditLog['action']) => {
        if (action.includes('Approved') || action.includes('Sent') || action.includes('Received')) return 'default';
        if (action.includes('Rejected')) return 'destructive';
        return 'secondary';
    };

    const actionTypes = useMemo(() => {
        const actions = new Set(auditLogs.map(log => log.action));
        return Array.from(actions);
    }, [auditLogs]);

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold">Admin Audit Log</h1>
                <p className="text-muted-foreground">A chronological record of all significant administrative actions on the platform.</p>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by admin, entity, or details..." 
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={actionFilter} onValueChange={setActionFilter}>
                            <SelectTrigger className="w-full md:w-[220px]">
                                <SelectValue placeholder="Filter by action" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actions</SelectItem>
                                {actionTypes.map(action => (
                                    <SelectItem key={action} value={action}>{action}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Actor</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Entity</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="text-xs text-muted-foreground">{format(new Date(log.timestamp), 'dd MMM yyyy, hh:mm a')}</TableCell>
                                    <TableCell className="font-medium">{log.adminName}</TableCell>
                                    <TableCell>
                                        <Badge variant={getActionBadgeVariant(log.action)}>
                                            {log.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                         <div className="font-medium">{log.entityName}</div>
                                         <div className="text-xs text-muted-foreground">{log.entityType} ID: {log.entityId}</div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground italic">{log.details}</TableCell>
                                </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No logs match your criteria.
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
