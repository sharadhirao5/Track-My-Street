const mongoose = require("mongoose");


// =====================================================
// DETECTION RESULT SCHEMA
// =====================================================

const detectionResultSchema = new mongoose.Schema(
  {

    // -------------------------------------------------
    // LINK TO COMPLAINT
    // -------------------------------------------------

    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true
    },


    // -------------------------------------------------
    // DETECTED DAMAGE TYPE
    // -------------------------------------------------

    damageType: {
      type: String,
      required: true,
      trim: true
    },


    // -------------------------------------------------
    // AI CONFIDENCE SCORE
    // Example: 0.94
    // -------------------------------------------------

    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },


    // -------------------------------------------------
    // SEVERITY
    // -------------------------------------------------

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


    // -------------------------------------------------
    // BOUNDING BOX
    // Used by YOLO object detection
    // -------------------------------------------------

    boundingBox: {

      x: {
        type: Number
      },

      y: {
        type: Number
      },

      width: {
        type: Number
      },

      height: {
        type: Number
      }

    },


    // -------------------------------------------------
    // AI MODEL NAME
    // -------------------------------------------------

    modelName: {
      type: String,
      default: "YOLO"
    },


    // -------------------------------------------------
    // MODEL VERSION
    // -------------------------------------------------

    modelVersion: {
      type: String,
      default: "v1"
    },


    // -------------------------------------------------
    // PROCESSING TIME
    // In milliseconds
    // -------------------------------------------------

    processingTime: {
      type: Number,
      default: 0
    },


    // -------------------------------------------------
    // OPTIONAL AI MESSAGE
    // -------------------------------------------------

    message: {
      type: String,
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
    "DetectionResult",
    detectionResultSchema
  );