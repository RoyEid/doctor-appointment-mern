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

const createPasswordResetToken = () => {
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
    user.emailVerificationExpires = Date.now() + 1000 * 60 * 60 * 24;

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

const sendPasswordResetEmail = async (user) => {
    const resetToken = createPasswordResetToken();

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 1000 * 60 * 30;

    await user.save();

    const resetUrl = `${getFrontendUrl()}/reset-password/${resetToken}`;

    await sendEmail({
        to: user.email,
        subject: "Reset your MediCare password",
        html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 560px; margin: auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden;">
        <div style="background: #f8fcfd; padding: 22px; border-bottom: 3px solid #008e9b;">
          <h2 style="margin: 0; color: #008e9b;">Reset your MediCare password</h2>
        </div>

        <div style="padding: 24px;">
          <p>Hello <strong>${user.name || "there"}</strong>,</p>

          <p>
            We received a request to reset the password for your MediCare account.
          </p>

          <p style="margin: 24px 0;">
            <a href="${resetUrl}" style="background: #008e9b; color: white; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </p>

          <div style="background: #eefbfc; border-left: 4px solid #008e9b; padding: 12px 14px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.6;">
              <strong>Important:</strong> If you requested multiple reset emails, only the newest reset link will work.
            </p>
          </div>

          <p style="font-size: 13px; color: #666;">
            This link expires in 30 minutes.
          </p>

          <p style="font-size: 13px; color: #666;">
            If you did not request a password reset, you can safely ignore this email.
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
                passwordResetToken: null,
                passwordResetExpires: null,
                passwordChangedAt: null,
            });
        } else {
            user.googleId = sub;
            user.isEmailVerified = true;
            user.emailVerificationToken = null;
            user.emailVerificationExpires = null;
            user.passwordResetToken = null;
            user.passwordResetExpires = null;

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
            passwordResetToken: null,
            passwordResetExpires: null,
            passwordChangedAt: null,
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
 * Forgot password
 */
router.post("/forgot-password", async (req, res) => {
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
                message:
                    "This account uses Google login. Please continue with Google instead.",
            });
        }

        const resetRequestedAt = new Date();

        await sendPasswordResetEmail(user);

        return res.status(200).json({
            success: true,
            message: "Password reset email sent. Please check your inbox.",
            resetRequestedAt: resetRequestedAt.toISOString(),
        });
    } catch (error) {
        console.error("FORGOT_PASSWORD_ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Could not send password reset email.",
        });
    }
});

/**
 * Reset password
 */
router.put("/reset-password/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Reset token is required.",
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "New password is required.",
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

        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Reset link is invalid or expired.",
            });
        }

        const isSamePassword = await bcrypt.compare(password, user.password);

        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from your current password.",
            });
        }

        user.password = await bcrypt.hash(password, 10);
        user.authProvider = "local";
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        user.passwordChangedAt = new Date();

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully. You can now log in.",
        });
    } catch (error) {
        console.error("RESET_PASSWORD_ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Could not reset password.",
        });
    }
});

/**
 * Verify email link
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
                message:
                    "This account uses Google login and does not need email verification.",
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
 * Check verification status
 * This is used by the laptop browser while the user verifies from phone.
 */
router.post("/check-verification-status", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
                isEmailVerified: false,
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email address.",
                isEmailVerified: false,
            });
        }

        return res.status(200).json({
            success: true,
            isEmailVerified: user.isEmailVerified,
            message: user.isEmailVerified
                ? "Email is verified."
                : "Email is not verified yet.",
        });
    } catch (error) {
        console.error("CHECK_VERIFICATION_STATUS_ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Could not check verification status.",
            isEmailVerified: false,
        });
    }
});

/**
 * Check password reset status
 * This lets the laptop browser detect when the password was reset from phone.
 */
router.post("/check-password-reset-status", async (req, res) => {
    try {
        const { email, resetRequestedAt } = req.body;

        if (!email || !resetRequestedAt) {
            return res.status(400).json({
                success: false,
                message: "Email and reset request time are required.",
                passwordResetCompleted: false,
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email address.",
                passwordResetCompleted: false,
            });
        }

        const requestTime = new Date(resetRequestedAt).getTime();
        const passwordChangedTime = user.passwordChangedAt
            ? new Date(user.passwordChangedAt).getTime()
            : 0;

        const passwordResetCompleted = passwordChangedTime > requestTime;

        return res.status(200).json({
            success: true,
            passwordResetCompleted,
            message: passwordResetCompleted
                ? "Password has been reset."
                : "Password has not been reset yet.",
        });
    } catch (error) {
        console.error("CHECK_PASSWORD_RESET_STATUS_ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Could not check password reset status.",
            passwordResetCompleted: false,
        });
    }
});

/**
 * Normal email/password login
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
                message:
                    "Email verification required. Please verify your email before logging in.",
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