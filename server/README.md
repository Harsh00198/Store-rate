# Store Rating System Backend

A robust Express.js backend with MySQL database for the Store Rating System.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Support for users, store owners, and administrators
- **Store Management**: CRUD operations for stores with search and filtering
- **Rating System**: Users can rate and review stores
- **Admin Panel**: Administrative functions for managing users and stores
- **Security**: Password hashing, input validation, and SQL injection protection

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   \`\`\`bash
   cd server
   npm install
   \`\`\`

2. **Configure environment:**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your database credentials
   \`\`\`

3. **Setup database:**
   \`\`\`bash
   npm run setup-db
   \`\`\`

4. **Start development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

### Default Credentials

After running the database setup, you can use these credentials:

**Administrator:**
- Email: `admin@storerating.com`
- Password: `Admin@123`

**Store Owner:**
- Email: `john@coffeeshop.com`
- Password: `Admin@123`

**Regular User:**
- Email: `alice@example.com`
- Password: `Admin@123`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Stores
- `GET /api/stores` - Get all stores (with search/filter)
- `GET /api/stores/:id` - Get store details
- `POST /api/stores` - Create new store (authenticated)

### Ratings
- `POST /api/ratings` - Submit store rating (authenticated)

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `DELETE /api/admin/stores/:id` - Delete store (admin only)

## Database Schema

### Users Table
- `id` - Primary key
- `name` - User full name (20-60 chars)
- `email` - Unique email address
- `password` - Hashed password (8-16 chars, 1 uppercase, 1 special)
- `address` - User address (max 400 chars)
- `role` - user/store_owner/admin

### Stores Table
- `id` - Primary key
- `name` - Store name
- `description` - Store description
- `address` - Store address
- `category` - Store category
- `owner_id` - Foreign key to users table

### Ratings Table
- `id` - Primary key
- `user_id` - Foreign key to users table
- `store_id` - Foreign key to stores table
- `rating` - Rating value (1-5)
- `review` - Optional review text

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run setup-db` - Initialize database schema and seed data

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based authorization
- Input validation and sanitization
- SQL injection protection
- CORS configuration
- Rate limiting (recommended for production)

## Environment Variables

\`\`\`env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=store_rating_db
JWT_SECRET=your_jwt_secret
PORT=5000
FRONTEND_URL=http://localhost:3000
