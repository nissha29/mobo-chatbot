# Chatbot Backend API

Full-stack chatbot backend built with Node.js, Express, TypeScript, and MongoDB. Features AI-powered intent detection using Groq AI for natural language understanding.

## Features

- ✅ User Registration & Authentication (JWT)
- ✅ AI-Powered NLP Intent Detection using Groq AI
- ✅ Product Deals Management with Price Range Filtering
- ✅ Order History Tracking with Status and Date Filtering
- ✅ Payment Status Management
- ✅ Smart Query Extraction (price ranges, order filters from natural language)
- ✅ RESTful API with proper error handling
- ✅ Session Management for Chat Conversations

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **AI/NLP**: Groq AI SDK (Llama 3.1 8B Instant)
- **CORS**: Enabled for cross-origin requests

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Variables

Create a `.env` file in the `server` directory:

```env
MONGODB_URI=mongodb://localhost:27017/chatbot
JWT_SECRET=your-secret-key-change-in-production
PORT=8000
BASE_URL=http://localhost:8000
GROQ_API_KEY=your-groq-api-key-here
```

**Note**: Get your Groq API key from [Groq Console](https://console.groq.com/)
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For local MongoDB
mongod
```

Or use MongoDB Atlas cloud database.

### 4. Run the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm run build
npm start
```

Server will start on `http://localhost:8000` (or the port specified in `.env`)

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/register`
Register a new user.

**Request Body**:
```json
{
  "name": "John Doe",
  "phone": "1234567890",
  "address": "123 Main St",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "userId": "...",
      "name": "John Doe",
      "phone": "1234567890",
      "address": "123 Main St",
      "email": "john@example.com"
    },
    "token": "jwt-token-here"
  }
}
```

#### POST `/api/auth/login`
Login with email and password.

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt-token-here"
  }
}
```

#### GET `/api/auth/me`
Get current user information (requires JWT token).

**Headers**:
```
Authorization: Bearer <jwt-token>
```

### Application Routes (`/api/app`)

#### POST `/api/app/chat`
Process chatbot messages and detect intents using AI-powered NLP.

**Request Body**:
```json
{
  "message": "show me deals",
  "sessionId": "optional-session-id"
}
```

**Headers** (Optional for some intents):
```
Authorization: Bearer <jwt-token>
```

**Response**:
```json
{
  "success": true,
  "message": "Here are our latest deals! 🎉\n\n• Product Name - ₹99.99\n  Product description",
  "data": {
    "intent": "DEALS",
    "sessionId": "session_1234567890_abc123",
    "deals": [
      {
        "dealId": "...",
        "title": "Product Name",
        "description": "Product description",
        "price": 99.99,
        "imageURL": "https://example.com/image.jpg"
      }
    ],
    "priceRange": {
      "minPrice": 100,
      "maxPrice": 500
    }
  }
}
```

**Supported Intents**:
- `DEALS`: "show deals", "discounts", "offers", "show me products"
- `ORDERS`: "my orders", "order history", "show my orders"
- `PAYMENT`: "payment status", "pending payment", "check payment"
- `SUPPORT`: "help", "support", "assistance", "I need help"
- `THANKS`: "thanks", "thank you", "appreciate"
- `GREETING`: "hello", "hi", "hey", "good morning"
- `OTHERS`: General messages that don't fit other categories
- `UNKNOWN`: Messages that cannot be classified

#### GET `/api/app/deals`
Get all available deals/products with optional price filtering.

**Query Parameters**:
- `message` (optional): Natural language message to extract price range from (e.g., "deals below 1000", "deals between 500 and 2000")
- `minPrice` (optional): Minimum price filter (number)
- `maxPrice` (optional): Maximum price filter (number)

**Examples**:
- `/api/app/deals` - Get all deals
- `/api/app/deals?minPrice=100&maxPrice=500` - Get deals in price range
- `/api/app/deals?message=deals below 1000` - AI extracts price range from message

**Response**:
```json
{
  "success": true,
  "message": "Here are deals in the price range ₹100 - ₹500! 🎉\n\n• Product Name - ₹99.99\n  Product description",
  "data": {
    "deals": [
      {
        "dealId": "...",
        "title": "Product Name",
        "description": "Product description",
        "price": 99.99,
        "imageURL": "https://example.com/image.jpg"
      }
    ],
    "priceRange": {
      "minPrice": 100,
      "maxPrice": 500
    }
  }
}
```

**Note**: The API can extract price ranges from natural language using AI. Examples:
- "deals below 1000" → maxPrice: 1000
- "deals above 500" → minPrice: 500
- "deals between 500 and 2000" → minPrice: 500, maxPrice: 2000

#### GET `/api/app/orders`
Get user's order history with optional filtering (requires JWT token).

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Query Parameters**:
- `message` (optional): Natural language message to extract filters from (e.g., "pending orders this month", "recent order", "shipped orders")
- `status` (optional): Filter by status - "pending", "confirmed", "shipped", "delivered", "cancelled"
- `startDate` (optional): Filter orders from this date (YYYY-MM-DD format)
- `endDate` (optional): Filter orders until this date (YYYY-MM-DD format)

**Examples**:
- `/api/app/orders` - Get all orders
- `/api/app/orders?status=pending` - Get pending orders
- `/api/app/orders?message=pending orders this month` - AI extracts filters from message
- `/api/app/orders?message=recent order` - Get most recent order only

**Response**:
```json
{
  "success": true,
  "message": "Here are your pending orders from this month:\n\n• Product Name - Status: pending\n Date: 1/15/2024",
  "data": {
    "orders": [
      {
        "orderId": "...",
        "userId": "...",
        "productName": "Product Name",
        "imageURL": "https://example.com/image.jpg",
        "status": "pending",
        "createdAt": "2024-01-15T00:00:00.000Z"
      }
    ],
    "orderFilters": {
      "status": "pending",
      "thisMonthOnly": true
    },
    "recentOnly": false
  }
}
```

