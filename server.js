const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Middleware =====
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ===== MongoDB Connection =====
mongoose.connect(
  `mongodb+srv://lashvillake:${mdso}@cluster1.ihlfscu.mongodb.net/lashvillake?retryWrites=true&w=majority&appName=Cluster1`
)
.then(() => console.log(' MongoDB connected'))
.catch(err => console.error('MongoDB error:', err));


// ===== Booking Model =====
const bookingSchema = new mongoose.Schema({
  name: String,
  phone: String,
  service: String,
  lashtech: String,
  date: String,
  time: String
});

const Booking = mongoose.model("Booking", bookingSchema);

// ===== Homepage Route =====
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// ===== GET AVAILABLE TIMES =====
app.get('/available-times', async (req, res) => {
  try {
    const { lashtech, date } = req.query;

    if (!lashtech || !date) {
      return res.status(400).json({ message: "Missing data" });
    }

    const bookings = await Booking.find({ lashtech, date });
    const bookedTimes = bookings.map(b => b.time);

    res.json(bookedTimes);

  } catch (error) {
    console.error("Error fetching times:", error);
    res.status(500).json({ message: "Error fetching times" });
  }
});

// ===== BOOKING ROUTE =====
app.post('/submit-form', async (req, res) => {
  try {
    const { name, phone, service, lashtech, date, time } = req.body;

    // ===== Validation =====
    if (!name || !phone || !service || !lashtech || !date || !time) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // ===== CHECK DOUBLE BOOKING (PER LASH TECH) =====
    const existingBooking = await Booking.findOne({
      lashtech,
      date,
      time
    });

    if (existingBooking) {
      return res.status(400).json({
        message: `This lash tech is already booked on ${date} at ${time}. Please choose another time.`
      });
    }

    // ===== SAVE BOOKING =====
    const newBooking = new Booking({
      name,
      phone,
      service,
      lashtech,
      date,
      time
    });

    await newBooking.save();


    // ===== EMAIL SECTION =====
    const recipientEmail = 'vallarymitchelle257@gmail.com';

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: recipientEmail,
        pass: process.env.PTSO,
      },
    });

    await transporter.sendMail({
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
    });

    console.log("✅ Booking saved & email sent");

    res.status(200).json({
      message: "Booking successful 💖"
    });

  } catch (error) {
    console.error(" Booking error:", error);
    res.status(500).json({
      message: "Server error"
    });
  }
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});