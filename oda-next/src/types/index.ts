export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
  preferences: DesignPreferences;
  createdAt: string;
}

export interface DesignPreferences {
  style: string;
  furnitureStyle?: string;
  mood: string;
  color: string;
  budget: number;
}

export interface Project {
  _id: string;
  userId: string;
  name: string;
  roomImage: string;
  roomAnalysis: RoomAnalysis | null;
  designs: AIDesign[];
  selectedDesign: string | null;
  furniture: FurnitureItem[];
  budgetPlan: BudgetPlan | null;
  shoppingList: ShoppingListItem[];
  status: "draft" | "analyzing" | "designing" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface RoomAnalysis {
  roomType: string;
  wallColor: string;
  flooring: string;
  ceiling: string;
  furniture: string[];
  existingFurniture?: Array<{
    item: string;
    placement: string;
    action?: 'preserve' | 'upgrade' | 'replace';
  }>;
  suggestedFurniture?: string[];
  isEmptyRoom?: boolean;
  perspective?: string;
  windows: string | string[];
  doors: string | string[];
  lighting: string;
  emptyAreas: string[];
  proportions:
    | {
        width?: number;
        height?: number;
        length?: number;
      }
    | string;
}

export interface AIDesign {
  _id: string;
  projectId: string;
  style: string;
  furnitureStyle?: string;
  mood: string;
  color: string;
  budget: number;
  description?: string;
  generatedImages: string[];
  hotspots: Hotspot[];
}

export interface Hotspot {
  id?: string | number;
  x: number;
  y: number;
  label: string;
  category?: string;
  description: string;
  price?: string;
  store?: string;
  brand?: string;
  material?: string;
  productUrl?: string;
  amazonUrl?: string | null;
  flipkartUrl?: string | null;
  image?: string;
  match?: number;
  furnitureId?: string;
}

export interface FurnitureItem {
  _id: string;
  productName: string;
  category: string;
  brand: string;
  price: number;
  image: string;
  storeName: string;
  productUrl: string;
  amazonUrl?: string | null;
  flipkartUrl?: string | null;
  style: string;
  rating: number;
  description: string;
  inStock: boolean;
}

export interface BudgetPlan {
  totalBudget: number;
  allocations: BudgetAllocation[];
  remaining: number;
}

export interface BudgetAllocation {
  category: string;
  amount: number;
  percentage: number;
}

export interface ShoppingListItem {
  furnitureId: string;
  productName?: string;
  category?: string;
  quantity: number;
  price: number;
  store: string;
  productLink: string;
  amazonUrl?: string | null;
  flipkartUrl?: string | null;
  checked: boolean;
}

export interface Store {
  _id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  city?: string;
  category?: string;
  phone?: string;
  website?: string;
  timings?: string;
  openingHours?: string;
  storeUrl?: string;
  distance?: number;
  location?: {
    type?: string;
    coordinates?: [number, number];
  };
  source?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
