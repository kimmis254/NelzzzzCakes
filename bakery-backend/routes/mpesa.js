const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();

// ✅ Generate M-Pesa Access Token
async function getMpesaAccessToken() {
  const { MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET } = process.env;
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64");

  try {
    const response = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: { Authorization: `Basic ${auth}` }
    });
    return response.data.access_token;
  } catch (error) {
    console.error("❌ M-Pesa Token Error:", error);
    throw new Error("Failed to generate M-Pesa token");
  }
}

async function getMpesaAccessToken() {
  try {
    const auth = `Basic ${Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64")}`;
    const response = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: { Authorization: auth },
    });
    return response.data.access_token;
  } catch (error) {
    console.error("❌ Error Fetching M-Pesa Access Token:", error.response?.data || error);
    throw new Error("Failed to retrieve M-Pesa access token");
  }
}

// ✅ Function to Generate Timestamp
function getTimestamp() {
  return new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
}

// ✅ Function to Generate Password
function getMpesaPassword() {
  const timestamp = getTimestamp();
  return Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString("base64");
}

// ✅ Route: Initiate M-Pesa Payment
router.post("/pay-mpesa", async (req, res) => {
  try {
    let { phone, amount } = req.body;

    // ✅ Validate input fields
    if (!phone || !amount) {
      return res.status(400).json({ error: "❌ Missing phone number or amount" });
    }

    // ✅ Convert phone number to international format
    phone = phone.trim();
    if (phone.startsWith("07")) {
      phone = phone.replace("07", "2547");
    } else if (phone.startsWith("01")) {
      phone = phone.replace("01", "2541");
    } else if (!phone.startsWith("254")) {
      return res.status(400).json({ error: "❌ Invalid phone number format. Use 07XXXXXXXX or 2547XXXXXXXX." });
    }

    // ✅ Convert amount to a valid number and round it
    amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "❌ Invalid payment amount" });
    }
    amount = Math.round(amount); // Ensure whole number for M-Pesa

    console.log(`🔹 Corrected Price: ${amount} Ksh, Sending to M-Pesa...`);

    // ✅ Retrieve M-Pesa Access Token
    const token = await getMpesaAccessToken();
    const password = getMpesaPassword();
    const timestamp = getTimestamp();

    // ✅ M-Pesa STK Push Request Body
    const requestBody = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount, // ✅ Ensure amount is correct
      PartyA: phone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: "NELZZ BAKERY",
      TransactionDesc: "Bakery Order Payment",
    };

    console.log("🔹 Sending M-Pesa STK Push Request...", requestBody);

    // ✅ Send M-Pesa STK Push Request
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      requestBody,
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );

    console.log("✅ M-Pesa STK Push Response:", response.data);
    return res.status(200).json({ message: `✅ M-Pesa STK Push sent for Ksh ${amount}! Check your phone.`, response: response.data });

  } catch (error) {
    console.error("❌ M-Pesa Payment Error:", error.response?.data || error);
    return res.status(500).json({ error: "Failed to process M-Pesa payment" });
  }
});

router.post("/mpesa-callback", async (req, res) => {
  console.log("🔹 M-Pesa Callback Received:", req.body);

  if (!req.body.Body.stkCallback) {
    return res.status(400).json({ error: "Invalid callback data" });
  }

  const callbackData = req.body.Body.stkCallback;
  const resultCode = callbackData.ResultCode;

  let paymentStatus = {
    status: resultCode === 0 ? "success" : "failed",
    phoneNumber: callbackData.CallbackMetadata?.Item.find(i => i.Name === "PhoneNumber")?.Value || "Unknown",
    amount: callbackData.CallbackMetadata?.Item.find(i => i.Name === "Amount")?.Value || "Unknown",
    receipt: callbackData.CallbackMetadata?.Item.find(i => i.Name === "MpesaReceiptNumber")?.Value || "Unknown",
    reason: resultCode !== 0 ? callbackData.ResultDesc : "Payment Successful",
    timestamp: new Date().toISOString()
  };

  // ✅ Store payment status
  fs.writeFileSync("payment-status.json", JSON.stringify(paymentStatus, null, 2));

  return res.status(200).json({ message: "✅ Payment Status Updated", paymentStatus });
});

// ✅ API to check payment status from frontend
router.get("/payment-status", (req, res) => {
  if (fs.existsSync("payment-status.json")) {
    const status = JSON.parse(fs.readFileSync("payment-status.json"));
    return res.json(status);
  } else {
    return res.json({ status: "pending" });
  }
});

module.exports = router;
