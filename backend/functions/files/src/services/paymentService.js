// backend/functions/files/src/services/paymentService.js
// Payment Service for Razorpay Integration

const Razorpay = require('razorpay');
const crypto = require('crypto');
const logger = require('../utils/logger');
require('dotenv').config();

// Razorpay configuration
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Subscription plans (in paise - multiply by 100)
const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    name: 'AstroAI Premium Monthly',
    amount: 49900, // ₹499
    currency: 'INR',
    period: 'monthly',
    interval: 1,
    description: 'Unlimited AI chat, advanced predictions, priority support'
  },
  YEARLY: {
    name: 'AstroAI Premium Yearly',
    amount: 499900, // ₹4,999 (save ₹1,000)
    currency: 'INR',
    period: 'yearly',
    interval: 1,
    description: 'Unlimited AI chat, advanced predictions, priority support - Best Value!'
  }
};

// Initialize Razorpay instance
let razorpayInstance;

/**
 * Initialize Razorpay
 */
const initializeRazorpay = () => {
  try {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      logger.warn('Razorpay credentials not configured. Payment service will be disabled.');
      return null;
    }

    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    });

    logger.info('✅ Razorpay payment service initialized successfully');
    return razorpayInstance;

  } catch (error) {
    logger.error('Error initializing Razorpay:', error.message);
    return null;
  }
};

// Initialize on module load
initializeRazorpay();

/**
 * Create Razorpay order for subscription
 * @param {string} planType - 'MONTHLY' or 'YEARLY'
 * @param {string} userId - User ID
 * @param {Object} userDetails - User details (name, email)
 * @returns {Object} Order details
 */
const createSubscriptionOrder = async (planType, userId, userDetails) => {
  try {
    if (!razorpayInstance) {
      throw new Error('Razorpay not initialized');
    }

    const plan = SUBSCRIPTION_PLANS[planType];
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }

    // Create Razorpay order
    const options = {
      amount: plan.amount, // Amount in paise
      currency: plan.currency,
      receipt: `receipt_${userId}_${Date.now()}`,
      notes: {
        user_id: userId,
        plan_type: planType,
        plan_name: plan.name,
        user_email: userDetails.email || '',
        user_name: userDetails.name || ''
      }
    };

    const order = await razorpayInstance.orders.create(options);
    
    logger.info(`Razorpay order created: ${order.id} for user: ${userId}`);

    return {
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: RAZORPAY_KEY_ID,
      plan_name: plan.name,
      plan_type: planType,
      description: plan.description
    };

  } catch (error) {
    logger.error('Error creating Razorpay order:', error.message);
    throw new Error('Failed to create payment order');
  }
};

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} Verification result
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    if (!RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay key secret not configured');
    }

    // Create expected signature
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    // Compare signatures
    const isValid = expectedSignature === signature;

    if (isValid) {
      logger.info(`Payment signature verified successfully for order: ${orderId}`);
    } else {
      logger.error(`Payment signature verification failed for order: ${orderId}`);
    }

    return isValid;

  } catch (error) {
    logger.error('Error verifying payment signature:', error.message);
    return false;
  }
};

/**
 * Fetch payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Object} Payment details
 */
const fetchPaymentDetails = async (paymentId) => {
  try {
    if (!razorpayInstance) {
      throw new Error('Razorpay not initialized');
    }

    const payment = await razorpayInstance.payments.fetch(paymentId);
    
    logger.info(`Fetched payment details: ${paymentId}`);

    return {
      payment_id: payment.id,
      order_id: payment.order_id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      email: payment.email,
      contact: payment.contact,
      created_at: payment.created_at,
      notes: payment.notes
    };

  } catch (error) {
    logger.error('Error fetching payment details:', error.message);
    throw new Error('Failed to fetch payment details');
  }
};

/**
 * Initiate refund
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Refund amount in paise (optional, full refund if not provided)
 * @param {string} reason - Refund reason
 * @returns {Object} Refund details
 */
