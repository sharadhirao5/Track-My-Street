const Authority =
  require("../models/Authority");

const User =
  require("../models/User");

const Complaint =
  require("../models/Complaint");

const ComplaintHistory =
  require("../models/ComplaintHistory");

const {
  createNotification
} =
  require("../utils/notificationUtils");


// =====================================================
// CREATE AUTHORITY PROFILE
// =====================================================

const createAuthority =
  async (req, res) => {

    try {

      const {
        userId,
        name,
        department,
        email,
        area,
        phone
      } = req.body;


      // -------------------------------------------------
      // REQUIRED FIELDS
      // -------------------------------------------------

      if (
        !userId ||
        !name ||
        !department ||
        !email ||
        !area
      ) {

        return res.status(400).json({

          message:
            "userId, name, department, email and area are required."

        });

      }


      // -------------------------------------------------
      // CHECK USER
      // -------------------------------------------------

      const user =
        await User.findById(userId);


      if (!user) {

        return res.status(404).json({

          message:
            "User not found."

        });

      }


      // -------------------------------------------------
      // USER MUST BE ADMIN
      // -------------------------------------------------

      if (
        user.role !==
        "admin"
      ) {

        return res.status(400).json({

          message:
            "The selected user must have admin role."

        });

      }


      // -------------------------------------------------
      // CHECK EXISTING AUTHORITY
      // -------------------------------------------------

      const existingAuthority =
        await Authority.findOne({

          $or: [

            {
              user:
                userId
            },

            {
              email:
                email.toLowerCase()
            }

          ]

        });


      if (existingAuthority) {

        return res.status(400).json({

          message:
            "Authority profile already exists."

        });

      }


      // -------------------------------------------------
      // CREATE AUTHORITY
      // -------------------------------------------------

      const authority =
        await Authority.create({

          user:
            userId,

          name:
            name.trim(),

          department:
            department.trim(),

          email:
            email.trim().toLowerCase(),

          area:
            area.trim(),

          phone:
            phone || "",

          isActive:
            true

        });


      return res.status(201).json({

        message:
          "Authority profile created successfully.",

        authority

      });


    } catch (error) {

      console.error(
        "Create authority error:",
        error
      );


      return res.status(500).json({

        message:
          "Server Error"

      });

    }

  };


// =====================================================
// GET ALL AUTHORITIES
// =====================================================

const getAuthorities =
  async (req, res) => {

    try {

      const authorities =
        await Authority.find({

          isActive:
            true

        })

        .populate(
          "user",
          "name email role"
        )

        .sort({

          createdAt:
            -1

        });


      return res.status(200).json({

        count:
          authorities.length,

        authorities

      });


    } catch (error) {

      console.error(
        "Get authorities error:",
        error
      );


      return res.status(500).json({

        message:
          "Server Error"

      });

    }

  };


// =====================================================
// GET SINGLE AUTHORITY
// =====================================================

const getAuthorityById =
  async (req, res) => {

    try {

      const authority =
        await Authority.findById(
          req.params.id
        )

        .populate(
          "user",
          "name email role"
        );


      if (!authority) {

        return res.status(404).json({

          message:
            "Authority not found."

        });

      }


      return res.status(200).json({

        authority

      });


    } catch (error) {

      console.error(
        "Get authority error:",
        error
      );


      return res.status(500).json({

        message:
          "Server Error"

      });

    }

  };


// =====================================================
// ASSIGN COMPLAINT TO AUTHORITY
// =====================================================

const assignComplaint =
  async (req, res) => {

    try {

      const {
        authorityId,
        complaintId
      } = req.body;


      // -------------------------------------------------
      // REQUIRED FIELDS
      // -------------------------------------------------

      if (
        !authorityId ||
        !complaintId
      ) {

        return res.status(400).json({

          message:
            "authorityId and complaintId are required."

        });

      }


      // -------------------------------------------------
      // FIND AUTHORITY
      // -------------------------------------------------

      const authority =
        await Authority.findById(
          authorityId
        );


      if (!authority) {

        return res.status(404).json({

          message:
            "Authority not found."

        });

      }


      if (
        !authority.isActive
      ) {

        return res.status(400).json({

          message:
            "Authority is inactive."

        });

      }


      // -------------------------------------------------
      // FIND COMPLAINT
      // -------------------------------------------------

      const complaint =
        await Complaint.findById(
          complaintId
        );


      if (!complaint) {

        return res.status(404).json({

          message:
            "Complaint not found."

        });

      }


      // -------------------------------------------------
      // ASSIGNMENT
      // -------------------------------------------------

      complaint.assignedAuthority =
        authority._id;


      await complaint.save();


      return res.status(200).json({

        message:
          "Complaint assigned successfully.",

        complaint

      });


    } catch (error) {

      console.error(
        "Assign complaint error:",
        error
      );


      return res.status(500).json({

        message:
          "Server Error"

      });

    }

  };


