import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // The decoded payload will be an object like { userId, role? }
    // We attach the whole object to req.user
    req.user = decoded;

    next();
  } catch (error) {
    // This catches errors like an expired or malformed token
    return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
  }
};