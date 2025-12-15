import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local in the root directory
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import {
    initialTrips,
    initialUsers,
    initialExperiences,
    initialOrganizers,
    initialBookings,
    initialReviews,
    initialExperienceBookings,
    initialExperienceVendors,
    initialBlogStories,
    initialCoupons,
    initialWalletTransactions,
    initialReferrals,
    initialLeads,
    initialLeadPackages,
    initialFaqs,
    initialAuditLogs,
    initialTravelCities,
    initialTravelInterests,
    initialTripCategories,
    initialTripDifficulties,
} from "../lib/data";

async function seed() {
    console.log("🌱 Starting database seeding...\n");

    // Dynamically import adminDb
    const { adminDb } = await import("../lib/firebase/admin");

    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing.");
    }

    try {
        // 1. Seed Users
        console.log("📝 Seeding Users...");
        for (const user of initialUsers) {
            if (user.id) {
                await adminDb.collection("users").doc(user.id).set({
                    ...user,
                    createdAt: user.joinDate || new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }, { merge: true });
            }
        }
        console.log(`   ✅ Seeded ${initialUsers.length} users\n`);

        // 2. Seed Organizers
        console.log("📝 Seeding Organizers...");
        let organizerCount = 0;
        for (const [id, organizer] of Object.entries(initialOrganizers)) {
            await adminDb.collection("organizers").doc(id).set({
                ...organizer,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }, { merge: true });
            organizerCount++;
        }
        console.log(`   ✅ Seeded ${organizerCount} organizers\n`);

        // 3. Seed Experience Vendors
        console.log("📝 Seeding Experience Vendors...");
        let vendorCount = 0;
        for (const [id, vendor] of Object.entries(initialExperienceVendors)) {
            // Experience vendors are also stored in organizers collection with partnerType: 'experience'
            await adminDb.collection("organizers").doc(id).set({
                ...vendor,
                partnerType: 'experience',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }, { merge: true });
            vendorCount++;
        }
        console.log(`   ✅ Seeded ${vendorCount} experience vendors\n`);

        // 4. Seed Trips
        console.log("📝 Seeding Trips...");
        for (const trip of initialTrips) {
            await adminDb.collection("trips").doc(trip.id).set({
                ...trip,
                createdAt: (trip as any).createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }, { merge: true });
        }
        console.log(`   ✅ Seeded ${initialTrips.length} trips\n`);

        // 5. Seed Experiences
        console.log("📝 Seeding Experiences...");
        for (const exp of initialExperiences) {
            await adminDb.collection("experiences").doc(exp.id).set({
                ...exp,
                createdAt: (exp as any).createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }, { merge: true });
        }
        console.log(`   ✅ Seeded ${initialExperiences.length} experiences\n`);

        // 6. Seed Bookings
        console.log("📝 Seeding Bookings...");
        for (const booking of initialBookings) {
            await adminDb.collection("bookings").doc(booking.id).set({
                ...booking,
                createdAt: booking.bookingDate || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }, { merge: true });
        }
        console.log(`   ✅ Seeded ${initialBookings.length} bookings\n`);

        // 7. Seed Experience Bookings
        console.log("📝 Seeding Experience Bookings...");
        for (const booking of initialExperienceBookings) {
            await adminDb.collection("experience_bookings").doc(booking.id).set({
                ...booking,
                createdAt: booking.bookingDate || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }, { merge: true });
        }
        console.log(`   ✅ Seeded ${initialExperienceBookings.length} experience bookings\n`);

        // 8. Seed Reviews
        console.log("📝 Seeding Reviews...");
        for (const review of initialReviews) {
            const reviewId = review.id || `review_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            await adminDb.collection("reviews").doc(reviewId).set({
                ...review,
                id: reviewId,
                createdAt: (review as any).createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }, { merge: true });
        }
        console.log(`   ✅ Seeded ${initialReviews.length} reviews\n`);

        // 9. Seed Coupons
        console.log("📝 Seeding Coupons...");
        for (const coupon of initialCoupons) {
            await adminDb.collection("coupons").doc(coupon.id).set({
                ...coupon,
                createdAt: (coupon as any).createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }, { merge: true });
        }
        console.log(`   ✅ Seeded ${initialCoupons.length} coupons\n`);

        // 10. Seed Wallet Transactions
        console.log("📝 Seeding Wallet Transactions...");
        for (const transaction of initialWalletTransactions) {
            const txId = transaction.id || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            await adminDb.collection("wallet_transactions").doc(txId).set({
                ...transaction,
                id: txId,
                createdAt: (transaction as any).timestamp || transaction.date || new Date().toISOString(),
            }, { merge: true });
        }
        console.log(`   ✅ Seeded ${initialWalletTransactions.length} wallet transactions\n`);

        // 11. Seed Referrals
        console.log("📝 Seeding Referrals...");
        for (const referral of initialReferrals) {
            const refId = referral.id || `ref_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            await adminDb.collection("referrals").doc(refId).set({
                ...referral,
                id: refId,
                createdAt: referral.date || new Date().toISOString(),
            }, { merge: true });
        }
        console.log(`   ✅ Seeded ${initialReferrals.length} referrals\n`);

        // 12. Seed Leads
        console.log("📝 Seeding Leads...");
        for (const lead of initialLeads) {
            await adminDb.collection("leads").doc(lead.id).set({
                ...lead,
                createdAt: lead.date || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }, { merge: true });
        }
        console.log(`   ✅ Seeded ${initialLeads.length} leads\n`);

        // 13. Seed Lead Packages
        console.log("📝 Seeding Lead Packages...");
        for (const pkg of initialLeadPackages) {
            await adminDb.collection("lead_packages").doc(pkg.id).set({
                ...pkg,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }, { merge: true });
        }
        console.log(`   ✅ Seeded ${initialLeadPackages.length} lead packages\n`);

        // 14. Seed FAQs
        console.log("📝 Seeding FAQs...");
        for (const faq of initialFaqs) {
            const faqId = faq.id || `faq_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            await adminDb.collection("faqs").doc(faqId).set({
                ...faq,
                id: faqId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }, { merge: true });
        }
        console.log(`   ✅ Seeded ${initialFaqs.length} FAQs\n`);

        // 15. Seed Blog Stories
        console.log("📝 Seeding Blog Stories...");
        for (const story of initialBlogStories) {
            await adminDb.collection("blog_stories").doc(story.id).set({
                ...story,
                createdAt: story.date || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }, { merge: true });
        }
        console.log(`   ✅ Seeded ${initialBlogStories.length} blog stories\n`);

        // 16. Seed Audit Logs
        console.log("📝 Seeding Audit Logs...");
        for (const log of initialAuditLogs) {
            const logId = log.id || `audit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            await adminDb.collection("audit_logs").doc(logId).set({
                ...log,
                id: logId,
                createdAt: log.timestamp || new Date().toISOString(),
            }, { merge: true });
        }
        console.log(`   ✅ Seeded ${initialAuditLogs.length} audit logs\n`);

        // 17. Seed Platform Settings
        console.log("📝 Seeding Platform Settings...");
        const settingsDoc = {
            commissionRate: 10,
            referralBonusAmount: 100,
            proSubscriptionMonthlyPrice: 599,
            proSubscriptionAnnualPrice: 5998,
            spotReservationPercentage: 10,
            balanceDueDays: 20,
            travelCities: initialTravelCities,
            travelInterests: initialTravelInterests,
            tripCategories: initialTripCategories,
            tripDifficulties: initialTripDifficulties,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        await adminDb.collection("settings").doc("platform").set(settingsDoc, { merge: true });
        console.log(`   ✅ Seeded platform settings\n`);

        console.log("\n🎉 Database seeding completed successfully!");
        console.log("\n📊 Summary:");
        console.log(`   - Users: ${initialUsers.length}`);
        console.log(`   - Organizers: ${organizerCount}`);
        console.log(`   - Experience Vendors: ${vendorCount}`);
        console.log(`   - Trips: ${initialTrips.length}`);
        console.log(`   - Experiences: ${initialExperiences.length}`);
        console.log(`   - Bookings: ${initialBookings.length}`);
        console.log(`   - Experience Bookings: ${initialExperienceBookings.length}`);
        console.log(`   - Reviews: ${initialReviews.length}`);
        console.log(`   - Coupons: ${initialCoupons.length}`);
        console.log(`   - Wallet Transactions: ${initialWalletTransactions.length}`);
        console.log(`   - Referrals: ${initialReferrals.length}`);
        console.log(`   - Leads: ${initialLeads.length}`);
        console.log(`   - Lead Packages: ${initialLeadPackages.length}`);
        console.log(`   - FAQs: ${initialFaqs.length}`);
        console.log(`   - Blog Stories: ${initialBlogStories.length}`);
        console.log(`   - Audit Logs: ${initialAuditLogs.length}`);
        console.log(`   - Platform Settings: 1\n`);

    } catch (error) {
        console.error("❌ Error seeding database:", error);
        throw error;
    }

    process.exit(0);
}

seed().catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
});

