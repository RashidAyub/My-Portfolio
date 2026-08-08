'use strict';

const express = require('express');
const { body } = require('express-validator');
const { submitContact } = require('../controllers/contactController');

const router = express.Router();

const contactValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ max: 100 }).withMessage('Name must be 100 characters or fewer.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required.')
    .isLength({ max: 200 }).withMessage('Subject must be 200 characters or fewer.'),

  body('message')
    .trim()
    .notEmpty().withMessage('Message is required.')
    .isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters.'),
];

router.post('/', contactValidation, submitContact);

module.exports = router;
