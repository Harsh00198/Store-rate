const express = require("express")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const path = require("path")
const fs = require("fs")
const multer = require("multer")
const { connectDatabase, mongoose } = require("./database/connection")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000
const AGENT_LOG_PATH = path.join(__dirname, "..", ".cursor", "debug.log")

const ensureAgentLogDir = () => {
  try {
    fs.mkdirSync(path.dirname(AGENT_LOG_PATH), { recursive: true })
  } catch (_) {
    /* ignore */
  }
}

const appendAgentLog = (payload) => {
  try {
    ensureAgentLogDir()
    fs.appendFile(AGENT_LOG_PATH, `${JSON.stringify(payload)}\n`, () => {})
  } catch (_) {
    /* ignore */
  }
}

// Models
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    address: { type: String },
    role: {
      type: String,
      enum: ["user", "store_owner", "admin"],
      default: "user",
    },
  },
  { timestamps: true },
)

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    category: { type: String },
    phone: { type: String },
    website: { type: String },
    image_url: { type: String },
    // Location for map-based search
    latitude: { type: Number },
    longitude: { type: Number },
    city: { type: String },
    zipCode: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },
  },
  { timestamps: true },
)

const ratingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String },
    // Multi-dimensional ratings
    ratings: {
      service: { type: Number, min: 1, max: 5 },
      quality: { type: Number, min: 1, max: 5 },
      value: { type: Number, min: 1, max: 5 },
      ambiance: { type: Number, min: 1, max: 5 },
    },
    // Photo support
    photos: [{ type: String }], // URLs to uploaded photos
    // Moderation and verification
    verified: { type: Boolean, default: false },
    flagged: { type: Boolean, default: false },
    flaggedReason: { type: String },
    helpfulCount: { type: Number, default: 0 },
    // AI-generated summary tags
    tags: [{ type: String }],
    sentiment: { type: String, enum: ["positive", "neutral", "negative"] },
  },
  { timestamps: true },
)

userSchema.index({ email: 1 }, { unique: true })
ratingSchema.index({ user: 1, store: 1 }, { unique: true })

const toJsonWithId = (_, ret) => {
  ret.id = ret._id.toString()
  delete ret._id
  delete ret.__v
  return ret
}

userSchema.set("toJSON", { versionKey: false, transform: toJsonWithId })
storeSchema.set("toJSON", { versionKey: false, transform: toJsonWithId })
ratingSchema.set("toJSON", { versionKey: false, transform: toJsonWithId })

