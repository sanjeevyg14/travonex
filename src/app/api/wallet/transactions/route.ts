import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/verify-session";
import { FieldValue } from "firebase-admin/firestore";
import type { WalletTransaction } from "@/lib/types";
import { z } from "zod";

const createTransactionSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["credit", "debit"]),
});

// GET /api/wallet/transactions - Get wallet transactions
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifySession();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    const snapshot = await adminDb
      .collection("wallet_transactions")
      .where("userId", "==", user.uid)
      .orderBy("date", "desc")
      .get();

    const transactions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get current wallet balance
    const userDoc = await adminDb.collection("users").doc(user.uid).get();
    const walletBalance = userDoc.data()?.walletBalance || 0;

    return NextResponse.json(
      { transactions, walletBalance },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get wallet transactions error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

// POST /api/wallet/transactions - Create wallet transaction (admin/system only)
// Note: This should typically be called server-side only
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifySession();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await req.json();
    const result = createTransactionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { amount, description, type } = result.data;
    const { user } = authResult;

    // Update user wallet balance
    const userRef = adminDb.collection("users").doc(user.uid);
    const updateAmount = type === "credit" ? amount : -amount;

    await userRef.update({
      walletBalance: FieldValue.increment(updateAmount),
    });

    // Create transaction record
    const transaction: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId: user.uid,
      date: new Date().toISOString(),
      description,
      amount: type === "credit" ? amount : -amount,
      type,
    };

    const transactionRef = adminDb
      .collection("wallet_transactions")
      .doc(transaction.id);
    await transactionRef.set(transaction);

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error: any) {
    console.error("Create transaction error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create transaction" },
      { status: 500 }
    );
  }
}

