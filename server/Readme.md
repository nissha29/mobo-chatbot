# Chatbot Backend API

Full-stack chatbot backend built with Node.js, Express, TypeScript, and MongoDB.

## Features

- ✅ User Registration & Authentication (JWT)
- ✅ NLP Intent Detection (Deals, Orders, Payment, Register)
- ✅ Product Deals Management
- ✅ Order History Tracking
- ✅ Payment Status Management
- ✅ RESTful API with proper error handling

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

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
PORT=3000
GEMINI_API_KEY=your-gemini-api-key-here
```

**Note**: Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

**Note**: For MongoDB Atlas, use:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatbot
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

Server will start on `http://localhost:3000`

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
Login with phone number (and optional password).

**Request Body**:
```json
{
  "phone": "1234567890",
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
Process chatbot messages and detect intents.

**Request Body**:
```json
{
  "message": "show me deals"
}
```

**Response**:
```json
{
  "success": true,
  "message": "I'll show you the latest deals!",
  "data": {
    "intent": "DEALS",
    "response": "I'll show you the latest deals!"
  }
}
```

**Supported Intents**:
- `DEALS`: "show deals", "discounts", "offers"
- `ORDERS`: "my orders", "order history"
- `PAYMENT`: "payment status", "pending payment"
- `REGISTER`: "register", "new user"
- `GREETING`: "hello", "hi", "hey"

#### GET `/api/app/deals`
Get all available deals/products.

**Response**:
```json
{
  "success": true,
  "message": "Deals retrieved successfully",
  "data": [
    {
      "dealId": "...",
      "title": "Product Name",
      "description": "Product description",
      "price": 99.99,
      "imageURL": "https://example.com/image.jpg"
    }
  ]
}
```

#### POST `/api/app/deals`
Create a new deal (Admin function).

**Request Body**:
```json
{
  "title": "Amazing Product",
  "description": "This is an amazing product",
  "price": 99.99,
  "imageURL": "https://example.com/image.jpg"
}
```

#### GET `/api/app/orders`
Get user's order history (requires JWT token).

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Response**:
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": [
    {
      "orderId": "...",
      "userId": "...",
      "productName": "Product Name",
      "imageURL": "https://example.com/image.jpg",
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

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
  "message": "Payment status retrieved successfully",
  "data": [
    {
      "paymentId": "...",
      "orderId": "...",
      "orderDetails": { ... },
      "amountPaid": 50.00,
      "pendingAmount": 49.99,
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

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
├── config/
│   └── db.ts              # MongoDB connection
├── middleware/
│   └── auth.middleware.ts # JWT authentication middleware
├── models/
│   └── index.ts           # Mongoose schemas and models
├── routes/
│   ├── auth.route.ts      # Authentication routes
│   └── app.route.ts       # Application routes
├── services/
│   └── nlp.service.ts     # NLP intent detection
├── types/
│   └── index.ts           # TypeScript type definitions
├── index.ts               # Main server file
├── package.json
└── tsconfig.json
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
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "1234567890",
    "password": "password123"
  }'
```

### Example: Get Deals

```bash
curl http://localhost:3000/api/app/deals
```

### Example: Chat with Bot

```bash
curl -X POST http://localhost:3000/api/app/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "show me deals"
  }'
```

## Notes

- All passwords are hashed using bcryptjs before storage
- JWT tokens expire after 7 days
- Phone numbers and emails must be unique
- Protected routes require JWT token in Authorization header
- All API responses follow a consistent format with `success`, `message`, and `data` fields

## Next Steps

1. Install dependencies: `npm install`
2. Set up `.env` file with MongoDB connection string
3. Start MongoDB service
4. Run the server: `npm run dev`
5. Test endpoints using Postman or curl

