import { z } from "zod";

// ─── Auth Contracts ───────────────────────────────────────────────────────────

export const LoginWithEmailSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const LoginWithPhoneSchema = z.object({
  phone: z.string().min(7),
  otp: z.string().length(6),
});

export const AuthTokenSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(), // seconds
  token_type: z.literal("Bearer"),
});

export type LoginWithEmailDto = z.infer<typeof LoginWithEmailSchema>;
export type LoginWithPhoneDto = z.infer<typeof LoginWithPhoneSchema>;
export type AuthTokenDto = z.infer<typeof AuthTokenSchema>;

// ─── Catalog Contracts ────────────────────────────────────────────────────────

export const ProductSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  base_price_minor: z.number(),
  currency_code: z.string(),
  image_url: z.string().nullable().optional(),
  is_available: z.boolean(),
  featured: z.boolean(),
});

export const CategoryWithProductsSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  products: z.array(ProductSummarySchema),
});

export type ProductSummary = z.infer<typeof ProductSummarySchema>;
export type CategoryWithProducts = z.infer<typeof CategoryWithProductsSchema>;

// ─── Cart Contracts ───────────────────────────────────────────────────────────

export const AddToCartSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().optional(),
  quantity: z.number().int().min(1),
  modifier_ids: z.array(z.string().uuid()).optional(),
  notes: z.string().max(300).optional(),
});

export const CartItemSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  product_name: z.string(),
  variant_id: z.string().uuid().nullable(),
  variant_name: z.string().nullable(),
  quantity: z.number(),
  unit_price_minor: z.number(),
  line_total_minor: z.number(),
  notes: z.string().nullable(),
  modifiers: z.array(
    z.object({ modifier_id: z.string().uuid(), modifier_name: z.string(), price_delta_minor: z.number() })
  ),
});

export const CartSchema = z.object({
  id: z.string().uuid(),
  items: z.array(CartItemSchema),
  subtotal_minor: z.number(),
  delivery_fee_minor: z.number(),
  grand_total_minor: z.number(),
  currency_code: z.string(),
});

export type AddToCartDto = z.infer<typeof AddToCartSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export type CartDto = z.infer<typeof CartSchema>;

// ─── Order Contracts ──────────────────────────────────────────────────────────

export const OrderStatusZodSchema = z.enum([
  "PLACED",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "RIDER_ASSIGNED",
  "PICKED_UP",
  "ON_THE_WAY",
  "DELIVERED",
  "REJECTED",
  "CANCELLED",
  "FAILED",
]);

export const OrderSummarySchema = z.object({
  id: z.string().uuid(),
  order_number: z.string(),
  status: OrderStatusZodSchema,
  grand_total_minor: z.number(),
  currency_code: z.string(),
  placed_at: z.string().datetime(),
  branch_name: z.string().optional(),
  item_count: z.number(),
});

export type OrderStatusString = z.infer<typeof OrderStatusZodSchema>;
export type OrderSummary = z.infer<typeof OrderSummarySchema>;

// ─── Rider Contracts ──────────────────────────────────────────────────────────

export const RiderLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().optional(),
  heading: z.number().optional(),
  speed: z.number().optional(),
  timestamp: z.string().datetime(),
});

export const RiderAvailabilityZodSchema = z.enum(["OFFLINE", "AVAILABLE", "BUSY", "PAUSED"]);

export type RiderLocation = z.infer<typeof RiderLocationSchema>;
export type RiderAvailabilityString = z.infer<typeof RiderAvailabilityZodSchema>;

// ─── Push Notification Contracts ──────────────────────────────────────────────

export const PushTokenSchema = z.object({
  token: z.string(),
  platform: z.enum(["ios", "android"]),
  device_id: z.string().optional(),
});

export const PushNotificationPayloadSchema = z.object({
  title: z.string(),
  body: z.string(),
  data: z
    .object({
      event: z.string(),
      order_id: z.string().uuid().optional(),
      delivery_id: z.string().uuid().optional(),
      deep_link: z.string().optional(),
    })
    .optional(),
  badge: z.number().optional(),
});

export type PushTokenDto = z.infer<typeof PushTokenSchema>;
export type PushNotificationPayload = z.infer<typeof PushNotificationPayloadSchema>;

// ─── Deep Link Schema ─────────────────────────────────────────────────────────

/** Canonical deep link paths for the platform */
export const DEEP_LINKS = {
  ORDER_DETAIL: (orderId: string) => `restaurant://orders/${orderId}`,
  TRACK_DELIVERY: (orderId: string) => `restaurant://orders/${orderId}/track`,
  RIDER_ACTIVE_DELIVERY: (deliveryId: string) => `restaurant-rider://deliveries/${deliveryId}`,
  SUPPORT_TICKET: (ticketId: string) => `restaurant://support/${ticketId}`,
} as const;
