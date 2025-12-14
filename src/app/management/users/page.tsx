
"use client";

import { useAdminUsers, type EnrichedAdminUser } from "@/hooks/use-admin-users";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users as UsersIcon, DollarSign, ArrowUpDown, Eye, Ban, ShieldCheck, Search, Wallet, Heart, Tag, StickyNote, Cake, Home, User, Phone, Mail, UserCheck, Crown, History, CreditCard } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User as UserType } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string | number | null }) => {
    if (!value && value !== 0) return null;
    return (
        <div className="flex items-start gap-3">
            <div className="text-muted-foreground mt-1">{icon}</div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium">{value}</p>
            </div>
        </div>
    );
}

function UserDetailDialog({ user, onDialogClose }: { user: EnrichedAdminUser | null, onDialogClose: () => void }) {
    if (!user) return null;
    const currentSubscription = user.subscriptionHistory?.find(s => s.status === 'active');
    return (
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    {user.name}
                    {user.subscriptionTier === 'pro' && (
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                     <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-500"><Crown className="h-3 w-3 mr-1"/>PRO</Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Travonex Pro Member</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </DialogTitle>
                <DialogDescription>
                    <span className="block">{user.phone} • {user.email}</span>
                    <span className="block">Joined on {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}</span>
                </DialogDescription>
            </DialogHeader>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
                 <div className="space-y-4 md:col-span-1">
                     <Card>
                        <CardHeader><CardTitle className="text-base">Core Profile</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                             <DetailItem icon={<Cake className="h-4 w-4" />} label="Date of Birth" value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'} />
                             <DetailItem icon={<User className="h-4 w-4" />} label="Gender" value={user.gender} />
                             <DetailItem icon={<Home className="h-4 w-4" />} label="Home City" value={user.homeCity} />
                        </CardContent>
                     </Card>
                      <Card>
                        <CardHeader><CardTitle className="text-base">Safety Information</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                             <DetailItem icon={<UserCheck className="h-4 w-4" />} label="Emergency Contact Name" value={user.emergencyContact?.name} />
                             <DetailItem icon={<Phone className="h-4 w-4" />} label="Emergency Contact Phone" value={user.emergencyContact?.phone} />
                             <DetailItem icon={<Mail className="h-4 w-4" />} label="Government ID" value={user.governmentId ? `${user.governmentId.type}: ${user.governmentId.number}` : 'Not provided'} />
                        </CardContent>
                     </Card>
                 </div>
                 <div className="space-y-4 md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4"/>Subscription & Billing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                                <DetailItem icon={<Wallet className="h-4 w-4" />} label="Current Wallet Balance" value={formatCurrency(user.walletBalance || 0)} />
                                <DetailItem icon={<DollarSign className="h-4 w-4" />} label="Lifetime Spend" value={formatCurrency(user.totalSpend)} />
                                <DetailItem icon={<Crown className="h-4 w-4" />} label="AI Planner Credits" value={user.subscriptionTier === 'pro' ? 'Unlimited' : user.aiCredits} />
                                {currentSubscription && (
                                     <div className="text-xs text-muted-foreground pt-2">
                                        Renews on {new Date(currentSubscription.endDate).toLocaleDateString()}
                                    </div>
                                )}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><History className="h-4 w-4"/> Subscription History</CardTitle></CardHeader>
                        <CardContent>
                            {user.subscriptionHistory && user.subscriptionHistory.length > 0 ? (
                                <div className="space-y-2 text-sm">
                                    {user.subscriptionHistory.map(sub => (
                                        <div key={sub.id} className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                                            <div>
                                                <p className="font-medium">{sub.planName}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(sub.startDate).toLocaleDateString()}</p>
                                            </div>
                                            <p className="font-mono text-xs">₹{sub.pricePaid.toLocaleString('en-IN')}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No subscription history.</p>
                            )}
                        </CardContent>
                    </Card>
                 </div>
                 <div className="space-y-4 md:col-span-1">
                     <Card>
                        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Tag className="h-4 w-4"/>Travel Preferences</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                             <DetailItem icon={<Home className="h-4 w-4" />} label="Preferred Cities" value={user.preferredCities?.join(', ')} />
                             <DetailItem icon={<Heart className="h-4 w-4" />} label="Interests" value={user.travelInterests?.join(', ')} />
                             <DetailItem icon={<StickyNote className="h-4 w-4" />} label="Dietary" value={user.dietaryPreferences?.join(', ')} />
                        </CardContent>
                     </Card>
                     <Card>
                        <CardHeader><CardTitle className="text-base">Booking History ({user.totalBookings})</CardTitle></CardHeader>
                        <CardContent>
                             {user.bookings.length > 0 ? (
                                <div className="space-y-2">
                                    {user.bookings.slice(0, 5).map(booking => (
                                        <Link
                                            key={booking.id}
                                            href={booking.trip ? `/discover/${booking.trip.slug}`: '#'}
                                            className="block p-2 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                                            onClick={onDialogClose}
                                        >
                                            <div className="font-medium truncate">{booking.tripTitle}</div>
                                            <div className="text-xs text-muted-foreground">{new Date(booking.bookingDate).toLocaleDateString()} • {formatCurrency(booking.totalPrice)}</div>
                                        </Link>
                                    ))}
                                    {user.bookings.length > 5 && <p className="text-xs text-center text-muted-foreground pt-2">...and {user.bookings.length - 5} more</p>}
                                </div>
                            ) : <p className="text-muted-foreground text-sm text-center py-4">No bookings found for this user.</p>}
                        </CardContent>
                     </Card>
                 </div>
            </div>
        </DialogContent>
    );
}

export default function AdminUsersPage() {
    const { stats, users, requestSort, sortConfig, updateUserStatus, setSearchQuery, setStatusFilter } = useAdminUsers();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<EnrichedAdminUser | null>(null);

    
    const getSortIndicator = (key: string) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    };

    const handleSuspendUser = (userId: string, currentStatus: 'active' | 'suspended' | undefined) => {
        const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
        updateUserStatus(userId, newStatus);
    }

    const handleViewDetails = (user: EnrichedAdminUser) => {
        setSelectedUser(user);
        setIsDialogOpen(true);
    };
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Manage Users</h1>
                <p className="text-muted-foreground">View and manage all registered travelers on the platform.</p>
            </div>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Travelers</CardTitle>
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalTravelers}</div>
                        <p className="text-xs text-muted-foreground">Total registered user accounts.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Traveler Spend</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.totalSpend)}</div>
                        <p className="text-xs text-muted-foreground">Lifetime value of all travelers.</p>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <Card>
                    <CardHeader>
                        <CardTitle>Traveler Accounts</CardTitle>
                        <CardDescription>A list of all travelers on the platform, ranked by total spend.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search by name..." 
                                    className="pl-9"
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                             <Select onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'suspended')}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {users.length > 0 ? (
                            <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => requestSort('name')}>
                                                Traveler {getSortIndicator('name')}
                                            </Button>
                                        </TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead className="text-center">
                                            <Button variant="ghost" onClick={() => requestSort('totalBookings')}>
                                                Total Bookings {getSortIndicator('totalBookings')}
                                            </Button>
                                        </TableHead>
                                        <TableHead className="text-right">
                                            <Button variant="ghost" onClick={() => requestSort('totalSpend')}>
                                                Total Spend {getSortIndicator('totalSpend')}
                                            </Button>
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Subscription</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                {user.name}
                                            </TableCell>
                                            <TableCell>{user.phone}</TableCell>
                                            <TableCell className="text-center">{user.totalBookings}</TableCell>
                                            <TableCell className="text-right font-semibold">{formatCurrency(user.totalSpend)}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.status === 'suspended' ? 'destructive' : 'secondary'}>
                                                    {user.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {user.subscriptionTier === 'pro' ? (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                 <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-500"><Crown className="h-3 w-3 mr-1"/>PRO</Badge>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Travonex Pro Member</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ) : (
                                                    <Badge variant="outline">Free</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <span className="sr-only">Open menu</span>
                                                            ...
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onSelect={() => handleViewDetails(user)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => handleSuspendUser(user.id, user.status)} className={user.status === 'suspended' ? '' : 'text-destructive'}>
                                                          {user.status === 'suspended' ? <ShieldCheck className="mr-2 h-4 w-4"/> : <Ban className="mr-2 h-4 w-4" />}
                                                          {user.status === 'suspended' ? 'Re-activate User' : 'Suspend User'}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No users match your search or filter criteria.</p>
                        )}
                    </CardContent>
                </Card>
                <UserDetailDialog user={selectedUser} onDialogClose={() => setIsDialogOpen(false)} />
            </Dialog>

        </div>
    );
}

    

    