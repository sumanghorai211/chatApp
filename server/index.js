const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/connectDB");
const router = require("./routes/index");
const cookieParser = require("cookie-parser");
const { app, server } = require("./socket/index");

// Initialize express app
// const app = express()
app.use(
  cors({
    origin: [
      "https://endearing-gumdrop-ad1ace.netlify.app",
      "http://localhost:3000",
      "https://magenta-sunflower-b293bc.netlify.app",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 8080;

app.get("/", (request, response) => {
  response.json({
    message: "Server running at " + PORT,
  });
});

// API endpoints
app.use("/api", router);

// Connect to the database and start the server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log("Server running at " + PORT);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database", error);
  });
