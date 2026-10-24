import { z } from 'zod';
import { ORDER_STATUSES } from '../config/store.js';

const addressSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter the full name').max(80),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  line1: z.string().trim().min(5, 'Enter the address').max(140),
  line2: z.string().trim().max(140).optional().default(''),
  city: z.string().trim().min(2, 'Enter the city').max(60),
  state: z.string().trim().min(2, 'Choose the state').max(60),
  pincode: z.string().trim().regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit pincode'),
});

export const purchaseSchema = z.object({
  qty: z.coerce.number().int().min(1).max(10).optional().default(1),
  variant: z
    .object({
      size: z.string().trim().max(10).optional().default(''),
      color: z.string().trim().max(20).optional().default(''),
    })
    .optional()
    .default({ size: '', color: '' }),
  address: addressSchema.optional(),
});

export const transactionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const lessonDoneSchema = z.object({
  done: z.boolean().default(true),
});

// ---- admin ----
export const adminOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(ORDER_STATUSES).optional(),
  kind: z.enum(['pro', 'course', 'physical']).optional(),
  q: z.string().trim().max(60).optional(),
});

export const adminOrderUpdateSchema = z.object({
  status: z.enum(['processing', 'shipped', 'delivered', 'cancelled']),
  carrier: z.string().trim().max(60).optional().default(''),
  trackingNumber: z.string().trim().max(60).optional().default(''),
  trackingUrl: z.string().trim().url().max(300).optional().or(z.literal('')).default(''),
  note: z.string().trim().max(200).optional().default(''),
});

export const adminItemUpdateSchema = z
  .object({
    price: z.coerce.number().int().min(1).max(1000000).optional(),
    stock: z.coerce.number().int().min(0).max(1000000).nullable().optional(),
    active: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'Nothing to update' });

export const adminCoinsSchema = z.object({
  handle: z.string().trim().toLowerCase().min(3).max(30),
  amount: z.coerce.number().int().refine((n) => n !== 0, 'Amount cannot be 0').refine((n) => Math.abs(n) <= 100000, 'Max 100000 per adjustment'),
  note: z.string().trim().min(3, 'Add a short reason').max(120),
});
