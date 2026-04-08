// ================== Imports ==================
 const express = require('express');
 const nodemailer = require('nodemailer');
 const bodyParser = require('body-parser');
 const cors = require('cors');
 const fs = require('fs');
 const mongoose = require('mongoose');
 require('dotenv').config();
 
 // ================== App Setup ==================
 const app = express();
 const PORT = process.env.PORT || 3000;
 const mdso = process.env.MDSO; // MongoDB password from Render env
 
 // ================== MongoDB Connection ==================
 mongoose.connect(
  `mongodb+srv://lashvillake:${mdso}@cluster1.ihlfscu.mongodb.net/lashvillake?retryWrites=true&w=majority&appName=Cluster1`
)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(' MongoDB error:', err));
 // ================== Schema ==================
 const bookingSchema = new mongoose.Schema({
   name: String,
   phone: String,
   date: String,
   time: String,
   lashtech: String,
   service: [String],
   reminded: { type: Boolean, default: false }, // track if reminder SMS sent
   createdAt: { type: Date, default: Date.now },
 });
 
 const Booking = mongoose.model('Booking', bookingSchema);
 
 // ================== Middleware ==================
 app.use(cors());
 app.use(bodyParser.urlencoded({ extended: true }));
 app.use(bodyParser.json());
 app.use(express.static(__dirname));
 
 // Homepage
 app.get('/', (req, res) => {
   res.sendFile(__dirname + '/index.html');
 });
 
 // Booking submission
 app.post('/submit-form', async (req, res) => {
   try {
     let { name, phone, date, time, lashtech, service } = req.body;
 
     if (!Array.isArray(service)) service = [service];

 
     // --- Prevent double booking ---
     const existingBooking = await Booking.findOne({ date, time, lashtech });
     if (existingBooking) {
       return res.status(400).json({
         error: `This lashtech is already booked on ${date} at ${time}. Please choose another time.`,
       });
     }
 
     // --- Save booking ---
     const newBooking = new Booking({ name, phone, date, time,  lashtech, service });
     await newBooking.save()
 
     // --- Email notification ---
     const transporter = nodemailer.createTransport({
       service: 'gmail',
       auth: {
         user: 'vallarymitchelle257@gmail.com',
         pass: process.env.PTSO,
       },
     });
 
     const mailOptions = {
       from: 'vallarymitchelle257@gmail.com',
       to: 'vallarymitchelle257@gmail.com',
       subject: 'New Booking – Lashvillake',
       text: `
 New booking received:
 
 Name: ${name}
 Phone: ${phone}
 Date: ${date}
 Time: ${time}
 Tech: ${lashtech || 'Not selected'}
 Services: ${service.join(', ')}
       `,
     };
 
     transporter.sendMail(mailOptions, (err, info) => {
       if (err) {
         console.error('Email error:', err);
         return res.status(500).json({ error: 'Failed to send email' });
       }
       console.log('Email sent:', info.response);
       res.status(200).json({ message: 'Booking received, email & SMS sent!' });
     });
 
   } catch (error) {
     console.error('Server error:', error);
     res.status(500).json({ error: 'Internal server error' });
   }
 });
 
 // ================== Start Server ==================
 app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
 });
 
 // ================== Export Booking Model ==================
 module.exports = Booking;