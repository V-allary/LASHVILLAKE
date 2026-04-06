const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const mdso = process.env.MDSO; //mogodb pass

 
// Connect to MongoDB
mongoose.connect(
  `mongodb+srv://lashvillake:${mdso}@cluster1.ihlfscu.mongodb.net/lashvillake?retryWrites=true&w=majority&appName=Cluster1`
)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(' MongoDB connection error:', err));

// Allowed 2-hour booking slots
const allowedTimeSlots = [
  "08:00-10:00",
  "10:00-12:00",
  "12:00-14:00",
  "14:00-16:00",
  "16:00-18:00",
  "18:00-20:00"
];

// Booking Schema
const bookingSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  phone: { type: String, required: true },
  service: { type: String, required: true },
  lashTech: { type: String, required: true },  
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  status: { type: String, default: 'confirmed' }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user:  'vallarymitchelle257@gmail.com',
    pass: process.env.EMAIL_PASS
  }
});

// Booking endpoint
app.post('/submit-form', async (req, res) => {
  const {
    clientName,
    phone,
    service,
    lashTech,
    date,
    timeSlot,
   
  } = req.body;

  try {
    // Validate required fields
    if (!clientName || !phone || !service || !lashTech || !date || !timeSlot) {
      return res.status(400).json({
        message: 'Please fill in all required booking fields.'
      });
    }

    // Validate 2-hour slot
    if (!allowedTimeSlots.includes(timeSlot)) {
      return res.status(400).json({
        message: `Invalid time slot. Allowed slots: ${allowedTimeSlots.join(', ')}`
      });
    }

    // Prevent double booking for same lash tech, date, and time slot
    const existingBooking = await Booking.findOne({ lashTech, date, timeSlot });

    if (existingBooking) {
      return res.status(400).json({
        message: ` ${lashTech} is already booked on ${date} at ${timeSlot}. Please choose another time or lash tech.`
      });
    }

    // Save booking
    const newBooking = new Booking({
      clientName,
      phone,
      service,
      lashTech,
      date,
      timeSlot,
    });

    await newBooking.save();

    // Send email to owner
    const ownerMailOptions = {
      from: 'vallarymitchelle257@gmail.com',
      to: 'vallarymitchelle257@gmail.com',
      subject: ' New LashVilla Booking Received',
      html: `
        <h2>New Booking Alert - LashVilla</h2>
        <p><strong>Client Name:</strong> ${clientName}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Lash Tech:</strong> ${lashTech}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time Slot:</strong> ${timeSlot}</p>
        <hr>
        <p>This booking has also been saved in MongoDB.</p>
      `
    };

    await transporter.sendMail(ownerMailOptions);
     
    res.status(200).json({
      message: 'Booking confirmed !',
      booking: newBooking
    });

  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({
      message: 'Server error while processing booking.'
    });
  }
});

// View all bookings
app.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: 1, timeSlot: 1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Could not fetch bookings.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`LashVilla server running on port ${PORT}`);
});