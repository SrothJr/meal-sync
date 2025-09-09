//packages
import bcrypt from "bcryptjs";
import crypto from "crypto";
//local
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import { generateVerificationTokenAndSetCookie } from "../utils/generateVerificationTokenAndSetCookie.js";
import { generateAdminTokenAndSetCookie } from "../utils/generateAdminTokenAndSetCookie.js";
import {
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetSuccessEmail,
} from "../mailtrap/emails.js";
import { User } from "../models/user.model.js";
import Admin from "../models/admin.model.js";

// SignUp
export const signup = async (req, res) => {
  const { email, password, name, area, role } = req.body;

  try {
    if (!email || !password || !name) {
      throw new Error("Name, Email, Password fields are required!");
    }
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationCode = generateVerificationCode();

    const user = new User({
      email,
      password: hashedPassword,
      name,
      area,
      role,
      verificationToken: verificationCode,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    await user.save();
    generateVerificationTokenAndSetCookie(res, user._id);
    //user created and token generated + Cookie set

    await sendVerificationEmail(user.email, user.name, user.verificationToken);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email Verification Successfull",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.error("Server Error", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User does not exist" });
    }

    // Check if the user is banned
    if (user.isBanned) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Your account has been suspended. Please contact support.",
        });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Wrong Password" });
    }

    generateVerificationTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.error("Error in login", error);
    res.status(400).json({ success: false, message: "Error in login" });
  }
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin account not found" });
    }

    // Plain text password comparison.
    const isPasswordValid = password === admin.password;

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Wrong Password" });
    }

    generateAdminTokenAndSetCookie(res, admin._id);

    res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Error in admin login", error);
    res.status(500).json({ success: false, message: "Error in admin login" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out Successfully" });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 60 * 60 * 1000; //1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    await sendResetPasswordEmail(
      user.email,
      user.name,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error("Error in forgotPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();

    await sendResetSuccessEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.error("Error in resetPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    let user;

    const { userId, role } = req.user;

    if (role === "admin") {
      const adminUser = await Admin.findById(userId).select("-password");

      if (adminUser) {
        user = { ...adminUser.toObject(), role: "admin" };
      }
    } else {
      user = await User.findById(userId).select("-password");
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error in checkAuth:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
