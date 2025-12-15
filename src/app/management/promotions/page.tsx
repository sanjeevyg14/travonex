
"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import type { Coupon } from "@/lib/types";
import { format, isAfter } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, PlusCircle, Ticket } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";


function CreateCouponDialog({ onCouponCreated }: { onCouponCreated: () => void }) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);

    const [code, setCode] = useState("");
    const [type, setType] = useState<'fixed' | 'percentage'>('fixed');
    const [value, setValue] = useState("");
    const [description, setDescription] = useState("");
    const [usageLimit, setUsageLimit] = useState("");
    const [expiresAt, setExpiresAt] = useState<Date>();

    const handleSubmit = async () => {
        if (!code || !type || !value || !description) {
            toast({ variant: 'destructive', title: "Missing Fields", description: "Please fill out all required coupon details."});
            return;
        }

        try {
            const response = await fetch('/api/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    code,
                    type,
                    value: Number(value),
                    description,
                    scope: 'global',
                    isActive: true,
                    usageLimit: usageLimit ? Number(usageLimit) : undefined,
                    expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create coupon');
            }

            toast({ title: "Global Coupon Created!", description: `The coupon "${code.toUpperCase()}" is now active for all trips.`});
            setIsOpen(false);
            // Reset form
            setCode(""); setType('fixed'); setValue(""); setDescription(""); setUsageLimit(""); setExpiresAt(undefined);
            onCouponCreated();
        } catch (error: any) {
            console.error("Failed to create coupon:", error);
            toast({ 
                variant: 'destructive', 
                title: "Error", 
                description: error.message || "Failed to create coupon. Please try again." 
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" />
                    Create Global Coupon
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Global Coupon</DialogTitle>
                    <DialogDescription>
                        This coupon will be applicable to all trips on the platform.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="code" className="text-right">Code</Label>
                        <Input id="code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="col-span-3" placeholder="e.g., TRAVONEX20" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Input id="description" value={description} onChange={e => setDescription(e.target.value)} className="col-span-3" placeholder="e.g., Platform-wide 20% Off" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Type</Label>
                         <RadioGroup value={type} onValueChange={(v) => setType(v as 'fixed' | 'percentage')} className="col-span-3 flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="fixed" id="fixed" />
                                <Label htmlFor="fixed">Fixed (₹)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="percentage" id="percentage" />
                                <Label htmlFor="percentage">Percentage (%)</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="value" className="text-right">Value</Label>
                        <Input id="value" type="number" value={value} onChange={e => setValue(e.target.value)} className="col-span-3" placeholder={type === 'fixed' ? "e.g., 1000" : "e.g., 20"} />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="usageLimit" className="text-right">Usage Limit</Label>
                        <Input id="usageLimit" type="number" value={usageLimit} onChange={e => setUsageLimit(e.target.value)} className="col-span-3" placeholder="Optional (e.g., 500)" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Expires At</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("col-span-3 justify-start text-left font-normal", !expiresAt && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {expiresAt ? format(expiresAt, "PPP") : <span>Optional</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={expiresAt} onSelect={setExpiresAt} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" onClick={handleSubmit}>Create Coupon</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function AdminPromotionsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [organizers, setOrganizers] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/coupons', { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch coupons');
            const data = await response.json();
            setCoupons(data.coupons || []);
        } catch (error) {
            console.error("Failed to fetch coupons:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
        
        // Also fetch organizers for display
        fetch('/api/organizers', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                const orgMap: Record<string, any> = {};
                (data.organizers || []).forEach((org: any) => {
                    orgMap[org.id] = org;
                });
                setOrganizers(orgMap);
            })
            .catch(err => console.error("Failed to fetch organizers:", err));
    }, []);
    
    const getStatus = (coupon: Coupon) => {
        if (!coupon.isActive) return { text: 'Inactive', variant: 'destructive' } as const;
        if (coupon.expiresAt && isAfter(new Date(), new Date(coupon.expiresAt))) return { text: 'Expired', variant: 'destructive' } as const;
        if (coupon.usageLimit && (coupon.timesUsed || 0) >= coupon.usageLimit) return { text: 'Used Up', variant: 'secondary' } as const;
        return { text: 'Active', variant: 'default' } as const;
    };
    
    const toggleCouponStatus = async (couponId: string) => {
        const coupon = coupons.find(c => c.id === couponId);
        if (!coupon) return;

        try {
            // TODO: Create PUT endpoint for coupons to update status
            // For now, just update local state
            setCoupons(prev => prev.map(c => c.id === couponId ? {...c, isActive: !c.isActive} : c));
            toast({ title: "Coupon Updated", description: `Coupon ${coupon.code} has been ${!coupon.isActive ? 'activated' : 'deactivated'}.` });
        } catch (error: any) {
            console.error("Failed to toggle coupon:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to update coupon." });
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">Manage Promotions</h1>
                    <p className="text-muted-foreground">View all coupons and create new platform-wide promotions.</p>
                </div>
                <CreateCouponDialog onCouponCreated={fetchCoupons} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Coupons</CardTitle>
                    <CardDescription>A list of all promotional codes on the platform, both global and organizer-specific.</CardDescription>
                </CardHeader>
                <CardContent>
                    {coupons.length > 0 ? (
                        <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Scope</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Usage</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {coupons.map((coupon) => {
                                    const status = getStatus(coupon);
                                    const scope = coupon.scope === 'global' 
                                        ? 'Global' 
                                        : (coupon.organizerId ? organizers[coupon.organizerId]?.name : 'Organizer');

                                    return (
                                    <TableRow key={coupon.id}>
                                        <TableCell className="font-mono font-semibold">{coupon.code}</TableCell>
                                        <TableCell>
                                            <Badge variant={coupon.scope === 'global' ? 'default' : 'secondary'}>{scope}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {coupon.type === 'fixed' ? `₹${coupon.value}` : `${coupon.value}%`}
                                        </TableCell>
                                        <TableCell>
                                            {coupon.timesUsed || 0} / {coupon.usageLimit || '∞'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={status.variant}>{status.text}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" onClick={() => toggleCouponStatus(coupon.id)}>
                                                {coupon.isActive ? 'Deactivate' : 'Activate'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Ticket className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mt-4">No coupons found.</h3>
                            <p className="text-muted-foreground mt-2">Click "Create Global Coupon" to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