const User = mongoose.model("User", userSchema)
const Store = mongoose.model("Store", storeSchema)
const Rating = mongoose.model("Rating", ratingSchema)

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Basic request trace to ensure logging file is created and requests are visible
app.use((req, res, next) => {
  appendAgentLog({
    sessionId: "debug-session",
    runId: "run2",
    hypothesisId: "H0",
    location: "server/server.js:request-middleware",
    message: "Incoming request",
    data: { path: req.path || "", method: req.method },
    timestamp: Date.now(),
  })
  next()
})

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads", "reviews")
    fs.mkdirSync(uploadDir, { recursive: true })
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, `review-${uniqueSuffix}${path.extname(file.originalname)}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    if (extname && mimetype) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"))
    }
  },
})

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    // #region agent log
    ;(typeof fetch !== "undefined"
      ? fetch("http://127.0.0.1:7242/ingest/6f5e7aa0-266f-4e9d-96f2-a539e0be835d", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "H2",
            location: "server/server.js:authenticateToken",
            message: "Missing bearer token",
            data: { path: req.path || "", method: req.method },
            timestamp: Date.now(),
          }),
        })
      : Promise.resolve()
    ).catch(() => {})
    // #endregion
    return res.status(401).json({ error: "Access token required" })
  }

  jwt.verify(token, process.env.JWT_SECRET || "your-secret-key", (err, user) => {
    if (err) {
      // #region agent log
      ;(typeof fetch !== "undefined"
        ? fetch("http://127.0.0.1:7242/ingest/6f5e7aa0-266f-4e9d-96f2-a539e0be835d", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: "debug-session",
              runId: "run1",
              hypothesisId: "H2",
              location: "server/server.js:authenticateToken",
              message: "JWT verification failed",
              data: { path: req.path || "", method: req.method, error: err.message },
              timestamp: Date.now(),
            }),
          })
        : Promise.resolve()
      ).catch(() => {})
      // #endregion
      return res.status(403).json({ error: "Invalid token" })
    }
    req.user = user
    // #region agent log
    ;(typeof fetch !== "undefined"
      ? fetch("http://127.0.0.1:7242/ingest/6f5e7aa0-266f-4e9d-96f2-a539e0be835d", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "H2",
            location: "server/server.js:authenticateToken",
            message: "JWT verified",
            data: { userId: user.id, role: user.role, path: req.path || "" },
            timestamp: Date.now(),
          }),
        })
      : Promise.resolve()
    ).catch(() => {})
    // #endregion
    next()
  })
}

// Role-based authorization middleware
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" })
    }
    next()
  }
}

// Helpers
const sanitizeObjectId = (id) => mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id)
const allowedStoreSortFields = new Set(["name", "createdAt", "average_rating", "total_ratings"])

// AI Review Summarization Helper
const analyzeReview = (reviewText) => {
  if (!reviewText || reviewText.trim().length === 0) {
    return { tags: [], sentiment: "neutral" }
  }

  const text = reviewText.toLowerCase()
  const tags = []
  const positiveWords = ["great", "excellent", "amazing", "wonderful", "fantastic", "love", "best", "perfect", "good", "awesome", "outstanding", "superb"]
  const negativeWords = ["bad", "terrible", "awful", "horrible", "worst", "disappointed", "poor", "slow", "rude", "dirty", "overpriced"]
  const serviceWords = ["service", "staff", "employee", "waiter", "cashier", "helpful", "friendly", "professional"]
  const qualityWords = ["quality", "fresh", "tasty", "delicious", "clean", "well-made", "durable"]
  const valueWords = ["price", "affordable", "expensive", "worth", "value", "cheap", "reasonable"]
  const ambianceWords = ["atmosphere", "ambiance", "decor", "environment", "cozy", "comfortable", "spacious"]

  // Extract tags based on keywords
  if (serviceWords.some((word) => text.includes(word))) tags.push("service")
  if (qualityWords.some((word) => text.includes(word))) tags.push("quality")
  if (valueWords.some((word) => text.includes(word))) tags.push("value")
  if (ambianceWords.some((word) => text.includes(word))) tags.push("ambiance")

  // Determine sentiment
  const positiveCount = positiveWords.filter((word) => text.includes(word)).length
  const negativeCount = negativeWords.filter((word) => text.includes(word)).length

  let sentiment = "neutral"
  if (positiveCount > negativeCount) {
    sentiment = "positive"
  } else if (negativeCount > positiveCount) {
    sentiment = "negative"
  }

  return { tags, sentiment }
}

// Auth Routes
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password, confirmPassword, address, role } = req.body

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" })
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      address: address || "",
      role: role || "user",
    })

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
    )

    res.status(201).json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      // #region agent log
      ;(typeof fetch !== "undefined"
        ? fetch("http://127.0.0.1:7242/ingest/6f5e7aa0-266f-4e9d-96f2-a539e0be835d", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: "debug-session",
              runId: "run1",
              hypothesisId: "H3",
              location: "server/server.js:/api/auth/login",
              message: "Invalid password attempt",
              data: { email },
              timestamp: Date.now(),
            }),
          })
        : Promise.resolve()
      ).catch(() => {})
      // #endregion
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
    )

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
    // #region agent log
    ;(typeof fetch !== "undefined"
      ? fetch("http://127.0.0.1:7242/ingest/6f5e7aa0-266f-4e9d-96f2-a539e0be835d", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "H3",
            location: "server/server.js:/api/auth/login",
            message: "Login success",
            data: { email, role: user.role },
            timestamp: Date.now(),
          }),
        })
      : Promise.resolve()
    ).catch(() => {})
    // #endregion
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Store Routes
app.get("/api/stores", async (req, res) => {
  try {
    const { search, category, sortBy = "name", sortOrder = "asc" } = req.query
    const match = {}
    if (search) {
      const regex = new RegExp(search, "i")
      match.$or = [{ name: regex }, { description: regex }]
    }
    if (category) {
      match.category = category
    }

    const sortField = allowedStoreSortFields.has(sortBy) ? sortBy : "name"
    const sortDirection = sortOrder === "desc" ? -1 : 1

    const stores = await Store.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $lookup: {
          from: "ratings",
          localField: "_id",
          foreignField: "store",
          as: "ratings",
        },
      },
      {
        $addFields: {
          owner_name: { $ifNull: [{ $arrayElemAt: ["$owner.name", 0] }, null] },
          owner_id: { $ifNull: [{ $toString: { $arrayElemAt: ["$owner._id", 0] } }, null] },
          average_rating: { $ifNull: [{ $avg: "$ratings.rating" }, 0] },
          total_ratings: { $size: "$ratings" },
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          address: 1,
          category: 1,
          phone: 1,
          website: 1,
          image_url: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          owner_id: 1,
          owner_name: 1,
          average_rating: 1,
          total_ratings: 1,
          _id: 1,
        },
      },
      { $sort: { [sortField]: sortDirection } },
    ])

    const formatted = stores.map((store) => ({
      ...store,
      id: store._id.toString(),
    }))

    res.json({ success: true, stores: formatted })
    // #region agent log
    ;(typeof fetch !== "undefined"
      ? fetch("http://127.0.0.1:7242/ingest/6f5e7aa0-266f-4e9d-96f2-a539e0be835d", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "H4",
            location: "server/server.js:/api/stores",
            message: "Stores queried",
            data: { search: search || null, category: category || null, count: formatted.length, sortBy },
            timestamp: Date.now(),
          }),
        })
      : Promise.resolve()
    ).catch(() => {})
    // #endregion
  } catch (error) {
    console.error("Get stores error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.get("/api/stores/:id", async (req, res) => {
  try {
    const { id } = req.params
    const objectId = sanitizeObjectId(id)
    if (!objectId) {
      return res.status(400).json({ error: "Invalid store id" })
    }

    const store = await Store.findById(objectId).lean()
    if (!store) {
      return res.status(404).json({ error: "Store not found" })
    }

    const owner = store.owner ? await User.findById(store.owner).select("name").lean() : null
    const ratings = await Rating.find({ store: objectId, flagged: { $ne: true } })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean()

    const averageRating =
      ratings.length > 0 ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length : 0

    // Generate AI summary
    const { tags, sentiment } = analyzeReview(
      ratings.map((r) => r.review).filter(Boolean).join(" "),
    )
    const themeCounts = {}
    ratings.forEach((r) => {
      if (r.tags && Array.isArray(r.tags)) {
        r.tags.forEach((tag) => {
          themeCounts[tag] = (themeCounts[tag] || 0) + 1
        })
      }
    })
    const topThemes = Object.entries(themeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag)

    res.json({
      success: true,
      store: {
        ...store,
        id: store._id.toString(),
        owner_id: store.owner ? store.owner.toString() : null,
        owner_name: owner ? owner.name : null,
        average_rating: averageRating,
        total_ratings: ratings.length,
        summary: {
          themes: topThemes,
          sentiment,
        },
        ratings: ratings.map((r) => ({
          ...r,
          id: r._id.toString(),
          user_id: r.user ? r.user._id.toString() : null,
          user_name: r.user ? r.user.name : null,
          photos: r.photos || [],
          ratings: r.ratings || null,
          tags: r.tags || [],
          sentiment: r.sentiment || "neutral",
          helpfulCount: r.helpfulCount || 0,
          verified: r.verified || false,
        })),
      },
    })
  } catch (error) {
    console.error("Get store error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/api/stores", authenticateToken, async (req, res) => {
  try {
    const { name, description, address, category, phone, website } = req.body
    const userId = sanitizeObjectId(req.user.id)
    if (!userId) {
      return res.status(400).json({ error: "Invalid user id" })
    }

    if (!name || !description || !address) {
      return res.status(400).json({ error: "Name, description, and address are required" })
    }

    const store = await Store.create({
      name,
      description,
      address,
      category,
      phone: phone || null,
      website: website || null,
      owner: userId,
    })

    res.status(201).json({
      success: true,
      store: {
        ...store.toJSON(),
        owner_id: userId.toString(),
      },
    })
  } catch (error) {
    console.error("Create store error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Rating Routes
app.get("/api/ratings", async (req, res) => {
  try {
    const { userId, storeId } = req.query
    const filter = {}

    if (userId) {
      const userObjectId = sanitizeObjectId(userId)
      if (!userObjectId) {
        return res.status(400).json({ error: "Invalid user id" })
      }
      filter.user = userObjectId
    } else if (storeId) {
      const storeObjectId = sanitizeObjectId(storeId)
      if (!storeObjectId) {
        return res.status(400).json({ error: "Invalid store id" })
      }
      filter.store = storeObjectId
    }

    const ratings = await Rating.find(filter)
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean()

    const formatted = ratings.map((rating) => ({
      ...rating,
      id: rating._id.toString(),
      user_id: rating.user ? rating.user._id.toString() : null,
      user_name: rating.user ? rating.user.name : null,
      store_id: rating.store ? rating.store.toString() : null,
    }))

    res.json({ success: true, ratings: formatted })
  } catch (error) {
    console.error("Get ratings error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Rating with photo upload support
app.post("/api/ratings", authenticateToken, upload.array("photos", 5), async (req, res) => {
  try {
    const { storeId, rating, review, ratings: dimensionRatings, photos: photoUrls } = req.body
    const userId = sanitizeObjectId(req.user.id)
    const storeObjectId = sanitizeObjectId(storeId)

    if (!userId || !storeObjectId) {
      return res.status(400).json({ error: "Valid store and user are required" })
    }
    if (!rating) {
      return res.status(400).json({ error: "Store ID and rating are required" })
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" })
    }

    // Process uploaded photos
    const uploadedPhotos = req.files
      ? req.files.map((file) => `/uploads/reviews/${file.filename}`)
      : []
    const allPhotos = [...uploadedPhotos, ...(photoUrls || [])]

    // AI analysis of review
    const { tags, sentiment } = analyzeReview(review)

    // Parse dimension ratings if provided
    let parsedDimensionRatings = null
    if (dimensionRatings) {
      try {
        parsedDimensionRatings =
          typeof dimensionRatings === "string" ? JSON.parse(dimensionRatings) : dimensionRatings
      } catch (e) {
        parsedDimensionRatings = null
      }
    }

    const ratingData = {
      rating,
      review: review || null,
      ratings: parsedDimensionRatings || null,
      photos: allPhotos.length > 0 ? allPhotos : null,
      tags: tags.length > 0 ? tags : null,
      sentiment,
      verified: false, // Can be enhanced with purchase verification later
    }

    const updatedRating = await Rating.findOneAndUpdate(
      { user: userId, store: storeObjectId },
      { ...ratingData, user: userId, store: storeObjectId },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )
      .populate("user", "name")
      .lean()

    res.status(201).json({
      success: true,
      rating: {
        ...updatedRating,
        id: updatedRating._id.toString(),
        userId: userId.toString(),
        storeId: storeObjectId.toString(),
        user_id: updatedRating.user ? updatedRating.user._id.toString() : null,
        user_name: updatedRating.user ? updatedRating.user.name : null,
      },
      message: "Rating submitted successfully",
    })
    // #region agent log
    ;(typeof fetch !== "undefined"
      ? fetch("http://127.0.0.1:7242/ingest/6f5e7aa0-266f-4e9d-96f2-a539e0be835d", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "H5",
            location: "server/server.js:/api/ratings",
            message: "Rating upserted",
            data: { storeId: storeObjectId?.toString() || null, userId: userId?.toString() || null, rating },
            timestamp: Date.now(),
          }),
        })
      : Promise.resolve()
    ).catch(() => {})
    // #endregion
  } catch (error) {
    console.error("Rating error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Admin Routes
app.get("/api/admin/users", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  try {
    const users = await User.find()
      .select("name email role address createdAt")
      .sort({ createdAt: -1 })
      .lean()

    const formatted = users.map((user) => ({
      ...user,
      id: user._id.toString(),
    }))

    res.json({ success: true, users: formatted })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.delete("/api/admin/stores/:id", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params
    const storeObjectId = sanitizeObjectId(id)
    if (!storeObjectId) {
      return res.status(400).json({ error: "Invalid store id" })
    }

    await Rating.deleteMany({ store: storeObjectId })
    const result = await Store.deleteOne({ _id: storeObjectId })

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Store not found" })
    }

    res.json({ success: true, message: "Store deleted successfully" })
  } catch (error) {
    console.error("Delete store error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// AI Review Summary Endpoint
app.get("/api/stores/:id/summary", async (req, res) => {
  try {
    const { id } = req.params
    const objectId = sanitizeObjectId(id)
    if (!objectId) {
      return res.status(400).json({ error: "Invalid store id" })
    }

    const ratings = await Rating.find({ store: objectId, flagged: { $ne: true } })
      .select("review rating tags sentiment ratings")
      .lean()

    if (ratings.length === 0) {
      return res.json({
        success: true,
        summary: {
          totalReviews: 0,
          themes: [],
          whatCustomersLike: [],
          whatCustomersDislike: [],
          averageDimensions: null,
        },
      })
    }

    // Extract themes from tags
    const themeCounts = {}
    ratings.forEach((r) => {
      if (r.tags && Array.isArray(r.tags)) {
        r.tags.forEach((tag) => {
          themeCounts[tag] = (themeCounts[tag] || 0) + 1
        })
      }
    })

    const themes = Object.entries(themeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag)

    // Extract positive and negative themes
    const positiveReviews = ratings.filter((r) => r.sentiment === "positive" || r.rating >= 4)
    const negativeReviews = ratings.filter((r) => r.sentiment === "negative" || r.rating <= 2)

    const whatCustomersLike = []
    const whatCustomersDislike = []

    positiveReviews.forEach((r) => {
      if (r.tags && r.tags.length > 0) {
        whatCustomersLike.push(...r.tags)
      }
    })

    negativeReviews.forEach((r) => {
      if (r.tags && r.tags.length > 0) {
        whatCustomersDislike.push(...r.tags)
      }
    })

    // Calculate average dimensions
    const dimensionTotals = { service: 0, quality: 0, value: 0, ambiance: 0 }
    let dimensionCount = 0

    ratings.forEach((r) => {
      if (r.ratings) {
        if (r.ratings.service) {
          dimensionTotals.service += r.ratings.service
          dimensionCount++
        }
        if (r.ratings.quality) {
          dimensionTotals.quality += r.ratings.quality
        }
        if (r.ratings.value) {
          dimensionTotals.value += r.ratings.value
        }
        if (r.ratings.ambiance) {
          dimensionTotals.ambiance += r.ratings.ambiance
        }
      }
    })

    const averageDimensions =
      dimensionCount > 0
        ? {
            service: dimensionTotals.service / dimensionCount,
            quality: dimensionTotals.quality / dimensionCount,
            value: dimensionTotals.value / dimensionCount,
            ambiance: dimensionTotals.ambiance / dimensionCount,
          }
        : null

    res.json({
      success: true,
      summary: {
        totalReviews: ratings.length,
        themes,
        whatCustomersLike: [...new Set(whatCustomersLike)].slice(0, 5),
        whatCustomersDislike: [...new Set(whatCustomersDislike)].slice(0, 5),
        averageDimensions,
      },
    })
  } catch (error) {
    console.error("Summary error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Benchmarking Endpoint
app.get("/api/stores/:id/benchmark", async (req, res) => {
  try {
    const { id } = req.params
    const objectId = sanitizeObjectId(id)
    if (!objectId) {
      return res.status(400).json({ error: "Invalid store id" })
    }

    const store = await Store.findById(objectId).lean()
    if (!store) {
      return res.status(404).json({ error: "Store not found" })
    }

    const storeRatings = await Rating.find({ store: objectId, flagged: { $ne: true } }).lean()
    const storeAvgRating =
      storeRatings.length > 0
        ? storeRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / storeRatings.length
        : 0

    // Compare with category peers
    const categoryStores = await Store.find({
      category: store.category,
      _id: { $ne: objectId },
      status: "active",
    }).lean()

    const categoryStoreIds = categoryStores.map((s) => s._id)
    const categoryRatings = await Rating.find({
      store: { $in: categoryStoreIds },
      flagged: { $ne: true },
    }).lean()

    const categoryAvgRating =
      categoryRatings.length > 0
        ? categoryRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / categoryRatings.length
        : 0

    // Compare with city peers (if city is available)
    let cityAvgRating = null
    if (store.city) {
      const cityStores = await Store.find({
        city: store.city,
        _id: { $ne: objectId },
        status: "active",
      }).lean()

      const cityStoreIds = cityStores.map((s) => s._id)
      const cityRatings = await Rating.find({
        store: { $in: cityStoreIds },
        flagged: { $ne: true },
      }).lean()

      cityAvgRating =
        cityRatings.length > 0
          ? cityRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / cityRatings.length
          : 0
    }

    res.json({
      success: true,
      benchmark: {
        storeRating: storeAvgRating,
        categoryAverage: categoryAvgRating,
        cityAverage: cityAvgRating,
        vsCategory: storeAvgRating - categoryAvgRating,
        vsCity: cityAvgRating !== null ? storeAvgRating - cityAvgRating : null,
        percentile: categoryAvgRating > 0 ? Math.round((storeAvgRating / categoryAvgRating) * 100) : 0,
      },
    })
  } catch (error) {
    console.error("Benchmark error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Moderation Endpoints
app.post("/api/ratings/:id/flag", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body
    const ratingObjectId = sanitizeObjectId(id)

    if (!ratingObjectId) {
      return res.status(400).json({ error: "Invalid rating id" })
    }

    await Rating.findByIdAndUpdate(ratingObjectId, {
      flagged: true,
      flaggedReason: reason || "Reported by user",
    })

    res.json({ success: true, message: "Rating flagged successfully" })
  } catch (error) {
    console.error("Flag rating error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/api/ratings/:id/helpful", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const ratingObjectId = sanitizeObjectId(id)

    if (!ratingObjectId) {
      return res.status(400).json({ error: "Invalid rating id" })
    }

    const rating = await Rating.findByIdAndUpdate(
      ratingObjectId,
      { $inc: { helpfulCount: 1 } },
      { new: true },
    ).lean()

    res.json({ success: true, helpfulCount: rating.helpfulCount })
  } catch (error) {
    console.error("Helpful rating error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.get("/api/admin/moderation", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  try {
    const flaggedRatings = await Rating.find({ flagged: true })
      .populate("user", "name email")
      .populate("store", "name")
      .sort({ createdAt: -1 })
      .lean()

    const formatted = flaggedRatings.map((rating) => ({
      ...rating,
      id: rating._id.toString(),
      user_id: rating.user ? rating.user._id.toString() : null,
      user_name: rating.user ? rating.user.name : null,
      store_id: rating.store ? rating.store._id.toString() : null,
      store_name: rating.store ? rating.store.name : null,
    }))

    res.json({ success: true, ratings: formatted })
  } catch (error) {
    console.error("Moderation queue error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.post("/api/admin/moderation/:id/resolve", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params
    const { action } = req.body // "approve" or "remove"
    const ratingObjectId = sanitizeObjectId(id)

    if (!ratingObjectId) {
      return res.status(400).json({ error: "Invalid rating id" })
    }

    if (action === "approve") {
      await Rating.findByIdAndUpdate(ratingObjectId, { flagged: false, flaggedReason: null })
      res.json({ success: true, message: "Rating approved" })
    } else if (action === "remove") {
      await Rating.findByIdAndDelete(ratingObjectId)
      res.json({ success: true, message: "Rating removed" })
    } else {
      res.status(400).json({ error: "Invalid action" })
    }
  } catch (error) {
    console.error("Resolve moderation error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err)
  res.status(500).json({ error: "Internal server error" })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

async function ensureDefaultAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@storerating.com"
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123"
  const existingAdmin = await User.findOne({ email: adminEmail })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    await User.create({
      name: "Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      address: "Default admin",
    })
    console.log(`✅ Default admin created (${adminEmail})`)
  } else if (existingAdmin.role !== "admin") {
    existingAdmin.role = "admin"
    await existingAdmin.save()
    console.log(`ℹ️ Updated existing admin role for ${adminEmail}`)
  }
}

async function startServer() {
  try {
    await connectDatabase()
    await ensureDefaultAdmin()

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
    // #region agent log
    ;(typeof fetch !== "undefined"
      ? fetch("http://127.0.0.1:7242/ingest/6f5e7aa0-266f-4e9d-96f2-a539e0be835d", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: "debug-session",
            runId: "run1",
            hypothesisId: "H1",
            location: "server/server.js:startServer",
            message: "Server started",
            data: { port: PORT, mongoUri: process.env.MONGODB_URI ? "env-set" : "default-local" },
            timestamp: Date.now(),
          }),
        })
      : Promise.resolve()
    ).catch(() => {})
    // #endregion
  } catch (error) {
    console.error("❌ Failed to start server:", error)
    process.exit(1)
  }
}

startServer()

module.exports = app