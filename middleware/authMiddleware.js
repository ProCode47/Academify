const { User } = require('../models/index');
const authController = require('../controllers/auth');

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    console.error("Authorization token not provided");
    return res.status(401).json({ message: 'Authorization token not provided' });
  }

  try {
    console.log("Token received: ", token);

    // Remove 'Bearer ' prefix if present
    const tokenValue = token.startsWith("Bearer ") ? token.slice(7, token.length) : token;

    const decodedToken = authController.verifyToken(tokenValue);
    console.log("Decoded token: ", decodedToken);

    const userId = decodedToken.userId;

    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found");
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error authenticating user:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = authenticate;
