import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/middleware/auth';
import connectDB from '@/lib/db/connection';
import InterviewSession from '@/lib/models/InterviewSession';

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateToken(request);
    if (!auth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (auth as any).decoded.userId;

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '90d';

    await connectDB();

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    // Fetch completed interviews within time range
    const interviews = await InterviewSession.find({
      userId,
      status: 'completed',
      completedAt: { $gte: startDate }
    }).sort({ completedAt: -1 });

    // Calculate analytics
    const totalInterviews = interviews.length;
    const averageScore = totalInterviews > 0
      ? interviews.reduce((sum, interview) => sum + (interview.overallEvaluation?.averageScore || 0), 0) / totalInterviews
      : 0;

    // Score trend over time
    const scoreTrend = interviews.map(interview => ({
      date: interview.completedAt?.toISOString().split('T')[0] || '',
      score: interview.overallEvaluation?.averageScore || 0
    })).reverse();

    // Skill proficiency - we'll need to calculate this from question evaluations
    const skillMap = new Map<string, { totalScore: number; count: number }>();
    interviews.forEach(interview => {
      interview.questions.forEach((question: any) => {
        if (question.evaluation && question.evaluation.score) {
          // Use question type as skill proxy since we don't have direct skill mapping
          const skill = question.type || 'general';
          if (!skillMap.has(skill)) {
            skillMap.set(skill, { totalScore: 0, count: 0 });
          }
          const current = skillMap.get(skill)!;
          current.totalScore += question.evaluation.score;
          current.count += 1;
        }
      });
    });

    const skillProficiency = Array.from(skillMap.entries()).map(([skill, data]) => ({
      skill: skill.charAt(0).toUpperCase() + skill.slice(1),
      avgScore: data.totalScore / data.count,
      interviewCount: data.count
    })).sort((a, b) => b.avgScore - a.avgScore);

    // Question type performance
    const questionTypeMap = new Map<string, { totalScore: number; count: number }>();
    interviews.forEach(interview => {
      interview.questions.forEach(question => {
        if (question.evaluation && question.evaluation.score !== undefined) {
          const type = question.type;
          if (!questionTypeMap.has(type)) {
            questionTypeMap.set(type, { totalScore: 0, count: 0 });
          }
          const current = questionTypeMap.get(type)!;
          current.totalScore += question.evaluation.score;
          current.count += 1;
        }
      });
    });

    const questionTypePerformance = Array.from(questionTypeMap.entries()).map(([type, data]) => ({
      type,
      avgScore: data.totalScore / data.count,
      count: data.count
    })).sort((a, b) => b.avgScore - a.avgScore);

    // Difficulty performance
    const difficultyMap = new Map<string, { totalScore: number; count: number }>();
    interviews.forEach(interview => {
      interview.questions.forEach(question => {
        if (question.evaluation && question.evaluation.score !== undefined) {
          const difficulty = question.difficulty;
          if (!difficultyMap.has(difficulty)) {
            difficultyMap.set(difficulty, { totalScore: 0, count: 0 });
          }
          const current = difficultyMap.get(difficulty)!;
          current.totalScore += question.evaluation.score;
          current.count += 1;
        }
      });
    });

    const difficultyPerformance = Array.from(difficultyMap.entries()).map(([difficulty, data]) => ({
      difficulty,
      avgScore: data.totalScore / data.count,
      count: data.count
    })).sort((a, b) => b.avgScore - a.avgScore);

    // Monthly progress
    const monthlyMap = new Map<string, { interviews: number; totalScore: number }>();
    interviews.forEach(interview => {
      const month = interview.completedAt?.toISOString().slice(0, 7) || '';
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { interviews: 0, totalScore: 0 });
      }
      const current = monthlyMap.get(month)!;
      current.interviews += 1;
      current.totalScore += interview.overallEvaluation?.averageScore || 0;
    });

    const monthlyProgress = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        interviews: data.interviews,
        avgScore: data.totalScore / data.interviews
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Calculate improvement rate (comparing first half vs second half of period)
    const midPoint = Math.floor(interviews.length / 2);
    const firstHalf = interviews.slice(0, midPoint);
    const secondHalf = interviews.slice(midPoint);

    const firstHalfAvg = firstHalf.length > 0
      ? firstHalf.reduce((sum, i) => sum + (i.overallEvaluation?.averageScore || 0), 0) / firstHalf.length
      : 0;
    const secondHalfAvg = secondHalf.length > 0
      ? secondHalf.reduce((sum, i) => sum + (i.overallEvaluation?.averageScore || 0), 0) / secondHalf.length
      : 0;

    const improvementRate = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

    // Find strongest and weakest skills
    const strongestSkill = skillProficiency.length > 0 ? skillProficiency[0].skill : 'N/A';
    const weakestSkill = skillProficiency.length > 0 ? skillProficiency[skillProficiency.length - 1].skill : 'N/A';

    // Generate AI recommendations
    const recommendations: string[] = [];

    if (totalInterviews < 3) {
      recommendations.push("Complete more interviews to get better analytics and personalized recommendations.");
    }

    if (averageScore < 5) {
      recommendations.push("Focus on building fundamental knowledge in your selected skills. Consider reviewing basic concepts.");
    }

    if (skillProficiency.length > 1) {
      const skillGap = skillProficiency[0].avgScore - skillProficiency[skillProficiency.length - 1].avgScore;
      if (skillGap > 2) {
        recommendations.push(`Work on improving your ${weakestSkill} skills to balance your overall performance.`);
      }
    }

    if (questionTypePerformance.length > 0) {
      const worstType = questionTypePerformance[questionTypePerformance.length - 1];
      if (worstType.avgScore < 6) {
        recommendations.push(`Practice more ${worstType.type} questions to improve your performance in this area.`);
      }
    }

    if (improvementRate < 0) {
      recommendations.push("Your recent performance shows a decline. Consider reviewing recent feedback and adjusting your preparation strategy.");
    } else if (improvementRate > 10) {
      recommendations.push("Great improvement! Keep up the good work and continue practicing regularly.");
    }

    if (difficultyPerformance.length > 0) {
      const advancedPerf = difficultyPerformance.find(d => d.difficulty === 'advanced');
      if (advancedPerf && advancedPerf.avgScore < 5) {
        recommendations.push("Consider focusing on intermediate-level questions before attempting advanced ones.");
      }
    }

    return NextResponse.json({
      scoreTrend,
      skillProficiency,
      questionTypePerformance,
      difficultyPerformance,
      monthlyProgress,
      recommendations,
      totalInterviews,
      averageScore,
      improvementRate,
      strongestSkill,
      weakestSkill
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
