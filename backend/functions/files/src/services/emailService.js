// backend/functions/files/src/services/emailService.js
// Email Service for Notifications and Transactional Emails

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
require('dotenv').config();

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
};

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@astroai.com';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'AstroAI';

// Create transporter
let transporter;

/**
 * Initialize email transporter
 */
const initializeTransporter = () => {
  try {
    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
      logger.warn('Email credentials not configured. Email service will be disabled.');
      return null;
    }

    transporter = nodemailer.createTransport(EMAIL_CONFIG);

    // Verify connection
    transporter.verify((error, success) => {
      if (error) {
        logger.error('Email transporter verification failed:', error.message);
      } else {
        logger.info('✅ Email service is ready to send messages');
      }
    });

    return transporter;

  } catch (error) {
    logger.error('Error initializing email transporter:', error.message);
    return null;
  }
};

// Initialize on module load
initializeTransporter();

/**
 * Send email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} text - Plain text content (optional)
 */
const sendEmail = async (to, subject, html, text = null) => {
  try {
    if (!transporter) {
      logger.error('Email transporter not initialized');
      return false;
    }

    const mailOptions = {
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: to,
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${to} - Message ID: ${info.messageId}`);
    return true;

  } catch (error) {
    logger.error('Error sending email:', error.message);
    return false;
  }
};

/**
 * Send welcome email to new user
 * @param {string} email - User email
 * @param {string} name - User name
 */
const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to AstroAI! 🌟';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6B46C1 0%, #4C51BF 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #6B46C1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #718096; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to AstroAI!</h1>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          
          <p>Welcome to AstroAI - your personal AI-powered Vedic astrology companion! We're thrilled to have you join our community.</p>
          
          <p><strong>Here's what you can do with AstroAI:</strong></p>
          <ul>
            <li>Generate your personalized Kundli (birth chart)</li>
            <li>Get daily, weekly, and monthly horoscope predictions</li>
            <li>Chat with our AI astrologer for personalized guidance</li>
            <li>Receive career, relationship, and health insights</li>
            <li>Discover planetary remedies and auspicious timings</li>
          </ul>
          
          <p>To get started, create your birth chart by entering your birth details in the app.</p>
          
          <a href="${process.env.FRONTEND_URL || 'https://astroai.com'}" class="button">Open AstroAI App</a>
          
          <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
          
          <p>May the stars guide you! ✨</p>
          
          <p>Best regards,<br>The AstroAI Team</p>
        </div>
        <div class="footer">
          <p>© 2024 AstroAI. All rights reserved.</p>
          <p>This email was sent to ${email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

/**
 * Send OTP email for verification
 * @param {string} email - User email
 * @param {string} otp - One-time password
 * @param {number} expiryMinutes - OTP expiry time in minutes
 */
const sendOTPEmail = async (email, otp, expiryMinutes = 10) => {
  const subject = 'Your AstroAI Verification Code';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6B46C1 0%, #4C51BF 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 2px dashed #6B46C1; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #6B46C1; margin: 20px 0; border-radius: 5px; }
        .warning { color: #E53E3E; font-size: 14px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; color: #718096; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verification Code</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          
          <p>Your verification code for AstroAI is:</p>
          
          <div class="otp-box">${otp}</div>
          
          <p>This code will expire in <strong>${expiryMinutes} minutes</strong>.</p>
          
          <p>If you didn't request this code, please ignore this email or contact our support team if you have concerns.</p>
          
          <p class="warning">⚠️ Never share this code with anyone. AstroAI staff will never ask for your verification code.</p>
          
          <p>Best regards,<br>The AstroAI Team</p>
        </div>
        <div class="footer">
          <p>© 2024 AstroAI. All rights reserved.</p>
          <p>This email was sent to ${email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} resetLink - Password reset link
 */
const sendPasswordResetEmail = async (email, resetLink) => {
  const subject = 'Reset Your AstroAI Password';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6B46C1 0%, #4C51BF 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #6B46C1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #718096; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          
          <p>We received a request to reset your AstroAI account password.</p>
          
          <p>Click the button below to reset your password:</p>
          
          <a href="${resetLink}" class="button">Reset Password</a>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #4C51BF;">${resetLink}</p>
          
          <p>This link will expire in 1 hour for security reasons.</p>
          
          <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          
          <p>Best regards,<br>The AstroAI Team</p>
        </div>
        <div class="footer">
          <p>© 2024 AstroAI. All rights reserved.</p>
          <p>This email was sent to ${email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

/**
 * Send Kundli PDF report via email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {Buffer} pdfBuffer - PDF file buffer
 */
const sendKundliPDFEmail = async (email, name, pdfBuffer) => {
  try {
    if (!transporter) {
      logger.error('Email transporter not initialized');
      return false;
    }

    const subject = 'Your AstroAI Kundli Report 📊';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6B46C1 0%, #4C51BF 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; color: #718096; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Kundli Report is Ready!</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            
            <p>Your personalized Vedic astrology birth chart (Kundli) report is attached to this email.</p>
            
            <p>This comprehensive report includes:</p>
            <ul>
              <li>Complete birth details</li>
              <li>Planetary positions</li>
              <li>House cusps</li>
              <li>Current Dasha periods</li>
              <li>General predictions</li>
            </ul>
            
            <p>Keep this report safe for future reference. You can also access your Kundli anytime in the AstroAI app.</p>
            
            <p>Best regards,<br>The AstroAI Team</p>
          </div>
          <div class="footer">
            <p>© 2024 AstroAI. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: subject,
      html: html,
      attachments: [
        {
          filename: `Kundli_Report_${name.replace(/\s+/g, '_')}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Kundli PDF email sent to ${email} - Message ID: ${info.messageId}`);
    return true;

  } catch (error) {
    logger.error('Error sending Kundli PDF email:', error.message);
    return false;
  }
};

/**
 * Send subscription confirmation email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} plan - Subscription plan name
 * @param {string} amount - Payment amount
 */
const sendSubscriptionConfirmationEmail = async (email, name, plan, amount) => {
  const subject = 'AstroAI Subscription Confirmation 🎉';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6B46C1 0%, #4C51BF 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .plan-box { background: white; border: 2px solid #6B46C1; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #718096; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Premium! 🌟</h1>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          
          <p>Thank you for subscribing to AstroAI Premium! Your payment has been successfully processed.</p>
          
          <div class="plan-box">
            <h3 style="color: #6B46C1; margin-top: 0;">Subscription Details</h3>
            <p><strong>Plan:</strong> ${plan}</p>
            <p><strong>Amount Paid:</strong> ₹${amount}</p>
            <p><strong>Status:</strong> Active</p>
          </div>
          
          <p><strong>Premium Features Unlocked:</strong></p>
          <ul>
            <li>Unlimited AI chat consultations</li>
            <li>Advanced career predictions</li>
            <li>Detailed compatibility analysis</li>
            <li>Priority support</li>
            <li>PDF report downloads</li>
          </ul>
          
          <p>Start exploring all premium features in the AstroAI app now!</p>
          
          <p>Best regards,<br>The AstroAI Team</p>
        </div>
        <div class="footer">
          <p>© 2024 AstroAI. All rights reserved.</p>
          <p>This email was sent to ${email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

/**
 * Send daily horoscope email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} horoscopeContent - Daily horoscope text
 */
const sendDailyHoroscopeEmail = async (email, name, horoscopeContent) => {
  const today = new Date().toLocaleDateString('en-IN', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const subject = `Your Daily Horoscope - ${today}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6B46C1 0%, #4C51BF 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .horoscope-box { background: white; border-left: 4px solid #6B46C1; padding: 20px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #718096; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Daily Horoscope ✨</h1>
          <p>${today}</p>
        </div>
        <div class="content">
          <p>Good morning, ${name}!</p>
          
          <p>Here's what the stars have in store for you today:</p>
          
          <div class="horoscope-box">
            ${horoscopeContent}
          </div>
          
          <p>Make the most of today's cosmic energy!</p>
          
          <p>Best regards,<br>The AstroAI Team</p>
        </div>
        <div class="footer">
          <p>© 2024 AstroAI. All rights reserved.</p>
          <p>This email was sent to ${email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

/**
 * Send feedback acknowledgment email
 * @param {string} email - User email
 * @param {string} name - User name
 */
const sendFeedbackAcknowledgmentEmail = async (email, name) => {
  const subject = 'Thank You for Your Feedback!';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6B46C1 0%, #4C51BF 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 20px; color: #718096; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You! 💜</h1>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          
          <p>Thank you for taking the time to share your feedback with us. Your input is invaluable in helping us improve AstroAI.</p>
          
          <p>We carefully review every piece of feedback and use it to enhance our services and features.</p>
          
          <p>If you have any urgent concerns or questions, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br>The AstroAI Team</p>
        </div>
        <div class="footer">
          <p>© 2024 AstroAI. All rights reserved.</p>
          <p>This email was sent to ${email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendOTPEmail,
  sendPasswordResetEmail,
  sendKundliPDFEmail,
  sendSubscriptionConfirmationEmail,
  sendDailyHoroscopeEmail,
  sendFeedbackAcknowledgmentEmail,
  initializeTransporter
};