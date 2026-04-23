require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Crop = require("./models/Crop");
const Prediction = require("./models/Prediction");
const User = require("./models/User");
const requireAuth = require("./middleware/requireAuth");

const multer = require("multer");
const cloudinary = require("./config/cloudinary");
const Product = require("./models/Product");

const app = express();

const findBuyerRequest = (crop, ownerId) =>
  crop.interestedBuyers.find(
    (buyer) => String(buyer.ownerId) === String(ownerId)
  );

const isFullyConfirmedRequest = (request) =>
  request?.status === "confirmed" && request?.farmerConfirmed && request?.ownerConfirmed;

const reopenConfirmedRequest = (request, actorRole, reason) => {
  request.status = "accepted";
  request.farmerConfirmed = false;
  request.ownerConfirmed = false;
  request.reopenReason = reason.trim();
  request.reopenedByRole = actorRole;
  request.reopenedAt = new Date();
  request.updatedAt = new Date();
};

const defaultProducts = [
  {
    name: "Premium Wheat Seeds",
    price: 780,
    category: "Seeds",
    description: "High germination wheat seed pack for strong early crop growth.",
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
    sku: "SEED-WHEAT-01",
    unitLabel: "10 kg bag",
    stock: 120
  },
  {
    name: "Hybrid Paddy Seeds",
    price: 1240,
    category: "Seeds",
    description: "Hybrid paddy seeds suited for high-yield cultivation across multiple seasons.",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
    sku: "SEED-PADDY-01",
    unitLabel: "12 kg bag",
    stock: 90
  },
  {
    name: "Vegetable Starter Seed Kit",
    price: 520,
    category: "Seeds",
    description: "Multi-crop starter kit with tomato, chilli, okra, and brinjal seeds.",
    image: "https://images.unsplash.com/photo-1457530378978-8bac673b8062?auto=format&fit=crop&w=1200&q=80",
    sku: "SEED-VEG-01",
    unitLabel: "combo pack",
    stock: 75
  },
  {
    name: "Urea Fertilizer",
    price: 620,
    category: "Fertilizer",
    description: "Nitrogen-rich fertilizer to support leaf growth and crop vigor.",
    image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=1200&q=80",
    sku: "FERT-UREA-01",
    unitLabel: "45 kg bag",
    stock: 200
  },
  {
    name: "DAP Fertilizer",
    price: 1180,
    category: "Fertilizer",
    description: "Balanced nitrogen and phosphorus support for healthy root and shoot growth.",
    image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80",
    sku: "FERT-DAP-01",
    unitLabel: "50 kg bag",
    stock: 150
  },
  {
    name: "Organic Compost Mix",
    price: 540,
    category: "Compost",
    description: "Balanced organic compost blend to improve soil health and moisture retention.",
    image: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=1200&q=80",
    sku: "COMP-ORG-01",
    unitLabel: "25 kg bag",
    stock: 140
  },
  {
    name: "Crop Shield Pesticide",
    price: 890,
    category: "Pesticide",
    description: "Broad-spectrum crop protection formula designed for common field pests.",
    image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80",
    sku: "PEST-SHIELD-01",
    unitLabel: "1 litre",
    stock: 70
  },
  {
    name: "Micronutrient Spray",
    price: 465,
    category: "Plant Nutrition",
    description: "Micronutrient foliar spray that helps maintain balanced crop development.",
    image: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=1200&q=80",
    sku: "NUTRI-SPRAY-01",
    unitLabel: "500 ml",
    stock: 85
  }
];

const seedDefaultProductsIfNeeded = async () => {
  await Product.updateMany(
    {
      $or: [
        { sku: { $exists: false } },
        { sku: "" },
        { image: /via\.placeholder\.com/i }
      ]
    },
    {
      $set: {
        isActive: false
      }
    }
  );

  await Product.updateMany(
    { isActive: { $exists: false } },
    {
      $set: {
        isActive: true,
        adminManaged: true
      }
    }
  );

  await Product.updateMany(
    { unitLabel: { $exists: false } },
    {
      $set: {
        unitLabel: "unit"
      }
    }
  );

  await Product.updateMany(
    { stock: { $exists: false } },
    {
      $set: {
        stock: 50
      }
    }
  );

  for (const product of defaultProducts) {
    await Product.updateOne(
      { sku: product.sku },
      {
        $set: {
          ...product,
          isActive: true,
          adminManaged: true
        }
      },
      { upsert: true }
    );
  }
  console.log(`Marketplace products verified (${defaultProducts.length} curated items)`);
};

