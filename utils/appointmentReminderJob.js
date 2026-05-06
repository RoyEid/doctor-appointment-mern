import Appointment from "../models/AppointmentSchema.js";
import sendEmail from "./sendEmail.js";

const formatDoctorName = (name) => {
  if (!name) return "N/A";

  const cleanName = name.trim();
  const lower = cleanName.toLowerCase();

  if (
    lower.startsWith("dr.") ||
    lower.startsWith("dr ") ||
    lower.startsWith("doctor")
  ) {
    return cleanName;
  }

  return `Dr. ${cleanName}`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (time) => {
  if (!time) return "N/A";

  try {
    if (time.includes("AM") || time.includes("PM")) return time;

    const [hours, minutes] = time.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHours = h % 12 || 12;

    return `${formattedHours}:${minutes} ${ampm}`;
  } catch (error) {
    return time;
  }
};

const getAppointmentDateTime = (date, time) => {
  const appointmentDate = new Date(date);

  if (!time || Number.isNaN(appointmentDate.getTime())) {
    return null;
  }

  const [hours, minutes] = time.split(":");

  appointmentDate.setHours(Number(hours), Number(minutes), 0, 0);

  return appointmentDate;
};

const getReminderEmailHtml = ({
  patientName,
  doctorName,
  date,
  time,
}) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 500px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #f8fcfd; padding: 20px; border-bottom: 2px solid #008e9b;">
        <h2 style="color: #008e9b; margin: 0;">Appointment Reminder</h2>
      </div>

      <div style="padding: 20px;">
        <p>Hello <strong>${patientName}</strong>,</p>

        <p style="line-height: 1.5;">
          This is a reminder that your appointment is scheduled within the next 24 hours.
        </p>

        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Doctor:</strong> ${doctorName}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
        </div>

        <p style="line-height: 1.5;">
          Please arrive 10 minutes early.
        </p>

        <p>Thank you,<br/><strong>MediCare Team</strong></p>
      </div>
    </div>
  `;
};

export const sendAppointmentReminders = async () => {
  try {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const appointments = await Appointment.find({
      status: "approved",
      reminderSent: false,
    })
      .populate("user", "name email")
      .populate("doctor");

    const appointmentsToRemind = appointments.filter((appointment) => {
      const appointmentDateTime = getAppointmentDateTime(
        appointment.date,
        appointment.time
      );

      if (!appointmentDateTime) return false;

      return appointmentDateTime > now && appointmentDateTime <= next24Hours;
    });

    for (const appointment of appointmentsToRemind) {
      const patientEmail = appointment.user?.email;

      if (!patientEmail) continue;

      const patientName = appointment.user?.name || "Patient";
      const doctorName = formatDoctorName(appointment.doctor?.name);
      const formattedDate = formatDate(appointment.date);
      const formattedTime = formatTime(appointment.time);

      await sendEmail({
        to: patientEmail,
        subject: `Appointment Reminder - ${doctorName} - ${formattedDate}`,
        html: getReminderEmailHtml({
          patientName,
          doctorName,
          date: formattedDate,
          time: formattedTime,
        }),
      });

      appointment.reminderSent = true;
      appointment.reminderSentAt = new Date();

      await appointment.save();

      console.log(
        `REMINDER_SENT: Appointment ${appointment._id} reminder sent to ${patientEmail}`
      );
    }
  } catch (error) {
    console.error("APPOINTMENT_REMINDER_JOB_ERROR:", error);
  }
};

export const startAppointmentReminderJob = () => {
  console.log("APPOINTMENT_REMINDER_JOB_STARTED");

  sendAppointmentReminders();

  setInterval(() => {
    sendAppointmentReminders();
  }, 30 * 60 * 1000);
};