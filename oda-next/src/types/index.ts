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
  windows: string[];
  doors: string[];
  lighting: string;
  emptyAreas: string[];
  proportions: {
    width: number;
    height: number;
    length: number;
  };
}

export interface AIDesign {
  _id: string;
  projectId: string;
  style: string;
  mood: string;
  color: string;
  budget: number;
  generatedImages: string[];
  hotspots: Hotspot[];
}

export interface Hotspot {
  x: number;
  y: number;
  label: string;
  description: string;
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
  quantity: number;
  price: number;
  store: string;
  productLink: string;
  checked: boolean;
}

export interface Store {
  _id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  website: string;
  category: string;
  rating: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