// =====================================================
// GET AUTHORITY'S ASSIGNED COMPLAINTS
// =====================================================

const getAssignedComplaints =
  async (req, res) => {

    try {

      const authority =
        await Authority.findOne({

          user:
            req.user.id

        });


      if (!authority) {

        return res.status(404).json({

          message:
            "Authority profile not found."

        });

      }


      const complaints =
        await Complaint.find({

          assignedAuthority:
            authority._id

        })

        .populate(
          "user",
          "name email"
        )

        .sort({

          createdAt:
            -1

        });


      return res.status(200).json({

        count:
          complaints.length,

        complaints

      });


    } catch (error) {

      console.error(
        "Get assigned complaints error:",
        error
      );


      return res.status(500).json({

        message:
          "Server Error"

      });

    }

  };


// =====================================================
// UPDATE ASSIGNED COMPLAINT STATUS
// AUTHORITY ONLY
// =====================================================

const updateAssignedComplaintStatus =
  async (req, res) => {

    try {

      const {
        complaintId,
        status,
        remark
      } = req.body;


      // -------------------------------------------------
      // REQUIRED FIELDS
      // -------------------------------------------------

      if (
        !complaintId ||
        !status
      ) {

        return res.status(400).json({

          message:
            "complaintId and status are required."

        });

      }


      // -------------------------------------------------
      // VALID STATUS
      // -------------------------------------------------

      const allowedStatuses = [

        "Pending",

        "In Progress",

        "Resolved"

      ];


      if (
        !allowedStatuses.includes(
          status
        )
      ) {

        return res.status(400).json({

          message:
            "Invalid complaint status."

        });

      }


      // -------------------------------------------------
      // FIND AUTHORITY
      // -------------------------------------------------

      const authority =
        await Authority.findOne({

          user:
            req.user.id,

          isActive:
            true

        });


      if (!authority) {

        return res.status(403).json({

          message:
            "Active authority profile not found."

        });

      }


      // -------------------------------------------------
      // FIND COMPLAINT
      // -------------------------------------------------

      const complaint =
        await Complaint.findById(
          complaintId
        );


      if (!complaint) {

        return res.status(404).json({

          message:
            "Complaint not found."

        });

      }


      // -------------------------------------------------
      // VERIFY ASSIGNMENT
      // -------------------------------------------------

      if (
        !complaint.assignedAuthority ||
        complaint.assignedAuthority.toString() !==
          authority._id.toString()
      ) {

        return res.status(403).json({

          message:
            "This complaint is not assigned to your authority profile."

        });

      }


      // -------------------------------------------------
      // SAVE PREVIOUS STATUS
      // -------------------------------------------------

      const previousStatus =
        complaint.status;


      // -------------------------------------------------
      // UPDATE STATUS
      // -------------------------------------------------

      complaint.status =
        status;


      await complaint.save();


      // -------------------------------------------------
      // CREATE STATUS HISTORY
      // -------------------------------------------------

      const history =
        await ComplaintHistory.create({

          complaint:
            complaint._id,

          previousStatus:
            previousStatus,

          newStatus:
            status,

          changedBy:
            req.user.id,

          remark:
            remark || ""

        });


      // -------------------------------------------------
      // CREATE CITIZEN NOTIFICATION
      // -------------------------------------------------

      let notificationType =
        "Status Updated";


      if (
        status ===
        "Resolved"
      ) {

        notificationType =
          "Complaint Resolved";

      }


      await createNotification({

        userId:
          complaint.user,

        complaintId:
          complaint._id,

        title:
          "Complaint Status Updated",

        message:
          `Your complaint "${complaint.title}" status has been updated from "${previousStatus}" to "${status}".`,

        type:
          notificationType

      });


      // -------------------------------------------------
      // RESPONSE
      // -------------------------------------------------

      return res.status(200).json({

        message:
          "Complaint status updated successfully.",

        complaint,

        history

      });


    } catch (error) {

      console.error(
        "Update assigned complaint status error:",
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

  createAuthority,

  getAuthorities,

  getAuthorityById,

  assignComplaint,

  getAssignedComplaints,

  updateAssignedComplaintStatus

};