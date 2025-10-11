// index.js
import express from "express";
import { config } from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { dbConnection } from "./config/db.connnection.js";
import { farmerRoutes } from "./routes/farmer.js";


config();
const app = express();

// Middlewares
const allowedOrigins = [
  "http://localhost:8080",
  "https://labbackend-2d5l.onrender.com",
];

app.use(cors({
  origin: function(origin, callback) {
    // React Native requests may have no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ------------------- Server Check Routes -------------------
app.get("/", (req, res) => {
  res.send("Server is Running!");
});

app.get("/testApi", (req, res) => {
  console.log("done");
  res.json({
    name: "Kiran",
    sirname: "Rathod",
  });
});

// ------------------- Hyperledger Fabric Routes -------------------

// ------------------- MongoDB Connection -------------------
dbConnection(process.env.MONGODB_URI)
  .then(() => {
    console.log("MONGODB IS CONNECTED");
  })
  .catch((err) => {
    console.log("Error", err);
  });

// ------------------- Farmer Routes -------------------
app.use("/api", farmerRoutes);

// ------------------- Start Server -------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Local Server is Running on Port: http://localhost:${PORT}`);
  console.log(`Live Server run : ${process.env.DEPLOYED_URL}`);
});

