import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
    user : {
        
     type: mongoose.Schema.Types.ObjectId,ref:"User"
    },

    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    doctor :{
         type: mongoose.Schema.Types.ObjectId,ref:"Doctor"
    },

    date:Date,
    time:String,

    reason: String,

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

const Appointment = mongoose.model("Appointment", AppointmentSchema);
export default Appointment;
