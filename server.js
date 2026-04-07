const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// =========================
// MIDDLEWARE
// =========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// =========================
// MONGODB CONNECTION
// =========================
const mongoPassword = process.env.MDSO;

mongoose.connect(
  `mongodb+srv://lashvillake:${mongoPassword}@cluster1.ihlfscu.mongodb.net/lashvillake?retryWrites=true&w=majority&appName=Cluster1`
)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(' MongoDB connection error:', err));

// =========================
// ALLOWED TIME SLOTS
// =========================
const allowedTimeSlots = [
  "08:00-10:00",
  "10:00-12:00",
  "12:00-14:00",
  "14:00-16:00",
  "16:00-18:00",
  "18:00-20:00"
];

// =========================
// BOOKING SCHEMA
// =========================
const bookingSchema = new mongoose.Schema({
  clientName: String,
  phone: String,
  service: String,
  lashTech: String,
  date: String,
  timeSlot: String,
  status: { type: String, default: 'confirmed' }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

// =========================
// EMAIL SETUP (SAFE)
// =========================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'vallarymitchelle257@gmail.com',
    pass: process.env.EMAIL_PASS
  }
});

// =========================
// ROUTES
// =========================

// Homepage (only if hosting frontend on Render)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// =========================
// BOOKING ENDPOINT
// =========================
app.post('/submit-form', async (req, res) => {
  const {
    clientName,
    phone,
    service,
    lashTech,
    date,
    timeSlot
  } = req.body;

  try {
    console.log('Incoming booking:', req.body);

    // =========================
    // VALIDATION
    // =========================
    if (!clientName || !phone || !service || !lashTech || !date || !timeSlot) {
      return res.status(400).json({
        message: 'Please fill in all required booking fields.'
      });
    }

    // Validate time slot
    if (!allowedTimeSlots.includes(timeSlot)) {
      return res.status(400).json({
        message: `Invalid time slot. Allowed: ${allowedTimeSlots.join(', ')}`
      });
    }

    // =========================
    // PREVENT DOUBLE BOOKING
    // =========================
    const existingBooking = await Booking.findOne({ lashTech, date, timeSlot });

    if (existingBooking) {
      return res.status(400).json({
        message: `${lashTech} is already booked on ${date} at ${timeSlot}.`
      });
    }

    // =========================
    // SAVE BOOKING
    // =========================
    const newBooking = new Booking({
      clientName,
      phone,
      service,
      lashTech,
      date,
      timeSlot
    });

    await newBooking.save();
    console.log('Booking saved');

    // =========================
    // SEND EMAIL (SAFE)
    // =========================
    try {
      const mailOptions = {
        from: 'vallarymitchelle257@gmail.com',
        to: 'vallarymitchelle257@gmail.com',
        subject: 'New LashVilla Booking',
        html: `
          <h2>New Booking</h2>
          <p><strong>Name:</strong> ${clientName}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Lash Tech:</strong> ${lashTech}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${timeSlot}</p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('Email sent');
    } catch (emailError) {
      console.error('Email failed:', emailError.message);
      // DO NOT break booking
    }

    // =========================
    // SUCCESS RESPONSE
    // =========================
    res.status(200).json({
      message: 'Booking confirmed!',
      booking: newBooking
    });

  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({
      message: 'Server error while processing booking.',
      error: error.message
    });
  }
});

// =========================
// GET BOOKINGS
// =========================
app.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: 1, timeSlot: 1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ message: 'Could not fetch bookings.' });
  }
});

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`LashVilla server running on port ${PORT}`);
});