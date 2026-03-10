# SocialBazaar — Claude Code Build Prompts
## Copy-paste these prompts ONE BY ONE in exact order into Claude Code

---

# ============================================================
# STEP 0: PROJECT SETUP FILE (Save this as CLAUDE.md first)
# ============================================================

Save the content between the `---START CLAUDE.md---` and `---END CLAUDE.md---` markers as `CLAUDE.md` in your project root folder before starting.

---START CLAUDE.md---

# SocialBazaar — Social Commerce Platform for Nepal

## What Is This
A social-commerce-first multi-vendor marketplace for Nepal. NOT traditional ecommerce. The social feed is the homepage, not a product catalog. Users discover products through TikTok/Instagram-style content, chat with sellers, and pay via Nepal's digital wallets.

## Brand Context
- Founded by Mensa Fashion, an existing retail brand receiving orders from TikTok, Instagram, WhatsApp
- Operates multiple niche accounts across categories (clothing, tech gadgets, beauty, etc.)
- Platform name: SocialBazaar (working name)

## Nepal Market Rules
- Currency: NPR (Nepal Rupees), format: रू 1,500 or NPR 1,500
- Phone format: +977-XXXXXXXXXX (10 digits)
- Address format: District → Municipality → Ward → Tole/Street
- Payments: eSewa (8M+ users), Khalti by IME, Fonepay QR, COD mandatory
- Language: Nepali (primary) + English
- E-Commerce Act 2081 (April 2025): All online sellers must register, 15-day return policy, 6-year data retention, grievance mechanism required
- 85-90% users are on mobile — build mobile-first always
- Average order value: US$25-40 (NPR 3,000-5,000)

## Tech Stack
- Monorepo: Turborepo + pnpm
- Language: TypeScript strict everywhere
- Frontend Web: Next.js 14+ (App Router), Tailwind CSS, shadcn/ui, Zustand, TanStack Query v5
- Mobile: React Native + Expo SDK 50+, Expo Router, NativeWind
- Backend: Node.js + Fastify + tRPC
- ORM: Prisma 5+ with PostgreSQL
- Auth: Phone/OTP via Sparrow SMS, JWT + refresh tokens
- Real-time: Socket.IO
- Cache/Queue: Redis 7+ with BullMQ
- Search: Meilisearch
- Storage: MinIO (S3-compatible)
- Containerization: Docker + Docker Compose

## Coding Standards
- TypeScript strict mode, no `any`
- Zod for all validation (shared via packages/shared)
- Error format: { success: boolean, error?: string, message?: string, data?: T }
- Logging: Pino (structured JSON)
- All user-facing strings must be externalizable for i18n (Nepali + English)
- JSDoc on all exported functions
- Conventional commits

---END CLAUDE.md---

---

# ============================================================
# STEP 1: MONOREPO SCAFFOLDING
# ============================================================

```
Initialize a Turborepo monorepo with pnpm workspaces for SocialBazaar. Create this exact structure:

apps/
  web/          → Next.js 14 App Router (buyer-facing, Tailwind + shadcn/ui)
  seller/       → Next.js 14 App Router (seller dashboard, Tailwind + shadcn/ui)
  admin/        → Next.js 14 App Router (admin panel, Tailwind + shadcn/ui)

packages/
  api/          → Fastify + tRPC backend
  db/           → Prisma schema + client
  shared/       → Shared TypeScript types, Zod validators, constants

Setup:
1. Initialize pnpm workspace with turbo.json
2. Each Next.js app should have Tailwind CSS + shadcn/ui configured
3. packages/api should have Fastify with tRPC adapter
4. packages/db should have Prisma with PostgreSQL datasource
5. packages/shared should export types and Zod schemas
6. Create docker-compose.yml with: PostgreSQL 16, Redis 7, MinIO, Meilisearch
7. Add .env.example with all required variables
8. Configure TypeScript strict mode across all packages
9. Setup ESLint + Prettier shared config
10. Add turbo.json with dev, build, lint pipelines

Make sure `pnpm dev` starts all apps + API concurrently.
Make sure all packages can import from packages/shared and packages/db.
```

---

