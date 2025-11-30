const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: "/.env" });
const { clerkMiddleware } = require("@clerk/express");
const connectDB = require("./config/mongoDB");
const patientRoute = require("./routes/patient.route");
const doctorRoute = require("./routes/doctor.route");
const pharmacyRoute = require("./routes/pharmacy.route");
const eventRoute = require("./routes/event.route");
const aiRoutes = require("./routes/ai.route");
const appointmentRoute = require("./routes/appointment.route");
const articleRoute = require("./routes/articles.route");
const paymentRoute = require("./routes/payment.routes");
const geminiRoutes = require("./routes/gemini.route");
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

// Serve static uploads before auth to avoid protecting files unintentionally
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(clerkMiddleware());

app.use("/api/patient", patientRoute);
app.use("/api/doctor", doctorRoute);
app.use("/api/pharmacy", pharmacyRoute);

app.use("/api/payment", paymentRoute);

app.use("/api/event", eventRoute);
app.use("/api/appointment", appointmentRoute);
app.use("/api/ai", aiRoutes);
app.use("/api/articles", articleRoute);
app.use("/api/gemini", geminiRoutes);
app.get("/", (req, res) => {
    res.send("API is running!");
});

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
