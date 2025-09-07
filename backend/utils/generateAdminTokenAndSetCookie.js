import jwt from "jsonwebtoken";

export const generateAdminTokenAndSetCookie = (res, adminId) => {
  const payload = {
    userId: adminId,
    role: "admin",
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true, //Security reason
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};
