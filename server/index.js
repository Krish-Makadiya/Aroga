const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "/.env" });
const { clerkMiddleware } = require("@clerk/express");
const connectDB = require("./config/mongoDB");
const patientRoute = require("./routes/patient.route");
const doctorRoute = require("./routes/doctor.route");
const pharmacyRoute = require("./routes/pharmacy.route");
const eventRoute = require("./routes/event.route");
const womenHealthRoute = require("./routes/womenhealth.route");
const womenhealthAiRoute = require('./routes/womenhealthai.route');
const aiRoutes = require("./routes/ai.route");
const appointmentRoute = require("./routes/appointment.route");
const articleRoute = require("./routes/articles.route");
const paymentRoute = require("./routes/payment.routes");
const healthRoute = require("./routes/health.route.js");
const webhookRoute = require("./routes/webhook.route");
const medicineRoute = require("./routes/medicine.Routes");
const pharmacyLocationRoute = require("./routes/pharmacy_Location.routes");
const pharmacyBillRoute = require("./routes/pharmcy.bill.route");
const { startReminderCron } = require("./config/reminderCronJob.js");
const { startPrescriptionCron } = require("./config/prescriptionJob.js");
const adminRoute = require('./routes/admin.route');
const emergencyRoute = require('./routes/emergency.route');
const governmentDoctorsRoute = require('./routes/governmentDoctors.route');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use("/api/patient", patientRoute);
app.use("/api/doctor", doctorRoute);
app.use("/api/pharmacy", pharmacyRoute);

app.use("/api/payment", paymentRoute);
app.use("/api/webhook", webhookRoute);

app.use("/api/event", eventRoute);
app.use("/api/womenhealth", womenHealthRoute);
app.use('/api/womenhealthai', womenhealthAiRoute);
app.use("/api/appointment", appointmentRoute);
app.use("/api/ai", aiRoutes);
app.use("/api/articles", articleRoute);
app.use("/api", healthRoute);

app.use("/api/medicine", medicineRoute);
app.use("/api/pharmacyLocation", pharmacyLocationRoute);
app.use("/api/pharmacyBill", pharmacyBillRoute);

app.use('/api/admin', adminRoute);
app.use('/api/emergency', emergencyRoute);
app.use('/api/government-doctors', governmentDoctorsRoute);

app.get("/", (req, res) => {
    res.send("API is running!");
});

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
    // startReminderCron();
    // startPrescriptionCron();
});
