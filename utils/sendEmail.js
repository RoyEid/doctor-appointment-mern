import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log(`EMAIL_UTILITY_DEBUG: preparing email to ${to} via Resend`);
    
    const { data, error } = await resend.emails.send({
      from: 'MediCare Appointments <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error("RESEND_ERROR:", error.message);
      throw new Error(error.message);
    }

    console.log(`EMAIL_UTILITY_SENT: email sent to ${to}, id: ${data.id}`);
    return data;
  } catch (error) {
    console.error("EMAIL_UTILITY_ERROR:", error.message);
    throw error;
  }
};

export default sendEmail;
