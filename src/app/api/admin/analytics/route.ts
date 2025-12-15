import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyAdmin } from "@/lib/auth/admin-guard";

// GET /api/admin/analytics - Get platform analytics (admin only)
export async function GET(req: NextRequest) {
  try {
    const adminResult = await verifyAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    // Fetch all data for analytics
    const [
      usersSnapshot,
      tripsSnapshot,
      bookingsSnapshot,
      experiencesSnapshot,
    ] = await Promise.all([
      adminDb.collection("users").get(),
      adminDb.collection("trips").get(),
      adminDb.collection("bookings").get(),
      adminDb.collection("experiences").get(),
    ]);

    const users = usersSnapshot.docs.map((d) => d.data());
    const trips = tripsSnapshot.docs.map((d) => d.data());
    const bookings = bookingsSnapshot.docs.map((d) => d.data());
    const experiences = experiencesSnapshot.docs.map((d) => d.data());

    // Calculate metrics
    const totalRevenue = bookings.reduce(
      (sum: number, b: any) => sum + (b.totalPrice || 0),
      0
    );

    // Get settings (commission rate, etc.)
    const settingsDoc = await adminDb.collection("settings").doc("platform").get();
    const settings = settingsDoc.data() || {};
    const commissionRate = settings.commissionRate || 10;

    const platformCommission = bookings.reduce(
      (sum: number, b: any) => {
        if (b.paymentStatus === "Paid in Full") {
          return sum + ((b.totalPrice || 0) * commissionRate) / 100;
        }
        return sum;
      },
      0
    );

    // Calculate total cashback from wallet transactions (credit type transactions)
    const walletTxsSnapshot = await adminDb
      .collection("wallet_transactions")
      .where("type", "==", "credit")
      .get();
    const totalCashback = walletTxsSnapshot.docs.reduce(
      (sum: number, doc: any) => sum + (doc.data().amount || 0),
      0
    );
    const pendingApprovals =
      trips.filter((t: any) => t.status === "pending").length +
      experiences.filter((e: any) => e.status === "pending").length;

    // Pro subscribers
    const proSubscribers = users.filter((u: any) => {
      const hasActivePro =
        u.subscriptionTier === "pro" &&
        u.subscriptionHistory?.some(
          (s: any) =>
            s.status === "active" && new Date(s.endDate) > new Date()
        );
      return hasActivePro;
    }).length;

    // Recent activity (last 10 bookings)
    const recentBookings = bookings
      .sort(
        (a: any, b: any) =>
          new Date(b.bookingDate || 0).getTime() -
          new Date(a.bookingDate || 0).getTime()
      )
      .slice(0, 10)
      .map((b: any) => ({
        id: b.id,
        travelerName: b.travelerName,
        tripTitle: b.tripTitle,
        bookingDate: b.bookingDate,
        totalPrice: b.totalPrice,
      }));

    // Get referral stats
    const referralsSnapshot = await adminDb
      .collection("referrals")
      .get();
    const referrals = referralsSnapshot.docs.map((d) => d.data());
    const totalReferralBonus = referrals.reduce(
      (sum: number, r: any) => sum + (r.bonusAmount || 0),
      0
    );

    const stats = {
      totalRevenue,
      platformCommission,
      totalCashback,
      totalReferralBonus,
      totalReferrals: referrals.length,
      pendingApprovals,
      totalUsers: users.length,
      totalTrips: trips.filter((t: any) => t.status === "published").length,
      totalExperiences: experiences.filter(
        (e: any) => e.status === "published"
      ).length,
      proSubscribers,
    };

    return NextResponse.json(
      { stats, recentBookings },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get analytics error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

