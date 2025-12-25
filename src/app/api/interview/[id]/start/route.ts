import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import InterviewSession from '@/lib/models/InterviewSession';
import { authenticateToken } from '@/lib/middleware/auth';

// POST - Start an interview session
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Find the interview session
    const session = await InterviewSession.findOne({
      _id: id,
      candidate: userId,
      status: 'scheduled'
    });

    if (!session) {
      return NextResponse.json(
        { message: 'Interview session not found or not accessible' },
        { status: 404 }
      );
    }

    // Update session status to in-progress
    session.status = 'in-progress';
    session.startedAt = new Date();

    await session.save();

    return NextResponse.json({
      message: 'Interview started successfully',
      session: {
        id: session._id,
        status: session.status,
        startedAt: session.startedAt
      }
    });

  } catch (error) {
    console.error('Error starting interview:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
