# SHOPEZ - Technical Documentation Manual

Welcome to the official technical documentation for **SHOPEZ**, a modern, full-stack MERN (MongoDB, Express, React, Node) e-commerce storefront. This manual describes the system's architecture, database models, REST API design, state-management frameworks, and local-testing fallback configurations.

---

## 1. Architecture Overview

SHOPEZ is built on a decoupled, client-server architecture model. The client acts as a single-page application (SPA), while the server operates as an API endpoint driver.

```mermaid
graph TD
    subgraph Client Tier (SPA)
        Vite[Vite React Client]
        AuthCtx[Auth Context Provider]
        CartCtx[Cart Context Provider]
        AxiosClient[Axios API Client]
    end

    subgraph Server Tier (API)
        Server[Express Node Server]
        AuthMW[Auth Middleware]
        UploadMW[Multer Middleware]
        Controllers[API Controllers]
    end

    subgraph Database & Cloud Service Tier
        MDB[(MongoDB Database)]
        Cloud[Cloudinary CDN]
        Razorpay[Razorpay Gateway]
        SMTP[Nodemailer SMTP]
    end

    %% Client communication
    Vite --> AuthCtx
    Vite --> CartCtx
    AuthCtx --> AxiosClient
    CartCtx --> AxiosClient
    AxiosClient -->|HTTPS / JSON| Server

    %% Server execution
    Server --> AuthMW
    Server --> UploadMW
    AuthMW --> Controllers
    UploadMW --> Controllers

    %% External connections
    Controllers -->|Mongoose ODM| MDB
    Controllers -->|Mock/Live API| Cloud
    Controllers -->|Mock/Live API| Razorpay
    Controllers -->|Mock/Live API| SMTP
```

---

## 2. Technical Stack & Dependencies

### Frontend (Client)
* **Framework**: React 19.x (Scaffolded with Vite 5.x)
* **Routing**: React Router 7.x (Declarative path mapping)
* **Global State**: React Context API (AuthContext, CartContext)
* **API Client**: Axios (configured with automated request token injectors)
* **Styling**: Bootstrap 5.x (Component structure) + Custom index.css (Dark-theme design system, glassmorphism overlays, and transition animations)
* **Icons**: Bootstrap Icons

### Backend (Server)
* **Platform**: Node.js
* **Framework**: Express.js
* **ODM**: Mongoose (MongoDB Object Modeling)
* **Encryption & Auth**: bcryptjs (password hashing) + jsonwebtoken (JWT validation)
* **File Upload**: Multer (parsing multipart form data)

### Cloud Integrations & Mocking Adaptors
* **Storage**: Cloudinary SDK (with local public file filesystem storage fallback)
* **Payments**: Razorpay SDK (with local HTML overlay transaction simulator fallback)
* **Notifications**: Nodemailer SMTP (with console-based mock logging output fallback)

---

## 3. Database Schema Models

SHOPEZ uses Mongoose models to declare structures in MongoDB.

### 3.1 User Model (`User`)
Represents users, credentials, and customer preferences.
* `name` (String, required): Full name of the user.
* `email` (String, required, unique): Validated email address.
* `password` (String, required): Bcrypt hashed string.
* `role` (String, enum: `['user', 'admin']`, default: `'user'`): Access privileges control.
* `wishlist` (Array of ObjectIds referencing `Product`): Bookmarked items.

### 3.2 Product Model (`Product`)
Catalog products and customer reviews.
* `name` (String, required): Display title of product.
* `description` (String, required): Marketing descriptions.
* `price` (Number, required): Pricing in Rupees (₹).
* `category` (String, required): Inventory tag (e.g., Electronics, Footwear).
* `image` (String, required): CDN URL or local upload file path.
* `stock` (Number, required): In-stock count.
* `reviews` (Array of Review Subdocuments):
  * `userId` (ObjectId, ref: `User`, required)
  * `name` (String, required)
  * `rating` (Number, 1-5, required)
  * `comment` (String, required)
  * `date` (Date, default: Date.now)

