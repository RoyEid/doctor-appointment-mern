import express from "express";
const router = express.Router();
import User from "../models/UserSchema.js"
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';


router.post("/register", async (req,res)=>{
    const {name, email, password,role = "user"} = req.body
    if(!name || !email || !password)
         return res.status(400).json({ message: "All fields are required" });

    const userExist = await User.findOne({email})
    if(userExist) return res.status(400).json({message:"User already exists"})

        const hashedPassword = await bcrypt.hash(password, 10)


        const newUser = await User.create({name,email, password: hashedPassword,role  })

        let token = jwt.sign({email,id:newUser._id, role: newUser.role},process.env.SECRET_KEY,{expiresIn:"1w"})

        return res.status(201).json({message:"user registerd successfully", token, user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        }})



})

    router.post ("/signin", async(req,res)=> {
     const { email, password } = req.body;
     if(!email || ! password)
    return res.status(400).json({ message: "Email and password are required" });

     const user = await User.findOne({email})
     if(!user) return res.status(400).json({ message: "invalid credentials" });

     const match = await bcrypt.compare(password,user.password)
     if(!match) return res.status(400).json({message:"Password is Not Correct"})

        const token = jwt.sign({id:user._id,role: user.role},process.env.SECRET_KEY,{expiresIn:"1w"})

         return res.status(201).json({message:"user Logged In successfully", token,user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }})




    })


export default router;