# ============================================================
# STEP 2: DATABASE SCHEMA
# ============================================================

```
Build the complete Prisma schema in packages/db/prisma/schema.prisma for SocialBazaar. Include ALL these models:

User — id mod(cuid), phone (unique, Nepal format), name, email, avatar, role (BUYER/SELLER/ADMIN), isVerified, addresses, createdAt, updatedAt. One-to-one relation to Seller.

Seller — id, userId (unique FK), storeName, storeSlug (unique), storeDescription, storeLogo, storeBanner, tiktokHandle, instagramHandle, facebookPage, whatsappNumber. E-Commerce Act compliance fields: businessRegNumber, panNumber, ecommerceRegNumber, complianceStatus (PENDING/SUBMITTED/VERIFIED/REJECTED/EXPIRED), complianceVerifiedAt. Business: commissionRate (default 10%), isActive, isVerified.

Product — id, sellerId (FK), name, nameNp (Nepali), slug (unique), description, descriptionNp, price (Decimal), compareAtPrice, currency (default NPR), sku, stock, categoryId (FK), tags (String[]), isActive, isFeatured, viewCount, orderCount, avgRating. Relations: images, variants, reviews, socialContents. Indexes on categoryId, sellerId, price.

ProductImage — id, productId, url, alt, sortOrder, isPrimary.

ProductVariant — id, productId, name (e.g. "Size"), value (e.g. "XL"), price (optional override), stock, sku.

Category — id, name, nameNp, slug (unique), icon, image, parentId (self-relation for tree), sortOrder, isActive.

SocialContent — id, sellerId, productId (optional FK), platform (TIKTOK/INSTAGRAM/FACEBOOK/YOUTUBE), contentType (VIDEO/REEL/POST/STORY/LIVE_REPLAY), externalUrl, embedData (Json), thumbnailUrl, caption, viewCount, clickCount.

Order — id, orderNumber (unique, format SB-2026-XXXXX), buyerId, sellerId, status (PENDING/CONFIRMED/PROCESSING/SHIPPED/DELIVERED/CANCELLED/RETURNED/REFUNDED), subtotal, deliveryFee, discount, commission, total, currency (NPR), paymentMethod (ESEWA/KHALTI/FONEPAY/COD/BANK_TRANSFER), paymentStatus (PENDING/PAID/FAILED/REFUNDED), paymentRef, deliveryAddress (Json), deliveryNote, estimatedDelivery, deliveredAt, invoiceData (Json for compliance), source (tiktok/instagram/whatsapp/direct/feed/live). Indexes on buyerId, sellerId, status, createdAt.

OrderItem — id, orderId, productId, variantId (optional), quantity, price, total.

Livestream — id, sellerId, title, description, streamKey, streamUrl, thumbnailUrl, status (SCHEDULED/LIVE/ENDED/CANCELLED), scheduledAt, startedAt, endedAt, viewerCount, peakViewers, products (Json).

ChatRoom — id, buyerId (FK to User), sellerId, productId (optional), lastMessage, lastMessageAt. Unique constraint on [buyerId, sellerId].

ChatMessage — id, roomId, senderId, content, type (TEXT/IMAGE/PRODUCT_SHARE/ORDER_UPDATE/SYSTEM), metadata (Json), isRead.

Review — id, productId, userId, rating (1-5 Int), title, content, images (String[]), isVerifiedPurchase. Unique on [productId, userId].

Address — id, userId, label (Home/Office/Other), fullName, phone, district, municipality, ward, tole, landmark, isDefault.

WishlistItem — id, userId, productId, createdAt.

Payout — id, sellerId, amount, currency, status (PENDING/PROCESSING/COMPLETED/FAILED), bankName, accountNumber, accountName, transactionRef, periodFrom, periodTo, createdAt.

Notification — id, userId, type (ORDER/CHAT/PROMO/SYSTEM), title, body, data (Json), isRead, createdAt.

After creating the schema:
1. Generate Prisma client
2. Create initial migration
3. Create a seed file (packages/db/seed/index.ts) that seeds: 5 top-level categories with subcategories (Fashion & Clothing, Tech & Gadgets, Beauty & Personal Care, Home & Living, Health & Fitness), 1 admin user, 1 test seller (Mensa Fashion), and 5 sample products
4. Export the Prisma client from packages/db for use in packages/api
```

