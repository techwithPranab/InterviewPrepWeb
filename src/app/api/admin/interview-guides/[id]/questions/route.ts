import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import InterviewGuide from '@/lib/models/InterviewGuide';
import { authenticateToken } from '@/lib/middleware/auth';

// POST - Add question to interview guide (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Authenticate and check admin role
    const auth = authenticateToken(request);
    if (!auth.success) {
      return NextResponse.json(
        { message: 'Unauthorized access' },
        { status: 403 }
      );
    }
    if ((auth as any).decoded.role !== 'admin') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { question, answer, category, tags, codeExample, references, order } = body;

    // Validate required fields
    if (!question || !answer || !category) {
      return NextResponse.json(
        { message: 'Please provide question, answer, and category' },
        { status: 400 }
      );
    }

    const guide = await InterviewGuide.findById(id);

    if (!guide) {
      return NextResponse.json(
        { message: 'Interview guide not found' },
        { status: 404 }
      );
    }

    // Add question
    const newQuestion = {
      question,
      answer,
      category,
      tags: tags || [],
      codeExample: codeExample || '',
      references: references || [],
      order: order ?? guide.questions.length
    };

    guide.questions.push(newQuestion);
    guide.lastUpdatedBy = (auth as any).decoded.userId;
    await guide.save();

    return NextResponse.json({
      message: 'Question added successfully',
      guide
    });

  } catch (error) {
    console.error('Add question error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update question in interview guide (admin only)
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
    const { questionId, question, answer, category, tags, codeExample, references, order } = body;

    if (!questionId) {
      return NextResponse.json(
        { message: 'Question ID is required' },
        { status: 400 }
      );
    }

    const guide = await InterviewGuide.findById(id);

    if (!guide) {
      return NextResponse.json(
        { message: 'Interview guide not found' },
        { status: 404 }
      );
    }

    // Find and update question
    const questionIndex = guide.questions.findIndex(
      (q: any) => q._id.toString() === questionId
    );

    if (questionIndex === -1) {
      return NextResponse.json(
        { message: 'Question not found' },
        { status: 404 }
      );
    }

    if (question) guide.questions[questionIndex].question = question;
    if (answer) guide.questions[questionIndex].answer = answer;
    if (category) guide.questions[questionIndex].category = category;
    if (tags) guide.questions[questionIndex].tags = tags;
    if (codeExample !== undefined) guide.questions[questionIndex].codeExample = codeExample;
    if (references) guide.questions[questionIndex].references = references;
    if (order !== undefined) guide.questions[questionIndex].order = order;

    guide.lastUpdatedBy = (auth as any).decoded.userId;
    await guide.save();

    return NextResponse.json({
      message: 'Question updated successfully',
      guide
    });

  } catch (error) {
    console.error('Update question error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete question from interview guide (admin only)
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

    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('questionId');

    if (!questionId) {
      return NextResponse.json(
        { message: 'Question ID is required' },
        { status: 400 }
      );
    }

    const guide = await InterviewGuide.findById(id);

    if (!guide) {
      return NextResponse.json(
        { message: 'Interview guide not found' },
        { status: 404 }
      );
    }

    // Remove question
    guide.questions = guide.questions.filter(
      (q: any) => q._id.toString() !== questionId
    );

    guide.lastUpdatedBy = (auth as any).decoded.userId;
    await guide.save();

    return NextResponse.json({
      message: 'Question deleted successfully',
      guide
    });

  } catch (error) {
    console.error('Delete question error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
