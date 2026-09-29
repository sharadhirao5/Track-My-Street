const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {

    // =================================================
    // USER WHO SUBMITTED THE COMPLAINT
    // =================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },


    // =================================================
    // COMPLAINT TITLE
    // =================================================

    title: {
      type: String,
      required: true,
      trim: true
    },


    // =================================================
    // COMPLAINT DESCRIPTION
    // =================================================

    description: {
      type: String,
      required: true,
      trim: true
    },


    // =================================================
    // UPLOADED IMAGE PATH
    // =================================================

    image: {
      type: String,
      required: true
    },


    // =================================================
    // GPS LATITUDE
    // =================================================

    latitude: {
      type: Number,
      required: true
    },


    // =================================================
    // GPS LONGITUDE
    // =================================================

    longitude: {
      type: Number,
      required: true
    },


    // =================================================
    // TYPE OF ROAD DAMAGE
    // =================================================

    damageType: {
      type: String,
      default: "pothole",
      trim: true
    },


    // =================================================
    // DAMAGE SEVERITY
    // =================================================

    severity: {
      type: String,
      enum: [
        "Low",
        "Medium",
        "High",
        "Critical"
      ],
      default: "Medium"
    },


    // =================================================
    // COMPLAINT STATUS
    // =================================================

    status: {
      type: String,
      enum: [
        "Pending",
        "In Progress",
        "Resolved"
      ],
      default: "Pending"
    },


    // =================================================
    // ASSIGNED AUTHORITY
    // =================================================

    assignedAuthority: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Authority",
      default: null
    }

  },

  {
    timestamps: true
  }
);


module.exports =
  mongoose.model(
    "Complaint",
    complaintSchema
  );