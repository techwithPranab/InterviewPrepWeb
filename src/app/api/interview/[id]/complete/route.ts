import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import InterviewSession from '@/lib/models/InterviewSession';
import { authenticateToken } from '@/lib/middleware/auth';
import emailService from '@/lib/services/emailService';

const aiService = require('@/lib/services/aiService');

// POST - Complete interview and generate overall evaluation
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

    const userId = (auth as any).decoded.userId;

    // Find session and verify ownership
    const session = await InterviewSession.findOne({
      _id: id,
      candidate: userId
    }).populate('candidate', 'firstName lastName email profile');

    if (!session) {
      return NextResponse.json(
        { message: 'Interview session not found' },
        { status: 404 }
      );
    }

    if (session.status === 'completed') {
      return NextResponse.json(
        { message: 'This interview session has already been completed' },
        { status: 400 }
      );
    }

    // Calculate overall statistics
    const answeredQuestions = session.questions.filter((q: any) => q.answer && q.answer.text);
    const evaluatedQuestions = session.questions.filter((q: any) => q.evaluation && q.evaluation.score);
    
    // Calculate average score
    let totalScore = 0;
    let scoreCount = 0;

    evaluatedQuestions.forEach((q: any) => {
      if (q.evaluation && q.evaluation.score) {
        totalScore += q.evaluation.score;
        scoreCount++;
      }
    });

    const averageScore = scoreCount > 0 ? totalScore / scoreCount : 0;

    // Generate overall AI feedback
    let overallEvaluation: any = {
      totalScore: totalScore,
      averageScore: parseFloat(averageScore.toFixed(2)),
      feedback: 'Interview completed successfully.',
      strengths: [],
      improvements: [],
      recommendation: 'neutral'
    };

    try {
      const interviewData = {
        questions: session.questions,
        candidate: (session as any).candidate,
        skills: session.skills,
        difficulty: session.difficulty
      };

      const aiFeedback = await aiService.generateOverallFeedback(interviewData);

      overallEvaluation = {
        totalScore: totalScore,
        averageScore: parseFloat(averageScore.toFixed(2)),
        feedback: aiFeedback.feedback || 'Interview completed successfully.',
        strengths: aiFeedback.strengths || [],
        improvements: aiFeedback.improvements || [],
        recommendation: aiFeedback.recommendation || 'neutral'
      };
    } catch (aiError) {
      console.error('AI overall feedback generation failed:', aiError);
      // Use default evaluation
    }

    // Calculate actual duration
    const completedAt = new Date();
    const totalDuration = session.startedAt 
      ? Math.round((completedAt.getTime() - session.startedAt.getTime()) / (1000 * 60))
      : session.duration;

    // Update session
    session.status = 'completed';
    session.completedAt = completedAt;
    session.totalDuration = totalDuration;
    session.overallEvaluation = overallEvaluation;

    await session.save();

    // Send completion email notification
    try {
      const user = (session as any).candidate;
      const userName = `${user.firstName} ${user.lastName}`;

      // Prepare recommendations from AI feedback
      const recommendations = [
        ...overallEvaluation.strengths.map((s: string) => `Strength: ${s}`),
        ...overallEvaluation.improvements.map((i: string) => `Area for improvement: ${i}`)
      ];

      await emailService.sendInterviewCompletionEmail(
        user.email,
        userName,
        {
          skill: session.skills.join(', '),
          score: Math.round(overallEvaluation.averageScore),
          totalQuestions: session.questions.length,
          duration: totalDuration,
          recommendations: recommendations.slice(0, 5) // Limit to 5 recommendations
        }
      );
    } catch (emailError) {
      console.error('Failed to send completion email:', emailError);
      // Don't fail the request if email fails
    }

    // Return comprehensive results
    return NextResponse.json({
      message: 'Interview completed successfully',
      results: {
        sessionId: session._id,
        status: session.status,
        totalQuestions: session.questions.length,
        answeredQuestions: answeredQuestions.length,
        evaluatedQuestions: evaluatedQuestions.length,
        completionRate: Math.round((answeredQuestions.length / session.questions.length) * 100),
        averageScore: overallEvaluation.averageScore,
        totalScore: overallEvaluation.totalScore,
        duration: totalDuration,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        overallEvaluation: {
          feedback: overallEvaluation.feedback,
          strengths: overallEvaluation.strengths,
          improvements: overallEvaluation.improvements,
          recommendation: overallEvaluation.recommendation
        },
        performanceBySkill: calculateSkillPerformance(session),
        criteriaBreakdown: calculateCriteriaBreakdown(evaluatedQuestions)
      }
    });

  } catch (error) {
    console.error('Complete interview error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate performance by skill
function calculateSkillPerformance(session: any) {
  const skillScores: { [key: string]: { total: number; count: number } } = {};

  session.skills.forEach((skill: string) => {
    skillScores[skill] = { total: 0, count: 0 };
  });

  session.questions.forEach((q: any) => {
    if (q.evaluation && q.evaluation.score) {
      // Try to match question to skills based on question text
      session.skills.forEach((skill: string) => {
        if (q.question.toLowerCase().includes(skill.toLowerCase())) {
          skillScores[skill].total += q.evaluation.score;
          skillScores[skill].count += 1;
        }
      });
    }
  });

  return Object.entries(skillScores).map(([skill, data]) => ({
    skill,
    averageScore: data.count > 0 ? parseFloat((data.total / data.count).toFixed(2)) : 0,
    questionsAnswered: data.count
  }));
}

// Helper function to calculate criteria breakdown
function calculateCriteriaBreakdown(evaluatedQuestions: any[]) {
  const criteriaScores = {
    technical_accuracy: { total: 0, count: 0 },
    communication: { total: 0, count: 0 },
    problem_solving: { total: 0, count: 0 },
    confidence: { total: 0, count: 0 }
  };

  evaluatedQuestions.forEach((q: any) => {
    if (q.evaluation && q.evaluation.criteria) {
      Object.keys(criteriaScores).forEach((criteria) => {
        if (q.evaluation.criteria[criteria] !== undefined) {
          criteriaScores[criteria as keyof typeof criteriaScores].total += q.evaluation.criteria[criteria];
          criteriaScores[criteria as keyof typeof criteriaScores].count += 1;
        }
      });
    }
  });

  return Object.entries(criteriaScores).map(([criterion, data]) => ({
    criterion,
    averageScore: data.count > 0 ? parseFloat((data.total / data.count).toFixed(2)) : 0,
    maxScore: 10
  }));
}
