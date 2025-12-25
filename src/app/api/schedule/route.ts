import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import ScheduledInterview from '@/lib/models/ScheduledInterview';
import { verifyToken } from '@/lib/middleware/auth';

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { title, description, scheduledAt, duration, interviewerId, meetingLink } = body;

    // Validate required fields
    if (!title || !scheduledAt) {
      return NextResponse.json(
        { success: false, message: 'Title and scheduled time are required' },
        { status: 400 }
      );
    }

    // Create scheduled interview
    const scheduledInterview = await ScheduledInterview.create({
      userId,
      interviewerId,
      title,
      description,
      scheduledAt: new Date(scheduledAt),
      duration: duration || 60,
      meetingLink,
      status: 'scheduled',
      reminderSent: false,
    });

    return NextResponse.json({
      success: true,
      message: 'Interview scheduled successfully',
      interview: scheduledInterview,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error scheduling interview:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to schedule interview' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming') === 'true';

    const query: any = { userId };
    
    if (status) {
      query.status = status;
    }
    
    if (upcoming) {
      query.scheduledAt = { $gte: new Date() };
      query.status = { $in: ['scheduled', 'confirmed'] };
    }

    const interviews = await ScheduledInterview.find(query)
      .populate('interviewerId')
      .sort({ scheduledAt: upcoming ? 1 : -1 })
      .lean();

    return NextResponse.json({
      success: true,
      interviews,
    });

  } catch (error: any) {
    console.error('Error fetching scheduled interviews:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch interviews' },
      { status: 500 }
    );
  }
}
