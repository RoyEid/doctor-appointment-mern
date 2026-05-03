import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"MediCare Appointments" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("EMAIL_SENT:", info.messageId);
    return info;
  } catch (error) {
    console.error("EMAIL_UTILITY_ERROR:", error.message);
    throw error;
  }
};

export default sendEmail;
