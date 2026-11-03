import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "../config/db.js";
import Cafe from "../models/Cafe.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

const standardAddOns = [
  { name: "Egg", price: 25, isAvailable: true },
  { name: "Cheese", price: 20, isAvailable: true },
  { name: "Chicken", price: 30, isAvailable: true },
];

const categoriesData = [
  { name: "Chaai", icon: "coffee", displayOrder: 1, description: "Authentic freshly brewed hot Indian teas" },
  { name: "Black Tea / Coffee", icon: "coffee", displayOrder: 2, description: "Invigorating black brews and herbal green teas" },
  { name: "Hot Coffee", icon: "coffee", displayOrder: 3, description: "Rich, aromatic espresso and hot specialty roasts" },
  { name: "Cold Coffee", icon: "coffee", displayOrder: 4, description: "Creamy iced blends and decadent frappes" },
  { name: "Mocktails", icon: "glass", displayOrder: 5, description: "Refreshing bubbly mocktails and coolers" },
  { name: "Sharbat", icon: "glass", displayOrder: 6, description: "Traditional desi refreshments and seasonal fruit coolers" },
  { name: "Ice Tea", icon: "glass", displayOrder: 7, description: "Chilled zesty iced teas brewed to perfection" },
  { name: "Breakfast", icon: "utensils", displayOrder: 8, description: "Wholesome morning favorites and savory platters" },
  { name: "Quick Bites", icon: "utensils", displayOrder: 9, description: "Crunchy tea-time snacks, rolls and warm toasts" },
  { name: "Fries", icon: "utensils", displayOrder: 10, description: "Crispy golden potato fries with gourmet toppings" },
  { name: "Veg Momos", icon: "utensils", displayOrder: 11, description: "Steamed and tossed dumplings with spicy dip" },
  { name: "Veg Wraps", icon: "utensils", displayOrder: 12, description: "Toasted flour wraps packed with marinated paneer" },
  { name: "Maggie", icon: "utensils", displayOrder: 13, description: "Classic hot noodles customized with veggies and cheese" },
  { name: "Veg Sandwich", icon: "utensils", displayOrder: 14, description: "Grilled jumbo bread sandwiches layered with fresh fillings" },
  { name: "Veg Burger", icon: "utensils", displayOrder: 15, description: "Crispy veg patties topped with melted cheese and sauce" },
  { name: "Veg Pizza", icon: "pizza", displayOrder: 16, description: "Stone-baked crispy pizzas in Small, Medium & Large sizes" },
  { name: "Non-Veg Sandwich", icon: "utensils", displayOrder: 17, description: "Toasted sandwiches with spiced egg and juicy chicken" },
  { name: "Chicken Burger", icon: "utensils", displayOrder: 18, description: "Succulent crispy fried chicken breast burgers" },
  { name: "Chicken Wraps", icon: "utensils", displayOrder: 19, description: "Warm rolled wraps filled with tandoori & peri-peri chicken" },
  { name: "Fried Chicken Momos", icon: "utensils", displayOrder: 20, description: "Golden fried dumplings filled with minced spiced chicken" },
  { name: "Non-Veg Breakfast", icon: "utensils", displayOrder: 21, description: "Fresh egg omelettes, bhurji and power breakfast bites" },
  { name: "Chicken Pizza", icon: "pizza", displayOrder: 22, description: "Stone-baked pizzas loaded with seasoned chicken & cheese" },
  { name: "Fried Chicken", icon: "utensils", displayOrder: 23, description: "Crispy crunchy fried chicken popcorn, strips, legs & wings" },
];