**Note**: The API can extract order filters from natural language using AI. Examples:
- "pending orders" → status: pending
- "this month orders" → filters by current month
- "recent order" → returns only the most recent order
- "pending orders this month" → combines status and date filters

#### GET `/api/app/payments`
Get user's payment status (requires JWT token).

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Response**:
```json
{
  "success": true,
  "message": "Here are all your payment statuses:\n\n1. Amount Paid: $50.00\n  Pending Amount: $49.99\n  Status: pending\n  Order: Product Name",
  "data": [
    {
      "paymentId": "...",
      "orderId": "...",
      "orderDetails": {
        "productName": "Product Name",
        "imageURL": "https://example.com/image.jpg",
        "status": "pending"
      },
      "amountPaid": 50.00,
      "pendingAmount": 49.99,
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Note**: Payment status is automatically calculated - "pending" if `pendingAmount > 0`, otherwise "completed".

## Database Schema

### Users
- `userId` (ObjectId)
- `name` (String)
- `phone` (String, unique)
- `address` (String)
- `email` (String, unique)
- `password` (String, hashed)

### Deals
- `dealId` (ObjectId)
- `title` (String)
- `description` (String)
- `price` (Number)
- `imageURL` (String)

### Orders
- `orderId` (ObjectId)
- `userId` (ObjectId, ref: User)
- `productName` (String)
- `imageURL` (String)
- `status` (Enum: pending, confirmed, shipped, delivered, cancelled)

### Payments
- `paymentId` (ObjectId)
- `userId` (ObjectId, ref: User)
- `orderId` (ObjectId, ref: Order)
- `amountPaid` (Number)
- `pendingAmount` (Number)

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── db.config.ts          # MongoDB connection configuration
│   ├── middleware/
│   │   └── auth.middleware.ts    # JWT authentication middleware
│   ├── models/
│   │   └── index.ts              # Mongoose schemas and models (User, Deal, Order, Payment)
│   ├── routes/
│   │   ├── auth.route.ts         # Authentication routes (register, login, me)
│   │   └── app.route.ts          # Application routes (chat, deals, orders, payments)
│   ├── services/
│   │   ├── nlp.service.ts        # AI-powered intent detection using Groq
│   │   └── chatbotActions.ts     # Business logic for deals, orders, payments, and query extraction
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   └── index.ts                  # Main server file (Express app setup)
├── .env.example                   # Environment variables template
├── package.json
├── tsconfig.json
└── Readme.md
```

## Testing the API

You can test the API using tools like:
- **Postman**
- **curl**
- **Thunder Client** (VS Code extension)

### Example: Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "1234567890",
    "address": "123 Main St",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Example: Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Example: Get Deals

```bash
# Get all deals
curl http://localhost:8000/api/app/deals

# Get deals with price filter
curl "http://localhost:8000/api/app/deals?minPrice=100&maxPrice=500"

# Get deals using natural language (requires authentication)
curl -X GET "http://localhost:8000/api/app/deals?message=deals%20below%201000" \
  -H "Authorization: Bearer <your-token>"
```

### Example: Chat with Bot

```bash
# Basic chat (some intents require authentication)
curl -X POST http://localhost:8000/api/app/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "message": "show me deals below 1000"
  }'
```

### Example: Get Orders

```bash
# Get all orders (requires authentication)
curl http://localhost:8000/api/app/orders \
  -H "Authorization: Bearer <your-token>"

# Get orders with filters
curl "http://localhost:8000/api/app/orders?status=pending&message=pending%20orders%20this%20month" \
  -H "Authorization: Bearer <your-token>"
```

## Key Features & Implementation Details

### AI-Powered Intent Detection
- Uses Groq AI (Llama 3.1 8B Instant) for natural language understanding
- Detects user intents: DEALS, ORDERS, PAYMENT, SUPPORT, THANKS, GREETING, OTHERS, UNKNOWN
- Prioritizes action intents over greetings when both are present

### Smart Query Extraction
- **Price Range Extraction**: Automatically extracts min/max prices from natural language
  - Examples: "deals below 1000" → maxPrice: 1000
  - "deals above 500" → minPrice: 500
  - "deals between 500 and 2000" → minPrice: 500, maxPrice: 2000

- **Order Filter Extraction**: Extracts status, date range, and recent flags
  - Examples: "pending orders this month" → status: pending, thisMonthOnly: true
  - "recent order" → recentOnly: true

### Session Management
- Chat endpoint supports optional `sessionId` for conversation tracking
- Automatically generates session IDs if not provided

### Authentication
- All `/api/app/*` routes require JWT authentication (except `/api/app/deals` GET without filters)
- `/api/auth/*` routes are public
- JWT tokens expire after 7 days

## Notes

- All passwords are hashed using bcryptjs before storage
- JWT tokens expire after 7 days
- Phone numbers and emails must be unique
- Protected routes require JWT token in Authorization header
- All API responses follow a consistent format with `success`, `message`, and `data` fields
- The server uses CORS to allow cross-origin requests
- Default port is 8000 (configurable via `PORT` environment variable)
- BASE_URL is used for internal API calls (defaults to `http://localhost:4000` if not set)

## Next Steps

1. Install dependencies: `npm install`
2. Set up `.env` file with MongoDB connection string and Groq API key
3. Start MongoDB service
4. Run the server: `npm run dev`
5. Test endpoints using Postman or curl
6. Integrate with frontend client application

