const mongoose = require("mongoose");


// =====================================================
// VALIDATE MONGODB OBJECT ID
// =====================================================

const validateObjectId =
  (parameterName) => {

    return (req, res, next) => {

      const id =
        req.params[
          parameterName
        ];


      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {

        return res.status(400).json({

          message:
            `Invalid ${parameterName}.`

        });

      }


      next();

    };

  };


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  validateObjectId
};