const cors = require("cors");
const express = require("express");
const router = require("./routes");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
);
app.use(express.json());
app.use("/api/v1", router);

module.exports = app;
