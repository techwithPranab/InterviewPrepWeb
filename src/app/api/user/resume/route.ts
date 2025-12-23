import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/middleware/auth';
import dbConnect from '@/lib/db/connection';
import User from '@/lib/models/User';
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateToken(request);
    if (!auth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (auth as any).decoded.userId;

    const formData = await request.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only PDF and Word documents are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = path.extname(file.name);
    const filename = `${timestamp}-${randomString}${extension}`;
    const filepath = path.join(uploadsDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Update user with resume path
    await dbConnect();
    const user = await User.findByIdAndUpdate(
      userId,
      {
        'profile.resume': {
          filename: filename,
          originalName: file.name,
          filePath: filename,
          uploadDate: new Date()
        }
      },
      { new: true }
    ).select('-password');

    return NextResponse.json({
      message: 'Resume uploaded successfully',
      user
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload resume' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = authenticateToken(request);
    if (!auth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (auth as any).decoded.userId;

    await dbConnect();
    const user = await User.findById(userId);

    if (!user || !user.profile?.resume) {
      return NextResponse.json({ error: 'No resume found' }, { status: 404 });
    }

    // Delete file from disk
    const filepath = path.join(process.cwd(), 'uploads', user.profile.resume.filePath);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    // Remove resume from user document
    user.profile.resume = undefined;
    await user.save();

    return NextResponse.json({
      message: 'Resume deleted successfully'
    });

  } catch (error) {
    console.error('Resume delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete resume' },
      { status: 500 }
    );
  }
}
