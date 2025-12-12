#!/usr/bin/env node

const { testConnection, initializeDatabase } = require("../database/connection")

async function setupDatabase() {
  console.log("🚀 Setting up Store Rating Database...")
  console.log("=".repeat(50))

  try {
    // Test connection first
    const connected = await testConnection()
    if (!connected) {
      console.error("❌ Cannot connect to database. Please check your configuration.")
      process.exit(1)
    }

    // Initialize database
    await initializeDatabase()

    console.log("=".repeat(50))
    console.log("✅ Database setup completed successfully!")
    console.log("")
    console.log("📋 Admin Login Credentials:")
    console.log("   Email: admin@storerating.com")
    console.log("   Password: Admin@123")
    console.log("")
    console.log("📋 Sample Store Owner Login:")
    console.log("   Email: john@coffeeshop.com")
    console.log("   Password: Admin@123")
    console.log("")
    console.log("📋 Sample User Login:")
    console.log("   Email: alice@example.com")
    console.log("   Password: Admin@123")
    console.log("")
    console.log("🚀 You can now start the server with: npm run dev")
  } catch (error) {
    console.error("❌ Database setup failed:", error.message)
    process.exit(1)
  }

  process.exit(0)
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
}

module.exports = { setupDatabase }
