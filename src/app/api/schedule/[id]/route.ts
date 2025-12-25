import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import ScheduledInterview from '@/lib/models/ScheduledInterview';
import { verifyToken } from '@/lib/middleware/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    // Verify user authentication
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.decoded?.userId;
    const { id: interviewId } = await params;
    const body = await request.json();

    // Find and update interview
    const interview = await ScheduledInterview.findOneAndUpdate(
      { _id: interviewId, userId },
      { $set: body },
      { new: true }
    );

    if (!interview) {
      return NextResponse.json(
        { success: false, message: 'Interview not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Interview updated successfully',
      interview,
    });

  } catch (error: any) {
    console.error('Error updating interview:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update interview' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    // Verify user authentication
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.decoded?.userId;
    const { id: interviewId } = await params;

    // Mark as cancelled instead of deleting
    const interview = await ScheduledInterview.findOneAndUpdate(
      { _id: interviewId, userId },
      { $set: { status: 'cancelled' } },
      { new: true }
    );

    if (!interview) {
      return NextResponse.json(
        { success: false, message: 'Interview not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Interview cancelled successfully',
    });

  } catch (error: any) {
    console.error('Error cancelling interview:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to cancel interview' },
      { status: 500 }
    );
  }
}
