const mongoose = require("mongoose");


// =====================================================
// NOTIFICATION SCHEMA
// =====================================================

const notificationSchema = new mongoose.Schema(
  {

    // -------------------------------------------------
    // USER WHO RECEIVES THE NOTIFICATION
    // -------------------------------------------------

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },


    // -------------------------------------------------
    // RELATED COMPLAINT
    // -------------------------------------------------

    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true
    },


    // -------------------------------------------------
    // NOTIFICATION TITLE
    // -------------------------------------------------

    title: {
      type: String,
      required: true,
      trim: true
    },


    // -------------------------------------------------
    // NOTIFICATION MESSAGE
    // -------------------------------------------------

    message: {
      type: String,
      required: true,
      trim: true
    },


    // -------------------------------------------------
    // NOTIFICATION TYPE
    // -------------------------------------------------

    type: {
      type: String,
      enum: [
        "Complaint Created",
        "Status Updated",
        "Complaint Resolved",
        "AI Detection"
      ],
      default: "Status Updated"
    },


    // -------------------------------------------------
    // READ / UNREAD
    // -------------------------------------------------

    isRead: {
      type: Boolean,
      default: false
    }

  },

  {
    timestamps: true
  }
);


module.exports =
  mongoose.model(
    "Notification",
    notificationSchema
  );