### 3.3 Cart Model (`Cart`)
Stores active carts.
* `userId` (ObjectId, ref: `User`, required, unique): Cart owner.
* `products` (Array of items):
  * `productId` (ObjectId, ref: `Product`, required)
  * `quantity` (Number, required, minimum: 1)

### 3.4 Order Model (`Order`)
Completed order receipts and tracking parameters.
* `userId` (ObjectId, ref: `User`, required): Buyer reference.
* `products` (Array of purchased items):
  * `productId` (ObjectId, ref: `Product`, required)
  * `quantity` (Number, required)
  * `price` (Number, required): Purchase price lock.
* `totalAmount` (Number, required): Net billing amount.
* `status` (String, enum: `['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled']`, default: `'Pending'`)
* `paymentDetails`:
  * `paymentId` (String): Gateway transaction reference.
  * `orderId` (String): Gateway order reference.
  * `signature` (String): Cryptographic signature verification string.
* `shippingAddress`:
  * `address` (String, required)
  * `city` (String, required)
  * `postalCode` (String, required)
  * `phone` (String, required)
* `orderDate` (Date, default: Date.now)

---

## 4. REST API Documentation

All routes are prefixed by `/api`. Protected routes require a JWT token passed as a `Bearer <token>` in the `Authorization` header.

### 4.1 Authentication Module (`/api/auth`)
| Method | Endpoint | Access | Request Body | Description |
| :---: | :--- | :---: | :--- | :--- |
| **POST** | `/register` | Public | `{ name, email, password }` | Creates a user, triggers a welcome email, returns profile data + JWT. |
| **POST** | `/login` | Public | `{ email, password }` | Authenticates email/password, returns profile data + JWT. |
| **GET** | `/me` | Protected | None | Returns profile and wishlist data of logged-in user. |
| **PUT** | `/profile` | Protected | `{ name, email, password }` | Updates profile settings, returns updated details + new token. |

### 4.2 Products Module (`/api/products`)
| Method | Endpoint | Access | Request Body | Description |
| :---: | :--- | :---: | :--- | :--- |
| **GET** | `/` | Public | Query Params: `keyword`, `category`, `minPrice`, `maxPrice`, `sortBy` | Retrieves products list based on filters. |
| **GET** | `/:id` | Public | None | Retrieves individual product details and reviews. |
| **POST** | `/:id/review` | Protected | `{ rating, comment }` | Adds a review subdocument if the user hasn't reviewed it yet. |
| **POST** | `/` | Admin | Form-data (fields + `image` file) or `{ name, description, price, category, stock, image }` | Creates a new catalog item. |
| **PUT** | `/:id` | Admin | Form-data (fields + `image` file) or `{ name, description, price, category, stock, image }` | Updates an existing catalog item. |
| **DELETE** | `/:id` | Admin | None | Deletes a catalog item. |

### 4.3 Shopping Cart Module (`/api/cart`)
| Method | Endpoint | Access | Request Body | Description |
| :---: | :--- | :---: | :--- | :--- |
| **GET** | `/` | Protected | None | Returns active user's cart (creates one if empty). |
| **POST** | `/add` | Protected | `{ productId, quantity }` | Appends/increments items in cart. |
| **PUT** | `/update` | Protected | `{ productId, quantity }` | Explicitly overrides product quantity. |
| **DELETE** | `/:productId` | Protected | None | Removes a single item from the cart. |
| **DELETE** | `/` | Protected | None | Clears the entire cart products list. |

