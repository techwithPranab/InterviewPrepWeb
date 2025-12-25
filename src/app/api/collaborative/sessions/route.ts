import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import CollaborativeSession from '@/lib/models/CollaborativeSession';
import InterviewSession from '@/lib/models/InterviewSession';
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
    const { interviewSessionId, interviewerId, scheduledAt, meetingLink } = body;

    // Validate required fields
    if (!interviewSessionId || !interviewerId || !scheduledAt) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify interview session exists and belongs to user
    const interviewSession = await InterviewSession.findOne({
      _id: interviewSessionId,
      userId,
    });

    if (!interviewSession) {
      return NextResponse.json(
        { success: false, message: 'Interview session not found' },
        { status: 404 }
      );
    }

    // Create collaborative session
    const collaborativeSession = await CollaborativeSession.create({
      interviewSessionId,
      candidateId: userId,
      interviewerId,
      scheduledAt: new Date(scheduledAt),
      meetingLink,
      status: 'scheduled',
      interviewerNotes: [],
      ratings: {
        technicalSkills: 0,
        communication: 0,
        problemSolving: 0,
        cultureFit: 0,
        overall: 0,
      },
      feedback: '',
    });

    return NextResponse.json({
      success: true,
      message: 'Collaborative session scheduled successfully',
      session: collaborativeSession,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error scheduling collaborative session:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to schedule session' },
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

    const query: any = { candidateId: userId };
    if (status) {
      query.status = status;
    }

    const sessions = await CollaborativeSession.find(query)
      .populate('interviewerId')
      .populate('interviewSessionId', 'title skills difficulty')
      .sort({ scheduledAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      sessions,
    });

  } catch (error: any) {
    console.error('Error fetching collaborative sessions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
