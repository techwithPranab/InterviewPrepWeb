import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import InterviewGuide from '@/lib/models/InterviewGuide';
import { authenticateToken } from '@/lib/middleware/auth';

// POST - Vote on interview guide (authenticated users)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Authenticate user
    const auth = authenticateToken(request);
    if (!auth.success) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { voteType } = body; // 'upvote' or 'downvote'

    if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
      return NextResponse.json(
        { message: 'Invalid vote type' },
        { status: 400 }
      );
    }

    const guide = await InterviewGuide.findOne({
      _id: id,
      isPublished: true
    });

    if (!guide) {
      return NextResponse.json(
        { message: 'Interview guide not found' },
        { status: 404 }
      );
    }

    // Update vote count
    if (voteType === 'upvote') {
      guide.upvotes += 1;
    } else {
      guide.downvotes += 1;
    }

    await guide.save();

    return NextResponse.json({
      message: 'Vote recorded successfully',
      upvotes: guide.upvotes,
      downvotes: guide.downvotes
    });

  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
