import { brevoClient } from "@/lib/brevo";
import { SendSmtpEmail } from "@getbrevo/brevo";

export const notificationService = {
    async sendWelcomeEmail(email: string, name: string) {
        if (!process.env.BREVO_API_KEY) {
            console.warn("BREVO_API_KEY missing, skipping email.");
            return;
        }

        const sendSmtpEmail = new SendSmtpEmail();
        sendSmtpEmail.subject = "Welcome to Travonex!";
        sendSmtpEmail.htmlContent = `<html><body><h1>Welcome, ${name}!</h1><p>We are excited to have you on board.</p></body></html>`;
        sendSmtpEmail.sender = { "name": "Travonex Team", "email": "no-reply@travonex.com" };
        sendSmtpEmail.to = [{ "email": email, "name": name }];

        try {
            await brevoClient.sendTransacEmail(sendSmtpEmail);
        } catch (error) {
            console.error("Failed to send welcome email:", error);
        }
    },

    async sendBookingConfirmation(email: string, name: string, tripTitle: string, bookingId: string) {
        if (!process.env.BREVO_API_KEY) return;

        const sendSmtpEmail = new SendSmtpEmail();
        sendSmtpEmail.subject = `Booking Confirmed: ${tripTitle}`;
        sendSmtpEmail.htmlContent = `<html><body><h1>Booking Confirmed!</h1><p>Hi ${name}, your booking for <strong>${tripTitle}</strong> (ID: ${bookingId}) is confirmed.</p></body></html>`;
        sendSmtpEmail.sender = { "name": "Travonex Team", "email": "bookings@travonex.com" };
        sendSmtpEmail.to = [{ "email": email, "name": name }];

        try {
            await brevoClient.sendTransacEmail(sendSmtpEmail);
        } catch (error) {
            console.error("Failed to send booking confirmation email:", error);
        }
    }
};
