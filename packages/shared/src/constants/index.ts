// ── Roles ────────────────────────────────────────────────────────────────────

export const ROLES = {
  BUYER: "BUYER",
  SELLER: "SELLER",
  ADMIN: "ADMIN",
} as const;

export type RoleValue = (typeof ROLES)[keyof typeof ROLES];

// ── Order Status ────────────────────────────────────────────────────────────

export const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;

export type OrderStatusValue =
  (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABELS: Record<OrderStatusValue, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

// ── Payment Status ──────────────────────────────────────────────────────────

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

export type PaymentStatusValue =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatusValue, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

// ── Product Status ──────────────────────────────────────────────────────────

export const PRODUCT_STATUS = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  ARCHIVED: "ARCHIVED",
} as const;

export type ProductStatusValue =
  (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];

export const PRODUCT_STATUS_LABELS: Record<ProductStatusValue, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  OUT_OF_STOCK: "Out of Stock",
  ARCHIVED: "Archived",
};

// ── Pagination Defaults ─────────────────────────────────────────────────────

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ── API Routes ──────────────────────────────────────────────────────────────

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    ME: "/api/auth/me",
  },
  USERS: {
    BASE: "/api/users",
    BY_ID: (id: string) => `/api/users/${id}`,
    PROFILE: "/api/users/profile",
  },
  PRODUCTS: {
    BASE: "/api/products",
    BY_ID: (id: string) => `/api/products/${id}`,
    BY_SLUG: (slug: string) => `/api/products/slug/${slug}`,
    SEARCH: "/api/products/search",
    REVIEWS: (id: string) => `/api/products/${id}/reviews`,
  },
  STORES: {
    BASE: "/api/stores",
    BY_ID: (id: string) => `/api/stores/${id}`,
    BY_SLUG: (slug: string) => `/api/stores/slug/${slug}`,
    PRODUCTS: (id: string) => `/api/stores/${id}/products`,
  },
  ORDERS: {
    BASE: "/api/orders",
    BY_ID: (id: string) => `/api/orders/${id}`,
    CANCEL: (id: string) => `/api/orders/${id}/cancel`,
  },
  CART: {
    BASE: "/api/cart",
    ADD_ITEM: "/api/cart/items",
    UPDATE_ITEM: (id: string) => `/api/cart/items/${id}`,
    REMOVE_ITEM: (id: string) => `/api/cart/items/${id}`,
  },
  CATEGORIES: {
    BASE: "/api/categories",
    BY_ID: (id: string) => `/api/categories/${id}`,
    BY_SLUG: (slug: string) => `/api/categories/slug/${slug}`,
  },
  FEED: {
    BASE: "/api/feed",
    POSTS: "/api/feed/posts",
    POST_BY_ID: (id: string) => `/api/feed/posts/${id}`,
    COMMENTS: (postId: string) => `/api/feed/posts/${postId}/comments`,
  },
  UPLOAD: {
    IMAGE: "/api/upload/image",
    IMAGES: "/api/upload/images",
  },
} as const;

// ── Limits ───────────────────────────────────────────────────────────────────

export const LIMITS = {
  MAX_PRODUCT_IMAGES: 10,
  MAX_PRODUCT_TAGS: 20,
  MAX_CART_ITEMS: 50,
  MAX_ORDER_ITEMS: 30,
  MAX_REVIEW_LENGTH: 2000,
  MAX_BIO_LENGTH: 500,
  MAX_PRODUCT_NAME_LENGTH: 200,
  MAX_PRODUCT_DESCRIPTION_LENGTH: 5000,
  MAX_FILE_SIZE_MB: 5,
} as const;

// ── Sort Options ────────────────────────────────────────────────────────────

export const SORT_OPTIONS = {
  PRODUCTS: {
    PRICE_ASC: { sortBy: "price", sortOrder: "asc" },
    PRICE_DESC: { sortBy: "price", sortOrder: "desc" },
    NEWEST: { sortBy: "createdAt", sortOrder: "desc" },
    OLDEST: { sortBy: "createdAt", sortOrder: "asc" },
    RATING: { sortBy: "rating", sortOrder: "desc" },
    NAME_ASC: { sortBy: "name", sortOrder: "asc" },
    NAME_DESC: { sortBy: "name", sortOrder: "desc" },
  },
} as const;

// ── HTTP Status Codes ───────────────────────────────────────────────────────

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