---

# ============================================================
# STEP 3: AUTHENTICATION SYSTEM
# ============================================================

```
Build the complete authentication system for SocialBazaar in packages/api.

Requirements:
1. Phone + OTP based login (Nepal phone: +977 followed by 10 digits)
2. tRPC procedures (or REST endpoints):
   - auth.sendOtp → accepts phone, validates Nepal format, generates 6-digit OTP, stores in Redis with 5min TTL, sends via SMS (mock SMS service for now with console.log, but create the Sparrow SMS integration interface ready to plug in)
   - auth.verifyOtp → accepts phone + otp, validates against Redis, creates user if new (auto-register), returns JWT access token (15min expiry) + refresh token (30 days, stored in Redis)
   - auth.refreshToken → validates refresh token, issues new access token
   - auth.logout → invalidates refresh token in Redis
   - auth.me → returns current user profile

3. JWT middleware for Fastify that:
   - Extracts token from Authorization header (Bearer)
   - Validates and decodes JWT
   - Attaches user to request context
   - Has role-based guards: requireAuth, requireSeller, requireAdmin

4. Rate limiting:
   - OTP send: max 3 per phone per 10 minutes
   - OTP verify: max 5 attempts per phone per 10 minutes
   - Use Redis for rate limit counters

5. Zod schemas in packages/shared:
   - phoneSchema (Nepal format validation)
   - otpSchema (6 digits)
   - loginResponseSchema
   - userSchema

6. Create the auth context provider for the Next.js web app (apps/web):
   - useAuth hook (login, logout, user, isAuthenticated, isLoading)
   - AuthProvider wrapping the app
   - Protected route wrapper component
   - Login page with phone input → OTP input flow
   - Clean UI using shadcn/ui components

Wire everything together so that running `pnpm dev` and visiting the web app shows a working login flow (OTP logged to console).
```

---

# ============================================================
# STEP 4: BACKEND API — PRODUCTS, CATEGORIES, SEARCH
# ============================================================

```
Build the products and categories API module in packages/api.

Categories API:
- category.getAll → returns full category tree (parent + children nested)
- category.getBySlug → single category with its products count
- Admin only: category.create, category.update, category.delete

Products API:
- product.list → paginated, filterable (category, minPrice, maxPrice, search query, seller, sort: newest/price-asc/price-desc/popular), returns products with primary image, seller name, avgRating
- product.getBySlug → full product detail with all images, variants, seller info, social content links, review summary
- product.getByIds → batch fetch for cart
- product.trending → top products by orderCount + viewCount in last 7 days
- product.related → products in same category by same seller or similar price range

Seller product management:
- seller.product.create → with image upload to MinIO, variant creation
- seller.product.update → partial updates
- seller.product.delete → soft delete (isActive = false)
- seller.product.list → seller's own products with filters

Search:
- Integrate Meilisearch
- On product create/update, sync to Meilisearch index
- Search fields: name, nameNp, description, tags, category name
- Filterable attributes: categoryId, price, avgRating, sellerId
- Sortable: price, createdAt, orderCount
- Typo-tolerant search in both English and Nepali

Image handling:
- Upload to MinIO via presigned URLs or multipart upload
- Process with Sharp: resize to 800px max width, convert to WebP, generate thumbnail (200px)
- Store original + optimized + thumbnail paths

Create Zod validators in packages/shared for all product/category inputs.
```

---

# ============================================================
# STEP 5: BACKEND API — CART, ORDERS, PAYMENTS
# ============================================================

