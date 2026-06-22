import Admin from "../models/admin.model.js";
import jwt from "jsonwebtoken";

export const adminProtection = async (req, res, next) => {
  try {
    const token = req.cookies.admin;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }

    const decode = jwt.verify(token, process.env.JWT_KEY);

    if (!decode) {
      return res.status(401).json({ message: "Unauthorized - Invalied Token" });
    }

    const user = await Admin.findById(decode.admin).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    req.admin = user;
    next();

  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    console.log("Error in userMiddleware controller :", error);
  }
};
