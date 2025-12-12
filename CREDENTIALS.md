# Store Rating System - Login Credentials

## Admin Access
**Email:** `admin@storerating.com`  
**Password:** `Admin@123`  
**Role:** Administrator  
**Permissions:** Full system access, user management, store management

## Sample Store Owners
### Coffee Shop Owner
**Email:** `john@coffeeshop.com`  
**Password:** `Admin@123`  
**Role:** Store Owner  
**Store:** Cozy Coffee Corner

### Electronics Store Owner
**Email:** `sarah@electronics.com`  
**Password:** `Admin@123`  
**Role:** Store Owner  
**Store:** TechWorld Electronics

### Restaurant Owner
**Email:** `mike@restaurant.com`  
**Password:** `Admin@123`  
**Role:** Store Owner  
**Store:** Mama's Italian Kitchen

## Sample Users
### Regular User 1
**Email:** `alice@example.com`  
**Password:** `Admin@123`  
**Role:** User

### Regular User 2
**Email:** `bob@example.com`  
**Password:** `Admin@123`  
**Role:** User

## Password Requirements
- Length: 8-16 characters
- Must contain at least 1 uppercase letter
- Must contain at least 1 special character
- Confirm password must match

## Getting Started
1. Start the Express backend: `cd server && npm run dev`
2. Start the Next.js frontend: `npm run dev`
3. Visit `http://localhost:3000`
4. Use any of the credentials above to test different user roles

## Database Setup
Run the database setup script to initialize with sample data:
\`\`\`bash
cd server
npm run setup-db
\`\`\`

This will create all necessary tables and populate them with the sample data and credentials listed above.
