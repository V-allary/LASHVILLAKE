const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Middleware =====
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ===== Homepage Route =====
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// ===== Booking Route =====
app.post('/submit-form', async (req, res) => {
  try {
    const { name, phone, service, lashtech, date, time } = req.body;

    // ===== Validation =====
    if (!name || !phone || !service || !lashtech || !date || !time) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const recipientEmail = 'vallarymitchelle257@gmail.com';

    // ===== Email Transporter =====
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: recipientEmail,
        pass: process.env.PTSO, // Gmail App Password
      },
    });

    // ===== Email Content =====
    const mailOptions = {
      from: `"LashVilla Booking" <${recipientEmail}>`,
      to: recipientEmail,
      subject: 'New Booking – LashVilla Kenya',
      text: `
NEW BOOKING RECEIVED 💖

Name: ${name}
Phone: ${phone}
Service: ${service}
Lash Tech: ${lashtech}
Date: ${date}
Time: ${time}
      `
    };

    // ===== Send Email =====
    await transporter.sendMail(mailOptions);

    console.log("Email sent successfully");

    // ===== Send Response to Frontend =====
    res.status(200).json({ message: "Booking sent successfully" });

  } catch (error) {
    console.error(" Email error:", error);

    res.status(500).json({ message: "Email failed to send" });
  }
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});