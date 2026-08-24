import { z } from 'zod';

export const checkoutSchema = z.object({
  plan: z.enum(['monthly', 'yearly']),
});

export const verifyPaymentSchema = z.object({
  razorpay_payment_id: z.string().min(1),
  razorpay_subscription_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});
