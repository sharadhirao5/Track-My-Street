const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// =====================================================
// REGISTER USER
// =====================================================

const registerUser = async (req, res) => {
  try {

    const {
      name,
      email,
      password
    } = req.body;


    // -------------------------------------------------
    // CHECK REQUIRED FIELDS
    // -------------------------------------------------

    if (
      !name ||
      !email ||
      !password
    ) {

      return res.status(400).json({

        message:
          "Name, email and password are required."

      });

    }


    // -------------------------------------------------
    // NAME VALIDATION
    // -------------------------------------------------

    if (
      typeof name !== "string" ||
      name.trim().length < 2
    ) {

      return res.status(400).json({

        message:
          "Name must contain at least 2 characters."

      });

    }


    if (
      name.trim().length > 100
    ) {

      return res.status(400).json({

        message:
          "Name cannot exceed 100 characters."

      });

    }


    // -------------------------------------------------
    // EMAIL VALIDATION
    // -------------------------------------------------

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
      !emailRegex.test(
        normalizedEmail
      )
    ) {

      return res.status(400).json({

        message:
          "Please provide a valid email address."

      });

    }


    // -------------------------------------------------
    // PASSWORD VALIDATION
    // -------------------------------------------------

    if (
      typeof password !== "string" ||
      password.length < 6
    ) {

      return res.status(400).json({

        message:
          "Password must contain at least 6 characters."

      });

    }


    if (
      password.length > 100
    ) {

      return res.status(400).json({

        message:
          "Password cannot exceed 100 characters."

      });

    }


    // -------------------------------------------------
    // CHECK EXISTING USER
    // -------------------------------------------------

    const existingUser =
      await User.findOne({
        email:
          normalizedEmail
      });


    if (existingUser) {

      return res.status(400).json({

        message:
          "User already exists."

      });

    }


    // -------------------------------------------------
    // HASH PASSWORD
    // -------------------------------------------------

    const salt =
      await bcrypt.genSalt(10);


    const hashedPassword =
      await bcrypt.hash(
        password,
        salt
      );


    // -------------------------------------------------
    // CREATE USER
    // IMPORTANT:
    // ROLE IS NOT ACCEPTED FROM REQUEST
    // DEFAULT ROLE = CITIZEN
    // -------------------------------------------------

    const user =
      await User.create({

        name:
          name.trim(),

        email:
          normalizedEmail,

        password:
          hashedPassword,

        role:
          "citizen"

      });


    // -------------------------------------------------
    // RESPONSE
    // Don't return password/hash
    // -------------------------------------------------

    return res.status(201).json({

      message:
        "User Registered Successfully",

      user: {

        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        role:
          user.role

      }

    });


  } catch (error) {

    console.error(
      "Registration error:",
      error
    );


    // MongoDB duplicate key
    if (
      error.code === 11000
    ) {

      return res.status(400).json({

        message:
          "Email is already registered."

      });

    }


    return res.status(500).json({

      message:
        "Server Error"

    });

  }

};


// =====================================================
// LOGIN USER
// =====================================================

const loginUser = async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;


    // -------------------------------------------------
    // REQUIRED FIELDS
    // -------------------------------------------------

    if (
      !email ||
      !password
    ) {

      return res.status(400).json({

        message:
          "Email and Password are required."

      });

    }


    // -------------------------------------------------
    // NORMALIZE EMAIL
    // -------------------------------------------------

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    // -------------------------------------------------
    // FIND USER
    // -------------------------------------------------

    const user =
      await User.findOne({

        email:
          normalizedEmail

      });


    if (!user) {

      return res.status(401).json({

        message:
          "Invalid Email or Password."

      });

    }


    // -------------------------------------------------
    // COMPARE PASSWORD
    // -------------------------------------------------

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );


    if (!isMatch) {

      return res.status(401).json({

        message:
          "Invalid Email or Password."

      });

    }


    // -------------------------------------------------
    // CHECK JWT SECRET
    // -------------------------------------------------

    if (
      !process.env.JWT_SECRET
    ) {

      console.error(
        "JWT_SECRET is missing from .env"
      );

      return res.status(500).json({

        message:
          "Server configuration error."

      });

    }


    // -------------------------------------------------
    // GENERATE JWT
    // -------------------------------------------------

    const token =
      jwt.sign(

        {

          id:
            user._id,

          role:
            user.role

        },

        process.env.JWT_SECRET,

        {

          expiresIn:
            "7d"

        }

      );


    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(200).json({

      message:
        "Login Successful",

      token,

      user: {

        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        role:
          user.role

      }

    });


  } catch (error) {

    console.error(
      "Login error:",
      error
    );


    return res.status(500).json({

      message:
        "Server Error"

    });

  }

};


// =====================================================
// GET LOGGED-IN USER PROFILE
// =====================================================

const getProfile =
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.user.id
        )
        .select("-password");


      if (!user) {

        return res.status(404).json({

          message:
            "User not found."

        });

      }


      return res.status(200).json(

        user

      );


    } catch (error) {

      console.error(
        "Get profile error:",
        error
      );


      return res.status(500).json({

        message:
          "Server Error"

      });

    }

  };


// =====================================================
// EXPORT
// =====================================================

module.exports = {

  registerUser,

  loginUser,

  getProfile

};