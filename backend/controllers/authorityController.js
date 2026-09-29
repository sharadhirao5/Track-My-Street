const Authority =
  require("../models/Authority");

const User =
  require("../models/User");

const Complaint =
  require("../models/Complaint");


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
        await User.findById(
          userId
        );


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
// EXPORT
// =====================================================

module.exports = {

  createAuthority,

  getAuthorities,

  getAuthorityById,

  assignComplaint,

  getAssignedComplaints

};