const mongoose = require("mongoose");

const detectionSchema = new mongoose.Schema(
  {
    class: {
      type: String,
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    confidence_label: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low"
    },
    bounding_box: {
      x1: Number,
      y1: Number,
      x2: Number,
      y2: Number
    }
  },
  { _id: false }
);

const aiDetectionSchema = new mongoose.Schema(
  {
    damage_detected: {
      type: Boolean,
      default: false
    },
    total_detections: {
      type: Number,
      min: 0,
      default: 0
    },
    detections: {
      type: [detectionSchema],
      default: []
    },
    annotated_image: {
      type: String,
      default: null
    }
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    image: {
      type: String,
      required: true
    },

    latitude: {
      type: Number,
      required: true
    },

    longitude: {
      type: Number,
      required: true
    },

    damageType: {
      type: String,
      default: "pothole",
      trim: true
    },

    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium"
    },

    // Results returned by the AI detection service.
    aiDetection: {
      type: aiDetectionSchema,
      default: undefined
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending"
    },

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

module.exports = mongoose.model("Complaint", complaintSchema);
