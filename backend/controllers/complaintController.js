const Complaint = require("../models/Complaint");

const ComplaintHistory =
  require("../models/ComplaintHistory");

const {
  createNotification
} = require("../utils/notificationUtils");

const {
  findPossibleDuplicates
} =
  require("../utils/duplicateDetection");


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
      severity
    } = req.body;


    // -------------------------------------------------
    // IMAGE CHECK
    // -------------------------------------------------

    if (!req.file) {

      return res.status(400).json({

        message:
          "Complaint image is required."

      });

    }


    // -------------------------------------------------
    // GPS VALIDATION
    // -------------------------------------------------

    const latitudeNumber =
      Number(latitude);

    const longitudeNumber =
      Number(longitude);


    if (
      !Number.isFinite(
        latitudeNumber
      ) ||
      latitudeNumber < -90 ||
      latitudeNumber > 90
    ) {

      return res.status(400).json({

        message:
          "Invalid latitude."

      });

    }


    if (
      !Number.isFinite(
        longitudeNumber
      ) ||
      longitudeNumber < -180 ||
      longitudeNumber > 180
    ) {

      return res.status(400).json({

        message:
          "Invalid longitude."

      });

    }


    // -------------------------------------------------
    // FIND POSSIBLE DUPLICATES
    // -------------------------------------------------

    const possibleDuplicates =
      await findPossibleDuplicates({

        latitude:
          latitudeNumber,

        longitude:
          longitudeNumber,

        damageType:
          damageType || "pothole",

        radiusInMeters:
          100

      });


    // -------------------------------------------------
    // IMAGE PATH
    // -------------------------------------------------

    const image =
      `/uploads/${req.file.filename}`;


    // -------------------------------------------------
    // CREATE COMPLAINT
    // -------------------------------------------------

    const complaint =
      await Complaint.create({

        user:
          req.user.id,

        title,

        description,

        image,

        latitude:
          latitudeNumber,

        longitude:
          longitudeNumber,

        damageType:
          damageType || "pothole",

        severity

      });


    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(201).json({

      message:
        "Complaint created successfully",

      complaint,

      duplicateCheck: {

        possibleDuplicate:
          possibleDuplicates.length > 0,

        count:
          possibleDuplicates.length,

        matches:
          possibleDuplicates.map(
            (item) => ({

              complaintId:
                item.complaint._id,

              title:
                item.complaint.title,

              distanceInMeters:
                item.distance

            })
          )

      }

    });


  } catch (error) {

    console.error(
      "Create complaint error:",
      error
    );


    if (
      error.name ===
      "ValidationError"
    ) {

      return res.status(400).json({

        message:
          "Complaint validation failed",

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
// GET COMPLAINTS
// CITIZEN = OWN
// ADMIN = ALL
// =====================================================

const getComplaints = async (req, res) => {

  try {

    let filter = {};


    if (
      req.user.role !==
      "admin"
    ) {

      filter.user =
        req.user.id;

    }


    const complaints =
      await Complaint.find(filter)

        .populate(
          "user",
          "name email role"
        )

        .sort({
          createdAt: -1
        });


    return res.status(200).json({

      count:
        complaints.length,

      complaints

    });


  } catch (error) {

    console.error(
      "Get complaints error:",
      error
    );


    return res.status(500).json({

      message:
        "Server Error"

    });

  }

};


// =====================================================
// GET SINGLE COMPLAINT
// =====================================================

const getComplaintById =
  async (req, res) => {

    try {

      const complaint =
        await Complaint.findById(
          req.params.id
        )

        .populate(
          "user",
          "name email role"
        );


      if (!complaint) {

        return res.status(404).json({

          message:
            "Complaint not found."

        });

      }


      // Citizen ownership check

      if (

        req.user.role !==
          "admin" &&

        complaint.user._id
          .toString() !==
        req.user.id.toString()

      ) {

        return res.status(403).json({

          message:
            "You are not authorized to view this complaint."

        });

      }


      return res.status(200).json({

        complaint

      });


    } catch (error) {

      console.error(
        "Get complaint by ID error:",
        error
      );


      return res.status(500).json({

        message:
          "Server Error"

      });

    }

  };


// =====================================================
// ADMIN - GET / FILTER / SEARCH
// =====================================================

const getAdminComplaints =
  async (req, res) => {

    try {

      const {
        status,
        severity,
        damageType,
        search
      } = req.query;


      const filter = {};


      if (status) {

        filter.status =
          status;

      }


      if (severity) {

        filter.severity =
          severity;

      }


      if (damageType) {

        filter.damageType =
          damageType;

      }


      if (search) {

        filter.$or = [

          {
            title: {
              $regex: search,
              $options: "i"
            }
          },

          {
            description: {
              $regex: search,
              $options: "i"
            }
          },

          {
            damageType: {
              $regex: search,
              $options: "i"
            }
          }

        ];

      }


      const complaints =
        await Complaint.find(filter)

          .populate(
            "user",
            "name email role"
          )

          .sort({
            createdAt: -1
          });


      return res.status(200).json({

        count:
          complaints.length,

        filters: {

          status:
            status || null,

          severity:
            severity || null,

          damageType:
            damageType || null,

          search:
            search || null

        },

        complaints

      });


    } catch (error) {

      console.error(
        "Admin complaints error:",
        error
      );


      return res.status(500).json({

        message:
          "Server Error"

      });

    }

  };


// =====================================================
// ADMIN - UPDATE COMPLAINT STATUS
// + HISTORY
// + NOTIFICATION
// =====================================================

const updateComplaintStatus =
  async (req, res) => {

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


      if (
        !allowedStatuses
          .includes(status)
      ) {

        return res.status(400).json({

          message:
            "Invalid complaint status."

        });

      }


      const complaint =
        await Complaint.findById(
          req.params.id
        );


      if (!complaint) {

        return res.status(404).json({

          message:
            "Complaint not found."

        });

      }


      const oldStatus =
        complaint.status;


      if (
        oldStatus ===
        status
      ) {

        return res.status(400).json({

          message:
            "Complaint is already in this status."

        });

      }


      complaint.status =
        status;


      await complaint.save();


      // ------------------------------------------------
      // CREATE HISTORY
      // ------------------------------------------------

      const history =
        await ComplaintHistory.create({

          complaint:
            complaint._id,

          previousStatus:
            oldStatus,

          newStatus:
            status,

          changedBy:
            req.user.id,

          remark:
            remark || ""

        });


      // ------------------------------------------------
      // CREATE NOTIFICATION
      // ------------------------------------------------

      let title =
        "Complaint Status Updated";


      let message =
        `Your complaint "${complaint.title}" status has been changed from ${oldStatus} to ${status}.`;


      let type =
        "Status Updated";


      if (
        status ===
        "Resolved"
      ) {

        title =
          "Complaint Resolved";


        message =
          `Your complaint "${complaint.title}" has been resolved.`;


        type =
          "Complaint Resolved";

      }


      await createNotification({

        userId:
          complaint.user,

        complaintId:
          complaint._id,

        title,

        message,

        type

      });


      return res.status(200).json({

        message:
          "Complaint status updated successfully",

        complaint,

        history

      });


    } catch (error) {

      console.error(
        "Update complaint status error:",
        error
      );


      return res.status(500).json({

        message:
          "Server Error"

      });

    }

  };


// =====================================================
// GET COMPLAINT STATUS HISTORY
// =====================================================

const getComplaintHistory =
  async (req, res) => {

    try {

      const complaint =
        await Complaint.findById(
          req.params.id
        );


      if (!complaint) {

        return res.status(404).json({

          message:
            "Complaint not found."

        });

      }


      if (

        req.user.role !==
          "admin" &&

        complaint.user
          .toString() !==
        req.user.id.toString()

      ) {

        return res.status(403).json({

          message:
            "You are not authorized to view this complaint history."

        });

      }


      const history =
        await ComplaintHistory.find({

          complaint:
            complaint._id

        })

        .populate(
          "changedBy",
          "name email role"
        )

        .sort({
          createdAt: 1
        });


      return res.status(200).json({

        count:
          history.length,

        history

      });


    } catch (error) {

      console.error(
        "Get complaint history error:",
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

  createComplaint,

  getComplaints,

  getComplaintById,

  getAdminComplaints,

  updateComplaintStatus,

  getComplaintHistory

};