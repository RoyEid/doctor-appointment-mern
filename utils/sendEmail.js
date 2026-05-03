import { BrevoClient } from "@getbrevo/brevo";

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.error("EMAIL_UTILITY_ERROR: BREVO_API_KEY is missing");
      return;
    }

    if (!to) {
      console.warn("EMAIL_UTILITY_ERROR: missing recipient email");
      return;
    }

    console.log(`EMAIL_UTILITY_DEBUG: preparing email to ${to}`);

    const client = new BrevoClient({
      apiKey: process.env.BREVO_API_KEY,
    });

    const response = await client.transactionalEmails.sendTransacEmail({
      sender: {
        name: "MediCare Appointments",
        email: "doctor.appointment.notifications@gmail.com",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });

    console.log(`EMAIL_UTILITY_SENT: email sent to ${to}`);
    return response;
  } catch (error) {
    console.error(
      "EMAIL_UTILITY_ERROR:",
      error?.body?.message || error?.message || error
    );
  }
};

export default sendEmail;



