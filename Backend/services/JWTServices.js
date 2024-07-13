const jwt = require("jsonwebtoken");
const { secret_acce_key, refresh_key } = require("../Config/index");
const RefreshToken = require("../models/JWT");

class JWTService {
  // 1 Access Token
  static accessToken(payload, expiryTime) {
    return jwt.sign(payload, secret_acce_key, { expiresIn: expiryTime });
  }
  // 2 Refresh Token
  static refreshToken(payload, expiryTime) {
    return jwt.sign(payload, refresh_key, { expiresIn: expiryTime });
  }
  // 3 Verify Access Token
  static verifyAccessToken(token) {
    return jwt.verify(token, secret_acce_key);
  }
  // 4 Verify Refresh Token
  static verifyRefreshToken(token) {
    return jwt.verify(token, refresh_key);
  }
  // 5 Save Refresh Token
  static async saveRefreshToken(token, userId) {
    try {
      const newToken = new RefreshToken({
        token: token,
        userId: userId,
      });
      await newToken.save();
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = JWTService;
