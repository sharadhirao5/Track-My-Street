const Complaint = require("../models/Complaint");
const ComplaintHistory = require("../models/ComplaintHistory");

const {
  createNotification
} = require("../utils/notificationUtils");

const {
  findPossibleDuplicates
} = require("../utils/duplicateDetection");

// =====================================================
// CREATE COMPLAINT
// =====================================================

const createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      latitude,
      longitude,
      damageType,
      severity,
      aiDetection
    } = req.body;

    // Validate uploaded image
    if (!req.file) {
      return res.status(400).json({
        message: "Complaint image is required."
      });
    }

    // Validate GPS coordinates
    const latitudeNumber = Number(latitude);
    const longitudeNumber = Number(longitude);

    if (
      !Number.isFinite(latitudeNumber) ||
      latitudeNumber < -90 ||
      latitudeNumber > 90
    ) {
      return res.status(400).json({
        message: "Invalid latitude."
      });
    }

    if (
      !Number.isFinite(longitudeNumber) ||
      longitudeNumber < -180 ||
      longitudeNumber > 180
    ) {
      return res.status(400).json({
        message: "Invalid longitude."
      });
    }

    // Find possible duplicate complaints
    const possibleDuplicates = await findPossibleDuplicates({
      latitude: latitudeNumber,
      longitude: longitudeNumber,
      damageType: damageType || "pothole",
      radiusInMeters: 100
    });

    // Save the original uploaded image path
    const image = `/uploads/${req.file.filename}`;

    // Parse optional AI detection results
    let parsedAiDetection;

    if (aiDetection !== undefined && aiDetection !== "") {
      try {
        parsedAiDetection =
          typeof aiDetection === "string"
            ? JSON.parse(aiDetection)
            : aiDetection;
      } catch {
        return res.status(400).json({
          message: "Invalid AI detection data."
        });
      }

      if (
        !parsedAiDetection ||
        typeof parsedAiDetection !== "object" ||
        typeof parsedAiDetection.damage_detected !== "boolean" ||
        !Number.isInteger(parsedAiDetection.total_detections) ||
        parsedAiDetection.total_detections < 0 ||
        !Array.isArray(parsedAiDetection.detections)
      ) {
        return res.status(400).json({
          message: "AI detection data has an invalid format."
        });
      }

      if (
        parsedAiDetection.total_detections !==
        parsedAiDetection.detections.length
      ) {
        return res.status(400).json({
          message: "AI detection count does not match its results."
        });
      }

      // Validate every detection before storing it.
      for (const detection of parsedAiDetection.detections) {
        if (
          typeof detection.class !== "string" ||
          typeof detection.confidence !== "number" ||
          !Number.isFinite(detection.confidence) ||
          detection.confidence < 0 ||
          detection.confidence > 1
        ) {
          return res.status(400).json({
            message: "An AI detection result is invalid."
          });
        }
      }

      // Only store the public result URL if supplied later
      // by a trusted backend integration. Do not trust a
      // client-provided local filesystem path.
      parsedAiDetection = {
        damage_detected: parsedAiDetection.damage_detected,
        total_detections: parsedAiDetection.total_detections,
        detections: parsedAiDetection.detections.map((detection) => ({
          class: detection.class,
          confidence: detection.confidence,
          confidence_label: ["Low", "Medium", "High"].includes(
            detection.confidence_label
          )
            ? detection.confidence_label
            : "Low",
          bounding_box: detection.bounding_box
            ? {
                x1: Number(detection.bounding_box.x1),
                y1: Number(detection.bounding_box.y1),
                x2: Number(detection.bounding_box.x2),
                y2: Number(detection.bounding_box.y2)
              }
            : undefined
        })),
        annotated_image: null
      };
    }

    // Prepare complaint data
    const complaintData = {
      user: req.user.id,
      title,
      description,
      image,
      latitude: latitudeNumber,
      longitude: longitudeNumber,
      damageType: damageType || "pothole",
      severity
    };

    if (parsedAiDetection !== undefined) {
      complaintData.aiDetection = parsedAiDetection;
    }

    // Create complaint in MongoDB
    const complaint = await Complaint.create(complaintData);

    // Notify citizen after successful creation
    await createNotification({
      userId: req.user.id,
      complaintId: complaint._id,
      title: "Complaint Submitted",
      message: `Your complaint "${complaint.title}" has been submitted successfully.`,
      type: "Complaint Created"
    });

    return res.status(201).json({
      message: "Complaint created successfully",
      complaint,
      duplicateCheck: {
        possibleDuplicate: possibleDuplicates.length > 0,
        count: possibleDuplicates.length,
        matches: possibleDuplicates.map((item) => ({
          complaintId: item.complaint._id,
          title: item.complaint.title,
          distanceInMeters: item.distance
        }))
      }
    });
  } catch (error) {
    console.error("Create complaint error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Complaint validation failed",
        error: error.message
      });
    }

    return res.status(500).json({
      message: "Server Error"
    });
  }
};

