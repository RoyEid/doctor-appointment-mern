import express from "express";
const router = express.Router();
import User from "../models/UserSchema.js"
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
    const { credential } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub, email, name, picture } = payload;

        let user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Register new Google user
            user = await User.create({
                name,
                email: email.toLowerCase(),
                role: "user", // Google login restricted to normal users
                authProvider: "google",
                googleId: sub
            });
        } else {
            // Update googleId if not present (legacy user transitioning to Google)
            if (user.authProvider === "local") {
                // If local user exists, we allow them to log in with Google if emails match
                // Optionally update provider or just allow it
                user.googleId = sub;
                // We keep it as "local" or switch to "google"? 
                // Let's just allow it for now.
            }
            await user.save();
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.SECRET_KEY,
            { expiresIn: "1w" }
        );

        return res.status(200).json({
            message: "Google login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Google auth error:", error);
        return res.status(400).json({ message: "Google authentication failed" });
    }
});


router.post("/register", async (req,res)=>{
    const {name, email, password} = req.body
    if(!name || !email || !password)
         return res.status(400).json({ message: "All fields are required" });

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters and include uppercase, lowercase, and a number."
        });
    }

    const userExist = await User.findOne({email})
    if(userExist) return res.status(400).json({message:"User already exists"})

        const hashedPassword = await bcrypt.hash(password, 10)


        const newUser = await User.create({name,email, password: hashedPassword, role: "user" })

        const userRole = newUser.role || "user";
        let token = jwt.sign({email,id:newUser._id, role: userRole},process.env.SECRET_KEY,{expiresIn:"1w"})

        return res.status(201).json({message:"user registerd successfully", token, user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: userRole
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

        const authRole = user.role || "user";
        const token = jwt.sign({id:user._id,role: authRole},process.env.SECRET_KEY,{expiresIn:"1w"})

         return res.status(201).json({message:"user Logged In successfully", token,user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: authRole
        }})




    })


export default router;
