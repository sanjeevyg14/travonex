import Razorpay from "razorpay";

// Initialize Razorpay instance
export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

// Verify Razorpay signature
export function verifyRazorpaySignature(
    orderId: string,
    paymentId: string,
    signature: string
): boolean {
    const crypto = require("crypto");
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(text)
        .digest("hex");
    return generatedSignature === signature;
}