```
Build the cart, order, and payment system in packages/api.

Cart:
- cart.get → returns cart items grouped by seller, with product details and subtotals
- cart.addItem → { productId, variantId?, quantity } — validates stock availability
- cart.updateQuantity → { itemId, quantity } — validates stock
- cart.removeItem → { itemId }
- cart.clear
- Store cart in Redis for guest users (keyed by session/device ID), migrate to DB on login
- Calculate delivery fee per seller group: NPR 100 for Kathmandu Valley, NPR 150-250 outside (configurable)

Orders:
- order.create → from cart items:
  1. Validate all items still in stock
  2. Split into sub-orders per seller
  3. Generate order number: SB-YYYY-NNNNN (auto-increment)
  4. Calculate commission per seller order (seller.commissionRate % of subtotal)
  5. Deduct stock
  6. Clear cart
  7. Return order with payment initiation data
  
- order.list → buyer's orders, paginated, filterable by status
- order.getById → full order detail with items, payment status, timeline
- order.cancel → only if status is PENDING or CONFIRMED, restores stock
- order.requestReturn → only if DELIVERED and within 15 days (E-Commerce Act compliance)

- seller.order.list → orders for this seller, filterable by status
- seller.order.updateStatus → PENDING→CONFIRMED→PROCESSING→SHIPPED→DELIVERED
- seller.order.reject → with reason, restores stock

- admin.order.list → all orders
- admin.order.resolveDispute → admin can override status

Payment Integration (create payment module with provider pattern):

eSewa:
- payment.esewa.initiate → generates eSewa payment URL with: amount, tax_amount, product_delivery_charge, product_service_charge, total_amount, transaction_uuid, product_code, success_url, failure_url, signed_field_names, signature (HMAC-SHA256)
- payment.esewa.verify → on callback, verify transaction via eSewa lookup API, update order paymentStatus
- Handle both success and failure redirects

Khalti:
- payment.khalti.initiate → call Khalti initiation API, return payment URL/token
- payment.khalti.verify → on callback, verify via Khalti lookup, update order

COD:
- No external API — mark paymentMethod as COD, paymentStatus stays PENDING until seller marks as delivered and paid
- seller.order.confirmCodPayment → marks payment as PAID on delivery

Fonepay:
- payment.fonepay.generateQR → generate QR for payment
- payment.fonepay.verify → webhook/callback verification

For now, implement eSewa and Khalti with sandbox/test credentials, COD fully working, and Fonepay as a stub.

Create all Zod validators in packages/shared.
Add BullMQ job queue for: order confirmation email/SMS, payment verification retry, stock restoration on failed payment (after 30min timeout).
```

---

# ============================================================
# STEP 6: BACKEND API — CHAT, NOTIFICATIONS, SOCIAL CONTENT
# ============================================================

```
Build the real-time chat, notifications, and social content modules in packages/api.

Chat (Socket.IO):
- Setup Socket.IO server integrated with Fastify
- Authentication: verify JWT on socket connection
- chat.createRoom → creates a room between buyer and seller (optionally linked to a product)
- chat.getRooms → list of chat rooms for current user, sorted by lastMessageAt, with unread count
- chat.getMessages → paginated messages for a room (cursor-based, load older messages)
- chat.sendMessage → { roomId, content, type, metadata }
  - type: TEXT (plain text), IMAGE (upload URL), PRODUCT_SHARE (productId embedded as card), ORDER_UPDATE (auto-generated), SYSTEM
  - Emits via Socket.IO to the other party in real-time
  - Updates ChatRoom.lastMessage and lastMessageAt
  - Creates a notification for the recipient
- chat.markRead → marks all messages in room as read up to a messageId
- Socket events: 'message:new', 'message:read', 'typing:start', 'typing:stop', 'user:online'

Notifications:
- notification.list → paginated, filterable by type, sorted by newest
- notification.markRead → single or bulk mark as read
- notification.unreadCount → returns count for badge
- Push notification via: Socket.IO (in-app real-time), SMS (critical: order status changes)
- BullMQ job processor for notification delivery:
  - ORDER_CONFIRMED → SMS + push
  - ORDER_SHIPPED → SMS + push
  - ORDER_DELIVERED → push
  - NEW_CHAT_MESSAGE → push only
  - PROMO → push only
- WhatsApp notification: create interface/stub for WhatsApp Business API (send order confirmations via WhatsApp)

Social Content:
- socialContent.create → seller links a TikTok/Instagram URL to a product
  - Fetch oEmbed data from TikTok/Instagram oEmbed endpoints
  - Store embedData, thumbnailUrl
  - Validate URL format for each platform
- socialContent.list → list social content for a seller or product
- socialContent.delete → remove social content link
- socialContent.getByProduct → all social content linked to a product (shown on product detail page)

Feed Generation:
- feed.get → the main social feed, returns a mix of:
  - Products with linked social content (prioritized)
  - New products from followed sellers
  - Trending products (high view/order count in last 7 days)
  - Category affinity (based on user's order/view history, simple v1)
  - Paginated, cursor-based
- feed.following → only products/content from sellers the user follows
- feed.trending → trending across the platform
- User follow system: user.followSeller, user.unfollowSeller, user.getFollowing

Cache feed results in Redis with 5-minute TTL. Invalidate on new product or content creation.
```

