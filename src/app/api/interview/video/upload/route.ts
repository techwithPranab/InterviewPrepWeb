import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const sessionId = formData.get('sessionId') as string;
    const questionId = formData.get('questionId') as string;

    if (!videoFile) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }

    if (!sessionId || !questionId) {
      return NextResponse.json(
        { error: 'Session ID and Question ID are required' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'video');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = videoFile.name.split('.').pop() || 'webm';
    const filename = `${sessionId}_${questionId}_${timestamp}_${randomString}.${extension}`;
    const filepath = path.join(uploadsDir, filename);

    // Convert File to Buffer and save
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    const videoUrl = `/uploads/video/${filename}`;

    console.log(`Video uploaded successfully: ${filename}, size: ${buffer.length} bytes`);

    return NextResponse.json({
      success: true,
      videoUrl,
      filename,
      size: buffer.length,
      message: 'Video uploaded successfully'
    });

  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload video',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
