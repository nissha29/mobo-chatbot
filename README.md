# Chatbot Application

A full-stack intelligent chatbot application built with Next.js (frontend) and Node.js/Express (backend), featuring AI-powered natural language understanding for e-commerce interactions.

## 🚀 Overview

The chatbot uses **Groq AI** (Llama 3.1 8B Instant) for intent detection and natural language processing, making it capable of understanding complex user queries and extracting relevant information.

## 📁 Project Structure

```
chatbot/
├── client/                 # Next.js Frontend Application
│   ├── app/               # Next.js App Router pages
│   │   ├── chat/         # Chat interface page
│   │   ├── login/        # Login page
│   │   ├── register/     # Registration page
│   │   └── page.tsx      # Home page
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── DealCard.tsx
│   │   │   ├── OrderCard.tsx
│   │   │   ├── PaymentCard.tsx
│   │   │   └── FormInput.tsx
│   │   └── lib/
│   │       └── api.ts    # API client functions
│   ├── package.json
│   └── README.md
│
├── server/                # Express Backend API
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   │   └── db.config.ts
│   │   ├── middleware/   # Express middleware
│   │   │   └── auth.middleware.ts
│   │   ├── models/       # Mongoose models
│   │   │   └── index.ts
│   │   ├── routes/       # API routes
│   │   │   ├── auth.route.ts
│   │   │   └── app.route.ts
│   │   ├── services/     # Business logic
│   │   │   ├── nlp.service.ts
│   │   │   └── chatbotActions.ts
│   │   ├── types/        # TypeScript types
│   │   │   └── index.ts
│   │   └── index.ts      # Server entry point
│   ├── package.json
│   └── Readme.md
│
└── README.md             # This file
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **AI/NLP**: Groq AI SDK (Llama 3.1 8B Instant)

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Groq API key ([Get one here](https://console.groq.com/))
- npm or yarn package manager

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Set up the Backend**:
   ```bash
   cd server
   npm install
   ```

3. **Set up the Frontend**:
   ```bash
   cd ../client
   npm install
   ```

### Configuration

#### Backend Environment Variables

Create a `.env` file in the `server` directory:

```env
MONGODB_URI=mongodb://localhost:27017/chatbot
JWT_SECRET=your-secret-key-change-in-production
PORT=8000
BASE_URL=http://localhost:8000
GROQ_API_KEY=your-groq-api-key-here
```

#### Frontend Configuration

Update the API base URL in `client/src/lib/api.ts` if your backend runs on a different port or domain.

### Running the Application

1. **Start MongoDB** (if using local MongoDB):
   ```bash
   mongod
   ```

2. **Start the Backend Server**:
   ```bash
   cd server
   npm run dev
   ```
   The backend will run on `http://localhost:8000` (or the port specified in `.env`)

3. **Start the Frontend Development Server**:
   ```bash
   cd client
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

4. **Open your browser** and navigate to `http://localhost:3000`

## 📚 Features

### 🤖 AI-Powered Chatbot
- Natural language intent detection using Groq AI
- Supports multiple intents: DEALS, ORDERS, PAYMENT, SUPPORT, THANKS, GREETING, OTHERS
- Smart query extraction from conversational messages
- Session management for multi-turn conversations

### 🛍️ Product Deals
- Browse all available deals/products
- Price range filtering (natural language or query parameters)
- Examples:
  - "show me deals below 1000"
  - "deals between 500 and 2000"
  - "deals above 500"

### 📦 Order Management
- View order history
- Filter by status (pending, confirmed, shipped, delivered, cancelled)
- Get most recent order
- Examples:
  - "show my orders"
  - "pending orders this month"
  - "recent order"

### 💳 Payment Tracking
- View payment status for all orders

### 🔐 Authentication
- User registration with email, phone, name, and address
- Secure login with JWT tokens
- Protected API routes
- User profile management

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info (protected)

### Application (`/api/app`)
- `POST /api/app/chat` - Process chatbot messages
- `GET /api/app/deals` - Get deals with optional price filtering
- `GET /api/app/orders` - Get user orders with filtering
- `GET /api/app/payments` - Get payment status

For detailed API documentation, see [server/Readme.md](./server/Readme.md)

## 🗄️ Database Schema

### Users
- `userId` (ObjectId)
- `name` (String)
- `phone` (String, unique)
- `address` (String)
- `email` (String, unique)
- `password` (String, hashed)
- `createdAt`, `updatedAt` (Date)

### Deals
- `dealId` (ObjectId)
- `title` (String)
- `description` (String)
- `price` (Number)
- `imageURL` (String)
- `createdAt`, `updatedAt` (Date)

### Orders
- `orderId` (ObjectId)
- `userId` (ObjectId, ref: User)
- `productName` (String)
- `imageURL` (String)
- `status` (Enum: pending, confirmed, shipped, delivered, cancelled)
- `createdAt`, `updatedAt` (Date)

### Payments
- `paymentId` (ObjectId)
- `orderId` (ObjectId, ref: Order)
- `amountPaid` (Number)
- `pendingAmount` (Number)
- `createdAt`, `updatedAt` (Date)

## 🧪 Testing

### Backend API Testing

You can test the API using:
- **Postman**
- **curl** commands
- **Thunder Client** (VS Code extension)

Example curl commands are provided in [server/Readme.md](./server/Readme.md)

### Frontend Testing

The frontend can be tested by:
1. Registering a new user
2. Logging in
3. Using the chat interface to interact with the chatbot
4. Testing different intents and queries

## 🚀 Production Deployment

### Backend
```bash
cd server
npm run build
npm start
```

### Frontend
```bash
cd client
npm run build
npm start
```

**Important Notes for Production**:
- Change `JWT_SECRET` to a strong, random secret
- Use MongoDB Atlas or a managed MongoDB service
- Set appropriate CORS origins
- Use environment variables for all sensitive data
- Enable HTTPS
- Set up proper error logging and monitoring

## 📝 Development Scripts

### Backend (`server/`)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

### Frontend (`client/`)
- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Protected API routes
- Input validation
- CORS configuration
- Environment variable management


## 🆘 Troubleshooting

### Backend Issues
- **MongoDB Connection Error**: Ensure MongoDB is running and the connection string is correct
- **Groq API Errors**: Verify your API key is valid and has sufficient credits
- **Port Already in Use**: Change the `PORT` in `.env` file

### Frontend Issues
- **API Connection Errors**: Check that the backend is running and the API URL is correct
- **Build Errors**: Ensure all dependencies are installed with `npm install`

## 📞 Support

For issues or questions:
1. Check the documentation in `server/Readme.md` and `client/README.md`
2. Review the API endpoint documentation
3. Check environment variable configuration

---

**Built with ❤️ using Next.js, Express, TypeScript, MongoDB, and Groq AI**