---

# ============================================================
# STEP 7: FRONTEND — BUYER WEB APP (CORE PAGES)
# ============================================================

```
Build the buyer-facing web app in apps/web using Next.js 14 App Router.

This is a mobile-first PWA. Design for 375px width first, then scale up. Use shadcn/ui components + Tailwind CSS. All pages must be fast — use Server Components where possible, client components only for interactive parts.

Pages to build:

1. Layout (app/layout.tsx):
   - Bottom navigation bar (mobile): Feed | Explore | Cart (with badge) | Chat (with unread badge) | Account
   - Top bar: SocialBazaar logo + search bar + notification bell
   - PWA manifest + meta tags

2. Feed Page (app/(shop)/feed/page.tsx) — THIS IS THE HOMEPAGE:
   - Vertical scrollable feed of product cards with social content
   - Each feed item shows: product image/video thumbnail, product name, price (NPR), seller name + avatar, "Seen on TikTok/Instagram" badge if linked, like count, rating
   - Click → goes to product detail
   - Pull-to-refresh
   - Infinite scroll pagination
   - Tab toggle at top: "For You" | "Following" | "Trending"
   - Skeleton loading states

3. Product Detail (app/(shop)/product/[slug]/page.tsx):
   - Image gallery (swipeable on mobile)
   - Product name (Nepali + English), price with strikethrough compareAtPrice
   - Variant selector (size, color, etc.)
   - "Add to Cart" button (sticky bottom on mobile)
   - "Chat with Seller" button
   - Social content section: embedded TikTok/Instagram videos linked to this product
   - Seller mini-card (avatar, name, rating, "Visit Store" link)
   - Reviews section with rating summary
   - Related products carousel
   - Share button (copy link, WhatsApp, Facebook)
   - "COD Available" badge if applicable

4. Seller Store (app/(shop)/store/[slug]/page.tsx):
   - Store banner + logo + name + description
   - Social links (TikTok, Instagram, Facebook) with icons
   - Follower count + "Follow" button
   - Product grid with filters (category within store, sort)
   - "Chat with Seller" floating button
   - Store rating

5. Search & Category (app/(shop)/search/page.tsx and app/(shop)/category/[slug]/page.tsx):
   - Search bar with instant results (debounced Meilisearch)
   - Category grid on explore page (icons + names in Nepali)
   - Search results as product grid with filters sidebar (mobile: bottom sheet)
   - Filter: category, price range, rating, sort

6. Cart & Checkout (app/(shop)/cart/page.tsx):
   - Cart items grouped by seller
   - Quantity +/- controls
   - Remove item
   - Subtotal per seller + delivery fee + total
   - "Proceed to Checkout" → Checkout page:
     - Address selection/add new
     - Payment method selection with eSewa/Khalti/Fonepay logos + COD option
     - Order summary
     - "Place Order" → redirect to payment gateway or confirm COD
   - Order confirmation page with order number

7. Orders (app/(account)/orders/page.tsx):
   - Order list with status badges (color-coded)
   - Order detail: items, status timeline, payment info, delivery address
   - Cancel button (if eligible)
   - Return request (if within 15 days of delivery)

8. Auth Pages (app/(auth)/login/page.tsx):
   - Phone number input (Nepal format, +977 prefix)
   - OTP input (6 digits, auto-advance between inputs)
   - Clean, minimal design
   - Auto-redirect after login

9. Chat Page (app/(chat)/page.tsx):
   - Chat room list (seller avatar, name, last message, time, unread badge)
   - Chat detail: message bubbles, send input, image upload, product share card rendering
   - Real-time via Socket.IO

Setup the API client layer using TanStack Query + tRPC client (or fetch wrapper) in apps/web/lib/.
Setup Zustand stores for: auth, cart (optimistic UI), chat (socket state).
Add next-pwa configuration for installable PWA.

The entire UI should feel like a social media app that you can shop from, NOT like a traditional ecommerce site.
```

