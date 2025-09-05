import Stripe from 'stripe';

/**
 * Initialise and export a Stripe client. The secret key must be set
 * via the STRIPE_SECRET_KEY environment variable. For more details see
 * https://stripe.com/docs/api
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});