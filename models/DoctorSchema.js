import mongoose from "mongoose";

const DEFAULT_AVAILABLE_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

const DoctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    specialty: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    experienceYears: {
      type: Number,
      default: 0,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // 30-minute appointment slots.
    // These are the doctor's normal working slots.
    // Booked slots are blocked by AppointmentSchema + appointment routes.
    availableSlots: {
      type: [String],
      default: DEFAULT_AVAILABLE_SLOTS,
    },
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", DoctorSchema);

export default Doctor;