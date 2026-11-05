const statuscode = require("../utils/statuscode");
const jwt = require("jsonwebtoken");
const User = require("../model/user.model");
class AuthMiddleware {
  static async verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(statuscode.UNAUTHORIZED).json({
        status: false,
        message: "Authorization token is required",
      });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(statuscode.UNAUTHORIZED).json({
        status: false,
        message: "Invalid authorization format. Use Bearer token",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(statuscode.NOT_FOUND).json({
        status: false,
        message: "User not found",
      });
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      secretKey: user.secretKey,
    };

    next();

  } catch (error) {
    return res.status(statuscode.UNAUTHORIZED).json({
      status: false,
      message: error.message,
    });
  }
}
}

module.exports = AuthMiddleware;
