```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Authority = require("../models/Authority");

const createAuthorityAccount = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      department,
      area,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !department ||
      !area
    ) {
      return res.status(400).json({
        message:
          "Name, email, password, department and area are required.",
      });
    }

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof department !== "string" ||
      typeof area !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid input values.",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedDepartment = department.trim();
    const normalizedArea = area.trim();

    if (
      normalizedName.length < 2 ||
      normalizedEmail.length === 0 ||
      normalizedDepartment.length === 0 ||
      normalizedArea.length === 0
    ) {
      return res.status(400).json({
        message: "Please provide valid authority details.",
      });
    }

    if (password.length < 6 || password.length > 100) {
      return res.status(400).json({
        message: "Password must contain 6 to 100 characters.",
      });
    }

    if (
      phone &&
      !/^[0-9]{10}$/.test(String(phone).trim())
    ) {
      return res.status(400).json({
        message: "Phone number must contain exactly 10 digits.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const existingAuthority = await Authority.findOne({
      email: normalizedEmail,
    });

    if (existingAuthority) {
      return res.status(409).json({
        message: "An authority profile with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Only an authenticated administrator can reach this endpoint.
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone ? String(phone).trim() : "",
      role: "authority",
    });

    try {
      const authority = await Authority.create({
        user: user._id,
        name: normalizedName,
        department: normalizedDepartment,
        email: normalizedEmail,
        area: normalizedArea,
        phone: phone ? String(phone).trim() : "",
        isActive: true,
      });

      return res.status(201).json({
        message: "Authority account created successfully.",
        authority: {
          id: authority._id,
          name: authority.name,
          email: authority.email,
          department: authority.department,
          area: authority.area,
          phone: authority.phone,
          isActive: authority.isActive,
          userId: user._id,
        },
      });
    } catch (error) {
      // Avoid leaving an account without its authority profile.
      await User.findByIdAndDelete(user._id);
      throw error;
    }
  } catch (error) {
    console.error("Create authority account error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account or authority profile already exists for this email.",
      });
    }

    return res.status(500).json({
      message: "Unable to create authority account.",
    });
  }
};

module.exports = {
  createAuthorityAccount,
};
```