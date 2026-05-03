import * as Brevo from '@getbrevo/brevo';

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log(`EMAIL_UTILITY_DEBUG: preparing email to ${to}`);
    
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.sender = { name: "MediCare Appointments", email: "doctor.appointment.notifications@gmail.com" };
    sendSmtpEmail.to = [{ email: to }];

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log(`EMAIL_UTILITY_SENT: email sent to ${to}`);
    return data;
  } catch (error) {
    console.error(`EMAIL_UTILITY_ERROR: ${error.message || error}`);
    throw error;
  }
};

export default sendEmail;