const initiateRefund = async (paymentId, amount = null, reason = 'Customer request') => {
  try {
    if (!razorpayInstance) {
      throw new Error('Razorpay not initialized');
    }

    const refundOptions = {
      notes: {
        reason: reason,
        refund_initiated_at: new Date().toISOString()
      }
    };

    // Add amount only if partial refund
    if (amount) {
      refundOptions.amount = amount;
    }

    const refund = await razorpayInstance.payments.refund(paymentId, refundOptions);
    
    logger.info(`Refund initiated: ${refund.id} for payment: ${paymentId}`);

    return {
      refund_id: refund.id,
      payment_id: refund.payment_id,
      amount: refund.amount,
      currency: refund.currency,
      status: refund.status,
      created_at: refund.created_at
    };

  } catch (error) {
    logger.error('Error initiating refund:', error.message);
    throw new Error('Failed to initiate refund');
  }
};

/**
 * Create Razorpay subscription (recurring payment)
 * @param {string} planType - 'MONTHLY' or 'YEARLY'
 * @param {string} userId - User ID
 * @param {Object} userDetails - User details
 * @returns {Object} Subscription details
 */
const createRecurringSubscription = async (planType, userId, userDetails) => {
  try {
    if (!razorpayInstance) {
      throw new Error('Razorpay not initialized');
    }

    const plan = SUBSCRIPTION_PLANS[planType];
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }

    // First, create a Razorpay plan (if not already created)
    // Note: In production, plans should be pre-created in Razorpay dashboard
    
    const subscriptionOptions = {
      plan_id: process.env[`RAZORPAY_PLAN_ID_${planType}`], // Plan IDs from env
      customer_notify: 1,
      quantity: 1,
      total_count: planType === 'MONTHLY' ? 12 : 1, // 12 months for monthly, 1 for yearly
      notes: {
        user_id: userId,
        user_email: userDetails.email || '',
        user_name: userDetails.name || ''
      }
    };

    const subscription = await razorpayInstance.subscriptions.create(subscriptionOptions);
    
    logger.info(`Razorpay subscription created: ${subscription.id} for user: ${userId}`);

    return {
      subscription_id: subscription.id,
      plan_id: subscription.plan_id,
      status: subscription.status,
      current_start: subscription.current_start,
      current_end: subscription.current_end,
      charge_at: subscription.charge_at,
      short_url: subscription.short_url
    };

  } catch (error) {
    logger.error('Error creating subscription:', error.message);
    throw new Error('Failed to create subscription');
  }
};

/**
 * Cancel subscription
 * @param {string} subscriptionId - Razorpay subscription ID
 * @param {boolean} cancelAtCycleEnd - If true, cancel at end of billing cycle
 * @returns {Object} Cancellation details
 */
const cancelSubscription = async (subscriptionId, cancelAtCycleEnd = false) => {
  try {
    if (!razorpayInstance) {
      throw new Error('Razorpay not initialized');
    }

    const subscription = await razorpayInstance.subscriptions.cancel(
      subscriptionId,
      cancelAtCycleEnd
    );
    
    logger.info(`Subscription cancelled: ${subscriptionId}`);

    return {
      subscription_id: subscription.id,
      status: subscription.status,
      ended_at: subscription.ended_at,
      cancelled_at: subscription.cancelled_at
    };

  } catch (error) {
    logger.error('Error cancelling subscription:', error.message);
    throw new Error('Failed to cancel subscription');
  }
};

/**
 * Fetch subscription details
 * @param {string} subscriptionId - Razorpay subscription ID
 * @returns {Object} Subscription details
 */
const fetchSubscriptionDetails = async (subscriptionId) => {
  try {
    if (!razorpayInstance) {
      throw new Error('Razorpay not initialized');
    }

    const subscription = await razorpayInstance.subscriptions.fetch(subscriptionId);
    
    logger.info(`Fetched subscription details: ${subscriptionId}`);

    return {
      subscription_id: subscription.id,
      plan_id: subscription.plan_id,
      status: subscription.status,
      current_start: subscription.current_start,
      current_end: subscription.current_end,
      charge_at: subscription.charge_at,
      paid_count: subscription.paid_count,
      remaining_count: subscription.remaining_count,
      total_count: subscription.total_count
    };

  } catch (error) {
    logger.error('Error fetching subscription details:', error.message);
    throw new Error('Failed to fetch subscription details');
  }
};

