import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema({
     name: String,
  specialty: String,
  image: String,
  description: String,
  experienceYears: Number,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  availableSlots: {
    type: [String],
    default: []
  }
})



const Doctor = mongoose.model("Doctor", DoctorSchema);
export default Doctor;
