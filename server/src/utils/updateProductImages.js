import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

// Curated verified food photography database
const SPECIFIC_PRODUCT_IMAGES = {
  // --- NON-VEG BREAKFAST (EGG SPECIALTIES) ---
  "Egg Fry": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
  "Boiled Egg": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80",
  "Bread Omelette": "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=800&q=80",
  "Anda Bhurji": "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80",

  // --- BREAKFAST ---
  "Puri Bhaji": "/images/dishes/puri_bhaji.jpg",
  "Shira": "/images/dishes/shira.jpg",
  "Poha": "/images/dishes/poha.jpg",

  // --- QUICK BITES ---
  "Aaloo Paratha": "/images/dishes/aloo_paratha.jpg",
  "Punjabi Samosa (4 pcs)": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
  "Suji Toast (3pcs)": "https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=800&q=80",
  "Cream Roll (Monginis)": "/images/dishes/cream_roll.jpg",
  "Cream Roll (Regular)": "/images/dishes/cream_roll.jpg",
  "Bun Garlic Maska": "/images/dishes/bun_garlic_maska.jpg",
  "Bun Maska": "/images/dishes/bun_maska.jpg",

  // --- SHARBAT & ICE TEA & MOCKTAILS ---
  "Lemon Ice Tea": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80",
  "Kala Khatta": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80",
  "Mango": "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80",
  "Pineapple": "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=800&q=80",
  "Khus": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
  "Kacha Aam": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
  "Jeera Masala": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
  "Red wine Sangria": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
  "Muddy Sky Blue": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
  "Mojito": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",

  // --- FRIED CHICKEN ---
  "Chicken Wings Crispy": "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=800&q=80",
  "Chicken Legs Crispy": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
  "Crispy Chicken Strips": "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
  "Crispy Chicken Popcorn": "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80",

  // --- CHICKEN PIZZA ---
  "Loaded Special Chicken Pizza": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
  "Tandoori Chicken Pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
  "Schezwan Chicken Pizza": "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80",
  "Regular Chicken Pizza": "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=800&q=80",

  // --- VEG PIZZA ---
  "Chatpata Paneer Pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
  "Smoky Tandoori Pizza": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
  "Exotic Veg Pizza": "https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?auto=format&fit=crop&w=800&q=80",
  "Zesty Schezwan Pizza": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
  "Golden Corn Pizza": "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=800&q=80",
  "Classic Margherita Pizza": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80",

  // --- CHICKEN BURGERS ---
  "Chicken Cheese Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
  "Crispy Zinger Burger": "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80",
  "Chicken Peri Peri Burger": "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80",
  "Ccrunchy Pop Burger": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80",
  "Classic Chicken Burger": "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=800&q=80",

  // --- VEG BURGERS ---
  "Veg Peri Peri Burger": "/images/dishes/veg_peri_peri_burger.jpg",
  "Cheese Veg Burger": "/images/dishes/cheese_veg_burger.jpg",
  "Veg Burger": "/images/dishes/veg_burger.jpg",

  // --- NON-VEG SANDWICH ---
  "Crispy Popcorn Sandwich": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
  "Crispy Chicken Sandwich": "https://images.unsplash.com/photo-1604467794349-0b74285de7e7?auto=format&fit=crop&w=800&q=80",
  "Grilled egg Sandwich": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",

  // --- VEG SANDWICH ---
  "Paneer Grill Sandwich": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
  "Corn Mayo Grill Sandwich": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
  "Cheese Grill Sandwich": "https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&w=800&q=80",
  "Corn Masala Grill Sandwich": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
  "Veg Grill Sandwich": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",

  // --- MAGGIE ---
  "Veg Maggie": "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80",
  "Corn Cheese Maggie": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
  "Schezwan Maggie": "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
  "Cheeze Maggie": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
  "Masala Maggie": "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80",
  "Plain Maggie": "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80",

  // --- FRIES ---
  "Loaded Fries": "https://images.unsplash.com/photo-1586816001966-79b736744398?auto=format&fit=crop&w=800&q=80",
  "Peri Peri Fries": "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=800&q=80",
  "Masalo Fries": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
  "Classic French Fries": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",

  // --- MOMOS ---
  "Chicken Momos": "/images/dishes/paneer_momos.jpg",
  "Paneer Momos": "/images/dishes/paneer_momos.jpg",
  "Mix Veg Momos": "/images/dishes/mix_veg_momos.jpg",
  "Schezwan Momos": "/images/dishes/schezwan_momos.jpg",

  // --- WRAPS ---
  "Chicken Peri Peri Wraps": "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=800&q=80",
  "Chicken Cheese Wraps": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
  "Chicken Mayo Wraps": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
  "Chicken Tandoor Wraps": "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=80",
  "Chicken Crispy Wraps": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
  "Paneer Peri Peri Wraps": "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=800&q=80",
  "Paneer Cheese Wraps": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
  "Paneer Tandoori Wraps": "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=80",

  // --- COLD COFFEE ---
  "Choco Cold Coffee": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
  "Cold Coffee": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80",

  // --- HOT COFFEE ---
  "Choco coffee": "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80",
  "Strong coffee": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
  "Hot Coffee": "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80",

  // --- TEA & CHAAI ---
  "Green Tea (Tulsi)": "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=800&q=80",
  "Green Tea (Honey)": "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=800&q=80",
  "Black Coffee": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
  "Lemon Black Tea": "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=800&q=80",
  "Black Tea": "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=800&q=80",
  "Masala Chaai": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
  "Elaichi Chaai": "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?auto=format&fit=crop&w=800&q=80",
  "Kadak Chaai": "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80",
  "Adrak Chaai": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
  "Classic Chaai": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",

  // --- SPECIALTY, BAKERY & DESSERTS ---
  "Artisan Flat White": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
  "Basque Burnt Cheesecake": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80",
  "Avocado & Truffle Sourdough Toast": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
  "Smoked Turkey & Pesto Panini": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
  "Spanish Iced Latte": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80",
  "Flaky Almond Croissant": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80",
  "Vanilla Sweet Cream Cold Brew": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80",
};

