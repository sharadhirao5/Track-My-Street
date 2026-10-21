
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =====================================================
// REGISTER USER
// Public registration supports citizen accounts.
// Admin registration requires a server-side secret.
// =====================================================

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      adminRegistrationSecret,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    if (typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({
        message: "Name must contain at least 2 characters.",
      });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({
        message: "Name cannot exceed 100 characters.",
      });
    }

    if (typeof email !== "string") {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    let normalizedPhone = "";

    if (phone !== undefined && phone !== null) {
      normalizedPhone = String(phone).trim();

      if (
        normalizedPhone !== "" &&
        !/^[0-9]{10}$/.test(normalizedPhone)
      ) {
        return res.status(400).json({
          message: "Phone number must contain exactly 10 digits.",
        });
      }
    }

    if (
      typeof password !== "string" ||
      password.length < 6 ||
      password.length > 100
    ) {
      return res.status(400).json({
        message: "Password must contain between 6 and 100 characters.",
      });
    }

    const requestedRole = role || "citizen";

    if (!["citizen", "admin"].includes(requestedRole)) {
      return res.status(400).json({
        message: "Invalid account role.",
      });
    }

    // Admin registration must be authorized by the backend.
    if (requestedRole === "admin") {
      const configuredSecret =
        process.env.ADMIN_REGISTRATION_SECRET;

      if (
        !configuredSecret ||
        typeof adminRegistrationSecret !== "string" ||
        adminRegistrationSecret.length === 0 ||
        adminRegistrationSecret !== configuredSecret
      ) {
        return res.status(403).json({
          message:
            "Administrator registration is not authorized. " +
            "Check the authorization code or contact the system administrator.",
        });
      }
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      role: requestedRole,
    });

    return res.status(201).json({
      message: "User Registered Successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email is already registered.",
      });
    }

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// =====================================================
// LOGIN USER
// =====================================================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and Password are required.",
      });
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        message: "Invalid login details.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid Email or Password.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Email or Password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from backend/.env");

      return res.status(500).json({
        message: "Server configuration error.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// =====================================================
// GET LOGGED-IN USER PROFILE
// =====================================================

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// =====================================================
// EXPORT CONTROLLER FUNCTIONS
// =====================================================

module.exports = {
  registerUser,
  loginUser,
  getProfile,
};
