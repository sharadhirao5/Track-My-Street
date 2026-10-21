const DetectionResult = require("../models/DetectionResult");
const Complaint = require("../models/Complaint");


// =====================================================
// CREATE AI DETECTION RESULT
// =====================================================

const createDetectionResult = async (req, res) => {
  try {

    const {
      complaintId,
      damageType,
      confidence,
      severity,
      boundingBox,
      modelName,
      modelVersion,
      processingTime,
      message
    } = req.body;


    // -------------------------------------------------
    // CHECK COMPLAINT
    // -------------------------------------------------

    const complaint =
      await Complaint.findById(
        complaintId
      );


    if (!complaint) {

      return res.status(404).json({
        message: "Complaint not found."
      });

    }


    // -------------------------------------------------
    // VALIDATE CONFIDENCE
    // -------------------------------------------------

    if (
      confidence === undefined ||
      confidence < 0 ||
      confidence > 1
    ) {

      return res.status(400).json({
        message:
          "Confidence must be between 0 and 1."
      });

    }


    // -------------------------------------------------
    // CREATE DETECTION RESULT
    // -------------------------------------------------

    const detection =
      await DetectionResult.create({

        complaint: complaintId,

        damageType,

        confidence,

        severity,

        boundingBox,

        modelName:
          modelName || "YOLO",

        modelVersion:
          modelVersion || "v1",

        processingTime:
          processingTime || 0,

        message:
          message || ""

      });


    // -------------------------------------------------
    // UPDATE COMPLAINT USING AI RESULT
    // -------------------------------------------------

    complaint.damageType =
      damageType;

    complaint.severity =
      severity;

    await complaint.save();


    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(201).json({

      message:
        "AI detection result saved successfully.",

      detection

    });


  } catch (error) {

    console.error(
      "Create detection error:",
      error
    );


    if (
      error.name ===
      "ValidationError"
    ) {

      return res.status(400).json({

        message:
          "Detection validation failed.",

        error:
          error.message

      });

    }


    return res.status(500).json({

      message:
        "Server Error"

    });

  }
};


// =====================================================
// GET DETECTION RESULT FOR COMPLAINT
// =====================================================

const getDetectionByComplaint =
  async (req, res) => {

    try {

      const detection =
        await DetectionResult.findOne({
          complaint:
            req.params.complaintId
        })
        .populate(
          "complaint"
        );


      if (!detection) {

        return res.status(404).json({

          message:
            "Detection result not found."

        });

      }


      return res.status(200).json({

        detection

      });


    } catch (error) {

      console.error(
        "Get detection error:",
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

  createDetectionResult,

  getDetectionByComplaint

};