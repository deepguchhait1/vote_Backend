import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
export const userProtection = async (req, res, next) => {
  try {
    const token = req.cookies.user;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }

    const decode = jwt.verify(token, process.env.JWT_KEY);

    if (!decode) {
      return res.status(401).json({ message: "Unauthorized - Invalied Token" });
    }

    const user = await User.findById(decode.id).select("name image");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    req.user = user;
    next();

  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
    console.log("Error in userMiddleware controller :", error);
  }
};
