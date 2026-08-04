const cors = require("cors");
const express = require("express");
const router = require("./routes");

const app = express();


const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Non-browser tools / same-origin
    if (!origin) return callback(null, true);

    const normalized = origin.replace(/\/+$/, "");

    if (
      allowedOrigins.includes("*") ||
      allowedOrigins.includes(normalized) ||
      normalized.endsWith(".vercel.app") ||
      normalized === "http://localhost:5173" ||
      normalized === "http://127.0.0.1:5173"
    ) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1", router);

module.exports = app;