/**
 * Verify webhook signature
 * @param {string} webhookBody - Raw webhook body
 * @param {string} webhookSignature - Razorpay webhook signature
 * @returns {boolean} Verification result
 */
const verifyWebhookSignature = (webhookBody, webhookSignature) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      logger.error('Razorpay webhook secret not configured');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(webhookBody)
      .digest('hex');

    const isValid = expectedSignature === webhookSignature;

    if (isValid) {
      logger.info('Webhook signature verified successfully');
    } else {
      logger.error('Webhook signature verification failed');
    }

    return isValid;

  } catch (error) {
    logger.error('Error verifying webhook signature:', error.message);
    return false;
  }
};

/**
 * Handle webhook event
 * @param {Object} event - Webhook event data
 * @returns {Object} Event processing result
 */
const handleWebhookEvent = async (event) => {
  try {
    logger.info(`Processing webhook event: ${event.event}`);

    const eventType = event.event;
    const payload = event.payload.payment || event.payload.subscription || event.payload.order;

    let result = { processed: true, event_type: eventType };

    switch (eventType) {
      case 'payment.captured':
        logger.info(`Payment captured: ${payload.entity.id}`);
        // Handle successful payment
        result.action = 'activate_subscription';
        result.payment_id = payload.entity.id;
        result.order_id = payload.entity.order_id;
        break;

      case 'payment.failed':
        logger.info(`Payment failed: ${payload.entity.id}`);
        // Handle failed payment
        result.action = 'payment_failed';
        result.payment_id = payload.entity.id;
        break;

      case 'subscription.activated':
        logger.info(`Subscription activated: ${payload.subscription.entity.id}`);
        result.action = 'subscription_activated';
        result.subscription_id = payload.subscription.entity.id;
        break;

      case 'subscription.cancelled':
        logger.info(`Subscription cancelled: ${payload.subscription.entity.id}`);
        result.action = 'subscription_cancelled';
        result.subscription_id = payload.subscription.entity.id;
        break;

      case 'subscription.charged':
        logger.info(`Subscription charged: ${payload.subscription.entity.id}`);
        result.action = 'subscription_renewed';
        result.subscription_id = payload.subscription.entity.id;
        break;

      default:
        logger.info(`Unhandled webhook event: ${eventType}`);
        result.processed = false;
    }

    return result;

  } catch (error) {
    logger.error('Error handling webhook event:', error.message);
    throw error;
  }
};

/**
 * Get subscription plans
 * @returns {Object} Available subscription plans
 */
const getSubscriptionPlans = () => {
  return {
    plans: Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
      id: key,
      name: plan.name,
      amount: plan.amount / 100, // Convert to rupees
      currency: plan.currency,
      period: plan.period,
      description: plan.description,
      savings: key === 'YEARLY' ? '₹1,000' : null
    }))
  };
};

/**
 * Calculate subscription expiry date
 * @param {string} planType - 'MONTHLY' or 'YEARLY'
 * @param {Date} startDate - Subscription start date
 * @returns {Date} Expiry date
 */
const calculateExpiryDate = (planType, startDate = new Date()) => {
  const expiry = new Date(startDate);
  
  if (planType === 'MONTHLY') {
    expiry.setMonth(expiry.getMonth() + 1);
  } else if (planType === 'YEARLY') {
    expiry.setFullYear(expiry.getFullYear() + 1);
  }
  
  return expiry;
};

/**
 * Validate payment service configuration
 */
const validatePaymentConfig = () => {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    logger.error('Razorpay credentials not configured');
    return false;
  }

  logger.info('Payment service configured successfully');
  return true;
};

// Validate configuration on module load
validatePaymentConfig();

module.exports = {
  createSubscriptionOrder,
  verifyPaymentSignature,
  fetchPaymentDetails,
  initiateRefund,
  createRecurringSubscription,
  cancelSubscription,
  fetchSubscriptionDetails,
  verifyWebhookSignature,
  handleWebhookEvent,
  getSubscriptionPlans,
  calculateExpiryDate,
  validatePaymentConfig,
  SUBSCRIPTION_PLANS
};