const trimText = (value = "") => String(value).trim();

const buildActivityItem = (type, title, subtitle, createdAt, meta = {}) => ({
  type,
  title,
  subtitle,
  createdAt: createdAt || new Date(),
  meta
});

const getActivityDate = (...values) => {
  const match = values.find((value) => value && !Number.isNaN(new Date(value).getTime()));
  return match || new Date();
};

// =======================
// ✅ MIDDLEWARE
// =======================
app.disable("x-powered-by");
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"]
}));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(self)");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  next();
});
app.use(express.json({ limit: "1mb" }));

// =======================
// ✅ MONGODB
// =======================
mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/khety")
  .then(async () => {
    console.log("MongoDB Connected ✅");
    await seedDefaultProductsIfNeeded();
  })
  .catch(err => console.log(err));

// =======================
// ✅ ROOT
// =======================
app.get("/", (req, res) => {
  res.send("Khety Backend Running 🚀");
});

// =======================
// ✅ CROPS
// =======================
app.get("/api/crops", requireAuth, async (req, res) => {
  try {
    const { farmerId, ownerId } = req.query;
    const filter = {};

    if (farmerId) {
      filter.farmerId = farmerId;
    }

    if (ownerId) {
      filter["interestedBuyers.ownerId"] = ownerId;
    }

    const crops = await Crop.find(filter).sort({ createdAt: -1 }).lean();

    const farmerIds = [
      ...new Set(
        crops
          .map((crop) => crop.farmerId)
          .filter(Boolean)
      )
    ];

    const validFarmerIds = farmerIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

    const farmers = validFarmerIds.length
      ? await User.find({ _id: { $in: validFarmerIds } }, { name: 1, phone: 1, email: 1, location: 1 }).lean()
      : [];

    const farmerMap = new Map(
      farmers.map((farmer) => [String(farmer._id), farmer])
    );

    const enrichedCrops = crops.map((crop) => {
      const farmer = crop.farmerId ? farmerMap.get(String(crop.farmerId)) : null;

      return {
        ...crop,
        farmerName: crop.farmerName || farmer?.name || "Farmer not available",
        farmerPhone: farmer?.phone || "",
        farmerEmail: farmer?.email || "",
        farmerLocation: crop.location || farmer?.location || ""
      };
    });

    res.json(enrichedCrops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/crops", requireAuth, async (req, res) => {
  try {
    if (req.auth.role !== "farmer" || String(req.body.farmerId) !== String(req.auth.sub)) {
      return res.status(403).json({ error: "Not allowed to create this listing" });
    }

    const payload = {
      name: trimText(req.body.name),
      price: trimText(req.body.price),
      location: trimText(req.body.location),
      quantity: trimText(req.body.quantity),
      unit: trimText(req.body.unit) || "quintal",
      notes: trimText(req.body.notes),
      availability: trimText(req.body.availability) || "Immediate",
      listingStatus: trimText(req.body.listingStatus) || "active",
      farmerId: trimText(req.body.farmerId),
      farmerName: trimText(req.body.farmerName)
    };

    if (!payload.name || !payload.price || !payload.location) {
      return res.status(400).json({ error: "Crop name, price, and location are required" });
    }

    const newCrop = new Crop(payload);
    await newCrop.save();
    res.json({ message: "Crop added successfully 🌱" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// ✅ AUTH
// =======================
app.use("/api/auth", require("./routes/auth"));

// =======================
// ✅ MULTER CONFIG (FIXED)
// =======================
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file?.mimetype?.startsWith("image/")) {
      cb(null, true);
      return;
    }

    cb(new Error("Only image uploads are allowed"));
  }
});

// =======================
// ✅ IMAGE UPLOAD (FIXED + SAFE)
// =======================
app.post("/api/upload-image", requireAuth, upload.single("file"), async (req, res) => {
  try {
    console.log("📸 Upload API hit");

    if (!req.file) {
      console.log("❌ No file received");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("📦 Upload details:", {
      type: req.file.mimetype,
      size: req.file.size,
      userId: req.auth?.sub
    });

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "khety/profile-images",
          resource_type: "image"
        },
        (error, result) => {
          if (error) {
            console.log("❌ Cloudinary error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(req.file.buffer);
    });

    console.log("✅ Uploaded:", result.secure_url);

    res.json({ url: result.secure_url });

  } catch (err) {
    console.log("❌ UPLOAD ERROR:", err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});

// =======================
// ✅ SAVE PREDICTION (DEBUG ADDED)
// =======================
app.post("/api/save-prediction", requireAuth, async (req, res) => {
  try {
    if (String(req.body.userId) !== String(req.auth.sub)) {
      return res.status(403).json({ error: "Not allowed to save this prediction" });
    }

    console.log("🔥 SAVE HIT:", req.body); // DEBUG

    const newPrediction = new Prediction({
      userId: req.body.userId,
      image: req.body.image,
      result: req.body.result,
      confidence: req.body.confidence,
      report: req.body.report // ✅ IMPORTANT
    });

    await newPrediction.save();

    res.json({ message: "Saved successfully ✅" });

  } catch (err) {
    console.log("❌ SAVE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// ✅ GET HISTORY
// =======================
app.get("/api/my-predictions/:userId", requireAuth, async (req, res) => {
  try {
    if (String(req.params.userId) !== String(req.auth.sub)) {
      return res.status(403).json({ error: "Not allowed to view these predictions" });
    }

    console.log("📊 Fetch history for:", req.params.userId);

    const data = await Prediction.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    res.json(data);

  } catch (err) {
    console.log("❌ FETCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// ✅ GET SINGLE REPORT
// =======================
app.get("/api/prediction/:id", requireAuth, async (req, res) => {
  try {
    const data = await Prediction.findById(req.params.id);

    if (!data) {
      return res.status(404).json({ error: "Report not found" });
    }

    if (String(data.userId) !== String(req.auth.sub)) {
      return res.status(403).json({ error: "Not allowed to view this report" });
    }

    res.json(data);
  } catch (err) {
    console.log("❌ ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// ✅ GET ALL PRODUCTS
// =======================
app.get("/api/products", requireAuth, async (req, res) => {
  try {
    console.log("📦 Products API hit");

    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });

    res.json(products);

  } catch (err) {
    console.log("❌ PRODUCT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/dashboard/summary", requireAuth, async (req, res) => {
  try {
    if (req.auth.role === "farmer") {
      const [predictions, crops] = await Promise.all([
        Prediction.find({ userId: req.auth.sub }).sort({ createdAt: -1 }).lean(),
        Crop.find({ farmerId: req.auth.sub }).sort({ createdAt: -1 }).lean()
      ]);

      const totalScans = predictions.length;
      const healthyScans = predictions.filter((item) =>
        item.result?.toLowerCase().includes("healthy")
      ).length;
      const totalListings = crops.length;
      const activeListings = crops.filter((item) => item.listingStatus !== "closed").length;
      const totalRequests = crops.reduce(
        (sum, crop) => sum + (crop.interestedBuyers?.length || 0),
        0
      );
      const pendingRequests = crops.reduce(
        (sum, crop) =>
          sum + (crop.interestedBuyers || []).filter((buyer) => buyer.status === "pending").length,
        0
      );

      const activities = [
        ...predictions.slice(0, 4).map((item) =>
          buildActivityItem(
            "scan",
            item.result || "Detection report saved",
            `Confidence ${item.confidence || 0}%`,
            getActivityDate(item.createdAt, item.updatedAt)
          )
        ),
        ...crops.slice(0, 4).map((crop) =>
          buildActivityItem(
            "listing",
            `${crop.name} listed`,
            `${crop.price} from ${crop.location}`,
            getActivityDate(crop.createdAt, crop.updatedAt),
            { requestCount: crop.interestedBuyers?.length || 0 }
          )
        ),
        ...crops.flatMap((crop) =>
          (crop.interestedBuyers || []).slice(-3).map((buyer) =>
            buildActivityItem(
              "request",
              `${buyer.ownerName || "Owner"} ${buyer.status || "pending"} request`,
              `${crop.name} • ${buyer.requestType || "chat"}`,
              getActivityDate(buyer.updatedAt, buyer.createdAt, crop.updatedAt, crop.createdAt)
            )
          )
        )
      ]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8);

      return res.json({
        role: "farmer",
        metrics: {
          totalScans,
          healthyScans,
          needsAttention: totalScans - healthyScans,
          totalListings,
          activeListings,
          totalRequests,
          pendingRequests
        },
        activities
      });
    }

    const crops = await Crop.find().sort({ createdAt: -1 }).lean();
    const myRequests = crops.flatMap((crop) =>
      (crop.interestedBuyers || [])
        .filter((buyer) => String(buyer.ownerId) === String(req.auth.sub))
        .map((buyer) => ({
          crop,
          buyer
        }))
    );

    const activities = myRequests
      .map(({ crop, buyer }) =>
        buildActivityItem(
          "request",
          `${crop.name} • ${buyer.status || "pending"}`,
          `${buyer.requestType || "chat"} with ${crop.farmerName || "farmer"}`,
          getActivityDate(buyer.updatedAt, buyer.createdAt, crop.updatedAt, crop.createdAt)
        )
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);

    return res.json({
      role: "owner",
      metrics: {
        totalListings: crops.length,
        myRequests: myRequests.length,
        pendingRequests: myRequests.filter(({ buyer }) => buyer.status === "pending").length,
        activeNegotiations: myRequests.filter(
          ({ buyer }) => buyer.status === "accepted" || buyer.status === "confirmed"
        ).length
      },
      activities
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/api/crops/:id/request", requireAuth, async (req, res) => {
  try {
    const {
      ownerId,
      ownerName,
      ownerPhone,
      ownerEmail,
      ownerLocation,
      requestType,
      message
    } = req.body;

    if (!ownerId || !ownerName) {
      return res.status(400).json({ error: "Owner details are required" });
    }

    if (req.auth.role !== "owner" || String(ownerId) !== String(req.auth.sub)) {
      return res.status(403).json({ error: "Not allowed to create this request" });
    }

    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ error: "Crop not found" });
    }

    const existingRequest = findBuyerRequest(crop, ownerId);
    const nextMessage = message?.trim();
    const reopenReason = trimText(req.body.reopenReason);

    if (existingRequest) {
      if (isFullyConfirmedRequest(existingRequest)) {
        if (!reopenReason) {
          return res.status(400).json({ error: "A reason is required to change a fully confirmed request." });
        }

        reopenConfirmedRequest(existingRequest, "owner", reopenReason);
      } else {
        existingRequest.status = "pending";
        existingRequest.farmerConfirmed = false;
        existingRequest.ownerConfirmed = false;
        existingRequest.updatedAt = new Date();
      }

      existingRequest.ownerName = ownerName;
      existingRequest.ownerPhone = ownerPhone || existingRequest.ownerPhone;
      existingRequest.ownerEmail = ownerEmail || existingRequest.ownerEmail;
      existingRequest.ownerLocation = ownerLocation || existingRequest.ownerLocation;
      existingRequest.requestType = requestType || existingRequest.requestType;
      existingRequest.message = nextMessage || existingRequest.message;

      if (nextMessage) {
        existingRequest.chatMessages.push({
          senderId: ownerId,
          senderName: ownerName,
          senderRole: "owner",
          text: nextMessage,
          createdAt: new Date()
        });
      }
    } else {
      crop.interestedBuyers.push({
        ownerId,
        ownerName,
        ownerPhone,
        ownerEmail,
        ownerLocation,
        requestType: requestType || "chat",
        message: nextMessage || "",
        farmerResponse: "",
        status: "pending",
        chatMessages: nextMessage ? [
          {
            senderId: ownerId,
            senderName: ownerName,
            senderRole: "owner",
            text: nextMessage,
            createdAt: new Date()
          }
        ] : [],
        createdAt: new Date()
      });
    }

    await crop.save();

    res.json({ message: "Request sent successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/crops/:cropId/request/:ownerId/status", requireAuth, async (req, res) => {
  try {
    const { status, farmerResponse, actorRole, reopenReason } = req.body;
    const allowedStatuses = ["pending", "accepted", "rejected", "confirmed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const crop = await Crop.findById(req.params.cropId);

    if (!crop) {
      return res.status(404).json({ error: "Crop not found" });
    }

    const request = findBuyerRequest(crop, req.params.ownerId);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (
      (actorRole === "farmer" && (req.auth.role !== "farmer" || String(crop.farmerId) !== String(req.auth.sub))) ||
      (actorRole === "owner" && (req.auth.role !== "owner" || String(req.params.ownerId) !== String(req.auth.sub)))
    ) {
      return res.status(403).json({ error: "Not allowed to update this request" });
    }

    request.updatedAt = new Date();

    if (isFullyConfirmedRequest(request) && status !== "confirmed") {
      if (!trimText(reopenReason)) {
        return res.status(400).json({ error: "A reason is required to change a fully confirmed request." });
      }

      reopenConfirmedRequest(request, actorRole, reopenReason);
    }

    if (status === "confirmed") {
      if (!actorRole || !["farmer", "owner"].includes(actorRole)) {
        return res.status(400).json({ error: "Confirmation role is required" });
      }

      if (actorRole === "farmer") {
        request.farmerConfirmed = true;
      }

      if (actorRole === "owner") {
        request.ownerConfirmed = true;
      }

      request.status =
        request.farmerConfirmed && request.ownerConfirmed
          ? "confirmed"
          : "accepted";
    } else {
      request.status = status;

      if (status === "rejected" || status === "pending" || status === "accepted") {
        request.farmerConfirmed = false;
        request.ownerConfirmed = false;
      }
    }

    if (typeof farmerResponse === "string") {
      request.farmerResponse = farmerResponse.trim();
    }

    await crop.save();

    res.json({
      message: "Request updated successfully",
      status: request.status,
      farmerConfirmed: request.farmerConfirmed,
      ownerConfirmed: request.ownerConfirmed,
      reopenReason: request.reopenReason,
      reopenedByRole: request.reopenedByRole,
      reopenedAt: request.reopenedAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/crops/:cropId/request/:ownerId/messages", requireAuth, async (req, res) => {
  try {
    const { senderId, senderName, senderRole, text, reopenReason } = req.body;
    const trimmedText = text?.trim();

    if (!senderId || !senderName || !senderRole || !trimmedText) {
      return res.status(400).json({ error: "Message details are required" });
    }

    const crop = await Crop.findById(req.params.cropId);

    if (!crop) {
      return res.status(404).json({ error: "Crop not found" });
    }

    const request = findBuyerRequest(crop, req.params.ownerId);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (
      String(senderId) !== String(req.auth.sub) ||
      senderRole !== req.auth.role ||
      (senderRole === "farmer" && String(crop.farmerId) !== String(req.auth.sub)) ||
      (senderRole === "owner" && String(req.params.ownerId) !== String(req.auth.sub))
    ) {
      return res.status(403).json({ error: "Not allowed to post this message" });
    }

    request.chatMessages.push({
      senderId,
      senderName,
      senderRole,
      text: trimmedText,
      createdAt: new Date()
    });
    request.updatedAt = new Date();

    if (isFullyConfirmedRequest(request)) {
      if (!trimText(reopenReason)) {
        return res.status(400).json({ error: "A reason is required to change a fully confirmed request." });
      }

      reopenConfirmedRequest(request, senderRole, reopenReason);
    }

    if (senderRole === "farmer") {
      request.farmerResponse = trimmedText;
      if (request.status === "pending") {
        request.status = "accepted";
      }
      request.farmerConfirmed = false;
      request.ownerConfirmed = false;
    }

    await crop.save();

    res.json({ message: "Message sent successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/crop-interest/:id", requireAuth, async (req, res) => {
  try {
    const { ownerId, ownerName } = req.body;

    await Crop.findByIdAndUpdate(req.params.id, {
      $push: {
        interestedBuyers: { ownerId, ownerName }
      }
    });

    res.json({ message: "Interest shown ✅" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// ✅ START SERVER
// =======================
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log("Server running on port 5000 🚀");
});
