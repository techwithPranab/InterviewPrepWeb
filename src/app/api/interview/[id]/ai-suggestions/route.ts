import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import InterviewSession from '@/lib/models/InterviewSession';
import { authenticateToken } from '@/lib/middleware/auth';

const aiService = require('@/lib/services/aiService');

// POST - Generate AI suggestions for live interviews
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
    
    const { context, duration, notes } = body;

    // Get interview session
    const session = await InterviewSession.findOne({
      _id: id,
      $or: [
        { interviewer: userId },
        { candidate: userId }
      ],
      status: 'in-progress'
    }).populate('candidate', 'name email role')
      .populate('interviewer', 'name email role');

    if (!session) {
      return NextResponse.json(
        { message: 'Interview session not found or not accessible' },
        { status: 404 }
      );
    }

    // Verify user is interviewer for AI suggestions
    const userRole = (auth as any).decoded.role;
    if (userRole !== 'interviewer') {
      return NextResponse.json(
        { message: 'AI suggestions are only available for interviewers' },
        { status: 403 }
      );
    }

    // Generate AI suggestion based on context
    let suggestion;
    try {
      suggestion = await aiService.generateInterviewerSuggestions(
        session.skills.join(', '),
        session.type,
        duration,
        notes,
        context
      );
    } catch (aiError) {
      console.error('AI suggestion failed:', aiError);
      
      // Fallback suggestions based on duration and context
      const fallbackSuggestions = getFallbackSuggestions(duration, context, session.type);
      suggestion = fallbackSuggestions[Math.floor(Math.random() * fallbackSuggestions.length)];
    }

    return NextResponse.json({
      type: suggestion.type || 'follow_up',
      content: suggestion.content || suggestion,
      priority: suggestion.priority || 'medium',
      timestamp: new Date(),
      sessionId: id,
      context
    });

  } catch (error) {
    console.error('AI suggestion error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Fallback suggestions when AI fails
function getFallbackSuggestions(duration: number, context: string, interviewType: string) {
  const timeBasedSuggestions = [];
  
  if (duration < 300) { // First 5 minutes
    timeBasedSuggestions.push(
      {
        type: 'follow_up',
        content: "Ask the candidate to elaborate on their background and experience with the key technologies.",
        priority: 'medium'
      },
      {
        type: 'assessment',
        content: "Observe the candidate's communication style and confidence level in their responses.",
        priority: 'low'
      }
    );
  } else if (duration < 900) { // 5-15 minutes
    timeBasedSuggestions.push(
      {
        type: 'next_question',
        content: "Consider asking a practical coding or problem-solving question to assess technical skills.",
        priority: 'high'
      },
      {
        type: 'follow_up',
        content: "Ask about specific challenges they've faced and how they overcame them.",
        priority: 'medium'
      }
    );
  } else if (duration < 1800) { // 15-30 minutes
    timeBasedSuggestions.push(
      {
        type: 'assessment',
        content: "Evaluate the candidate's problem-solving approach and technical depth.",
        priority: 'high'
      },
      {
        type: 'follow_up',
        content: "Ask about their experience working in teams and handling conflicts.",
        priority: 'medium'
      }
    );
  } else { // 30+ minutes
    timeBasedSuggestions.push(
      {
        type: 'next_question',
        content: "Consider asking about their career goals and how this role fits their aspirations.",
        priority: 'medium'
      },
      {
        type: 'assessment',
        content: "Wrap up by assessing overall cultural fit and ask if they have questions about the role.",
        priority: 'high'
      }
    );
  }

  // Add interview type specific suggestions
  if (interviewType === 'technical') {
    timeBasedSuggestions.push(
      {
        type: 'next_question',
        content: "Ask them to walk through their approach to debugging a complex issue.",
        priority: 'high'
      },
      {
        type: 'follow_up',
        content: "Inquire about their experience with code reviews and best practices.",
        priority: 'medium'
      }
    );
  } else if (interviewType === 'behavioral') {
    timeBasedSuggestions.push(
      {
        type: 'next_question',
        content: "Ask about a time they had to learn a new technology quickly.",
        priority: 'medium'
      },
      {
        type: 'follow_up',
        content: "Explore how they handle feedback and continuous learning.",
        priority: 'medium'
      }
    );
  }

  return timeBasedSuggestions;
}
