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

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: 'admin@odanext.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Email: admin@odanext.com');
      console.log('Password: Admin@123');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@odanext.com',
      password: hashedPassword,
      avatar: '',
      role: 'admin',
      preferences: {
        favoriteStyles: ['Modern', 'Luxury'],
        defaultBudget: 500000,
        preferredColors: ['Dark', 'Neutral'],
      },
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@odanext.com');
    console.log('Password: Admin@123');
    console.log('User ID:', admin._id);

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
