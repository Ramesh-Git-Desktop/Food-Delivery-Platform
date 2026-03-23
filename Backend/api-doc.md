# 🍔 Food-Order Platform — Complete API Documentation

> **Tech Stack:** Node.js · Express.js · MongoDB · JWT
> **Roles:** User · Main Admin · Restaurant Admin · Rider (Delivery Boy)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Authentication & Authorization Flow](#authentication--authorization-flow)
3. [API Build Order (Step-by-Step)](#api-build-order-step-by-step)
4. [Phase 1 — Foundation & Main Admin](#phase-1--foundation--main-admin)
5. [Phase 2 — Restaurant Admin (Registration + Approval)](#phase-2--restaurant-admin-registration--approval)
6. [Phase 3 — Menu Management](#phase-3--menu-management)
7. [Phase 4 — User (Customer)](#phase-4--user-customer)
8. [Phase 5 — Cart & Checkout](#phase-5--cart--checkout)
9. [Phase 6 — Order Management](#phase-6--order-management)
10. [Phase 7 — Rider (Delivery Boy)](#phase-7--rider-delivery-boy)
11. [Phase 8 — Ratings & Reviews](#phase-8--ratings--reviews)
12. [Phase 9 — Notifications](#phase-9--notifications)
13. [Phase 10 — Analytics & Dashboard Data](#phase-10--analytics--dashboard-data)
14. [Database Models Summary](#database-models-summary)
15. [Middleware Summary](#middleware-summary)
16. [Error Code Reference](#error-code-reference)

---

## Architecture Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│  Express.js  │────▶│   MongoDB    │
│  (React/etc) │◀────│   REST API   │◀────│  (Mongoose)  │
└──────────────┘     └──────┬───────┘     └──────────────┘
                           │
                     ┌─────┴─────┐
                     │Middlewares│
                     │• auth     │
                     │• role     │
                     │• upload   │
                     │• validate │
                     └───────────┘
```

### Folder Structure (Backend)

```
Backend/
├── server.js
├── config/
│   ├── db.js
│   └── env.js
├── models/
│   ├── User.js
│   ├── Admin.js
│   ├── Restaurant.js
│   ├── RestaurantAdmin.js
│   ├── Menu.js
│   ├── MenuItem.js
│   ├── Rider.js
│   ├── Cart.js
│   ├── Order.js
│   ├── Review.js
│   └── Notification.js
├── controllers/
│   ├── admin.controller.js
│   ├── auth.controller.js
│   ├── restaurant.controller.js
│   ├── menu.controller.js
│   ├── user.controller.js
│   ├── cart.controller.js
│   ├── order.controller.js
│   ├── rider.controller.js
│   ├── review.controller.js
│   └── notification.controller.js
├── routes/
│   ├── admin.routes.js
│   ├── auth.routes.js
│   ├── restaurant.routes.js
│   ├── menu.routes.js
│   ├── user.routes.js
│   ├── cart.routes.js
│   ├── order.routes.js
│   ├── rider.routes.js
│   ├── review.routes.js
│   └── notification.routes.js
├── middlewares/
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   ├── upload.middleware.js
│   └── validate.middleware.js
├── utils/
│   ├── asyncHandler.js
│   ├── apiError.js
│   ├── apiResponse.js
│   └── generateToken.js
└── validators/
    ├── auth.validator.js
    ├── restaurant.validator.js
    ├── menu.validator.js
    └── order.validator.js
```

---

## Authentication & Authorization Flow

```
                    ┌─────────────────────────────┐
                    │     Registration Request    │
                    └──────────┬──────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
    ┌─────▼─────┐       ┌─────▼──────┐       ┌─────▼─────┐
    │   User    │       │ Restaurant │       │   Rider   │
    │  (direct  │       │   Admin    │       │  (pending │
    │  access)  │       │  (pending) │       │  approval)│
    └─────┬─────┘       └─────┬──────┘       └─────┬─────┘
          │                   │                     │
          │            ┌──────▼──────┐        ┌─────▼──────┐
          │            │ Main Admin  │        │ Main Admin │
          │            │  Reviews &  │        │  Reviews & │
          │            │  Approves   │        │  Approves  │
          │            └──────┬──────┘        └─────┬──────┘
          │                   │                     │
          ▼                   ▼                     ▼
    ┌───────────────────────────────────────────────────┐
    │        JWT Token Issued → Dashboard Access        │
    └───────────────────────────────────────────────────┘
```

- **User** → Registers → Logs in immediately → Gets JWT token
- **Restaurant Admin** → Registers with restaurant details + menu + documents → Status = `pending` → Main Admin reviews → Approves/Rejects → On approval, Restaurant Admin can log in
- **Rider** → Registers with personal details + documents → Status = `pending` → Main Admin reviews → Approves/Rejects → On approval, Rider can log in
- **Main Admin** → Pre-seeded or created via a secure seed script → Full access

---

## API Build Order (Step-by-Step)

> **Build in this exact order.** Each phase depends on the previous one.

| #  | Phase                              | Priority  |
|----|-------------------------------------|-----------|
| 1  | Foundation & Main Admin Auth        | 🔴 First  |
| 2  | Restaurant Admin Registration + Approval | 🔴 First |
| 3  | Menu Management                     | 🟠 Second |
| 4  | User (Customer) Auth & Profile      | 🟠 Second |
| 5  | Cart & Checkout                     | 🟡 Third  |
| 6  | Order Management                    | 🟡 Third  |
| 7  | Rider Registration + Delivery       | 🟢 Fourth |
| 8  | Ratings & Reviews                   | 🔵 Fifth  |
| 9  | Notifications                       | 🔵 Fifth  |
| 10 | Analytics & Dashboard Data          | 🟣 Sixth  |

---

## Phase 1 — Foundation & Main Admin

> **Build this FIRST.** This sets up auth, JWT, error handling, and the admin seed.

### 1.1 Server Setup (No API — just configuration)

| #  | Task                                         |
|----|----------------------------------------------|
| 1  | Initialize `npm init -y`                      |
| 2  | Install deps: `express mongoose dotenv jsonwebtoken bcryptjs cors cookie-parser multer express-validator` |
| 3  | Create `server.js` — Express app + MongoDB connection |
| 4  | Create `config/db.js` — Mongoose connect function |
| 5  | Create `utils/asyncHandler.js` — Async error wrapper |
| 6  | Create `utils/apiError.js` — Custom error class |
| 7  | Create `utils/apiResponse.js` — Standard response format |
| 8  | Create `utils/generateToken.js` — JWT sign + cookie setter |
| 9  | Create `middlewares/auth.middleware.js` — Verify JWT from cookie/header |
| 10 | Create `middlewares/role.middleware.js` — Role-based access control |
| 11 | Create `middlewares/errorHandler.js` — Global error handler (register last) |

### 1.2 Main Admin Auth APIs

| #  | Method | Endpoint                  | Feature                                     | Auth     |
|----|--------|---------------------------|---------------------------------------------|----------|
| 1  | POST   | `/api/admin/seed`          | Create first super admin (**run once**, then **disable**) | None*    |
| 2  | POST   | `/api/admin/login`         | Admin login → returns JWT token              | None     |
| 3  | POST   | `/api/admin/logout`        | Clear JWT cookie / invalidate session        | Admin    |
| 4  | GET    | `/api/admin/profile`       | Get current admin profile                    | Admin    |
| 5  | PUT    | `/api/admin/profile`       | Update admin profile (name, email, password) | Admin    |

**Seed endpoint safety (required):**
- **Disable in production** after first admin is created.
- Protect it with an environment flag + secret (example: only allow if `ENABLE_ADMIN_SEED=true` and a header like `x-admin-seed-secret` matches `ADMIN_SEED_SECRET`).

**Request/Response Examples:**

**POST `/api/admin/login`**
```json
// Request
{
  "email": "admin@foodorder.com",
  "password": "Admin@123"
}

// Response 200
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "...",
    "name": "Super Admin",
    "email": "admin@foodorder.com",
    "role": "main-admin"
  }
}
```

**Auth token transport (pick one approach and keep consistent across all APIs):**
- **Recommended (web)**: set JWT in an **HttpOnly cookie** (using `cookie-parser`) and return the user/admin profile in `data`. Client does not need to store `token`.
- **Alternative (mobile/SPA)**: return `token` in the JSON response and require `Authorization: Bearer <token>` on protected routes.

---

## Phase 2 — Restaurant Admin (Registration + Approval)

> **Build this SECOND.** Restaurant admins register with full details; Main Admin approves them.

### 2.1 Restaurant Admin Auth APIs

| #  | Method | Endpoint                              | Feature                                                     | Auth  |
|----|--------|---------------------------------------|-------------------------------------------------------------|-------|
| 1  | POST   | `/api/restaurant-admin/register`       | Register with owner details + restaurant info + documents (images, FSSAI, GST) + optional initial menu | None  |
| 2  | POST   | `/api/restaurant-admin/login`          | Login (only if status = `approved`)                          | None  |
| 3  | POST   | `/api/restaurant-admin/logout`         | Logout — clear session                                       | RestaurantAdmin |
| 4  | GET    | `/api/restaurant-admin/profile`        | Get own profile + restaurant details                         | RestaurantAdmin |
| 5  | PUT    | `/api/restaurant-admin/profile`        | Update own profile                                           | RestaurantAdmin |
| 6  | GET    | `/api/restaurant-admin/status`         | Check application status (pending / approved / rejected)     | None (by token **or** by `?email=`) |

**POST `/api/restaurant-admin/register` — multipart/form-data fields:**
```json
{
  // --- Owner Details ---
  "ownerName": "Rahul Sharma",
  "email": "rahul@restaurant.com",
  "password": "Secure@123",
  "phone": "9876543210",

  // --- Restaurant Details ---
  "restaurantName": "Spice Garden",
  "restaurantAddress": "123 MG Road, Bangalore",
  "restaurantCity": "Bangalore",
  "restaurantState": "Karnataka",
  "restaurantPincode": "560001",
  "restaurantPhone": "080-12345678",
  "cuisineType": ["North Indian", "Chinese", "South Indian"],
  "openingTime": "10:00",
  "closingTime": "23:00",
  "deliveryRadius": 10,
  "avgDeliveryTime": 30,

  // --- Documents (file uploads) ---
  "restaurantLogo": "<file>",
  "restaurantImages": ["<file>", "<file>"],
  "fssaiLicense": "<file>",
  "gstCertificate": "<file>",
  "panCard": "<file>",

  // --- Optional Initial Menu (stringified JSON in a text field) ---
  "menu": "[{\"category\":\"Starters\",\"items\":[{\"name\":\"Paneer Tikka\",\"price\":250,\"description\":\"Grilled cottage cheese\",\"isVeg\":true}]}]"
}
```

**GET `/api/restaurant-admin/status` — supported checks:**
- **If logged in**: return status for the restaurant admin from the JWT (cookie/Bearer).
- **If not logged in**: allow `GET /api/restaurant-admin/status?email=rahul@restaurant.com` and return only minimal status fields (e.g., `status`, `rejectionReason`). Add rate limiting to prevent enumeration.

### 2.2 Main Admin — Restaurant Management APIs

| #  | Method | Endpoint                                         | Feature                                                               | Auth  |
|----|--------|--------------------------------------------------|-----------------------------------------------------------------------|-------|
| 1  | GET    | `/api/admin/restaurants`                          | List all restaurant applications (filter: pending / approved / rejected) | Admin |
| 2  | GET    | `/api/admin/restaurants/:id`                      | View single restaurant application with full details + documents       | Admin |
| 3  | PUT    | `/api/admin/restaurants/:id/approve`              | Approve restaurant → status = `approved`, send email notification      | Admin |
| 4  | PUT    | `/api/admin/restaurants/:id/reject`               | Reject restaurant with reason → status = `rejected`                    | Admin |
| 5  | PUT    | `/api/admin/restaurants/:id/suspend`              | Suspend an approved restaurant                                         | Admin |
| 6  | DELETE | `/api/admin/restaurants/:id`                      | Permanently delete a restaurant                                        | Admin |

**PUT `/api/admin/restaurants/:id/reject` — Request Body:**
```json
{
  "reason": "Incomplete FSSAI documentation. Please re-submit."
}
```

---

## Phase 3 — Menu Management

> **Build this THIRD.** Restaurant Admin manages their own menu.

### 3.1 Category APIs (Restaurant Admin)

| #  | Method | Endpoint                                                 | Feature                              | Auth            |
|----|--------|----------------------------------------------------------|--------------------------------------|-----------------|
| 1  | POST   | `/api/restaurant/:restaurantId/categories`                | Create a menu category (e.g., Starters, Main Course) | RestaurantAdmin |
| 2  | GET    | `/api/restaurant/:restaurantId/categories`                | Get all categories for the restaurant | Public          |
| 3  | PUT    | `/api/restaurant/:restaurantId/categories/:categoryId`    | Update category name/order           | RestaurantAdmin |
| 4  | DELETE | `/api/restaurant/:restaurantId/categories/:categoryId`    | Delete a category                    | RestaurantAdmin |

### 3.2 Menu Item APIs (Restaurant Admin)

| #  | Method | Endpoint                                                         | Feature                                              | Auth            |
|----|--------|------------------------------------------------------------------|------------------------------------------------------|-----------------|
| 1  | POST   | `/api/restaurant/:restaurantId/menu`                              | Add a menu item (name, price, description, image, category, veg/non-veg, available) | RestaurantAdmin |
| 2  | GET    | `/api/restaurant/:restaurantId/menu`                              | Get all menu items (filter by category, veg, price range) | Public          |
| 3  | GET    | `/api/restaurant/:restaurantId/menu/:itemId`                      | Get single menu item details                         | Public          |
| 4  | PUT    | `/api/restaurant/:restaurantId/menu/:itemId`                      | Update menu item (price, availability, etc.)         | RestaurantAdmin |
| 5  | DELETE | `/api/restaurant/:restaurantId/menu/:itemId`                      | Delete a menu item                                   | RestaurantAdmin |
| 6  | PUT    | `/api/restaurant/:restaurantId/menu/:itemId/toggle-availability`  | Quick toggle item available/unavailable               | RestaurantAdmin |

**POST `/api/restaurant/:restaurantId/menu` — Request Body (multipart/form-data):**
```json
{
  "name": "Butter Chicken",
  "description": "Creamy tomato-based curry with tender chicken",
  "price": 350,
  "category": "categoryId_here",
  "isVeg": false,
  "isAvailable": true,
  "preparationTime": 20,
  "image": "<file>"
}
```

---

## Phase 4 — User (Customer)

> **Build this FOURTH.** Users can register, login, browse restaurants and menus.

### 4.1 User Auth APIs

| #  | Method | Endpoint                       | Feature                                           | Auth  |
|----|--------|--------------------------------|---------------------------------------------------|-------|
| 1  | POST   | `/api/user/register`            | Register with name, email, password, phone         | None  |
| 2  | POST   | `/api/user/login`               | Login → JWT token (immediate access, no approval)  | None  |
| 3  | POST   | `/api/user/logout`              | Logout — clear session                             | User  |
| 4  | GET    | `/api/user/profile`             | Get own profile                                    | User  |
| 5  | PUT    | `/api/user/profile`             | Update name, phone, profile picture                | User  |
| 6  | PUT    | `/api/user/change-password`     | Change password                                    | User  |
| 7  | POST   | `/api/user/forgot-password`     | Send password reset email/OTP                      | None  |
| 8  | POST   | `/api/user/reset-password`      | Reset password with token/OTP                      | None  |

### 4.2 User Address APIs

| #  | Method | Endpoint                        | Feature                                           | Auth  |
|----|--------|-------------------------------- |---------------------------------------------------|-------|
| 1  | POST   | `/api/user/addresses`            | Add a delivery address (home, work, other)         | User  |
| 2  | GET    | `/api/user/addresses`            | Get all saved addresses                            | User  |
| 3  | PUT    | `/api/user/addresses/:addressId` | Update an address                                  | User  |
| 4  | DELETE | `/api/user/addresses/:addressId` | Delete an address                                  | User  |
| 5  | PUT    | `/api/user/addresses/:addressId/default` | Set as default delivery address             | User  |

### 4.3 Browse Restaurants (Public)

| #  | Method | Endpoint                                  | Feature                                                    | Auth   |
|----|--------|-------------------------------------------|------------------------------------------------------------|--------|
| 1  | GET    | `/api/restaurants`                         | List all approved restaurants (search, filter by cuisine, city, rating, sort) | Public |
| 2  | GET    | `/api/restaurants/:id`                     | Get restaurant details + menu categories + menu items       | Public |
| 3  | GET    | `/api/restaurants/search?q=biryani`        | Search restaurants by name, cuisine, or menu item name      | Public |
| 4  | GET    | `/api/restaurants/cuisine/:cuisineType`    | Filter by cuisine type                                      | Public |

---

## Phase 5 — Cart & Checkout

> **Build this FIFTH.** Users can add items to cart and proceed to checkout.

### 5.1 Cart APIs

| #  | Method | Endpoint                       | Feature                                                  | Auth  |
|----|--------|--------------------------------|----------------------------------------------------------|-------|
| 1  | POST   | `/api/cart/add`                 | Add item to cart (if cart has items from different restaurant → warn/clear) | User  |
| 2  | GET    | `/api/cart`                     | Get current cart with items, quantities, totals           | User  |
| 3  | PUT    | `/api/cart/item/:itemId`        | Update item quantity in cart                              | User  |
| 4  | DELETE | `/api/cart/item/:itemId`        | Remove item from cart                                    | User  |
| 5  | DELETE | `/api/cart/clear`               | Clear entire cart                                        | User  |

**POST `/api/cart/add` — Request Body:**
```json
{
  "menuItemId": "item_id_here",
  "restaurantId": "restaurant_id_here",
  "quantity": 2
}
```

**GET `/api/cart` — Response:**
```json
{
  "success": true,
  "data": {
    "restaurant": { "_id": "...", "name": "Spice Garden" },
    "items": [
      {
        "menuItem": { "_id": "...", "name": "Butter Chicken", "price": 350, "image": "..." },
        "quantity": 2,
        "itemTotal": 700
      }
    ],
    "subTotal": 700,
    "deliveryFee": 40,
    "tax": 35,
    "totalAmount": 775
  }
}
```

### 5.2 Coupon / Promo Code APIs

| #  | Method | Endpoint                        | Feature                                      | Auth   |
|----|--------|---------------------------------|----------------------------------------------|--------|
| 1  | POST   | `/api/admin/coupons`             | Create a coupon (code, discount %, max amount, expiry) | Admin  |
| 2  | GET    | `/api/admin/coupons`             | List all coupons                              | Admin  |
| 3  | PUT    | `/api/admin/coupons/:id`         | Update coupon                                 | Admin  |
| 4  | DELETE | `/api/admin/coupons/:id`         | Delete coupon                                 | Admin  |
| 5  | POST   | `/api/coupons/apply`             | Apply coupon to cart → validate & return discount | User  |
| 6  | GET    | `/api/coupons/available`         | List available coupons for user                | User  |

---

## Phase 6 — Order Management

> **Build this SIXTH.** The core order lifecycle.

### Order Status Flow

```
User places order
      │
      ▼
  ┌──────────┐    Restaurant     ┌───────────┐    Restaurant     ┌────────────┐
  │  PLACED  │ ──────accepts───▶ │ CONFIRMED │ ──────ready────▶  │  PREPARED  │
  └──────────┘                   └───────────┘                   └─────┬──────┘
                                                                       │
      ┌──────────┐    Rider       ┌────────────┐    Rider        ┌─────▼──────┐
      │DELIVERED │ ◀──delivers──  │  ON_THE_WAY│ ◀──picks up──  │  PICKED_UP │
      └──────────┘                └────────────┘                 └────────────┘

  At any point before PICKED_UP:
  ┌───────────┐
  │ CANCELLED │  ← User or Restaurant can cancel
  └───────────┘
```

### 6.1 User — Order APIs

| #  | Method | Endpoint                        | Feature                                              | Auth  |
|----|--------|---------------------------------|------------------------------------------------------|-------|
| 1  | POST   | `/api/orders`                    | Place order (from cart → create order, clear cart)     | User  |
| 2  | GET    | `/api/orders`                    | Get all my orders (with pagination, filter by status)  | User  |
| 3  | GET    | `/api/orders/:orderId`           | Get single order details (items, status, rider, tracking) | User  |
| 4  | PUT    | `/api/orders/:orderId/cancel`    | Cancel order (only if status = `placed` or `confirmed`) | User  |
| 5  | GET    | `/api/orders/:orderId/track`     | Live tracking — get current order status + rider location | User  |

**POST `/api/orders` — Request Body:**
```json
{
  "addressId": "address_id_here",
  "paymentMethod": "COD",
  "couponCode": "WELCOME50",
  "instructions": "Ring the bell twice"
}
```

**POST `/api/orders` — Response:**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "_id": "order_id",
    "orderNumber": "ORD-20260303-001",
    "restaurant": { "name": "Spice Garden" },
    "items": [...],
    "status": "placed",
    "subTotal": 700,
    "deliveryFee": 40,
    "discount": 50,
    "tax": 35,
    "totalAmount": 725,
    "paymentMethod": "COD",
    "estimatedDeliveryTime": "30-40 mins",
    "deliveryAddress": { ... }
  }
}
```

### 6.2 Restaurant Admin — Order APIs

| #  | Method | Endpoint                                            | Feature                                              | Auth            |
|----|--------|-----------------------------------------------------|------------------------------------------------------|-----------------|
| 1  | GET    | `/api/restaurant-admin/orders`                       | Get all orders for my restaurant (filter by status)   | RestaurantAdmin |
| 2  | GET    | `/api/restaurant-admin/orders/:orderId`              | Get single order details                              | RestaurantAdmin |
| 3  | PUT    | `/api/restaurant-admin/orders/:orderId/accept`       | Accept order → status = `confirmed`                   | RestaurantAdmin |
| 4  | PUT    | `/api/restaurant-admin/orders/:orderId/reject`       | Reject order with reason                              | RestaurantAdmin |
| 5  | PUT    | `/api/restaurant-admin/orders/:orderId/preparing`    | Mark as preparing                                     | RestaurantAdmin |
| 6  | PUT    | `/api/restaurant-admin/orders/:orderId/ready`        | Mark as ready for pickup → notify rider               | RestaurantAdmin |

### 6.3 Main Admin — Order APIs

| #  | Method | Endpoint                              | Feature                                              | Auth  |
|----|--------|---------------------------------------|------------------------------------------------------|-------|
| 1  | GET    | `/api/admin/orders`                    | List all orders platform-wide (filter, search, sort)  | Admin |
| 2  | GET    | `/api/admin/orders/:orderId`           | View any order details                                | Admin |
| 3  | PUT    | `/api/admin/orders/:orderId/reassign`  | Reassign rider to an order                            | Admin |

---

## Phase 7 — Rider (Delivery Boy)

> **Build this SEVENTH.** Riders register, get approved by admin, and handle deliveries.

### 7.1 Rider Auth APIs

| #  | Method | Endpoint                       | Feature                                                  | Auth  |
|----|--------|--------------------------------|----------------------------------------------------------|-------|
| 1  | POST   | `/api/rider/register`           | Register with name, email, password, phone, vehicle type, documents (DL, Aadhar, vehicle RC) | None  |
| 2  | POST   | `/api/rider/login`              | Login (only if status = `approved`)                       | None  |
| 3  | POST   | `/api/rider/logout`             | Logout                                                    | Rider |
| 4  | GET    | `/api/rider/profile`            | Get own profile                                           | Rider |
| 5  | PUT    | `/api/rider/profile`            | Update profile                                            | Rider |
| 6  | GET    | `/api/rider/status`             | Check application status (pending / approved / rejected)  | None  |

**POST `/api/rider/register` — Request Body (multipart/form-data):**
```json
{
  "name": "Amit Kumar",
  "email": "amit@rider.com",
  "password": "Rider@123",
  "phone": "9988776655",
  "vehicleType": "bike",
  "vehicleNumber": "KA-01-AB-1234",
  "drivingLicense": "<file>",
  "aadharCard": "<file>",
  "vehicleRC": "<file>",
  "profilePhoto": "<file>"
}
```

### 7.2 Main Admin — Rider Management APIs

| #  | Method | Endpoint                              | Feature                                              | Auth  |
|----|--------|---------------------------------------|------------------------------------------------------|-------|
| 1  | GET    | `/api/admin/riders`                    | List all rider applications (filter: pending / approved / rejected) | Admin |
| 2  | GET    | `/api/admin/riders/:id`                | View single rider application with documents          | Admin |
| 3  | PUT    | `/api/admin/riders/:id/approve`        | Approve rider → status = `approved`                   | Admin |
| 4  | PUT    | `/api/admin/riders/:id/reject`         | Reject rider with reason                              | Admin |
| 5  | PUT    | `/api/admin/riders/:id/suspend`        | Suspend an active rider                               | Admin |
| 6  | DELETE | `/api/admin/riders/:id`                | Permanently delete a rider                            | Admin |

### 7.3 Rider — Delivery APIs

| #  | Method | Endpoint                                   | Feature                                              | Auth  |
|----|--------|--------------------------------------------|------------------------------------------------------|-------|
| 1  | GET    | `/api/rider/available-orders`               | Get orders ready for pickup near rider location       | Rider |
| 2  | PUT    | `/api/rider/orders/:orderId/accept`         | Accept a delivery → order assigned to this rider      | Rider |
| 3  | PUT    | `/api/rider/orders/:orderId/picked-up`      | Mark order as picked up from restaurant               | Rider |
| 4  | PUT    | `/api/rider/orders/:orderId/delivered`       | Mark order as delivered                               | Rider |
| 5  | PUT    | `/api/rider/toggle-availability`            | Toggle online/offline status                          | Rider |
| 6  | PUT    | `/api/rider/update-location`                | Update current GPS location (for live tracking)       | Rider |
| 7  | GET    | `/api/rider/orders`                         | Get all my delivery history (filter by status)        | Rider |
| 8  | GET    | `/api/rider/earnings`                       | Get earnings summary (today, week, month)             | Rider |

---

## Phase 8 — Ratings & Reviews

> **Build this EIGHTH.** Users rate restaurants and riders after delivery.

### 8.1 Review APIs

| #  | Method | Endpoint                                        | Feature                                              | Auth  |
|----|--------|-------------------------------------------------|------------------------------------------------------|-------|
| 1  | POST   | `/api/reviews/restaurant/:restaurantId`          | Rate & review a restaurant (1-5 stars + review, only if user has a delivered order) | User  |
| 2  | GET    | `/api/reviews/restaurant/:restaurantId`          | Get all reviews for a restaurant (paginated)          | Public |
| 3  | POST   | `/api/reviews/rider/:riderId`                    | Rate a rider after delivery                           | User  |
| 4  | GET    | `/api/reviews/rider/:riderId`                    | Get all reviews for a rider                           | Public |
| 5  | DELETE | `/api/reviews/:reviewId`                         | Delete own review                                     | User  |
| 6  | DELETE | `/api/admin/reviews/:reviewId`                   | Admin delete any review (moderation)                  | Admin |

---

## Phase 9 — Notifications

> **Build this NINTH.** Real-time notifications for all roles.

### 9.1 Notification APIs

| #  | Method | Endpoint                              | Feature                                              | Auth        |
|----|--------|---------------------------------------|------------------------------------------------------|-------------|
| 1  | GET    | `/api/notifications`                   | Get all notifications for logged-in user (any role)   | Any Auth    |
| 2  | PUT    | `/api/notifications/:id/read`          | Mark a notification as read                           | Any Auth    |
| 3  | PUT    | `/api/notifications/read-all`          | Mark all notifications as read                        | Any Auth    |
| 4  | DELETE | `/api/notifications/:id`               | Delete a notification                                 | Any Auth    |

**When notifications are triggered (backend logic, not separate APIs):**

| Event                               | Who gets notified         |
|--------------------------------------|---------------------------|
| New restaurant registration           | Main Admin                |
| Restaurant approved/rejected          | Restaurant Admin          |
| New rider registration                | Main Admin                |
| Rider approved/rejected              | Rider                     |
| New order placed                     | Restaurant Admin          |
| Order accepted by restaurant         | User                      |
| Order ready for pickup              | Rider (nearby available)  |
| Rider picked up order               | User                      |
| Order delivered                      | User, Restaurant Admin    |
| Order cancelled                      | All relevant parties      |
| New review received                  | Restaurant Admin / Rider  |

---

## Phase 10 — Analytics & Dashboard Data

> **Build this LAST.** Dashboard statistics for all roles.

### 10.1 Main Admin Dashboard APIs

| #  | Method | Endpoint                              | Feature                                              | Auth  |
|----|--------|---------------------------------------|------------------------------------------------------|-------|
| 1  | GET    | `/api/admin/dashboard/stats`           | Total users, restaurants, riders, orders, revenue      | Admin |
| 2  | GET    | `/api/admin/dashboard/revenue`         | Revenue over time (daily, weekly, monthly chart data)  | Admin |
| 3  | GET    | `/api/admin/dashboard/recent-orders`   | Latest 10 orders                                      | Admin |
| 4  | GET    | `/api/admin/dashboard/top-restaurants` | Top restaurants by orders/revenue                     | Admin |
| 5  | GET    | `/api/admin/users`                     | List all users (search, paginate)                     | Admin |
| 6  | PUT    | `/api/admin/users/:id/block`           | Block/unblock a user                                  | Admin |

### 10.2 Restaurant Admin Dashboard APIs

| #  | Method | Endpoint                                        | Feature                                              | Auth            |
|----|--------|-------------------------------------------------|------------------------------------------------------|-----------------|
| 1  | GET    | `/api/restaurant-admin/dashboard/stats`          | Today's orders, revenue, pending orders, total items  | RestaurantAdmin |
| 2  | GET    | `/api/restaurant-admin/dashboard/revenue`        | Revenue chart data (daily, weekly, monthly)           | RestaurantAdmin |
| 3  | GET    | `/api/restaurant-admin/dashboard/popular-items`  | Most ordered items                                    | RestaurantAdmin |
| 4  | PUT    | `/api/restaurant-admin/restaurant/toggle-status` | Open/close restaurant temporarily                     | RestaurantAdmin |

### 10.3 Rider Dashboard APIs

| #  | Method | Endpoint                              | Feature                                              | Auth  |
|----|--------|---------------------------------------|------------------------------------------------------|-------|
| 1  | GET    | `/api/rider/dashboard/stats`           | Today's deliveries, earnings, rating                  | Rider |
| 2  | GET    | `/api/rider/dashboard/earnings-chart`  | Earnings chart data (daily, weekly, monthly)          | Rider |

---

## Database Models Summary

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  profileImage: String,
  addresses: [{
    label: String,          // "Home", "Work", "Other"
    fullAddress: String,
    city: String,
    state: String,
    pincode: String,
    lat: Number,
    lng: Number,
    isDefault: Boolean
  }],
  isBlocked: Boolean,
  role: "user",
  createdAt, updatedAt
}
```

### Admin Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "main-admin",
  createdAt, updatedAt
}
```

### RestaurantAdmin Model
```javascript
{
  ownerName: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: "restaurant-admin",
  status: String,           // "pending" | "approved" | "rejected" | "suspended"
  rejectionReason: String,
  restaurant: ObjectId (ref: Restaurant),
  createdAt, updatedAt
}
```

### Restaurant Model
```javascript
{
  name: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  phone: String,
  logo: String,
  images: [String],
  cuisineType: [String],
  openingTime: String,
  closingTime: String,
  isOpen: Boolean,
  deliveryRadius: Number,   // in km
  avgDeliveryTime: Number,  // in minutes
  avgRating: Number,
  totalRatings: Number,
  documents: {
    fssaiLicense: String,
    gstCertificate: String,
    panCard: String
  },
  admin: ObjectId (ref: RestaurantAdmin),
  createdAt, updatedAt
}
```

### MenuItem Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  image: String,
  category: ObjectId (ref: Category),
  restaurant: ObjectId (ref: Restaurant),
  isVeg: Boolean,
  isAvailable: Boolean,
  preparationTime: Number,
  createdAt, updatedAt
}
```

### Category Model
```javascript
{
  name: String,
  restaurant: ObjectId (ref: Restaurant),
  sortOrder: Number,
  createdAt, updatedAt
}
```

### Rider Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  profilePhoto: String,
  vehicleType: String,       // "bike" | "scooter" | "bicycle"
  vehicleNumber: String,
  role: "rider",
  status: String,            // "pending" | "approved" | "rejected" | "suspended"
  rejectionReason: String,
  isAvailable: Boolean,
  currentLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date
  },
  documents: {
    drivingLicense: String,
    aadharCard: String,
    vehicleRC: String
  },
  avgRating: Number,
  totalRatings: Number,
  totalDeliveries: Number,
  totalEarnings: Number,
  createdAt, updatedAt
}
```

### Cart Model
```javascript
{
  user: ObjectId (ref: User),
  restaurant: ObjectId (ref: Restaurant),
  items: [{
    menuItem: ObjectId (ref: MenuItem),
    quantity: Number,
    itemTotal: Number
  }],
  subTotal: Number,
  createdAt, updatedAt
}
```

### Order Model
```javascript
{
  orderNumber: String (unique),
  user: ObjectId (ref: User),
  restaurant: ObjectId (ref: Restaurant),
  rider: ObjectId (ref: Rider),
  items: [{
    menuItem: ObjectId (ref: MenuItem),
    name: String,
    price: Number,
    quantity: Number,
    itemTotal: Number
  }],
  deliveryAddress: {
    fullAddress: String,
    city: String,
    lat: Number,
    lng: Number
  },
  status: String,             // "placed" | "confirmed" | "preparing" | "ready" | "picked_up" | "on_the_way" | "delivered" | "cancelled"
  paymentMethod: String,      // "COD" | "online"
  paymentStatus: String,      // "pending" | "paid" | "refunded"
  subTotal: Number,
  deliveryFee: Number,
  discount: Number,
  tax: Number,
  totalAmount: Number,
  couponCode: String,
  instructions: String,
  cancelReason: String,
  cancelledBy: String,        // "user" | "restaurant" | "admin"
  estimatedDeliveryTime: Number,
  actualDeliveryTime: Date,
  createdAt, updatedAt
}
```

### Review Model
```javascript
{
  user: ObjectId (ref: User),
  order: ObjectId (ref: Order),
  restaurant: ObjectId (ref: Restaurant),  // null if rider review
  rider: ObjectId (ref: Rider),            // null if restaurant review
  rating: Number (1-5),
  review: String,
  type: String,              // "restaurant" | "rider"
  createdAt, updatedAt
}
```

### Coupon Model
```javascript
{
  code: String (unique, uppercase),
  discountType: String,      // "percentage" | "flat"
  discountValue: Number,
  maxDiscount: Number,
  minOrderValue: Number,
  usageLimit: Number,
  usedCount: Number,
  validFrom: Date,
  validUntil: Date,
  isActive: Boolean,
  createdAt, updatedAt
}
```

### Notification Model
```javascript
{
  recipient: ObjectId,
  recipientModel: String,    // "User" | "RestaurantAdmin" | "Rider" | "Admin"
  title: String,
  message: String,
  type: String,              // "order" | "registration" | "review" | "system"
  isRead: Boolean,
  referenceId: ObjectId,
  createdAt
}
```

---

## Middleware Summary

| Middleware             | Purpose                                                |
|------------------------|--------------------------------------------------------|
| `auth.middleware.js`    | Verify JWT token from cookie or `Authorization: Bearer` header |
| `role.middleware.js`    | Check user role: `authorize("main-admin", "restaurant-admin")` |
| `upload.middleware.js`  | Handle file uploads using `multer` (single & multiple files) |
| `validate.middleware.js`| Validate request body using `express-validator` rules   |
| `errorHandler.js`      | Global error handler — catches all thrown errors        |

---

## Error Code Reference

| Status Code | Usage                                             |
|-------------|---------------------------------------------------|
| 200         | Success                                           |
| 201         | Created (new resource)                            |
| 400         | Bad Request (validation failed)                   |
| 401         | Unauthorized (no token / invalid token)           |
| 403         | Forbidden (insufficient role / account not approved) |
| 404         | Not Found                                         |
| 409         | Conflict (duplicate email, etc.)                  |
| 500         | Internal Server Error                             |

**Standard Error Response:**
```json
{
  "success": false,
  "message": "Error description here",
  "errors": [
    { "field": "email", "message": "Email already exists" }
  ]
}
```

**Standard Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## Complete API Count Summary

| Role              | Auth | Dashboard/Other | Total |
|-------------------|------|-----------------|-------|
| Main Admin        | 5    | 22              | **27**|
| Restaurant Admin  | 6    | 14              | **20**|
| Rider             | 6    | 12              | **18**|
| User              | 8    | 18              | **26**|
| Public            | -    | 6               | **6** |
| **Grand Total**   |      |                 | **~97 APIs** |

---

> **Next Steps:** Start building Phase 1 (Foundation + Main Admin Auth). Follow the build order strictly — each phase depends on the previous one.