const productsData = [
  // Page 2: CHAAI (Sizes: 70ml, 100ml)
  {
    categoryName: "Chaai",
    name: "Classic Chaai",
    description: "Traditional aromatic boiled chai made with rich dairy milk and premium tea leaves.",
    price: 12,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
    tags: ["Bestseller", "Hot"],
    variants: [
      { name: "70ml", price: 12, isAvailable: true },
      { name: "100ml", price: 20, isAvailable: true },
    ],
  },
  {
    categoryName: "Chaai",
    name: "Adrak Chaai",
    description: "Soothing hot tea infused with freshly crushed ginger root for immunity and warmth.",
    price: 15,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
    tags: ["Spiced", "Popular"],
    variants: [
      { name: "70ml", price: 15, isAvailable: true },
      { name: "100ml", price: 20, isAvailable: true },
    ],
  },
  {
    categoryName: "Chaai",
    name: "Kadak Chaai",
    description: "Bold, strong decoction tea brewed for the real chai connoisseur craving intense flavor.",
    price: 15,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80",
    tags: ["Strong", "Favorite"],
    variants: [
      { name: "70ml", price: 15, isAvailable: true },
      { name: "100ml", price: 25, isAvailable: true },
    ],
  },
  {
    categoryName: "Chaai",
    name: "Elaichi Chaai",
    description: "Fragrant chai brewed with green cardamom pods, delivering a sweet herbal aroma.",
    price: 15,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?auto=format&fit=crop&w=800&q=80",
    tags: ["Aromatic", "Classic"],
    variants: [
      { name: "70ml", price: 15, isAvailable: true },
      { name: "100ml", price: 25, isAvailable: true },
    ],
  },
  {
    categoryName: "Chaai",
    name: "Masala Chaai",
    description: "Royal blend of cloves, cinnamon, black pepper, ginger, and cardamom in creamy hot tea.",
    price: 20,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1571934811356-5cc506b3c9b7?auto=format&fit=crop&w=800&q=80",
    tags: ["Signature", "Royal"],
    variants: [
      { name: "70ml", price: 20, isAvailable: true },
      { name: "100ml", price: 30, isAvailable: true },
    ],
  },

  // Page 2: BLACK TEA / COFFEE
  {
    categoryName: "Black Tea / Coffee",
    name: "Black Tea",
    description: "Pure Ceylon black leaf infusion served steaming hot without milk.",
    price: 12,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
  },
  {
    categoryName: "Black Tea / Coffee",
    name: "Lemon Black Tea",
    description: "Zesty black tea steeped with freshly squeezed lemon juice and a touch of sweetness.",
    price: 15,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80",
  },
  {
    categoryName: "Black Tea / Coffee",
    name: "Black Coffee",
    description: "Rich dark roasted coffee extracted black for a clean, sharp caffeine boost.",
    price: 20,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
  },
  {
    categoryName: "Black Tea / Coffee",
    name: "Green Tea (Honey)",
    description: "Antioxidant-rich whole green tea leaves sweetened naturally with pure amber honey.",
    price: 15,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=800&q=80",
  },
  {
    categoryName: "Black Tea / Coffee",
    name: "Green Tea (Tulsi)",
    description: "Holistic herbal green tea infused with sacred Indian basil leaves for pure wellness.",
    price: 20,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80",
  },

  // Page 2: HOT COFFEE
  {
    categoryName: "Hot Coffee",
    name: "Hot Coffee",
    description: "Silky whipped coffee froth poured over steaming hot milk with velvety foam.",
    price: 30,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
    tags: ["Hot", "Bestseller"],
  },
  {
    categoryName: "Hot Coffee",
    name: "Strong coffee",
    description: "Double extraction roast crafted with extra body and depth for coffee purists.",
    price: 40,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
  },
  {
    categoryName: "Hot Coffee",
    name: "Choco coffee",
    description: "Indulgent blend of premium hot coffee with melted dark cocoa and chocolate syrup.",
    price: 40,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80",
  },

  // Page 2: COLD COFFEE
  {
    categoryName: "Cold Coffee",
    name: "Cold Coffee",
    description: "Chilled thick blended coffee with vanilla cream and cracked ice.",
    price: 70,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80",
    tags: ["Chilled", "Bestseller"],
  },
  {
    categoryName: "Cold Coffee",
    name: "Choco Cold Coffee",
    description: "Decadent chocolate thick shake infused with espresso shot and cocoa drizzle.",
    price: 80,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=800&q=80",
  },

  // Page 3: MOCKTAILS
  {
    categoryName: "Mocktails",
    name: "Mojito",
    description: "Muddled fresh mint leaves, tangy lime slices, sparkling soda, and crushed ice.",
    price: 80,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
    tags: ["Refreshing"],
  },
  {
    categoryName: "Mocktails",
    name: "Muddy Sky Blue",
    description: "Vibrant electric blue curacao mocktail layered with citrus tang and fizzy soda.",
    price: 80,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
  },
  {
    categoryName: "Mocktails",
    name: "Red wine Sangria",
    description: "Non-alcoholic deep ruby grape and berry cooler studded with fresh seasonal fruit bits.",
    price: 80,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1560512823-829485b8bf24?auto=format&fit=crop&w=800&q=80",
  },

  // Page 3: SHARBAT
  {
    categoryName: "Sharbat",
    name: "Jeera Masala",
    description: "Tangy cumin-spiced digestive cooler with black salt, lemon, and chilled soda.",
    price: 50,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80",
  },
  {
    categoryName: "Sharbat",
    name: "Kacha Aam",
    description: "Sweet and tart raw green mango cooler with roasted cumin and mint notes.",
    price: 50,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=800&q=80",
  },
  {
    categoryName: "Sharbat",
    name: "Khus",
    description: "Cooling emerald vetiver root syrup mixed with iced water and refreshing sweetness.",
    price: 50,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80",
  },
  {
    categoryName: "Sharbat",
    name: "Pineapple",
    description: "Tropical crushed pineapple nectar served ice cold with a hint of tangy citrus.",
    price: 50,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=800&q=80",
  },
  {
    categoryName: "Sharbat",
    name: "Mango",
    description: "Sun-ripened Alphonso mango pulp blended smooth for a golden, luscious drink.",
    price: 50,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80",
  },
  {
    categoryName: "Sharbat",
    name: "Kala Khatta",
    description: "Iconic sweet-sour Indian blackberry sharbat garnished with black salt and lemon.",
    price: 50,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=800&q=80",
  },

  // Page 3: ICE TEA
  {
    categoryName: "Ice Tea",
    name: "Lemon Ice Tea",
    description: "Handcrafted iced tea infused with natural lemon extract, fresh mint, and ice cubes.",
    price: 60,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80",
    tags: ["Chilled"],
  },

  // Page 3: BREAKFAST (VEG)
  {
    categoryName: "Breakfast",
    name: "Poha",
    description: "Steamed flattened rice tossed with mustard seeds, turmeric, roasted peanuts, and lemon.",
    price: 40,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
    tags: ["Morning Special"],
  },
  {
    categoryName: "Breakfast",
    name: "Shira",
    description: "Warm semolina halwa cooked in pure desi ghee with cardamom, milk, and golden raisins.",
    price: 40,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
  },
  {
    categoryName: "Breakfast",
    name: "Puri Bhaji",
    description: "Four puffed golden wheat puris served with spiced potato sabzi and pickle.",
    price: 70,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
    tags: ["Hearty"],
  },

  // Page 4: QUICK BITES
  {
    categoryName: "Quick Bites",
    name: "Bun Maska",
    description: "Soft bakery bun generously spread with sweet and salted butter, ideal for dipping in hot chai.",
    price: 40,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    tags: ["Classic"],
  },
  {
    categoryName: "Quick Bites",
    name: "Bun Garlic Maska",
    description: "Warm toasted bun brushed with infused aromatic roasted garlic herb butter.",
    price: 50,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    categoryName: "Quick Bites",
    name: "Cream Roll (Regular)",
    description: "Flaky puff pastry horn stuffed with sweet vanilla whipped confectionery cream.",
    price: 10,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80",
  },
  {
    categoryName: "Quick Bites",
    name: "Cream Roll (Monginis)",
    description: "Deluxe bakery pastry horn filled with rich butter cream and powdered sugar.",
    price: 15,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80",
  },
  {
    categoryName: "Quick Bites",
    name: "Suji Toast (3pcs)",
    description: "Crispy roasted semolina rusks baked with subtle cardamom sweetness.",
    price: 10,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
  },
  {
    categoryName: "Quick Bites",
    name: "Punjabi Samosa (4 pcs)",
    description: "Crispy fried pastry triangles filled with spiced cumin potatoes and green peas.",
    price: 50,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    tags: ["Crispy", "Popular"],
  },
  {
    categoryName: "Quick Bites",
    name: "Aaloo Paratha",
    description: "Whole wheat flatbread stuffed with spiced mashed potatoes, griddled with butter and served hot.",
    price: 60,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
  },

  // Page 4: FRIES
  {
    categoryName: "Fries",
    name: "Classic French Fries",
    description: "Golden crisp potato batons tossed in sea salt, served with tangy ketchup.",
    price: 80,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },
  {
    categoryName: "Fries",
    name: "Masalo Fries",
    description: "Crispy golden fries coated with house special chatpata spice blend.",
    price: 90,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },
  {
    categoryName: "Fries",
    name: "Peri Peri Fries",
    description: "Fiery African bird's eye chili spice powder shaken over smoking hot fries.",
    price: 100,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=800&q=80",
    tags: ["Spicy"],
    addOns: standardAddOns,
  },
  {
    categoryName: "Fries",
    name: "Loaded Fries",
    description: "Crispy fries smothered in melted cheddar cheese sauce, jalapenos, and mayo.",
    price: 140,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
    tags: ["Cheesy", "Bestseller"],
    addOns: standardAddOns,
  },

  // Page 4: VEG MOMOS
  {
    categoryName: "Veg Momos",
    name: "Schezwan Momos",
    description: "Tender vegetable dumplings tossed in fiery garlic red schezwan sauce.",
    price: 130,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=800&q=80",
  },
  {
    categoryName: "Veg Momos",
    name: "Mix Veg Momos",
    description: "Handmade dumplings filled with finely chopped cabbage, carrots, onions, and herbs.",
    price: 130,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
  },
  {
    categoryName: "Veg Momos",
    name: "Paneer Momos",
    description: "Delicate dumplings filled with spiced fresh cottage cheese, coriander, and black pepper.",
    price: 140,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=800&q=80",
  },

  // Page 4: VEG WRAPS
  {
    categoryName: "Veg Wraps",
    name: "Paneer Tandoori Wraps",
    description: "Smoky tandoori paneer cubes wrapped in a toasted tortilla with mint chutney and onions.",
    price: 140,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },
  {
    categoryName: "Veg Wraps",
    name: "Paneer Cheese Wraps",
    description: "Creamy cottage cheese loaded with mozzarella, creamy sauce, and crisp bell peppers.",
    price: 150,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },
  {
    categoryName: "Veg Wraps",
    name: "Paneer Peri Peri Wraps",
    description: "Zesty paneer tossed in fiery peri peri seasonings wrapped with crunchy lettuce and dressing.",
    price: 160,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },

  // Page 5: MAGGIE
  {
    categoryName: "Maggie",
    name: "Plain Maggie",
    description: "Simple, nostalgic 2-minute noodles cooked just right with original tastemaker broth.",
    price: 50,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },
  {
    categoryName: "Maggie",
    name: "Masala Maggie",
    description: "Spiced up noodles cooked with onions, tomatoes, green chilies, and coriander.",
    price: 60,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },
  {
    categoryName: "Maggie",
    name: "Cheeze Maggie",
    description: "Creamy noodles topped with an abundance of melted processed cheese and herbs.",
    price: 70,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80",
    tags: ["Cheesy"],
    addOns: standardAddOns,
  },
  {
    categoryName: "Maggie",
    name: "Schezwan Maggie",
    description: "Hot noodles tossed with spicy red schezwan sauce and garlic crunch.",
    price: 70,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },
  {
    categoryName: "Maggie",
    name: "Corn Cheese Maggie",
    description: "Sweet American golden corn kernels folded into hot cheesy noodles.",
    price: 70,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },
  {
    categoryName: "Maggie",
    name: "Veg Maggie",
    description: "Loaded noodle bowl with bell peppers, sweet corn, carrots, beans, and fresh herbs.",
    price: 80,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },

  // Page 5: VEG SANDWICH
  {
    categoryName: "Veg Sandwich",
    name: "Veg Grill Sandwich",
    description: "Double layered bread stuffed with cucumber, tomato, potato, green chutney, and grilled crispy.",
    price: 80,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },
  {
    categoryName: "Veg Sandwich",
    name: "Corn Masala Grill Sandwich",
    description: "Sweet corn tossed with spiced herbs and mint sauce, toasted to golden perfection.",
    price: 80,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },
  {
    categoryName: "Veg Sandwich",
    name: "Cheese Grill Sandwich",
    description: "Gooey mozzarella and cheddar cheese sandwich seasoned with Italian oregano and chili flakes.",
    price: 90,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
    tags: ["Cheesy"],
    addOns: standardAddOns,
  },
  {
    categoryName: "Veg Sandwich",
    name: "Corn Mayo Grill Sandwich",
    description: "Juicy corn kernels blended in creamy eggless mayonnaise with cracked black pepper.",
    price: 90,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },
  {
    categoryName: "Veg Sandwich",
    name: "Paneer Grill Sandwich",
    description: "Marinated cottage cheese slabs layered with mint chutney and grilled crisp.",
    price: 100,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },

  // Page 5: VEG BURGER
  {
    categoryName: "Veg Burger",
    name: "Veg Burger",
    description: "Crispy potato and vegetable patty in a sesame bun with fresh tomato, lettuce, and mayo.",
    price: 70,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },
  {
    categoryName: "Veg Burger",
    name: "Cheese Veg Burger",
    description: "Crunchy veg patty layered with melted cheese slice, tangy sauce, and pickled gherkins.",
    price: 80,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },
  {
    categoryName: "Veg Burger",
    name: "Veg Peri Peri Burger",
    description: "Spicy seasoned veggie patty coated in spicy peri peri glaze and crunchy slaw.",
    price: 100,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },

  // Page 6: VEG PIZZA (Sizes: Small 8in, Medium 9in, Large 10in)
  {
    categoryName: "Veg Pizza",
    name: "Classic Margherita Pizza",
    description: "Hand-stretched crust with San Marzano tomato sauce, fresh basil, and bubbling mozzarella.",
    price: 140,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
    tags: ["Classic"],
    variants: [
      { name: "Small (8in)", price: 140, isAvailable: true },
      { name: "Medium (9in)", price: 160, isAvailable: true },
      { name: "Large (10in)", price: 200, isAvailable: true },
    ],
    addOns: standardAddOns,
  },
  {
    categoryName: "Veg Pizza",
    name: "Golden Corn Pizza",
    description: "Sweet tender corn kernels scattered generously over herb tomato sauce and mozzarella cheese.",
    price: 150,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    variants: [
      { name: "Small (8in)", price: 150, isAvailable: true },
      { name: "Medium (9in)", price: 170, isAvailable: true },
      { name: "Large (10in)", price: 210, isAvailable: true },
    ],
    addOns: standardAddOns,
  },
  {
    categoryName: "Veg Pizza",
    name: "Zesty Schezwan Pizza",
    description: "Fusion crust layered with zesty spicy schezwan gravy, onions, capsicum, and mozzarella.",
    price: 180,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
    variants: [
      { name: "Small (8in)", price: 180, isAvailable: true },
      { name: "Medium (9in)", price: 200, isAvailable: true },
      { name: "Large (10in)", price: 240, isAvailable: true },
    ],
    addOns: standardAddOns,
  },
  {
    categoryName: "Veg Pizza",
    name: "Exotic Veg Pizza",
    description: "Topped with black olives, crisp bell peppers, sweet corn, mushrooms, and mozzarella cheese.",
    price: 190,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
    tags: ["Loaded"],
    variants: [
      { name: "Small (8in)", price: 190, isAvailable: true },
      { name: "Medium (9in)", price: 210, isAvailable: true },
      { name: "Large (10in)", price: 250, isAvailable: true },
    ],
    addOns: standardAddOns,
  },
  {
    categoryName: "Veg Pizza",
    name: "Smoky Tandoori Pizza",
    description: "Marinated tandoori vegetables, smoked paprika sauce, and gooey cheese baked crisp.",
    price: 190,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    variants: [
      { name: "Small (8in)", price: 190, isAvailable: true },
      { name: "Medium (9in)", price: 210, isAvailable: true },
      { name: "Large (10in)", price: 250, isAvailable: true },
    ],
    addOns: standardAddOns,
  },
  {
    categoryName: "Veg Pizza",
    name: "Chatpata Paneer Pizza",
    description: "Spiced paneer tikka chunks with crunchy onions, capsicum, and melted mozzarella.",
    price: 200,
    isVegetarian: true,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
    tags: ["Bestseller"],
    variants: [
      { name: "Small (8in)", price: 200, isAvailable: true },
      { name: "Medium (9in)", price: 230, isAvailable: true },
      { name: "Large (10in)", price: 270, isAvailable: true },
    ],
    addOns: standardAddOns,
  },

  // Page 7: NON-VEG SANDWICH
  {
    categoryName: "Non-Veg Sandwich",
    name: "Grilled egg Sandwich",
    description: "Toasted bread with boiled egg slices, pepper, tomato, and creamy garlic mayonnaise.",
    price: 80,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },
  {
    categoryName: "Non-Veg Sandwich",
    name: "Crispy Chicken Sandwich",
    description: "Golden fried chicken breast fillet with crisp lettuce and creamy sauce in grilled bread.",
    price: 100,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
    tags: ["Bestseller"],
    addOns: standardAddOns,
  },
  {
    categoryName: "Non-Veg Sandwich",
    name: "Crispy Popcorn Sandwich",
    description: "Tender popcorn chicken bites stuffed with spicy mayo, cheese, and crunchy veggies.",
    price: 130,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },

  // Page 7: CHICKEN BURGER
  {
    categoryName: "Chicken Burger",
    name: "Classic Chicken Burger",
    description: "Juicy chicken patty grilled with fresh herbs, crisp lettuce, tomato, and burger relish.",
    price: 80,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },
  {
    categoryName: "Chicken Burger",
    name: "Ccrunchy Pop Burger",
    description: "Crispy battered chicken cutlet topped with spicy coleslaw and melted cheese.",
    price: 140,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },
  {
    categoryName: "Chicken Burger",
    name: "Chicken Peri Peri Burger",
    description: "Spicy peri peri marinated chicken fillet topped with chili mayo and crisp gherkins.",
    price: 160,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    tags: ["Spicy"],
    addOns: standardAddOns,
  },
  {
    categoryName: "Chicken Burger",
    name: "Crispy Zinger Burger",
    description: "Signature whole crunchy fried chicken thigh with secret pepper breading and house dressing.",
    price: 200,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80",
    tags: ["Signature", "Bestseller"],
    addOns: standardAddOns,
  },
  {
    categoryName: "Chicken Burger",
    name: "Chicken Cheese Burger",
    description: "Double melted cheese slices over tender grilled chicken patty with caramelized onions.",
    price: 150,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    tags: ["Cheesy"],
    addOns: standardAddOns,
  },

  // Page 8: CHICKEN WRAPS
  {
    categoryName: "Chicken Wraps",
    name: "Chicken Crispy Wraps",
    description: "Crispy golden fried chicken strips rolled in a tortilla with garlic sauce and greens.",
    price: 140,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },
  {
    categoryName: "Chicken Wraps",
    name: "Chicken Tandoor Wraps",
    description: "Charcoal roasted spiced tandoori chicken pieces with pickled onion rings and mint dip.",
    price: 150,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },
  {
    categoryName: "Chicken Wraps",
    name: "Chicken Mayo Wraps",
    description: "Shredded chicken tossed in sweet-savory herb mayonnaise rolled with fresh cucumber.",
    price: 150,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },
  {
    categoryName: "Chicken Wraps",
    name: "Chicken Cheese Wraps",
    description: "Warm wrap stuffed with tender chicken chunks, melted cheese, and barbecue drizzle.",
    price: 160,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },
  {
    categoryName: "Chicken Wraps",
    name: "Chicken Peri Peri Wraps",
    description: "Fiery peri peri spiced chicken folded in a toasted flatbread with lettuce and chili mayo.",
    price: 160,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
    addOns: standardAddOns,
  },

  // Page 8: FRIED CHICKEN MOMOS
  {
    categoryName: "Fried Chicken Momos",
    name: "Chicken Momos",
    description: "Crispy fried dumplings stuffed with spiced juicy minced chicken and ginger-garlic.",
    price: 120,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=800&q=80",
    tags: ["Hot & Crispy"],
  },

  // Page 8: NON-VEG BREAKFAST
  {
    categoryName: "Non-Veg Breakfast",
    name: "Anda Bhurji",
    description: "Country eggs scrambled with onions, tomatoes, green chilies, and coriander, served with pav/bread.",
    price: 80,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
  },
  {
    categoryName: "Non-Veg Breakfast",
    name: "Bread Omelette",
    description: "Fluffy 2-egg spiced herb omelette toasted around buttery golden bread slices.",
    price: 80,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    tags: ["Breakfast Favorite"],
  },
  {
    categoryName: "Non-Veg Breakfast",
    name: "Boiled Egg",
    description: "Two farm-fresh eggs hard boiled and dusted with roasted pepper and rock salt.",
    price: 40,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&w=800&q=80",
  },
  {
    categoryName: "Non-Veg Breakfast",
    name: "Egg Fry",
    description: "Sunny side up or double-fried egg with crispy edges and molten seasoned yolk.",
    price: 50,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
  },

  // Page 9: CHICKEN PIZZA (Sizes: Small 8in, Medium 9in, Large 10in)
  {
    categoryName: "Chicken Pizza",
    name: "Regular Chicken Pizza",
    description: "Handcrafted stone-baked pizza loaded with tender seasoned chicken chunks and mozzarella.",
    price: 220,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    variants: [
      { name: "Small (8in)", price: 220, isAvailable: true },
      { name: "Medium (9in)", price: 240, isAvailable: true },
      { name: "Large (10in)", price: 260, isAvailable: true },
    ],
    addOns: standardAddOns,
  },
  {
    categoryName: "Chicken Pizza",
    name: "Schezwan Chicken Pizza",
    description: "Spicy oriental schezwan sauce base topped with diced chicken, bell peppers, and cheese.",
    price: 320,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
    variants: [
      { name: "Small (8in)", price: 320, isAvailable: true },
      { name: "Medium (9in)", price: 340, isAvailable: true },
      { name: "Large (10in)", price: 360, isAvailable: true },
    ],
    addOns: standardAddOns,
  },
  {
    categoryName: "Chicken Pizza",
    name: "Tandoori Chicken Pizza",
    description: "Clay-oven spiced roasted chicken chunks, onion rings, capsicum, and smoky cheese.",
    price: 320,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
    variants: [
      { name: "Small (8in)", price: 320, isAvailable: true },
      { name: "Medium (9in)", price: 340, isAvailable: true },
      { name: "Large (10in)", price: 360, isAvailable: true },
    ],
    addOns: standardAddOns,
  },
  {
    categoryName: "Chicken Pizza",
    name: "Loaded Special Chicken Pizza",
    description: "Ultimate carnivore pizza loaded with double chicken, sausage slices, extra cheese, and herbs.",
    price: 330,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
    tags: ["Chef Special", "Bestseller"],
    variants: [
      { name: "Small (8in)", price: 330, isAvailable: true },
      { name: "Medium (9in)", price: 350, isAvailable: true },
      { name: "Large (10in)", price: 370, isAvailable: true },
    ],
    addOns: standardAddOns,
  },

  // Page 9: FRIED CHICKEN (Sizes/Portions: Small, Medium, Large)
  {
    categoryName: "Fried Chicken",
    name: "Crispy Chicken Popcorn",
    description: "Bite-sized tender chicken breast pieces in seasoned crunchy breading with garlic dip.",
    price: 130,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
    tags: ["Crunchy", "Bestseller"],
    variants: [
      { name: "Small (100g)", price: 130, isAvailable: true },
      { name: "Medium (200g)", price: 240, isAvailable: true },
      { name: "Large (300g)", price: 370, isAvailable: true },
    ],
  },
  {
    categoryName: "Fried Chicken",
    name: "Crispy Chicken Strips",
    description: "Boneless hand-breaded chicken breast tenders fried to a deep golden crisp.",
    price: 180,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
    variants: [
      { name: "Small (4pcs)", price: 180, isAvailable: true },
      { name: "Medium (8pcs)", price: 350, isAvailable: true },
      { name: "Large (12pcs)", price: 490, isAvailable: true },
    ],
  },
  {
    categoryName: "Fried Chicken",
    name: "Chicken Legs Crispy",
    description: "Juicy bone-in chicken drumsticks marinated in buttermilk and spices with crunchy skin.",
    price: 170,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
    variants: [
      { name: "Small (2pcs)", price: 170, isAvailable: true },
      { name: "Medium (4pcs)", price: 330, isAvailable: true },
      { name: "Large (6pcs)", price: 490, isAvailable: true },
    ],
  },
  {
    categoryName: "Fried Chicken",
    name: "Chicken Wings Crispy",
    description: "Crunchy golden chicken wings tossed in secret pepper spice, served with ranch or hot sauce.",
    price: 170,
    isVegetarian: false,
    image: "https://images.unsplash.com/photo-1527477378408-1bc8b44983a0?auto=format&fit=crop&w=800&q=80",
    variants: [
      { name: "Small (3pcs)", price: 170, isAvailable: true },
      { name: "Medium (6pcs)", price: 330, isAvailable: true },
      { name: "Large (9pcs)", price: 480, isAvailable: true },
    ],
  },
];

