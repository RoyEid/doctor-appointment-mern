import Doctor from "../models/DoctorSchema.js";

export const getDoctorProfileForUser = async (userId) => {
    if (!userId) return null;
    return Doctor.findOne({ userId });
};
