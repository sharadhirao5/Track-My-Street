const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {

  let token;

  // =====================================================
  // CHECK AUTHORIZATION HEADER
  // =====================================================

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {

    try {

      // -------------------------------------------------
      // EXTRACT TOKEN
      // -------------------------------------------------

      token =
        req.headers.authorization.split(" ")[1];


      // -------------------------------------------------
      // VERIFY TOKEN
      // -------------------------------------------------

      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );


      // -------------------------------------------------
      // SAVE USER INFORMATION
      // -------------------------------------------------

      req.user =
        decoded;


      return next();

    } catch (error) {

      return res.status(401).json({

        message:
          "Invalid Token"

      });

    }

  }


  // =====================================================
  // NO TOKEN
  // =====================================================

  return res.status(401).json({

    message:
      "No Token Provided"

  });

};


module.exports =
  protect;