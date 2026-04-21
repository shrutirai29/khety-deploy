require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("./models/Product");

const products = [
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

async function seedData() {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/khety"
  );

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

  for (const product of products) {
    await Product.updateOne(
      { sku: product.sku },
      {
        $set: {
          ...product,
          adminManaged: true,
          isActive: true
        }
      },
      { upsert: true }
    );
  }

  console.log(`Seeded or updated ${products.length} admin products`);
  await mongoose.disconnect();
}

seedData().catch(async (error) => {
  console.error("Failed to seed products", error);
  await mongoose.disconnect();
  process.exit(1);
});
