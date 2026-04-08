const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedTimeSlots = [
  "08:00-10:00",
  "10:00-12:00",
  "12:00-14:00",
  "14:00-16:00",
  "16:00-18:00",
  "18:00-20:00"
];

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

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'vallarymitchelle257@gmail.com',
    pass: process.env.EMAIL_PASS
  }
});

app.get('/', (req, res) => {
  res.send('LashVilla API is running');
});

app.post('/submit-form', async (req, res) => {
  const { clientName, phone, service, lashTech, date, timeSlot } = req.body;

  try {
    if (!clientName || !phone || !service || !lashTech || !date || !timeSlot) {
      return res.status(400).json({ message: 'Please fill in all required booking fields.' });
    }

    if (!allowedTimeSlots.includes(timeSlot)) {
      return res.status(400).json({ message: `Invalid time slot. Allowed slots: ${allowedTimeSlots.join(', ')}` });
    }

    const existingBooking = await Booking.findOne({ lashTech, date, timeSlot });
    if (existingBooking) {
      return res.status(400).json({
        message: `${lashTech} is already booked on ${date} at ${timeSlot}.`
      });
    }

    const newBooking = new Booking({
      clientName,
      phone,
      service,
      lashTech,
      date,
      timeSlot
    });

    await newBooking.save();

    try {
      await transporter.sendMail({
        from: 'vallarymitchelle257@gmail.com',
        to: 'vallarymitchelle257@gmail.com',
        subject: 'New LashVilla Booking Received',
        html: `
          <h2>New Booking Alert - LashVilla</h2>
          <p><strong>Client Name:</strong> ${clientName}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Lash Tech:</strong> ${lashTech}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time Slot:</strong> ${timeSlot}</p>
        `
      });
    } catch (emailError) {
      console.error('Email failed:', emailError.message);
    }

    return res.status(200).json({
      message: 'Booking confirmed!',
      booking: newBooking
    });
  } catch (error) {
    console.error('Booking error:', error);
    return res.status(500).json({
      message: 'Server error while processing booking.',
      error: error.message
    });
  }
});

async function startServer() {
  try {
    await mongoose.connect(
      `mongodb+srv://lashvillake:${process.env.MDSO}@cluster1.ihlfscu.mongodb.net/lashvillake?retryWrites=true&w=majority&appName=Cluster1`
    );

    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`LashVilla server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }
}

startServer();