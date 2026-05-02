import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
      name:{
      type:String,
      required: true,
      },
      
     
       email: {
        type: String,
        unique: true, 
        required: true,
        trim: true,
        lowercase: true
       } ,

        password: {
        type: String,
         required: function() { return this.authProvider === "local"; }
       } ,

       role: {
        type: String,
        enum: ["user", "admin", "doctor"],
        default: "user"
       },

       authProvider: {
        type: String,
        enum: ["local", "google"],
        default: "local"
       },

       googleId: {
        type: String,
        default: null
       },

       // Optional doctor profile fields (single User model for auth)
       specialization: {
        type: String,
        default: null
       },
       experience: {
        type: Number,
        default: null
       }
}, { timestamps: true })

const User = mongoose.model("User", UserSchema);
export default User;
