const Notification =
  require("../models/Notification");


// =====================================================
// GET USER NOTIFICATIONS
// =====================================================

const getNotifications =
  async (req, res) => {

    try {

      const notifications =
        await Notification.find({

          user:
            req.user.id

        })
        .populate(
          "complaint",
          "title status severity"
        )
        .sort({
          createdAt: -1
        });


      return res.status(200).json({

        count:
          notifications.length,

        unreadCount:
          notifications.filter(
            notification =>
              !notification.isRead
          ).length,

        notifications

      });


    } catch (error) {

      console.error(
        "Get notifications error:",
        error
      );


      return res.status(500).json({

        message:
          "Server Error"

      });

    }

  };


// =====================================================
// MARK NOTIFICATION AS READ
// =====================================================

const markAsRead =
  async (req, res) => {

    try {

      const notification =
        await Notification.findOne({

          _id:
            req.params.id,

          user:
            req.user.id

        });


      if (!notification) {

        return res.status(404).json({

          message:
            "Notification not found."

        });

      }


      notification.isRead =
        true;


      await notification.save();


      return res.status(200).json({

        message:
          "Notification marked as read.",

        notification

      });


    } catch (error) {

      console.error(
        "Mark notification error:",
        error
      );


      return res.status(500).json({

        message:
          "Server Error"

      });

    }

  };


// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// =====================================================

const markAllAsRead =
  async (req, res) => {

    try {

      await Notification.updateMany(

        {
          user:
            req.user.id,

          isRead:
            false
        },

        {
          $set: {
            isRead:
              true
          }
        }

      );


      return res.status(200).json({

        message:
          "All notifications marked as read."

      });


    } catch (error) {

      console.error(
        "Mark all notifications error:",
        error
      );


      return res.status(500).json({

        message:
          "Server Error"

      });

    }

  };


module.exports = {

  getNotifications,

  markAsRead,

  markAllAsRead

};