// =====================================================
// GET COMPLAINTS
// CITIZEN = OWN
// ADMIN = ALL
// =====================================================

const getComplaints = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role !== "admin") {
      filter.user = req.user.id;
    }

    const complaints = await Complaint.find(filter)
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: complaints.length,
      complaints
    });
  } catch (error) {
    console.error("Get complaints error:", error);

    return res.status(500).json({
      message: "Server Error"
    });
  }
};

// =====================================================
// GET SINGLE COMPLAINT
// =====================================================

const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("user", "name email role");

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found."
      });
    }

    if (
      req.user.role !== "admin" &&
      complaint.user._id.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to view this complaint."
      });
    }

    return res.status(200).json({
      complaint
    });
  } catch (error) {
    console.error("Get complaint by ID error:", error);

    return res.status(500).json({
      message: "Server Error"
    });
  }
};

// =====================================================
// ADMIN - GET / FILTER / SEARCH
// =====================================================

const getAdminComplaints = async (req, res) => {
  try {
    const {
      status,
      severity,
      damageType,
      search
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (severity) {
      filter.severity = severity;
    }

    if (damageType) {
      filter.damageType = damageType;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { damageType: { $regex: search, $options: "i" } }
      ];
    }

    const complaints = await Complaint.find(filter)
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: complaints.length,
      filters: {
        status: status || null,
        severity: severity || null,
        damageType: damageType || null,
        search: search || null
      },
      complaints
    });
  } catch (error) {
    console.error("Admin complaints error:", error);

    return res.status(500).json({
      message: "Server Error"
    });
  }
};

// =====================================================
// ADMIN - UPDATE COMPLAINT STATUS
// + HISTORY
// + NOTIFICATION
// =====================================================

const updateComplaintStatus = async (req, res) => {
  try {
    const {
      status,
      remark
    } = req.body;

    const allowedStatuses = [
      "Pending",
      "In Progress",
      "Resolved"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid complaint status."
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found."
      });
    }

    const oldStatus = complaint.status;

    if (oldStatus === status) {
      return res.status(400).json({
        message: "Complaint is already in this status."
      });
    }

    complaint.status = status;
    await complaint.save();

    // Record status history
    const history = await ComplaintHistory.create({
      complaint: complaint._id,
      previousStatus: oldStatus,
      newStatus: status,
      changedBy: req.user.id,
      remark: remark || ""
    });

    let title = "Complaint Status Updated";
    let message =
      `Your complaint "${complaint.title}" status has been changed from ${oldStatus} to ${status}.`;
    let type = "Status Updated";

    if (status === "Resolved") {
      title = "Complaint Resolved";
      message = `Your complaint "${complaint.title}" has been resolved.`;
      type = "Complaint Resolved";
    }

    await createNotification({
      userId: complaint.user,
      complaintId: complaint._id,
      title,
      message,
      type
    });

    return res.status(200).json({
      message: "Complaint status updated successfully",
      complaint,
      history
    });
  } catch (error) {
    console.error("Update complaint status error:", error);

    return res.status(500).json({
      message: "Server Error"
    });
  }
};

// =====================================================
// GET COMPLAINT STATUS HISTORY
// =====================================================

const getComplaintHistory = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found."
      });
    }

    if (
      req.user.role !== "admin" &&
      complaint.user.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to view this complaint history."
      });
    }

    const history = await ComplaintHistory.find({
      complaint: complaint._id
    })
      .populate("changedBy", "name email role")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      count: history.length,
      history
    });
  } catch (error) {
    console.error("Get complaint history error:", error);

    return res.status(500).json({
      message: "Server Error"
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  getAdminComplaints,
  updateComplaintStatus,
  getComplaintHistory
};