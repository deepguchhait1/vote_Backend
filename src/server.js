import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoutes from "./routes/userAuth.route.js";
import userControlRoutes from "./routes/userControl.route.js";
import adminRoutes from "./routes/adminAuth.route.js";
import adminControlRoutes from "./routes/adminControl.route.js";
import DbConn from "./utils/dbconn.js";

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/user", userRoutes);
app.use("/api/user", userControlRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminControlRoutes);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

try {
  await DbConn();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (error) {
  console.error("Database connection failed:", error);
  process.exit(1);
}
