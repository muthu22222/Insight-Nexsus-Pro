import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const cloudinary = (await import('@/config/cloudinary')).default;
      const result = await cloudinary.uploader.upload(base64String, {
        folder: 'oda-next/rooms',
        resource_type: 'image',
      });

      return NextResponse.json({
        success: true,
        data: {
          imageUrl: result.secure_url,
          publicId: result.public_id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: base64String,
        publicId: `local-${Date.now()}`,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
