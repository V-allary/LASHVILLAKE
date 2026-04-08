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

// ===== Contact / Booking Route =====
app.post('/submit-form', async (req, res) => {
  try {
    const { name, phone, service, lashtech, date, time } = req.body;

    if (!name || !phone || !service || !lashtech || !date || !time) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const recipientEmail = 'vallarymitchelle257@gmail.com';

    // Email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: recipientEmail,
        pass: process.env.PTSO, 
      },
    });

    // Email content
    const mailOptions = {
      from: `"lashvilla ke Website" <${recipientEmail}>`,
      to: recipientEmail,
      replyTo: email,
      subject: 'New Booking – Lashvilla_Ke',
      text: `
          Name: ${name}
          Phone: ${phone}
          Service: ${service}
          Lash Tech: ${lashtech}
          Date: ${date}
          Time: ${time}
          `  
    };

    // Send email
    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error('Email error:', err);
        return res.redirect('/?error=true');
      }

      // SUCCESS → redirect back to homepage
      res.redirect('/?success=true');
    });

  } catch (error) {
    console.error('Server error:', error);
    res.redirect('/?error=true');
  }
})
// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});