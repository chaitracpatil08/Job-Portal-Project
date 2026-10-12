const express = require("express");
const ContactMessage = require("../models/ContactMessage");
const Notification = require("../models/Notification");
const User = require("../models/User");

const router = express.Router();

// @desc    Submit a contact inquiry message
// @route   POST /api/contact
// @access  Public
router.post("/", async (req, res) => {
  try {
    const { fullName, email, phone, inquiryType, subject, message } = req.body;

    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (Full Name, Email, Subject, Message).",
      });
    }

    const newMessage = await ContactMessage.create({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: (phone || "").trim(),
      inquiryType: inquiryType || "Candidate Support",
      subject: subject.trim(),
      message: message.trim(),
    });

    // Notify all admin users
    try {
      const admins = await User.find({ role: "admin" }).select("_id");
      const notifPromises = admins.map((admin) =>
        Notification.create({
          recipient: admin._id,
          recipientRole: "admin",
          type: "system",
          title: "New Contact Inquiry Received",
          message: `${fullName} submitted a message regarding "${subject}".`,
          link: "/admin",
        })
      );
      await Promise.all(notifPromises);
    } catch (notifErr) {
      console.warn("Could not dispatch admin contact notification:", notifErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Thank you! Your message has been received by our administration team.",
      contactMessage: newMessage,
    });
  } catch (error) {
    console.error("Error submitting contact inquiry:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit contact inquiry.",
      error: error.message,
    });
  }
});

module.exports = router;
