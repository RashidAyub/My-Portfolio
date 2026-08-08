'use strict';

const { validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const { sendNotificationEmail } = require('../utils/mailer');

/**
 * POST /api/contact
 */
async function submitContact(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed. Please check your input.',
      errors: errors.array().map((e) => ({ field: e.path, msg: e.msg })),
    });
  }

  const { name, email, subject, message } = req.body;

  try {
    const contact = await Contact.create({ name, email, subject, message });

    // Fire-and-forget email notification
    sendNotificationEmail({ name, email, subject, message }).catch((err) => {
      console.warn('[Mailer] Notification failed:', err.message);
    });

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      id: contact._id,
    });
  } catch (err) {
    console.error('[Contact] Save error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
    });
  }
}

module.exports = { submitContact };
