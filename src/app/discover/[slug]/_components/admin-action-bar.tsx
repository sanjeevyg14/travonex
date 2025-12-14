'use client';

import { Button } from '@/components/ui/button';
import { useMockData } from '@/hooks/use-mock-data';
import { useToast } from '@/hooks/use-toast';
import type { Trip } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';

interface AdminActionBarProps {
  trip: Trip;
}

export function AdminActionBar({ trip }: AdminActionBarProps) {
  const { setTrips } = useMockData();
  const { toast } = useToast();
  const router = useRouter();

  const handleApprove = () => {
    setTrips((prevTrips) =>
      prevTrips.map((t) =>
        t.id === trip.id ? { ...t, status: 'published' } : t
      )
    );
    toast({
      title: 'Trip Approved!',
      description: `"${trip.title}" is now live on the platform.`,
    });
    router.push('/management/trips');
  };

  const handleReject = () => {
    setTrips((prevTrips) =>
      prevTrips.map((t) => (t.id === trip.id ? { ...t, status: 'draft' } : t))
    );
    toast({
      variant: 'destructive',
      title: 'Trip Rejected',
      description: `"${trip.title}" has been moved to drafts.`,
    });
    router.push('/management/trips');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 border-t shadow-lg lg:sticky lg:top-16">
      <div className="container flex items-center justify-between h-16">
        <div className="text-sm">
          <p className="font-bold">Admin Action Required</p>
          <p className="text-muted-foreground">This trip is pending approval.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleReject}>
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>
          <Button onClick={handleApprove}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve Trip
          </Button>
        </div>
      </div>
    </div>
  );
}