---

# ============================================================
# STEP 8: FRONTEND — SELLER DASHBOARD
# ============================================================

```
Build the seller dashboard in apps/seller using Next.js 14 App Router.

This is a desktop-first dashboard (sellers manage from computer), but must be usable on mobile too. Use shadcn/ui components + Tailwind CSS.

Pages:

1. Layout:
   - Sidebar navigation: Dashboard | Products | Orders | Content | Analytics | Settings | Compliance
   - Top bar: seller store name + notification bell + profile dropdown
   - Collapsible sidebar on mobile

2. Dashboard (app/dashboard/page.tsx):
   - Key metrics cards: Today's sales (NPR), total orders, pending orders, total products, store rating
   - Sales chart (last 7 days / 30 days toggle) using recharts
   - Recent orders table (last 10)
   - Quick actions: Add Product, View Orders, Go to Store

3. Products (app/products/page.tsx):
   - Product table: image thumbnail, name, price, stock, status (active/draft), actions
   - Search + filter by category, status
   - Add Product page (app/products/new/page.tsx):
     - Multi-step form: Basic info → Images (drag-drop upload, reorder) → Variants → Pricing → Category & Tags → Submit
     - Nepali name/description fields alongside English
     - Image preview with crop/resize
   - Edit Product page (app/products/[id]/edit/page.tsx)

4. Orders (app/orders/page.tsx):
   - Order table: order number, buyer name, items count, total (NPR), status, date, actions
   - Filter by status tabs: All | Pending | Confirmed | Processing | Shipped | Delivered | Cancelled
   - Order detail modal/page: items list, buyer address, payment method/status, action buttons (Confirm → Process → Ship → Deliver), reject with reason
   - COD payment confirmation button on delivery

5. Content Manager (app/content/page.tsx):
   - Link social media content to products
   - Input: paste TikTok/Instagram URL → auto-fetch embed preview → select product to link
   - Grid of linked content: thumbnail, platform icon, linked product, views, clicks
   - Delete link

6. Analytics (app/analytics/page.tsx):
   - Revenue chart (daily/weekly/monthly)
   - Top products by revenue and by orders
   - Traffic sources breakdown (which social platform drove sales)
   - Order conversion funnel: views → cart → order → delivered
   - Average order value trend

7. Settings (app/settings/page.tsx):
   - Store info: name, description, logo upload, banner upload
   - Social links: TikTok, Instagram, Facebook, WhatsApp
   - Payment settings: bank account details for payouts
   - Notification preferences

8. Compliance (app/compliance/page.tsx):
   - E-Commerce Act 2081 compliance checklist with status indicators:
     ✅ Business Registration Certificate — uploaded / ❌ missing
     ✅ PAN Number — entered / ❌ missing
     ✅ E-Commerce Portal Registration — number entered / ❌ missing
     ✅ Return Policy — displayed / ❌ missing
     ✅ Grievance Contact — set / ❌ missing
   - Upload documents
   - Current compliance status: PENDING/SUBMITTED/VERIFIED
   - Warning banners if non-compliant: "Your store will be hidden until compliance is verified"

Connect everything to the backend API via tRPC client or fetch.
Seller must be authenticated and have role SELLER to access any page.
```

---

# ============================================================
# STEP 9: FRONTEND — ADMIN PANEL
# ============================================================

