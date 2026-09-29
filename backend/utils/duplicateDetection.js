const Complaint = require("../models/Complaint");


// =====================================================
// DISTANCE BETWEEN TWO GPS COORDINATES
// Uses Haversine Formula
// Returns distance in meters
// =====================================================

const calculateDistance = (
  latitude1,
  longitude1,
  latitude2,
  longitude2
) => {

  const earthRadius = 6371000;

  const toRadians = (degree) => {
    return degree * (Math.PI / 180);
  };

  const lat1 = toRadians(latitude1);
  const lat2 = toRadians(latitude2);

  const deltaLatitude =
    toRadians(latitude2 - latitude1);

  const deltaLongitude =
    toRadians(longitude2 - longitude1);


  const a =
    Math.sin(deltaLatitude / 2) *
      Math.sin(deltaLatitude / 2) +

    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2);


  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );


  return earthRadius * c;
};


// =====================================================
// FIND POSSIBLE DUPLICATE COMPLAINTS
// =====================================================

const findPossibleDuplicates = async ({
  latitude,
  longitude,
  damageType,
  radiusInMeters = 100
}) => {

  const complaints =
    await Complaint.find({
      damageType: damageType
    });


  const duplicates = [];


  for (const complaint of complaints) {

    const distance =
      calculateDistance(
        latitude,
        longitude,
        complaint.latitude,
        complaint.longitude
      );


    if (
      distance <=
      radiusInMeters
    ) {

      duplicates.push({

        complaint,

        distance: Math.round(
          distance
        )

      });

    }

  }


  return duplicates;
};


module.exports = {

  calculateDistance,

  findPossibleDuplicates

};