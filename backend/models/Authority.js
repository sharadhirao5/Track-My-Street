const mongoose = require("mongoose");


// =====================================================
// AUTHORITY SCHEMA
// =====================================================

const authoritySchema = new mongoose.Schema(
  {

    // -------------------------------------------------
    // LINK TO USER ACCOUNT
    // -------------------------------------------------

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },


    // -------------------------------------------------
    // AUTHORITY NAME
    // -------------------------------------------------

    name: {
      type: String,
      required: true,
      trim: true
    },


    // -------------------------------------------------
    // DEPARTMENT
    // -------------------------------------------------

    department: {
      type: String,
      required: true,
      trim: true
    },


    // -------------------------------------------------
    // OFFICIAL EMAIL
    // -------------------------------------------------

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },


    // -------------------------------------------------
    // JURISDICTION / AREA
    // -------------------------------------------------

    area: {
      type: String,
      required: true,
      trim: true
    },


    // -------------------------------------------------
    // CONTACT NUMBER
    // -------------------------------------------------

    phone: {
      type: String,
      trim: true,
      default: ""
    },


    // -------------------------------------------------
    // AUTHORITY ACTIVE STATUS
    // -------------------------------------------------

    isActive: {
      type: Boolean,
      default: true
    }

  },

  {
    timestamps: true
  }
);


// =====================================================
// EXPORT MODEL
// =====================================================

module.exports =
  mongoose.model(
    "Authority",
    authoritySchema
  );