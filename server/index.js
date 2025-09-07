// server/index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { clerkMiddleware } = require("@clerk/express");
const connectDB = require("./config/mongoDB");
const patientRoute = require("./routes/patient.route");
const eventRoute = require("./routes/event.route");
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());


app.use("/api/patient", patientRoute);
app.use("/api/event", eventRoute);

app.get("/", (req, res) => {
    res.send("API is running!");
});

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
