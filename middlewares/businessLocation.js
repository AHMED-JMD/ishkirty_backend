const getBusinessLocation = (req) => {
  return req.header("business_location") || req.body?.business_location || null;
};

const requireBusinessLocation = (req, res) => {
  const business_location = getBusinessLocation(req);
  if (!business_location) {
    res.status(400).json("business_location is required");
    return null;
  }
  return business_location;
};

module.exports = { getBusinessLocation, requireBusinessLocation };
