const mongoose = require("mongoose")
const path = require("path")

// Load .env file from the server directory (parent of database directory)
require("dotenv").config({ path: path.join(__dirname, "..", ".env") })

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/store_rating_db"

async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log("✅ Connected to MongoDB")
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message)
    throw error
  }
}

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message)
})

process.on("SIGINT", async () => {
  console.log("Closing MongoDB connection...")
  await mongoose.connection.close()
  process.exit(0)
})

module.exports = {
  connectDatabase,
  mongoose,
}
