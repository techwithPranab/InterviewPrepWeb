import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import InterviewGuide from '@/lib/models/InterviewGuide';
import { authenticateToken } from '@/lib/middleware/auth';

// GET - Fetch single interview guide by ID (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Authenticate and check admin role
    const auth = authenticateToken(request);
    if (!auth.success || (auth as any).decoded.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const guide = await InterviewGuide.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastUpdatedBy', 'firstName lastName email');

    if (!guide) {
      return NextResponse.json(
        { message: 'Interview guide not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ guide });

  } catch (error) {
    console.error('Fetch guide error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update interview guide (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Authenticate and check admin role
    const auth = authenticateToken(request);
    if (!auth.success || (auth as any).decoded.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updateData: any = { ...body };
    updateData.lastUpdatedBy = (auth as any).decoded.userId;

    // If publishing for the first time
    if (body.isPublished && !updateData.publishedDate) {
      const existingGuide = await InterviewGuide.findById(id);
      if (existingGuide && !existingGuide.isPublished) {
        updateData.publishedDate = new Date();
      }
    }

    const guide = await InterviewGuide.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email')
     .populate('lastUpdatedBy', 'firstName lastName email');

    if (!guide) {
      return NextResponse.json(
        { message: 'Interview guide not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Interview guide updated successfully',
      guide
    });

  } catch (error) {
    console.error('Update guide error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete interview guide (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Authenticate and check admin role
    const auth = authenticateToken(request);
    if (!auth.success || (auth as any).decoded.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const guide = await InterviewGuide.findByIdAndDelete(id);

    if (!guide) {
      return NextResponse.json(
        { message: 'Interview guide not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Interview guide deleted successfully'
    });

  } catch (error) {
    console.error('Delete guide error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
