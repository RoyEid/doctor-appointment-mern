import nodemailer from "nodemailer";
import dns from "dns";

// Force IPv4 for DNS resolution to avoid Render IPv6 connection issues
dns.setDefaultResultOrder("ipv4first");

const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log(`EMAIL_UTILITY_DEBUG: preparing email to ${to}`);
    
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      family: 4, // Force IPv4 to avoid Render connection issues
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    const mailOptions = {
      from: `"MediCare Appointments" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`EMAIL_UTILITY_SENT: email sent to ${to}`);
    return info;
  } catch (error) {
    console.error("EMAIL_UTILITY_ERROR:", error.message);
    throw error;
  }
};

export default sendEmail;