```
Build the admin panel in apps/admin using Next.js 14 App Router.

Desktop-only dashboard. Use shadcn/ui + Tailwind CSS.

Pages:

1. Dashboard (app/dashboard/page.tsx):
   - Platform metrics: total GMV (NPR), total orders, active sellers, active buyers, pending seller verifications
   - GMV chart (last 30 days)
   - Order volume chart
   - Recent activity feed

2. Sellers (app/sellers/page.tsx):
   - Seller table: store name, owner, products count, total sales, compliance status, verified status, joined date
   - Filter: pending verification, verified, rejected
   - Seller detail: all info, compliance documents (view/download), products list
   - Actions: Verify seller, Reject (with reason), Suspend, Set commission rate

3. Orders (app/orders/page.tsx):
   - All platform orders with filters (status, seller, date range, payment method)
   - Order detail with full info
   - Dispute resolution: override order status, issue refund

4. Categories (app/categories/page.tsx):
   - Category tree view (drag-drop reorder)
   - Add/edit/delete categories
   - Nepali + English names

5. Compliance Monitor (app/compliance/page.tsx):
   - Sellers approaching compliance expiry
   - Sellers with missing documents
   - Bulk notification to non-compliant sellers

6. Payments (app/payments/page.tsx):
   - Transaction log: all payments with status, method, amount
   - Commission summary per seller
   - Payout management: pending payouts, process payout, payout history

7. Reports (app/reports/page.tsx):
   - Revenue report by date range
   - Commission earned report
   - Category performance report
   - Payment method breakdown
   - Export to CSV

Admin must have role ADMIN. Protect all routes.
```

---

# ============================================================
# STEP 10: MOBILE APP FOUNDATION
# ============================================================

```
Build the React Native mobile app in apps/mobile using Expo SDK 50+ with Expo Router.

This is the PRIMARY interface — most users will use this. Design for one-hand use on 5-6 inch screens.

Setup:
1. Initialize Expo project with TypeScript template
2. Configure Expo Router (file-based routing)
3. Setup NativeWind (Tailwind for React Native)
4. Configure the API client (same tRPC/fetch pattern as web, shared types from packages/shared)
5. Setup Zustand stores (auth, cart, chat)
6. Setup expo-notifications + Firebase Cloud Messaging
7. Setup Socket.IO client for real-time chat

Screens:

1. Tab Navigation (bottom tabs):
   - Feed (home icon) | Explore (search icon) | Cart (bag icon + badge) | Chat (message icon + unread badge) | Account (person icon)

2. Feed Screen (tabs/feed):
   - Vertical scrollable list of product cards (like TikTok's scrollable feed but with product cards, not full-screen videos)
   - Each card: product image (16:9 ratio), product name, price (NPR), seller name, social platform badge, rating stars
   - Pull-to-refresh
   - Infinite scroll
   - Top tabs: For You | Following | Trending
   - Tap card → Product Detail screen

3. Explore Screen (tabs/explore):
   - Search bar at top (auto-focus)
   - Category grid below (icon + name in Nepali)
   - Trending searches
   - Search results: product grid with filter bottom sheet

4. Product Detail Screen (product/[slug]):
   - Swipeable image gallery
   - Sticky bottom bar: price + "Add to Cart" button
   - Variant picker (modal/bottom sheet)
   - "Chat with Seller" button
   - Social content carousel (embedded TikTok/IG)
   - Seller mini-profile
   - Reviews
   - Share button (WhatsApp, copy link)
   - "COD Available" badge

5. Cart Screen (tabs/cart):
   - Items grouped by seller
   - Quantity controls
   - Swipe to delete
   - Bottom: total + "Checkout" button
   - Checkout flow: Address → Payment → Confirm (as screen stack, not tabs)
   - Payment: deep-link to eSewa/Khalti apps, WebView fallback

6. Chat Screen (tabs/chat):
   - Chat list with avatars, last message, time, unread badge
   - Chat detail: message bubbles, send bar, image attach, product share
   - Real-time via Socket.IO
   - Push notification on new message when app is backgrounded

7. Account Screen (tabs/account):
   - Profile header (name, phone, avatar)
   - Menu: My Orders, Wishlist, Addresses, Settings, Language (EN/NP toggle), Become a Seller, Logout
   - Orders list with status badges, tap for detail

8. Auth Flow:
   - Phone input screen (Nepal flag + +977 prefix)
   - OTP screen (6 digit inputs, auto-read SMS if possible)
   - Name input for new users
   - Navigate to main tabs on success

Make the app feel native and fast. Use:
- FlatList/FlashList for all lists (not ScrollView)
- Skeleton loading (not spinners)
- Haptic feedback on actions
- Smooth navigation transitions
- Image caching (expo-image or FastImage)
- Offline: cache last viewed products, show cached data when offline with "You're offline" banner
```

