import { z } from "zod";

// ── Auth Schemas ────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    username: z
      .string()
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    displayName: z
      .string()
      .min(1, "Display name is required")
      .max(50, "Display name must be at most 50 characters"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /[A-Z]/,
        "Password must contain at least one uppercase letter"
      )
      .regex(
        /[a-z]/,
        "Password must contain at least one lowercase letter"
      )
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(["BUYER", "SELLER"]).default("BUYER"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// ── Product Schemas ─────────────────────────────────────────────────────────

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Product name must be at most 200 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(5000, "Description must be at most 5000 characters"),
  price: z
    .number()
    .positive("Price must be a positive number")
    .max(999999.99, "Price is too high"),
  compareAtPrice: z
    .number()
    .positive("Compare-at price must be a positive number")
    .max(999999.99, "Compare-at price is too high")
    .nullable()
    .optional(),
  categoryId: z.string().nullable().optional(),
  sku: z
    .string()
    .max(100, "SKU must be at most 100 characters")
    .nullable()
    .optional(),
  stock: z
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .default(0),
  tags: z
    .array(z.string().max(50, "Tag must be at most 50 characters"))
    .max(20, "At most 20 tags allowed")
    .default([]),
  images: z
    .array(
      z.object({
        url: z.string().url("Invalid image URL"),
        alt: z.string().max(200).nullable().optional(),
      })
    )
    .max(10, "At most 10 images allowed")
    .default([]),
  status: z
    .enum(["DRAFT", "ACTIVE", "INACTIVE", "OUT_OF_STOCK", "ARCHIVED"])
    .default("DRAFT"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// ── Order Schemas ───────────────────────────────────────────────────────────

export const addressSchema = z.object({
  street: z
    .string()
    .min(1, "Street address is required")
    .max(200, "Street address is too long"),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City name is too long"),
  state: z
    .string()
    .min(1, "State is required")
    .max(100, "State name is too long"),
  postalCode: z
    .string()
    .min(1, "Postal code is required")
    .max(20, "Postal code is too long"),
  country: z
    .string()
    .min(1, "Country is required")
    .max(100, "Country name is too long"),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

export const createOrderSchema = z.object({
  storeId: z.string().min(1, "Store ID is required"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),
        quantity: z
          .number()
          .int("Quantity must be a whole number")
          .positive("Quantity must be at least 1"),
      })
    )
    .min(1, "Order must contain at least one item"),
  shippingAddress: addressSchema,
  notes: z
    .string()
    .max(500, "Notes must be at most 500 characters")
    .nullable()
    .optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// ── Profile Schemas ─────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(50, "Display name must be at most 50 characters")
    .optional(),
  bio: z
    .string()
    .max(500, "Bio must be at most 500 characters")
    .nullable()
    .optional(),
  avatarUrl: z
    .string()
    .url("Invalid avatar URL")
    .nullable()
    .optional(),
  phoneNumber: z
    .string()
    .max(20, "Phone number is too long")
    .nullable()
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ── Store Schemas ───────────────────────────────────────────────────────────

export const createStoreSchema = z.object({
  name: z
    .string()
    .min(1, "Store name is required")
    .max(100, "Store name must be at most 100 characters"),
  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters")
    .nullable()
    .optional(),
  logoUrl: z
    .string()
    .url("Invalid logo URL")
    .nullable()
    .optional(),
  bannerUrl: z
    .string()
    .url("Invalid banner URL")
    .nullable()
    .optional(),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;

// ── Review Schemas ──────────────────────────────────────────────────────────

export const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z
    .number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  title: z
    .string()
    .max(200, "Title must be at most 200 characters")
    .nullable()
    .optional(),
  comment: z
    .string()
    .max(2000, "Comment must be at most 2000 characters")
    .nullable()
    .optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// ── Pagination Schema ───────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// ── Search / Filter Schemas ─────────────────────────────────────────────────

export const productSearchSchema = z.object({
  query: z.string().optional(),
  categoryId: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  status: z
    .enum(["DRAFT", "ACTIVE", "INACTIVE", "OUT_OF_STOCK", "ARCHIVED"])
    .optional(),
  sortBy: z
    .enum(["price", "createdAt", "rating", "name"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ProductSearchInput = z.infer<typeof productSearchSchema>;
