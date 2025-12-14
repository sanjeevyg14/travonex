
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { type NextRequest, NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

const signupSchema = z.object({
    idToken: z.string().min(1, "ID Token is required"),
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name too long"),
    referralCode: z.string().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const result = signupSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
        }

        const { idToken, name, referralCode } = result.data;

        // 1. Verify User via Firebase Admin
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const phone = decodedToken.phone_number || "";

        // 2. Check if User already exists in Firestore
        const userRef = adminDb.collection("users").doc(uid);
        const userSnap = await userRef.get();

        if (userSnap.exists) {
            return NextResponse.json({ user: userSnap.data() }, { status: 200 });
        }

        // 3. Generate new Referral Code
        const cleanName = name.replace(/[^a-zA-Z]/g, "").toUpperCase().substring(0, 4) || "TRAV";
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const myReferralCode = `${cleanName}${randomSuffix}`;

        // 4. Prepare New User Object
        const newUser = {
            id: uid,
            phone: phone,
            name: name,
            email: "",
            role: "traveler",
            status: "active",
            joinDate: new Date().toISOString(),
            walletBalance: 0,
            myReferralCode: myReferralCode,
            redeemedReferralCode: null as string | null,
        };

        // 5. Handle Referral Logic Transactionally
        await adminDb.runTransaction(async (t) => {
            let bonusAmount = 0;
            let referrerId = null;

            if (referralCode) {
                const referrerQuery = await t.get(adminDb.collection("users").where("myReferralCode", "==", referralCode).limit(1));

                if (!referrerQuery.empty) {
                    const referrerDoc = referrerQuery.docs[0];
                    referrerId = referrerDoc.id;
                    bonusAmount = 100;

                    t.update(referrerDoc.ref, {
                        walletBalance: FieldValue.increment(100)
                    });

                    const referrerTxRef = adminDb.collection("wallet_transactions").doc();
                    t.set(referrerTxRef, {
                        userId: referrerId,
                        amount: 100,
                        type: "credit",
                        description: `Referral Bonus for inviting ${name}`,
                        date: new Date().toISOString(),
                        relatedUserId: uid
                    });
                }
            }

            newUser.walletBalance = bonusAmount;
            if (referrerId) {
                newUser.redeemedReferralCode = referralCode;
            }

            t.set(userRef, newUser);

            if (bonusAmount > 0) {
                const userTxRef = adminDb.collection("wallet_transactions").doc();
                t.set(userTxRef, {
                    userId: uid,
                    amount: bonusAmount,
                    type: "credit",
                    description: `Signup Bonus (Referred by ${referralCode})`,
                    date: new Date().toISOString(),
                    relatedUserId: referrerId
                });
            }
        });

        return NextResponse.json({ user: newUser }, { status: 201 });

    } catch (error: any) {
        console.error("Signup API Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
