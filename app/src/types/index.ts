export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  specifications: string | null;
  image: string | null;
  images: string | null;
  categoryId: number;
  subcategoryId: number | null;
  carBrand: string;
  carModel: string;
  yearFrom: number | null;
  yearTo: number | null;
  engineVariant: string | null;
  condition: "new" | "used";
  qualityType: "genuine" | "oem" | "aftermarket";
  purchasePrice: string;
  sellingPrice: string;
  marketPriceMin: string | null;
  marketPriceMax: string | null;
  stockQuantity: number;
  minStockAlert: number;
  supplierName: string | null;
  warranty: string | null;
  returnPolicy: string | null;
  featured: boolean;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  createdAt: Date;
  subcategories?: Subcategory[];
  productCount?: number;
}

export interface Subcategory {
  id: number;
  categoryId: number;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
  createdAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number | null;
  fullName: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  address: string;
  city: string;
  deliveryMethod: "pickup" | "local_delivery" | "courier";
  paymentMethod: "easypaisa" | "jazzcash" | "bank_transfer" | "cod";
  paymentStatus: "pending" | "verified" | "rejected";
  subtotal: string;
  deliveryCharge: string;
  serviceFee: string;
  grandTotal: string;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productImage: string | null;
  sku: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  createdAt: Date;
}

export interface VehicleBrand {
  name: string;
  models: string[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface WebsiteSettings {
  [key: string]: string;
}

export const VEHICLE_BRANDS: VehicleBrand[] = [
  { name: "Toyota", models: ["Corolla", "Yaris", "Vitz", "Aqua", "Prius", "Fortuner", "Hilux", "Prado"] },
  { name: "Honda", models: ["Civic", "City", "BR-V", "HR-V", "Vezel", "Accord"] },
  { name: "Suzuki", models: ["Alto", "Cultus", "Swift", "Wagon R", "Mehran", "Bolan", "Ravi"] },
  { name: "Hyundai", models: ["Elantra", "Sonata", "Tucson", "Santa Fe"] },
  { name: "Kia", models: ["Sportage", "Picanto", "Stonic", "Sorento"] },
  { name: "Nissan", models: ["Dayz", "Note", "Juke", "Sunny", "Patrol"] },
  { name: "BMW", models: ["3 Series", "5 Series"] },
  { name: "Mercedes", models: ["C-Class", "E-Class"] },
  { name: "Audi", models: ["A3", "A4", "A6"] },
  { name: "Mazda", models: ["3", "6", "CX-5"] },
  { name: "Mitsubishi", models: ["Lancer", "Pajero", "Attrage"] },
];

export const YEARS = Array.from({ length: 25 }, (_, i) => 2024 - i);

export const CATEGORY_SLUGS: Record<string, string> = {
  "engine-parts": "Engine Parts",
  "brake-system": "Brake System",
  "suspension-parts": "Suspension Parts",
  "electrical-parts": "Electrical Parts",
  "lights": "Lights",
  "body-parts": "Body Parts",
  "oils-fluids": "Oils & Fluids",
  "accessories": "Accessories",
};

export const SUBCATEGORY_DESCRIPTIONS: Record<string, string> = {
  "oil-filters": "Keep your engine clean with quality oil filters for all car brands",
  "air-filters": "Ensure clean airflow to your engine with premium air filters",
  "brake-pads": "High-quality brake pads for safe and reliable stopping power",
  "shock-absorbers": "Smooth out your ride with durable shock absorbers",
  "batteries": "Reliable car batteries with warranty for all vehicle types",
  "headlights": "Bright and clear headlights for safe night driving",
  "side-mirrors": "Quality replacement side mirrors for all car models",
  "engine-oil": "Premium engine oils for optimal performance and protection",
};
