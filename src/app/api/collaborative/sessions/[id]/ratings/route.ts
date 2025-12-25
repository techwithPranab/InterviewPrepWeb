import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import CollaborativeSession from '@/lib/models/CollaborativeSession';
import Interviewer from '@/lib/models/Interviewer';
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
    const { id: sessionId } = await params;
    const body = await request.json();
    const { ratings, feedback } = body;

    // Find session and verify it's the interviewer
    const session = await CollaborativeSession.findOne({
      _id: sessionId,
      interviewerId: userId,
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update ratings and feedback
    if (ratings) {
      session.ratings = {
        ...session.ratings,
        ...ratings,
      };
      
      // Calculate overall rating as average
      const ratingValues = [
        ratings.technicalSkills || session.ratings.technicalSkills,
        ratings.communication || session.ratings.communication,
        ratings.problemSolving || session.ratings.problemSolving,
        ratings.cultureFit || session.ratings.cultureFit,
      ].filter(r => r > 0);
      
      if (ratingValues.length > 0) {
        session.ratings.overall = ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length;
      }
    }

    if (feedback !== undefined) {
      session.feedback = feedback;
    }

    // Mark session as completed if it's not already
    if (session.status === 'in-progress') {
      session.status = 'completed';
      session.endedAt = new Date();
      
      // Update interviewer stats
      await Interviewer.findByIdAndUpdate(userId, {
        $inc: { totalInterviews: 1 },
      });
    }

    await session.save();

    return NextResponse.json({
      success: true,
      message: 'Ratings updated successfully',
      session,
    });

  } catch (error: any) {
    console.error('Error updating ratings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update ratings' },
      { status: 500 }
    );
  }
}