export const importRealCafeMenu = async () => {
  try {
    await connectDB();
    console.log("[Menu Import] Connected to MongoDB Atlas.");

    // Resolve Cafe
    let cafe = await Cafe.findOne();
    if (!cafe) {
      console.log("[Menu Import] No existing cafe found. Creating default BrewBuddies cafe...");
      cafe = await Cafe.create({
        name: "BrewBuddies Cafe",
        slug: "brewbuddies-kopargaon",
        address: "Sanika Plaza, Dharangaon Road, Kopargaon, Ahilyanagar, Maharashtra – 423601",
        phone: "+91 8275115011",
        email: "contact@brewbuddies.com",
        currency: "₹",
        taxRate: 5,
        isActive: true,
      });
    } else {
      // Update address & phone to match genuine cafe details from PDF
      cafe.address = "Sanika Plaza, Dharangaon Road, Kopargaon, Ahilyanagar, Maharashtra – 423601";
      cafe.phone = "+91 8275115011";
      await cafe.save();
      console.log(`[Menu Import] Using Cafe: ${cafe.name} (${cafe._id})`);
    }

    // 1. Safe Idempotent Upsert of Categories
    const categoryMap = new Map();
    for (const catData of categoriesData) {
      const category = await Category.findOneAndUpdate(
        { name: catData.name },
        {
          name: catData.name,
          icon: catData.icon,
          displayOrder: catData.displayOrder,
          description: catData.description,
          isActive: true,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      categoryMap.set(catData.name, category._id);
    }
    console.log(`[Menu Import] Upserted ${categoryMap.size} categories.`);

    // 2. Safe Idempotent Upsert of Products
    let createdCount = 0;
    let updatedCount = 0;

    for (const p of productsData) {
      const catId = categoryMap.get(p.categoryName);
      if (!catId) {
        console.warn(`[Menu Import] Category not found for product: ${p.name}`);
        continue;
      }

      const existing = await Product.findOne({
        cafeId: cafe._id,
        name: p.name,
      });

      const updatePayload = {
        cafeId: cafe._id,
        name: p.name,
        category: catId,
        description: p.description,
        price: p.price,
        image: p.image,
        isVegetarian: p.isVegetarian,
        isAvailable: true,
        tags: p.tags || [],
        variants: p.variants || [],
        addOns: p.addOns || [],
        preparationTimeMinutes: 12,
      };

      if (existing) {
        await Product.findByIdAndUpdate(existing._id, updatePayload);
        updatedCount++;
      } else {
        await Product.create(updatePayload);
        createdCount++;
      }
    }

    console.log(`[Menu Import] Menu import completed! Created: ${createdCount}, Updated: ${updatedCount}`);
    console.log(`[Menu Import] Total real menu items now: ${await Product.countDocuments({ cafeId: cafe._id })}`);
    
    return { success: true, createdCount, updatedCount };
  } catch (error) {
    console.error("[Menu Import] Fatal error during safe menu import:", error);
    throw error;
  }
};

// If run directly from terminal
if (process.argv[1] && process.argv[1].endsWith("importRealMenu.js")) {
  importRealCafeMenu()
    .then(() => {
      console.log("[Menu Import] Successfully finished.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("[Menu Import] Failed:", err);
      process.exit(1);
    });
}
