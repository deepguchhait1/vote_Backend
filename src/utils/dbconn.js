import mongoose from "mongoose";

const DbConn = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    if (conn) {
      console.log("✅ DB connection Successful ");
    }
  } catch (error) {
    console.log("Error in Database Connection :", error);
  }
};

export default DbConn;