### 4.4 Orders Module (`/api/orders`)
| Method | Endpoint | Access | Request Body | Description |
| :---: | :--- | :--- | :--- | :--- |
| **POST** | `/` | Protected | `{ products, shippingAddress }` | Checks stock, calculates total, initiates Razorpay/mock order, saves order record. |
| **POST** | `/verify` | Protected | `{ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }` | Verifies signature, updates status to `Paid`, updates stock levels, clears cart, sends order receipt email. |
| **GET** | `/my-orders` | Protected | None | Returns active user's order history. |
| **GET** | `/all` | Admin | None | Returns all orders on the platform. |
| **PUT** | `/:id/status` | Admin | `{ status }` | Updates order status (triggers notification email to customer). |

### 4.5 User & Analytics Module (`/api/users`)
| Method | Endpoint | Access | Request Body | Description |
| :---: | :--- | :---: | :--- | :--- |
| **POST** | `/wishlist/:productId` | Protected | None | Toggles a product in/out of user's wishlist array. |
| **GET** | `/wishlist` | Protected | None | Retrieves user's populated wishlist items. |
| **GET** | `/` | Admin | None | Retrieves lists of all users (excluding passwords). |
| **DELETE** | `/:id` | Admin | None | Deletes a user account (admin accounts blocked from deletion). |
| **GET** | `/admin/stats` | Admin | None | Aggregates revenue, totals, category-sales, and recent order stats. |

---

## 5. Mock & Integration Fallback Mechanics

To make installation and local validation easy, the backend server automatically runs in a simulation mode if live API keys are not provided in the `.env` file.

### 5.1 Cloudinary / File Upload Fallback
* **Live Mode**: If `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are present, uploaded product images are sent to Cloudinary CDN, and CDN URLs are saved.
* **Mock Fallback**: If keys are missing, the server moves the file to public uploads directory and returns a local relative path (e.g. `/uploads/image-12345.jpg`).

### 5.2 Razorpay Payment Fallback
* **Live Mode**: If `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are provided, the server initializes the actual Razorpay order, and the client displays the official Razorpay Checkout SDK portal.
* **Mock Fallback**: If keys are missing, the server generates a simulated payment order object (`mock: true`). The frontend detects this and opens an interactive **Simulator Overlay Modal**, where clicking "Simulate Successful Payment" automatically signs a mock signature and confirms the order.

### 5.3 Nodemailer Email Fallback
* **Live Mode**: If SMTP host configurations are active, transaction receipts and welcome emails are dispatched to the customer's inbox.
* **Mock Fallback**: If SMTP parameters are missing, emails are printed directly into the server console log window for inspection and verification.

---

## 6. Frontend State Design

The frontend React client uses global React Context providers to manage application state.

### 6.1 Authentication Context (`AuthContext`)
* **State**: `user` (details + JWT), `loading` (session validation spinner check).
* **Methods**:
  * `login(email, password)`: Logs in, writes user info to local storage.
  * `register(name, email, password)`: Registers a user, logs in immediately.
  * `logout()`: Clears memory variables and local storage profiles.
  * `updateProfile(name, email, password)`: Updates settings and merges new data.
  * `toggleWishlist(productId)`: Calls the wishlist toggle API and updates the local state.
  * `refreshUser()`: Syncs user data from the backend.

### 6.2 Cart Context (`CartContext`)
* **State**: `cartItems` (array of products + quantity), `loading` (spinner check).
* **Methods**:
  * `addToCart(productId, quantity)`: Appends an item.
  * `updateQuantity(productId, quantity)`: Updates product quantities in real-time.
  * `removeFromCart(productId)`: Removes a product from the shopping cart.
  * `clearCart()`: Empties the cart.
  * `getCartCount()`: Evaluates item quantities total.
  * `getCartTotal()`: Aggregates subtotal costs.

---

## 7. Troubleshooting & Setup

### Database Connection Fails
* Ensure your local MongoDB Service is running (run `net start MongoDB` or check Services manager).
* Verify port `27017` is listening.

### Port Conflicts
* Node.js backend listens on port `5000` by default. If port `5000` is occupied, change the `PORT` variable in the backend environment variables configuration and update the `baseURL` inside Axios API client file to match.
