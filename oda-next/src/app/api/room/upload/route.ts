import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      );
    }

    const uniqueId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/jpeg';
    const base64String = `data:${mimeType};base64,${buffer.toString('base64')}`;

    // 1. Cloudinary storage if configured
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const cloudinary = (await import('@/config/cloudinary')).default;
      const result = await cloudinary.uploader.upload(base64String, {
        folder: 'oda-next/rooms',
        public_id: uniqueId,
        resource_type: 'image',
        overwrite: true,
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            imageUrl: result.secure_url,
            imageId: uniqueId,
            publicId: result.public_id,
            timestamp: Date.now(),
          },
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        }
      );
    }

    // 2. Save locally into public/uploads/rooms/ for fast static serving
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'rooms');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, `${uniqueId}.jpg`);
      fs.writeFileSync(filePath, buffer);

      const localUrl = `/uploads/rooms/${uniqueId}.jpg`;

      return NextResponse.json(
        {
          success: true,
          data: {
            imageUrl: localUrl,
            imageBase64: base64String,
            imageId: uniqueId,
            publicId: uniqueId,
            timestamp: Date.now(),
          },
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        }
      );
    } catch (saveErr) {
      console.warn('Failed to save to local uploads dir, using base64:', saveErr);
      return NextResponse.json(
        {
          success: true,
          data: {
            imageUrl: base64String,
            imageId: uniqueId,
            publicId: uniqueId,
            timestamp: Date.now(),
          },
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        }
      );
    }
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: message },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
