const mongoose = require("mongoose");


// =====================================================
// COMPLAINT STATUS HISTORY SCHEMA
// =====================================================

const complaintHistorySchema = new mongoose.Schema(
  {

    // -------------------------------------------------
    // RELATED COMPLAINT
    // -------------------------------------------------

    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true
    },


    // -------------------------------------------------
    // PREVIOUS STATUS
    // -------------------------------------------------

    previousStatus: {
      type: String,
      enum: [
        "Pending",
        "In Progress",
        "Resolved"
      ],
      default: "Pending"
    },


    // -------------------------------------------------
    // NEW STATUS
    // -------------------------------------------------

    newStatus: {
      type: String,
      enum: [
        "Pending",
        "In Progress",
        "Resolved"
      ],
      required: true
    },


    // -------------------------------------------------
    // USER WHO MADE THE CHANGE
    // -------------------------------------------------

    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },


    // -------------------------------------------------
    // OPTIONAL REMARK
    // -------------------------------------------------

    remark: {
      type: String,
      trim: true,
      default: ""
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
    "ComplaintHistory",
    complaintHistorySchema
  );