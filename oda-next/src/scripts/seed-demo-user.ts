import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  preferences: {
    favoriteStyles: [String],
    defaultBudget: { type: Number, default: 0 },
    preferredColors: [String],
  },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedDemoUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    const existingUser = await User.findOne({ email: 'demo@odanext.com' });
    if (existingUser) {
      console.log('Demo user already exists');
      console.log('Email: demo@odanext.com');
      console.log('Password: Demo@123');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Demo@123', 10);

    const demoUser = await User.create({
      name: 'Demo User',
      email: 'demo@odanext.com',
      password: hashedPassword,
      avatar: '',
      role: 'user',
      preferences: {
        favoriteStyles: ['Modern', 'Minimalist'],
        defaultBudget: 200000,
        preferredColors: ['Neutral', 'Warm'],
      },
    });

    console.log('Demo user created successfully!');
    console.log('Email: demo@odanext.com');
    console.log('Password: Demo@123');
    console.log('User ID:', demoUser._id);

    process.exit(0);
  } catch (error) {
    console.error('Error creating demo user:', error);
    process.exit(1);
  }
}

seedDemoUser();
