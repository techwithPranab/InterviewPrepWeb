import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import InterviewSession from '@/lib/models/InterviewSession';
import { authenticateToken } from '@/lib/middleware/auth';

const aiService = require('@/lib/services/aiService');

// POST - Assess answer using AI for online interviews
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
    const body = await request.json();
    
    const {
      questionIndex,
      candidateAnswer,
      timeSpent // in seconds
    } = body;

    // Validate required fields
    if (questionIndex === undefined || !candidateAnswer) {
      return NextResponse.json(
        { message: 'Question index and candidate answer are required' },
        { status: 400 }
      );
    }

    // Get interview session
    const session = await InterviewSession.findOne({
      _id: id,
      candidate: userId,
      status: 'in-progress'
    });

    if (!session) {
      return NextResponse.json(
        { message: 'Interview session not found or not accessible' },
        { status: 404 }
      );
    }

    // Verify this is an online interview
    if (session.interviewType !== 'online') {
      return NextResponse.json(
        { message: 'AI assessment is only available for online interviews' },
        { status: 400 }
      );
    }

    // Get the question
    const question = session.questions[questionIndex];
    if (!question) {
      return NextResponse.json(
        { message: 'Question not found' },
        { status: 404 }
      );
    }

    // Use AI to assess the answer
    let assessment;
    try {
      assessment = await aiService.assessAnswer(
        question.question,
        candidateAnswer,
        question.assessmentCriteria || ['technical_accuracy', 'communication']
      );
    } catch (aiError) {
      console.error('AI assessment failed:', aiError);
      // Fallback assessment
      assessment = {
        overallScore: 5,
        criteriaScores: {
          technical_accuracy: 5,
          completeness: 5,
          communication: 5,
          problem_solving: 5
        },
        strengths: ['Provided a response'],
        improvements: ['Could provide more detail'],
        feedback: 'Thank you for your response. Consider providing more specific examples.',
        keywordMatch: 50
      };
    }

    // Calculate time bonus/penalty
    const expectedTime = parseInt(question.timeLimit || '3') * 60; // Convert to seconds
    const timeFactor = timeSpent <= expectedTime ? 1.0 : Math.max(0.7, expectedTime / timeSpent);
    const adjustedScore = Math.round(assessment.overallScore * timeFactor);

    // Update the session with the answer and assessment
    session.questions[questionIndex].answer = {
      text: candidateAnswer,
      timeSpent,
      submittedAt: new Date(),
      timestamp: new Date()
    };

    session.questions[questionIndex].evaluation = {
      score: adjustedScore,
      feedback: assessment.feedback,
      criteria: assessment.criteriaScores,
      strengths: assessment.strengths,
      improvements: assessment.improvements,
      keywordMatch: assessment.keywordMatch,
      timeFactor,
      assessedAt: new Date(),
      assessedBy: 'AI'
    };

    // Check if this was the last question
    const answeredQuestions = session.questions.filter(q => q.answer && q.answer.text);
    const isComplete = answeredQuestions.length === session.questions.length;

    if (isComplete) {
      // Calculate overall evaluation
      const totalScore = session.questions.reduce((sum, q) => {
        return sum + (q.evaluation?.score || 0);
      }, 0);
      const averageScore = totalScore / session.questions.length;

      session.overallEvaluation = {
        averageScore: Math.round(averageScore * 10) / 10,
        totalQuestions: session.questions.length,
        completedQuestions: answeredQuestions.length,
        feedback: `Interview completed! You scored ${Math.round(averageScore * 10) / 10}/10 overall.`,
        strengths: assessment.strengths,
        improvements: assessment.improvements,
        evaluatedAt: new Date(),
        evaluatedBy: 'AI'
      };

      session.status = 'completed';
      session.completedAt = new Date();
      if (session.startedAt) {
        session.totalDuration = Math.round((new Date().getTime() - session.startedAt.getTime()) / 1000 / 60);
      }
    }

    await session.save();

    return NextResponse.json({
      message: 'Answer assessed successfully',
      assessment: {
        score: adjustedScore,
        feedback: assessment.feedback,
        strengths: assessment.strengths,
        improvements: assessment.improvements,
        keywordMatch: assessment.keywordMatch,
        isComplete
      },
      nextQuestion: isComplete ? null : questionIndex + 1,
      overallProgress: {
        completed: answeredQuestions.length,
        total: session.questions.length,
        percentage: Math.round((answeredQuestions.length / session.questions.length) * 100)
      }
    });

  } catch (error) {
    console.error('Assessment error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
