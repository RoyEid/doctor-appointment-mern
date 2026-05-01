import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
    // Owner (user/patient)
    user : {
     type: mongoose.Schema.Types.ObjectId,
     ref:"User",
     required: true
    },

    // Assigned doctor (User._id with role=doctor)
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Legacy doctor profile reference (Doctor._id) kept for population in UI
    doctor :{
         type: mongoose.Schema.Types.ObjectId,
         ref:"Doctor"
    },

    date: { type: Date, required: true },
    time: { type: String, required: true },

    reason: String,

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
        default: 'pending'
    }
}, { timestamps: true });

const Appointment = mongoose.model("Appointment", AppointmentSchema);
export default Appointment;
