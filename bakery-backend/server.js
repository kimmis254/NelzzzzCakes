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

// Email Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "wk.kathanzu@gmail.com", // Replace with your bakery's email
    pass: "Waynekim254", // Replace with the actual email password (or use an app password)
  },
});

// Function to save data to Excel
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

// Function to send email
const sendEmail = (order) => {
  const mailOptions = {
    from: "yourbakeryemail@gmail.com",
    to: "bakeryowner@gmail.com", // Change to the owner's email
    subject: "New Cake Order Received",
    text: `A new order has been placed:\n\n${JSON.stringify(order, null, 2)}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent successfully:", info.response);
    }
  });
};

app.post("/create-order", (req, res) => {
  const {
    order_type,
    flavor,
    quantity,
    price,
    color,
    design,
    inscription_color,
    icing_color,
    toppings,
    additional_info
  } = req.body;

  if (!order_type || !flavor || !quantity || !price) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newOrder = {
    "Order Type": order_type,
    "Flavor": flavor,
    "Quantity": quantity,
    "Price (Ksh)": price,
    "Color": color || "N/A",
    "Design": design || "N/A",
    "Inscription Color": inscription_color || "N/A",
    "Icing Color": icing_color || "N/A",
    "Toppings": toppings || "N/A",
    "Additional Info": additional_info || "None",
    "Order Time": new Date().toLocaleString(),
  };

  saveToExcel(newOrder);
  res.status(201).json({ message: "Order saved successfully!" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://127.0.0.1:${PORT}`);
});
