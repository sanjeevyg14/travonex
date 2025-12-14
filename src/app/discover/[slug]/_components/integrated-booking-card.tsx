

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Trip } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

export function IntegratedBookingCard({ trip }: { trip: Trip }) {
  const router = useRouter();
  const { toast } = useToast();

  const activeBatches = useMemo(
    () => trip.batches?.filter((b) => b.status === "Active") || [],
    [trip.batches]
  );

  const [selectedBatchId, setSelectedBatchId] = useState<string | undefined>(
    activeBatches.length === 1 ? activeBatches[0].id : undefined
  );

  const selectedBatch = useMemo(() => {
    if (!selectedBatchId) return null;
    return trip.batches?.find((b) => b.id === selectedBatchId) || null;
  }, [trip.batches, selectedBatchId]);

  const handleBooking = (paymentType: "full" | "partial") => {
    if (!selectedBatchId) {
      toast({
        variant: "destructive",
        title: "Please select a date",
        description: "You need to choose a departure date before booking.",
      });
      return;
    }
    router.push(
      `/book/${trip.slug}?batchId=${selectedBatchId}&paymentType=${paymentType}`
    );
  };

  const isDeal = selectedBatch?.isLastMinuteDeal && selectedBatch?.dealPrice;
  const displayPrice = isDeal ? selectedBatch.dealPrice : (selectedBatch?.priceOverride ?? trip.price);
  const originalPrice = isDeal ? (selectedBatch?.priceOverride ?? trip.price) : null;


  return (
    <Card className="shadow-lg">
      <CardHeader>
        {isDeal ? (
             <div className="flex items-baseline gap-3">
                 <div className="text-4xl font-bold text-primary">₹{displayPrice?.toLocaleString("en-IN")}</div>
                 <div className="text-xl font-normal text-muted-foreground line-through">₹{originalPrice?.toLocaleString("en-IN")}</div>
             </div>
        ) : (
            <div className="text-3xl font-bold">
            ₹{displayPrice?.toLocaleString("en-IN")}
            <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / person
            </span>
            </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {activeBatches.length > 0 ? (
          <div className="space-y-2">
            <label className="text-sm font-medium">Select a Date</label>
            <Select
              onValueChange={setSelectedBatchId}
              defaultValue={selectedBatchId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a departure date" />
              </SelectTrigger>
              <SelectContent>
                {activeBatches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    <div className="flex justify-between items-center w-full">
                       <span>
                            {new Date(batch.startDate).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                            })}{" "}
                            -{" "}
                            {new Date(batch.endDate).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            })}{" "}
                            ({batch.availableSlots} left)
                       </span>
                        {batch.isLastMinuteDeal && (
                            <Badge variant="destructive" className="ml-2 gap-1"><Zap className="h-3 w-3"/> DEAL</Badge>
                        )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="text-sm text-center text-muted-foreground p-4 bg-muted rounded-md">
            No active batches available.
          </div>
        )}

        <div className="space-y-2">
          <Button
            size="lg"
            className="w-full"
            onClick={() => handleBooking("full")}
            disabled={activeBatches.length === 0}
          >
            Join the Adventure
          </Button>

          {trip.spotReservationEnabled && (
            <Button
              size="lg"
              variant="secondary"
              className="w-full"
              onClick={() => handleBooking("partial")}
              disabled={activeBatches.length === 0}
            >
              Reserve Your Spot (Pay {trip.spotReservationPercentage || 10}%)
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
