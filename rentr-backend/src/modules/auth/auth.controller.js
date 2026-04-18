const User = require("../user/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Reusable email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // 🔐 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Generate token immediately so user is auto-logged in after signup
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const login = async (req, res)=>{
  try{
      const {email,password} =req.body;
  
    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 1. check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    // 2. compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password"
      });
    }

     // 🔑 generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 3. success
    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Step 1: User requests a password reset
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });

    // Always return the same response — don't reveal if email exists or not
    if (!user) {
      return res.json({ success: true, message: "If that email exists, a reset link has been sent" });
    }

    // Generate a random 32-byte token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store hashed version in DB (never store raw token)
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // The reset link the mobile app will deep-link into
    const resetLink = `${process.env.APP_DEEP_LINK}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: `"Rentr App" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Reset your Rentr password</h2>
        <p>Click the link below. It expires in 10 minutes.</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });

    res.json({ success: true, message: "If that email exists, a reset link has been sent" });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Step 2: User submits new password using the token from the email link
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Token and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    // Hash the incoming token to compare with the stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // token must not be expired
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    // Update password and clear reset fields
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ success: true, message: "Password reset successful. You can now log in." });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { signup, login, forgotPassword, resetPassword };