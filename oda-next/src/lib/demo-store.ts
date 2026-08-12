import bcrypt from 'bcryptjs';

export interface DemoUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  avatar: string;
  role: 'user' | 'admin';
  preferences: {
    favoriteStyles: string[];
    defaultBudget: number;
    preferredColors: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const demoUsers: DemoUser[] = [];

let initialized = false;

async function initializeDemoUsers() {
  if (initialized) return;
  initialized = true;

  const demoPassword = await bcrypt.hash('Demo@123', 10);
  const adminPassword = await bcrypt.hash('Admin@123', 10);

  demoUsers.push({
    _id: 'demo-user-001',
    name: 'Demo User',
    email: 'demo@odanext.com',
    password: demoPassword,
    avatar: '',
    role: 'user',
    preferences: {
      favoriteStyles: ['Modern', 'Minimalist'],
      defaultBudget: 200000,
      preferredColors: ['Neutral', 'Warm'],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  demoUsers.push({
    _id: 'demo-admin-001',
    name: 'Admin',
    email: 'admin@odanext.com',
    password: adminPassword,
    avatar: '',
    role: 'admin',
    preferences: {
      favoriteStyles: ['Modern', 'Luxury'],
      defaultBudget: 500000,
      preferredColors: ['Dark', 'Neutral'],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export function isDemoMode(): boolean {
  return !process.env.MONGODB_URI;
}

export async function findDemoUserByEmail(email: string): Promise<DemoUser | null> {
  await initializeDemoUsers();
  return demoUsers.find(u => u.email === email.toLowerCase()) || null;
}

export async function findDemoUserById(id: string): Promise<DemoUser | null> {
  await initializeDemoUsers();
  return demoUsers.find(u => u._id === id) || null;
}

export async function createDemoUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<DemoUser> {
  await initializeDemoUsers();

  const existing = demoUsers.find(u => u.email === data.email.toLowerCase());
  if (existing) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser: DemoUser = {
    _id: `demo-user-${Date.now()}`,
    name: data.name,
    email: data.email.toLowerCase(),
    password: hashedPassword,
    avatar: '',
    role: 'user',
    preferences: {
      favoriteStyles: [],
      defaultBudget: 0,
      preferredColors: [],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  demoUsers.push(newUser);
  return newUser;
}

export function sanitizeDemoUser(user: DemoUser) {
  const { password, ...safe } = user;
  return safe;
}
