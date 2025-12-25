import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import CollaborativeSession from '@/lib/models/CollaborativeSession';
import { verifyToken } from '@/lib/middleware/auth';

export async function POST(
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
    const { id: sessionId } = await params;
    const body = await request.json();
    const { note, category } = body;

    if (!note) {
      return NextResponse.json(
        { success: false, message: 'Note is required' },
        { status: 400 }
      );
    }

    // Find session and verify interviewer
    const session = await CollaborativeSession.findOne({
      _id: sessionId,
      // Allow both interviewer and candidate to add notes
      $or: [
        { interviewerId: userId },
        { candidateId: userId },
      ],
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found or unauthorized' },
        { status: 404 }
      );
    }

    // Add note
    session.interviewerNotes.push({
      timestamp: new Date(),
      note,
      category,
    } as any);

    await session.save();

    return NextResponse.json({
      success: true,
      message: 'Note added successfully',
      notes: session.interviewerNotes,
    });

  } catch (error: any) {
    console.error('Error adding note:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add note' },
      { status: 500 }
    );
  }
}
