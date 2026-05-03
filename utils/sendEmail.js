import SibApiV3Sdk from '@getbrevo/brevo';

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.BREVO_API_KEY) {
    console.error("EMAIL_UTILITY_ERROR: BREVO_API_KEY is missing");
    return;
  }

  try {
    console.log(`EMAIL_UTILITY_DEBUG: preparing email to ${to}`);
    
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.sender = { 
      name: "MediCare Appointments", 
      email: "doctor.appointment.notifications@gmail.com" 
    };
    sendSmtpEmail.to = [{ email: to }];

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log(`EMAIL_UTILITY_SENT: email sent to ${to}`);
    return data;
  } catch (error) {
    console.error(`EMAIL_UTILITY_ERROR: ${error.message || error}`);
  }
};

export default sendEmail;


