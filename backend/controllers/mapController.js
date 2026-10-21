const Complaint = require("../models/Complaint");


// =====================================================
// GET MAP COMPLAINTS
// =====================================================

const getMapComplaints = async (req, res) => {
  try {

    const {
      status,
      severity,
      damageType
    } = req.query;


    // -------------------------------------------------
    // BUILD FILTER
    // -------------------------------------------------

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


    // -------------------------------------------------
    // GET COMPLAINTS
    // -------------------------------------------------

    const complaints = await Complaint.find(filter)
      .select(
        "_id title latitude longitude damageType severity status image createdAt"
      )
      .sort({
        createdAt: -1
      });


    // -------------------------------------------------
    // CONVERT TO MAP-FRIENDLY DATA
    // -------------------------------------------------

    const mapData = complaints
      .filter(
        (complaint) =>
          complaint.latitude !== undefined &&
          complaint.longitude !== undefined
      )
      .map((complaint) => ({
        id: complaint._id,

        title: complaint.title,

        latitude: complaint.latitude,

        longitude: complaint.longitude,

        damageType: complaint.damageType,

        severity: complaint.severity,

        status: complaint.status,

        image: complaint.image,

        createdAt: complaint.createdAt
      }));


    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(200).json({

      count: mapData.length,

      complaints: mapData

    });


  } catch (error) {

    console.error(
      "Map complaints error:",
      error
    );


    return res.status(500).json({

      message: "Server Error"

    });

  }
};


module.exports = {
  getMapComplaints
};