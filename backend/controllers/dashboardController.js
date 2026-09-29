const Complaint = require("../models/Complaint");


// =====================================================
// GET DASHBOARD STATISTICS
// =====================================================

const getStatistics = async (req, res) => {
  try {

    // Total complaints
    const total = await Complaint.countDocuments();


    // Pending complaints
    const pending = await Complaint.countDocuments({
      status: "Pending"
    });


    // In Progress complaints
    const inProgress = await Complaint.countDocuments({
      status: "In Progress"
    });


    // Resolved complaints
    const resolved = await Complaint.countDocuments({
      status: "Resolved"
    });


    // High + Critical severity complaints
    const highSeverity = await Complaint.countDocuments({
      severity: {
        $in: ["High", "Critical"]
      }
    });


    // Complaints grouped by damage type
    const byDamageType = await Complaint.aggregate([
      {
        $group: {
          _id: "$damageType",
          count: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          count: -1
        }
      }
    ]);


    // Send response
    return res.status(200).json({

      total,

      pending,

      inProgress,

      resolved,

      highSeverity,

      byDamageType

    });

  } catch (error) {

    console.error(
      "Dashboard statistics error:",
      error
    );

    return res.status(500).json({
      message: "Server Error"
    });

  }
};


module.exports = {
  getStatistics
};