async function checkUrl(url) {
  if (url.startsWith("/images/dishes/")) {
    const localFile = path.resolve(__dirname, "../../../client/public" + url);
    return fs.existsSync(localFile);
  }
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.statusCode === 200);
    }).on("error", () => resolve(false));
  });
}

async function updateAll() {
  console.log("Checking and verifying all product images...");
  const uniqueUrls = [...new Set(Object.values(SPECIFIC_PRODUCT_IMAGES))];
  console.log(`Verifying ${uniqueUrls.length} unique image URLs...`);

  let failedUrls = [];
  for (const url of uniqueUrls) {
    const isOk = await checkUrl(url);
    if (!isOk) {
      console.warn("FAILED URL:", url);
      failedUrls.push(url);
    }
  }

  if (failedUrls.length > 0) {
    console.error(`Abort: ${failedUrls.length} URLs failed 200 check!`);
    process.exit(1);
  }
  console.log("All image URLs verified: 100% reachable with HTTP 200 OK!");

  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB successfully!");

  const Product = mongoose.model(
    "Product",
    new mongoose.Schema({}, { strict: false }),
    "products"
  );

  const allProducts = await Product.find({});
  console.log(`Found ${allProducts.length} products in MongoDB.`);

  let updatedCount = 0;
  for (const p of allProducts) {
    const matchedUrl = SPECIFIC_PRODUCT_IMAGES[p.name];
    if (matchedUrl) {
      await Product.updateOne({ _id: p._id }, { $set: { image: matchedUrl } });
      updatedCount++;
    } else {
      console.log("No specific mapping for product:", p.name);
    }
  }
  console.log(`Successfully updated ${updatedCount} products in MongoDB Atlas!`);

  // Update products_audit.json
  const auditPath = path.resolve(__dirname, "../../../../products_audit.json");
  if (fs.existsSync(auditPath)) {
    const auditData = JSON.parse(fs.readFileSync(auditPath, "utf8"));
    auditData.products.forEach((p) => {
      if (SPECIFIC_PRODUCT_IMAGES[p.name]) {
        p.image = SPECIFIC_PRODUCT_IMAGES[p.name];
      }
    });
    fs.writeFileSync(auditPath, JSON.stringify(auditData, null, 2), "utf8");
    console.log("Updated products_audit.json");
  }

  // Update all_products_inventory.txt
  const invPath = path.resolve(__dirname, "../../../../all_products_inventory.txt");
  if (fs.existsSync(invPath)) {
    const lines = fs.readFileSync(invPath, "utf8").split("\n");
    const newLines = lines.map((line) => {
      if (!line.trim()) return line;
      const parts = line.split(" | ");
      if (parts.length >= 5) {
        const name = parts[1].trim();
        if (SPECIFIC_PRODUCT_IMAGES[name]) {
          parts[4] = SPECIFIC_PRODUCT_IMAGES[name];
          return parts.join(" | ");
        }
      }
      return line;
    });
    fs.writeFileSync(invPath, newLines.join("\n"), "utf8");
    console.log("Updated all_products_inventory.txt");
  }

  process.exit(0);
}

updateAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
