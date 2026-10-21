const Notification = require("../models/Notification");


// =====================================================
// CREATE NOTIFICATION
// =====================================================

const createNotification = async ({
  userId,
  complaintId,
  title,
  message,
  type
}) => {

  try {

    const notification =
      await Notification.create({

        user: userId,

        complaint: complaintId,

        title,

        message,

        type:
          type || "Status Updated"

      });

    return notification;

  } catch (error) {

    console.error(
      "Notification creation error:",
      error
    );

    return null;

  }
};


module.exports = {
  createNotification
};