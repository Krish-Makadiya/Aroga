const Razorpay = require("razorpay");
const crypto = require("crypto");
const Appointment = require("../schema/appointment.schema");

const paymentOrderController = async (req, res) => {
    try {
        var instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const order = await instance.orders.create({
            amount: req.body.amount * 100,
            currency: "INR",
            receipt: "receipt#1",
        });

        return res.status(200).json({
            success: true,
            message: "Payment order created successfully",
            data: order,
        });
    } catch (error) {
        console.error("Error creating payment order:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create payment order",
            error: error.message,
        });
    }
};

const savePaymentData = async (req, res) => {
    try {
        const { appointmentId, status, orderId, paymentId } = req.body;

        if (!appointmentId || !status) {
            return res.status(400).json({
                success: false,
                message: "appointmentId and status are required",
            });
        }

        let paymentStatus = status.toLowerCase();
        if (paymentStatus === "unpaid") {
            paymentStatus = "pending";
        }

        const paymentData = {
            status: paymentStatus,
            orderId: orderId || "",
            paymentId: paymentId || "",
        };

        if (paymentStatus === "paid") {
            paymentData.paidAt = new Date();
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { payment: paymentData },
            { new: true }
        );

        if (!updatedAppointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Payment data saved successfully",
            data: updatedAppointment,
        });
    } catch (error) {
        console.error("Error saving payment data:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to save payment data",
            error: error.message,
        });
    }
};

module.exports = { paymentOrderController, savePaymentData };
