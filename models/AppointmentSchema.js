import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
    {
        // Owner user / patient
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Assigned doctor account: User._id where role = doctor
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Legacy doctor profile reference: Doctor._id
        // Kept because your frontend uses doctor profile data like name/image/specialty.
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
        },

        // Appointment date.
        // Important: in the route, we should save this normalized to the selected day.
        date: {
            type: Date,
            required: true,
        },

        // Appointment time as 30-minute slot string, example: "09:00", "09:30", "13:00"
        time: {
            type: String,
            required: true,
            trim: true,
        },

        reason: {
            type: String,
            trim: true,
            default: "",
        },

        // Used when doctor proposes a reschedule
        oldDate: {
            type: Date,
            default: null,
        },

        oldTime: {
            type: String,
            default: null,
        },

        status: {
            type: String,
            enum: [
                "pending",
                "approved",
                "rejected",
                "cancelled",
                "completed",
                "reschedule_pending",
            ],
            default: "pending",
        },

        // Email reminder system
        // This becomes true after the system sends the 24-hour reminder email.
        reminderSent: {
            type: Boolean,
            default: false,
        },

        // Stores when the reminder email was sent.
        reminderSentAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

/*
  Prevent double booking.

  Same doctor + same date + same time cannot be booked twice
  when the appointment is active.

  These statuses block the slot:
  - pending
  - approved
  - reschedule_pending

  These statuses do NOT block the slot:
  - rejected
  - cancelled
  - completed
*/
AppointmentSchema.index(
    { doctorId: 1, date: 1, time: 1 },
    {
        unique: true,
        partialFilterExpression: {
            status: { $in: ["pending", "approved", "reschedule_pending"] },
        },
    }
);

const Appointment = mongoose.model("Appointment", AppointmentSchema);

export default Appointment;