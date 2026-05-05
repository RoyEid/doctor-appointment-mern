import express from "express";
import User from "../models/UserSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import auth from "../auth/Middleware.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role || "user",
        },
        process.env.SECRET_KEY,
        { expiresIn: "1w" }
    );
};

const createVerificationToken = () => {
    return crypto.randomBytes(32).toString("hex");
};

const getBackendUrl = () => {
    return process.env.BACKEND_URL || "http://localhost:10000";
};

const getFrontendUrl = () => {
    return process.env.FRONTEND_URL || "http://localhost:3000";
};

const sendVerificationEmail = async (user) => {
    const verificationToken = createVerificationToken();

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 1000 * 60 * 60 * 24; // 24 hours

    await user.save();

    const verifyUrl = `${getBackendUrl()}/user/verify-email/${verificationToken}`;

    await sendEmail({
        to: user.email,
        subject: "Verify your MediCare email",
        html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 520px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
        <div style="background: #f8fcfd; padding: 20px; border-bottom: 3px solid #008e9b;">
          <h2 style="margin: 0; color: #008e9b;">Verify your MediCare account</h2>
        </div>

        <div style="padding: 22px;">
          <p>Hello <strong>${user.name || "there"}</strong>,</p>

          <p>
            Please confirm your email address before logging in and booking appointments.
          </p>

          <p style="margin: 24px 0;">
            <a href="${verifyUrl}" style="background: #008e9b; color: white; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Verify Email
            </a>
          </p>

          <p style="font-size: 13px; color: #666;">
            This link expires in 24 hours.
          </p>

          <p style="font-size: 13px; color: #666;">
            If you did not create this account, you can ignore this email.
          </p>

          <p>
            Thank you,<br />
            <strong>MediCare Team</strong>
          </p>
        </div>
      </div>
    `,
    });
};

/**
 * Google login/register
 * Google accounts are considered verified because Google already verifies ownership.
 */
router.post("/google", async (req, res) => {
    const { credential } = req.body;

    try {
        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Google credential is required.",
            });
        }

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub, email, name } = payload;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Google account email is missing.",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        let user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            user = await User.create({
                name: name || normalizedEmail.split("@")[0],
                email: normalizedEmail,
                role: "user",
                authProvider: "google",
                googleId: sub,
                isEmailVerified: true,
                emailVerificationToken: null,
                emailVerificationExpires: null,
            });
        } else {
            user.googleId = sub;
            user.isEmailVerified = true;
            user.emailVerificationToken = null;
            user.emailVerificationExpires = null;

            if (!user.authProvider) {
                user.authProvider = "local";
            }

            await user.save();
        }

        const token = createToken(user);

        return res.status(200).json({
            success: true,
            message: "Google login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
            },
        });
    } catch (error) {
        console.error("GOOGLE_AUTH_ERROR:", error.message);

        return res.status(400).json({
            success: false,
            message: "Google authentication failed. Please try again.",
        });
    }
});

/**
 * Normal email/password register
 * User is created as unverified.
 * Verification email is sent.
 */
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address.",
            });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 8 characters and include uppercase, lowercase, and a number.",
            });
        }

        const userExist = await User.findOne({ email: normalizedEmail });

        if (userExist) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: "user",
            authProvider: "local",
            isEmailVerified: false,
        });

        try {
            await sendVerificationEmail(newUser);
            console.log(`EMAIL_SENT: verification email sent to ${newUser.email}`);
        } catch (emailError) {
            console.error("EMAIL_ERROR: verification email", emailError.message);
        }

        return res.status(201).json({
            success: true,
            message:
                "Account created successfully. Please check your email to verify your account before logging in.",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                isEmailVerified: newUser.isEmailVerified,
            },
        });
    } catch (error) {
        console.error("REGISTER_ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error during registration.",
        });
    }
});

/**
 * Verify email link
 * User clicks link from email.
 */
router.get("/verify-email/:token", async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.redirect(`${getFrontendUrl()}/login?verified=false`);
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;

        await user.save();

        return res.redirect(`${getFrontendUrl()}/login?verified=true`);
    } catch (error) {
        console.error("EMAIL_VERIFY_ERROR:", error);

        return res.redirect(`${getFrontendUrl()}/login?verified=false`);
    }
});

/**
 * Protected resend verification email
 * Works only if the user is already logged in.
 */
router.post("/resend-verification", auth(), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified.",
            });
        }

        await sendVerificationEmail(user);

        return res.status(200).json({
            success: true,
            message: "Verification email sent. Please check your inbox.",
        });
    } catch (error) {
        console.error("RESEND_VERIFICATION_ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Could not resend verification email.",
        });
    }
});

/**
 * Public resend verification email
 * Used when user cannot log in because email is not verified.
 */
router.post("/resend-verification-public", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email address.",
            });
        }

        if (user.authProvider === "google" && !user.password) {
            return res.status(400).json({
                success: false,
                message: "This account uses Google login and does not need email verification.",
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified. You can log in now.",
            });
        }

        await sendVerificationEmail(user);

        return res.status(200).json({
            success: true,
            message: "Verification email sent. Please check your inbox.",
        });
    } catch (error) {
        console.error("PUBLIC_RESEND_VERIFICATION_ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Could not resend verification email.",
        });
    }
});

/**
 * Normal email/password login
 * Workflow B:
 * Register -> verify email -> login -> book appointment
 */
router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        if (user.authProvider === "google" && !user.password) {
            return res.status(400).json({
                success: false,
                message: "This account uses Google login. Please continue with Google.",
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({
                success: false,
                message: "Password is not correct",
            });
        }

        if (user.authProvider === "local" && !user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Email verification required. Please verify your email before logging in.",
                code: "EMAIL_NOT_VERIFIED",
            });
        }

        const token = createToken(user);

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || "user",
                isEmailVerified: user.isEmailVerified,
            },
        });
    } catch (error) {
        console.error("SIGNIN_ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error during login.",
        });
    }
});

export default router;