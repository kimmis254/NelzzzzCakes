const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const xlsx = require("xlsx");
const fs = require("fs");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const FILE_PATH = "orders.xlsx";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "wk.kathanzu@gmail.com",
    pass: "opno pvbc mtho qccc", // 🔥 Use an App Password, NOT your real password
  },
});

const saveToExcel = (order) => {
  let workbook;
  if (fs.existsSync(FILE_PATH)) {
    workbook = xlsx.readFile(FILE_PATH);
  } else {
    workbook = xlsx.utils.book_new();
  }

  let worksheet = workbook.Sheets["Orders"];

  if (!worksheet) {
    worksheet = xlsx.utils.json_to_sheet([]);
    xlsx.utils.book_append_sheet(workbook, worksheet, "Orders");
  }

  let existingData = xlsx.utils.sheet_to_json(worksheet);
  existingData.push(order);
  const newWorksheet = xlsx.utils.json_to_sheet(existingData);
  workbook.Sheets["Orders"] = newWorksheet;

  xlsx.writeFile(workbook, FILE_PATH);
};

const sendEmail = (order) => {
  const mailOptions = {
    from: "wk.kathanzu@gmail.com",
    to: "kathanzuwayne2@gmail.com",
    subject: "New Order Received! 🎂",
    text: `A new order has been placed:\n\n${JSON.stringify(order, null, 2)}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Error sending email:", error);
    } else {
      console.log("✅ Email sent successfully:", info.response);
    }
  });
};

app.post("/create-order", (req, res) => {
  try {
    console.log("🔹 Request Received:", req.body);

    const newOrder = {
      "Order Type": req.body.order_type,
      "Flavor": req.body.flavor,
      "Quantity": req.body.quantity,
      "Price (Ksh)": req.body.price,
      "Color": req.body.color || "N/A",
      "Design": req.body.design || "N/A",
      "Inscription Color": req.body.inscription_color || "N/A",
      "Icing Color": req.body.icing_color || "N/A",
      "Toppings": req.body.toppings || "N/A",
      "Additional Info": req.body.additional_info || "None",
      "Customer Name": req.body.name,
      "Customer Email": req.body.email,
      "Customer Phone": req.body.phone,
      "Delivery Method": req.body.deliveryMethod,
      "Delivery Address": req.body.deliveryAddress,
      "Delivery Date": req.body.deliveryDate,
      "Delivery Time": req.body.deliveryTime
    };

    saveToExcel(newOrder);
    sendEmail(newOrder);

    res.status(201).json({ message: "✅ Order saved & email sent!" });

  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running at http://127.0.0.1:${PORT}`));
