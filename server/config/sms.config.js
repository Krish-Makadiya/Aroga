const twilio = require("twilio");
const dotenv = require("dotenv");
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

console.log("Twilio Config:", {
    accountSid,
    authToken: authToken ? "[REDACTED]" : null,
    fromPhoneNumber,
});

const client = twilio(accountSid, authToken);

const sendSms = async (to, body) => {
    let messageOptions = {
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
        body,
    };

    try {
        const message = await client.messages.create(messageOptions);
        console.log(`SMS sent to ${to}: ${message.sid}`);
        return message;
    } catch (error) {
        console.error(`Failed to send SMS to ${to}:`, error);
        throw error;
    }
};

module.exports = {
    sendSms,
};
