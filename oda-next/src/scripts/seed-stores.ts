import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined in .env.local");
  process.exit(1);
}

interface SeedStore {
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  website: string;
  category: string;
  rating: number;
  openingHours: string;
}

const stores: SeedStore[] = [
  // MUMBAI (5)
  {
    name: "IKEA India - Navi Mumbai",
    address: "Plot No. 30/1, Navi Mumbai, Maharashtra 400703",
    lat: 19.033,
    lng: 73.0297,
    phone: "+91 22 6160 0001",
    website: "https://www.ikea.com/in/en/stores/navi-mumbai/",
    category: "Furniture Store",
    rating: 4.5,
    openingHours: "10:00 AM - 10:00 PM",
  },
  {
    name: "Pepperfry Studio - Bandra",
    address: "Ground Floor, Bandra West, Mumbai, Maharashtra 400050",
    lat: 19.0596,
    lng: 72.8295,
    phone: "+91 22 4604 5555",
    website: "https://www.pepperfry.com/studio/bandra.html",
    category: "Furniture Store",
    rating: 4.3,
    openingHours: "10:30 AM - 9:30 PM",
  },
  {
    name: "HomeTown - Lower Parel",
    address: "Palladium Mall, Lower Parel, Mumbai, Maharashtra 400013",
    lat: 19.0118,
    lng: 72.8347,
    phone: "+91 22 6105 0505",
    website: "https://www.hometown.in/",
    category: "Home Decor",
    rating: 4.1,
    openingHours: "10:00 AM - 10:00 PM",
  },
  {
    name: "Godrej Interio - Andheri",
    address: "Link Road, Andheri West, Mumbai, Maharashtra 400053",
    lat: 19.1364,
    lng: 72.8296,
    phone: "+91 22 2673 1234",
    website: "https://www.godrejinterio.com/",
    category: "Furniture Store",
    rating: 4.4,
    openingHours: "10:00 AM - 9:00 PM",
  },
  {
    name: "Urban Ladder - Powai",
    address: "Galleria Shopping Mall, Hiranandani, Powai, Mumbai 400076",
    lat: 19.1197,
    lng: 72.9071,
    phone: "+91 22 4034 6789",
    website: "https://www.urbanladder.com/",
    category: "Furniture Store",
    rating: 4.6,
    openingHours: "10:30 AM - 9:30 PM",
  },

  // DELHI (5)
  {
    name: "IKEA India - Noida",
    address: "Plot 28, Sector 16A, Noida, Uttar Pradesh 201301",
    lat: 28.5802,
    lng: 77.3184,
    phone: "+91 120 616 0001",
    website: "https://www.ikea.com/in/en/stores/noida/",
    category: "Furniture Store",
    rating: 4.6,
    openingHours: "10:00 AM - 10:00 PM",
  },
  {
    name: "Pepperfry Studio - Saket",
    address: "Select Citywalk Mall, Saket, New Delhi 110017",
    lat: 28.5289,
    lng: 77.219,
    phone: "+91 11 4604 5555",
    website: "https://www.pepperfry.com/studio/saket.html",
    category: "Furniture Store",
    rating: 4.4,
    openingHours: "10:30 AM - 9:30 PM",
  },
  {
    name: "HomeTown - Lajpat Nagar",
    address: "Central Market, Lajpat Nagar II, New Delhi 110024",
    lat: 28.5733,
    lng: 77.2344,
    phone: "+91 11 6105 0505",
    website: "https://www.hometown.in/",
    category: "Home Decor",
    rating: 4.2,
    openingHours: "10:00 AM - 9:30 PM",
  },
  {
    name: "FabIndia - Khan Market",
    address: "Block B, Khan Market, Rabindra Nagar, New Delhi 110003",
    lat: 28.6001,
    lng: 77.2271,
    phone: "+91 11 2463 1020",
    website: "https://www.fabindia.com/",
    category: "Home Decor",
    rating: 4.5,
    openingHours: "10:30 AM - 9:00 PM",
  },
  {
    name: "Godrej Interio - Nehru Place",
    address: "Eros Building, Nehru Place, New Delhi 110019",
    lat: 28.5491,
    lng: 77.2534,
    phone: "+91 11 2644 5678",
    website: "https://www.godrejinterio.com/",
    category: "Furniture Store",
    rating: 4.3,
    openingHours: "10:00 AM - 9:00 PM",
  },

  // BANGALORE (5)
  {
    name: "IKEA India - Nagawara",
    address: "Nagawara Village, Thanisandra Main Road, Bangalore 560077",
    lat: 13.0359,
    lng: 77.5971,
    phone: "+91 80 616 0001",
    website: "https://www.ikea.com/in/en/stores/bangalore/",
    category: "Furniture Store",
    rating: 4.7,
    openingHours: "10:00 AM - 10:00 PM",
  },
  {
    name: "Pepperfry Studio - Indiranagar",
    address: "100 Feet Road, Indiranagar, Bangalore 560038",
    lat: 12.9784,
    lng: 77.6408,
    phone: "+91 80 4604 5555",
    website: "https://www.pepperfry.com/studio/indiranagar.html",
    category: "Furniture Store",
    rating: 4.5,
    openingHours: "10:30 AM - 9:30 PM",
  },
  {
    name: "Urban Ladder - Koramangala",
    address: "62/1, 80 Feet Road, Koramangala IV Block, Bangalore 560034",
    lat: 12.9352,
    lng: 77.6245,
    phone: "+91 80 4034 6789",
    website: "https://www.urbanladder.com/",
    category: "Furniture Store",
    rating: 4.4,
    openingHours: "10:30 AM - 9:30 PM",
  },
  {
    name: "Curtain Wonderland - Jayanagar",
    address: "4th Block, Jayanagar, Bangalore 560041",
    lat: 12.9279,
    lng: 77.5885,
    phone: "+91 80 2654 3210",
    website: "https://www.curtainwonderland.in/",
    category: "Curtains",
    rating: 4.3,
    openingHours: "10:00 AM - 8:30 PM",
  },
  {
    name: "Sleepwell - Whitefield",
    address: "Phoenix Marketcity, Whitefield, Bangalore 560066",
    lat: 12.9973,
    lng: 77.7486,
    phone: "+91 80 3987 6543",
    website: "https://www.sleepwell.in/",
    category: "Mattress",
    rating: 4.2,
    openingHours: "10:30 AM - 9:30 PM",
  },

  // CHENNAI (3)
  {
    name: "IKEA India - Nungambakkam",
    address: "Nungambakkam High Road, Chennai, Tamil Nadu 600034",
    lat: 13.0604,
    lng: 80.2496,
    phone: "+91 44 616 0001",
    website: "https://www.ikea.com/in/en/stores/chennai/",
    category: "Furniture Store",
    rating: 4.4,
    openingHours: "10:00 AM - 10:00 PM",
  },
  {
    name: "Pepperfry Studio - T. Nagar",
    address: "Usman Road, T. Nagar, Chennai, Tamil Nadu 600017",
    lat: 13.0418,
    lng: 80.2341,
    phone: "+91 44 4604 5555",
    website: "https://www.pepperfry.com/studio/chennai.html",
    category: "Furniture Store",
    rating: 4.3,
    openingHours: "10:30 AM - 9:00 PM",
  },
  {
    name: "HomeTown - Velachery",
    address: "Velachery Main Road, Velachery, Chennai 600042",
    lat: 12.9815,
    lng: 80.218,
    phone: "+91 44 6105 0505",
    website: "https://www.hometown.in/",
    category: "Home Decor",
    rating: 4.1,
    openingHours: "10:00 AM - 9:30 PM",
  },

  // HYDERABAD (3)
  {
    name: "IKEA India - HITEC City",
    address: "Sy. No. 81/1, HITEC City, Hyderabad, Telangana 500081",
    lat: 17.4401,
    lng: 78.3489,
    phone: "+91 40 616 0001",
    website: "https://www.ikea.com/in/en/stores/hyderabad/",
    category: "Furniture Store",
    rating: 4.6,
    openingHours: "10:00 AM - 10:00 PM",
  },
  {
    name: "Pepperfry Studio - Banjara Hills",
    address: "Road No. 12, Banjara Hills, Hyderabad, Telangana 500034",
    lat: 17.4156,
    lng: 78.4347,
    phone: "+91 40 4604 5555",
    website: "https://www.pepperfry.com/studio/hyderabad.html",
    category: "Furniture Store",
    rating: 4.4,
    openingHours: "10:30 AM - 9:30 PM",
  },
  {
    name: "Urban Ladder - Gachibowli",
    address: "Cyber Towers, Gachibowli, Hyderabad, Telangana 500032",
    lat: 17.4486,
    lng: 78.3502,
    phone: "+91 40 4034 6789",
    website: "https://www.urbanladder.com/",
    category: "Furniture Store",
    rating: 4.5,
    openingHours: "10:30 AM - 9:30 PM",
  },

  // PUNE (3)
  {
    name: "IKEA India - Wakad",
    address: "Wakad-Pimpri Road, Pune, Maharashtra 411057",
    lat: 18.5993,
    lng: 73.7601,
    phone: "+91 20 616 0001",
    website: "https://www.ikea.com/in/en/stores/pune/",
    category: "Furniture Store",
    rating: 4.5,
    openingHours: "10:00 AM - 10:00 PM",
  },
  {
    name: "Pepperfry Studio - Kothrud",
    address: "Karve Road, Kothrud, Pune, Maharashtra 411038",
    lat: 18.5074,
    lng: 73.8077,
    phone: "+91 20 4604 5555",
    website: "https://www.pepperfry.com/studio/pune.html",
    category: "Furniture Store",
    rating: 4.3,
    openingHours: "10:30 AM - 9:30 PM",
  },
  {
    name: "Nilkamal Furniture - Viman Nagar",
    address: "Airport Road, Viman Nagar, Pune, Maharashtra 411014",
    lat: 18.5679,
    lng: 73.9143,
    phone: "+91 20 2605 4321",
    website: "https://www.nilkamal.com/",
    category: "Furniture Store",
    rating: 4.2,
    openingHours: "10:00 AM - 9:00 PM",
  },
];

async function seedStores() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected to MongoDB successfully.");

  const StoreSchema = new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
      phone: { type: String, default: "" },
      website: { type: String, default: "" },
      category: { type: String, required: true, trim: true },
      rating: { type: Number, min: 0, max: 5, default: 0 },
      openingHours: { type: String, default: "" },
    },
    { timestamps: true }
  );

  const StoreModel =
    mongoose.models.Store || mongoose.model("Store", StoreSchema);

  console.log("Clearing existing stores...");
  await StoreModel.deleteMany({});

  console.log(`Inserting ${stores.length} stores...`);
  const result = await StoreModel.insertMany(stores);
  console.log(`Successfully inserted ${result.length} stores.`);

  const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune"];
  for (const city of cities) {
    const count = stores.filter(
      (s) =>
        s.address.toLowerCase().includes(city.toLowerCase()) ||
        s.address.includes(city.slice(0, 4))
    ).length;
    console.log(`  ${city}: ${count} stores`);
  }

  const categories = [...new Set(stores.map((s) => s.category))];
  console.log(`\nStore categories: ${categories.join(", ")}`);

  await mongoose.disconnect();
  console.log("\nStore seeding completed. Disconnected from MongoDB.");
}

seedStores().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
