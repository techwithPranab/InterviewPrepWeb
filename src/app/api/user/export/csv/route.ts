import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import InterviewSession from '@/lib/models/InterviewSession';
import { verifyToken } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = decoded.decoded.userId;

    await dbConnect();

    // Fetch all completed interviews for the user
    const interviews = await InterviewSession.find({
      userId,
      status: 'completed'
    }).sort({ completedAt: -1 }).lean();

    // Generate CSV content
    const csvRows = [];
    
    // Header
    csvRows.push([
      'Interview Title',
      'Type',
      'Difficulty',
      'Skills',
      'Overall Score',
      'Questions Answered',
      'Total Questions',
      'Technical Accuracy',
      'Communication',
      'Problem Solving',
      'Confidence',
      'Started At',
      'Completed At',
      'Duration (minutes)'
    ].join(','));

    // Data rows
    for (const interview of interviews) {
      const duration = interview.completedAt && interview.startedAt
        ? Math.round((new Date(interview.completedAt).getTime() - new Date(interview.startedAt).getTime()) / 60000)
        : 0;

      const answeredQuestions = interview.questions.filter((q: any) => q.answer).length;
      const evaluation: any = interview.overallEvaluation || {};

      csvRows.push([
        `"${interview.title}"`,
        interview.type,
        interview.difficulty,
        `"${interview.skills.join(', ')}"`,
        evaluation.overallScore || evaluation.averageScore || 0,
        answeredQuestions,
        interview.questions.length,
        evaluation.criteriaBreakdown?.technical_accuracy || 0,
        evaluation.criteriaBreakdown?.communication || 0,
        evaluation.criteriaBreakdown?.problem_solving || 0,
        evaluation.criteriaBreakdown?.confidence || 0,
        interview.startedAt ? new Date(interview.startedAt).toISOString() : '',
        interview.completedAt ? new Date(interview.completedAt).toISOString() : '',
        duration
      ].join(','));
    }

    const csvContent = csvRows.join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="interview-history-${Date.now()}.csv"`
      }
    });

  } catch (error) {
    console.error('Error exporting CSV:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
