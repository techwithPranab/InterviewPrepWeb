import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import InterviewGuide from '@/lib/models/InterviewGuide';

// Ensure User model is registered before using populate
import '@/lib/models/User';

// GET - Fetch single published interview guide by ID (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const guide = await InterviewGuide.findOne({
      _id: id,
      isPublished: true
    }).populate('createdBy', 'firstName lastName');

    if (!guide) {
      return NextResponse.json(
        { message: 'Interview guide not found' },
        { status: 404 }
      );
    }

    // Increment view count
    guide.views += 1;
    await guide.save();

    // Sort questions by order
    guide.questions.sort((a: any, b: any) => a.order - b.order);

    return NextResponse.json({ guide });

  } catch (error) {
    console.error('Fetch guide error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
