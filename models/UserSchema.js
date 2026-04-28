import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
      name:{
      type:String,
      required: true,
      },
      
     
       email: {
        type: String,
        uniqe:true, 
        required: true,
       } ,

        password: {
        type: String,
         required: true,
      
       } ,

       role : {
        type:String,
        default:"user"
       }
})

const User = mongoose.model("User", UserSchema);
export default User;
