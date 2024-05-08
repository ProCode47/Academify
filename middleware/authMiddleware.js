const jwt = require("jsonwebtoken");
const { User } = require("../models/index");
const config = require('../config/config')


const JWT_SECRET =  config.secretKey

// Middleware function to authenticate users
async function authenticate(req, res, next) {
  // Extract the JWT token from the request headers
  const authorizationHeader = req.headers.authorization;
  // Extract the token without the "Bearer" prefix
  const [prefix, token] = authorizationHeader.split(" ");
  console.log(token);

  if (!token) {
    return res
      .status(401)
      .json({ message: "Authorization token not provided" });
  }

  try {
    // Verify the JWT token
    const decodedToken = jwt.verify(token, JWT_SECRET);

    // Retrieve user ID from the decoded token
    const userId = decodedToken.userId;

    // Find the user in the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach the user object to the request for further handling
    console.log({user})
    req.user = user;
    next();
  } catch (error) {
    console.error("Error authenticating user:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = authenticate;
