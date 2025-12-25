import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { authenticateToken } from '@/lib/middleware/auth';
import mongoose from 'mongoose';

// Import the template model from the route file
const InterviewTemplate = mongoose.models.InterviewTemplate;

interface PageParams {
  params: Promise<{ id: string }>;
}

// GET - Get specific template
export async function GET(request: NextRequest, { params }: PageParams) {
  try {
    await connectDB();

    // Authenticate user
    const auth = authenticateToken(request);
    if (!auth.success) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = (auth as any).decoded.userId;
    const userRole = (auth as any).decoded.role;

    // Check if user is interviewer or admin
    if (userRole !== 'interviewer' && userRole !== 'admin') {
      return NextResponse.json(
        { message: 'Access denied. Interviewer role required.' },
        { status: 403 }
      );
    }

    // Get template (only if created by user or is default)
    const template = await InterviewTemplate.findOne({
      _id: id,
      $or: [
        { createdBy: userId },
        { isDefault: true }
      ]
    });

    if (!template) {
      return NextResponse.json(
        { message: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ template });

  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update template
export async function PUT(request: NextRequest, { params }: PageParams) {
  try {
    await connectDB();

    // Authenticate user
    const auth = authenticateToken(request);
    if (!auth.success) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = (auth as any).decoded.userId;
    const userRole = (auth as any).decoded.role;

    // Check if user is interviewer or admin
    if (userRole !== 'interviewer' && userRole !== 'admin') {
      return NextResponse.json(
        { message: 'Access denied. Interviewer role required.' },
        { status: 403 }
      );
    }

    const templateData = await request.json();

    // Find template (only if created by user, not default templates)
    const template = await InterviewTemplate.findOne({
      _id: id,
      createdBy: userId,
      isDefault: false
    });

    if (!template) {
      return NextResponse.json(
        { message: 'Template not found or cannot be edited' },
        { status: 404 }
      );
    }

    // Update template
    Object.assign(template, templateData);
    await template.save();

    return NextResponse.json({
      message: 'Template updated successfully',
      template
    });

  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete template
export async function DELETE(request: NextRequest, { params }: PageParams) {
  try {
    await connectDB();

    // Authenticate user
    const auth = authenticateToken(request);
    if (!auth.success) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = (auth as any).decoded.userId;
    const userRole = (auth as any).decoded.role;

    // Check if user is interviewer or admin
    if (userRole !== 'interviewer' && userRole !== 'admin') {
      return NextResponse.json(
        { message: 'Access denied. Interviewer role required.' },
        { status: 403 }
      );
    }

    // Find and delete template (only if created by user, not default templates)
    const template = await InterviewTemplate.findOneAndDelete({
      _id: id,
      createdBy: userId,
      isDefault: false
    });

    if (!template) {
      return NextResponse.json(
        { message: 'Template not found or cannot be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Template deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