---

# ============================================================
# STEP 11: CONNECT EVERYTHING + TEST
# ============================================================

```
Wire all frontends (web, seller, admin, mobile) to the backend API and make the full flow work end-to-end.

Test these critical flows:

1. BUYER FLOW:
   Phone login → Browse feed → View product → Add to cart → Checkout with COD → Order confirmed → View order in "My Orders"

2. SELLER FLOW:
   Register as seller → Upload compliance docs → Add product with images → Link TikTok URL to product → View incoming order → Confirm order → Mark as shipped → Mark as delivered

3. CHAT FLOW:
   Buyer opens product → "Chat with Seller" → Sends message → Seller receives in real-time → Seller replies → Buyer sees reply instantly

4. PAYMENT FLOW:
   Buyer checks out with eSewa (sandbox) → Redirected → Payment verified → Order marked as PAID

5. ADMIN FLOW:
   Login as admin → View pending sellers → Verify a seller → View all orders → View revenue report

Fix any broken connections, type mismatches, or missing API calls.
Make sure:
- All Zod validators are shared correctly
- Error handling shows user-friendly messages
- Loading states show skeletons
- Empty states show helpful messages ("No products yet", "Start shopping to see orders here")
- Nepal-specific formatting is correct everywhere: NPR currency, +977 phone, Nepali category names
```

---

# ============================================================
# STEP 12: DEPLOYMENT SETUP
# ============================================================

```
Create production deployment configuration for SocialBazaar.

1. Dockerfiles:
   - Dockerfile.api → Node.js production build for packages/api
   - Dockerfile.web → Next.js standalone build for apps/web
   - Dockerfile.seller → Next.js standalone build for apps/seller
   - Dockerfile.admin → Next.js standalone build for apps/admin

2. docker-compose.prod.yml:
   - All services + Nginx reverse proxy
   - PostgreSQL with volume persistence
   - Redis with persistence
   - MinIO with volume
   - Meilisearch with volume
   - Nginx config routing: socialbazaar.com → web, seller.socialbazaar.com → seller, admin.socialbazaar.com → admin, api.socialbazaar.com → api

3. Nginx configuration:
   - SSL termination (Let's Encrypt / Certbot)
   - Gzip compression
   - Static file caching headers
   - WebSocket proxy for Socket.IO
   - Rate limiting

4. GitHub Actions CI/CD:
   - Lint + type-check on PR
   - Build all packages on push to main
   - Deploy to production server via SSH + docker compose up

5. Backup script:
   - PostgreSQL daily backup to S3/MinIO
   - Retention: 30 days

6. Environment setup:
   - Production .env template with all required variables
   - Separate staging environment config

7. Mobile (Expo):
   - EAS Build configuration (eas.json) for Android APK/AAB
   - App store submission checklist
   - OTA update configuration

Output a README.md with complete setup instructions for both development and production.
```

---

# ============================================================
# HOW TO USE THESE PROMPTS
# ============================================================

# 1. Save CLAUDE.md in your project root
# 2. Open Claude Code in the project directory
# 3. Paste STEP 1 → wait for completion → verify it works
# 4. Paste STEP 2 → wait for completion → verify it works
# 5. Continue in order: STEP 3 → 4 → 5 → ... → 12
#
# RULES:
# - Do NOT skip steps. Each step builds on the previous.
# - After each step, run `pnpm dev` to verify everything still works.
# - If something breaks, tell Claude Code: "Fix the error in [file/module]"
# - If you want to modify a feature, do it AFTER completing all 12 steps.
# - Each step should take Claude Code 10-30 minutes to implement.
#
# TOTAL ESTIMATED BUILD TIME: 4-8 hours of Claude Code interaction
