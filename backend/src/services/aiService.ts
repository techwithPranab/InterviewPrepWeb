import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface GenerateQuestionsOptions {
  skills?: string[];
  resumeContent?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  questionCount?: number;
  questionType?: 'technical' | 'behavioral' | 'mixed';
  experience?: string;
  interviewType?: 'online' | 'in-person';
  duration?: number;
}

interface QuestionData {
  question: string;
  answer?: {
    text?: string;
    audioUrl?: string;
    timeSpent?: number;
    submittedAt?: Date;
    timestamp: Date;
  };
  evaluation?: {
    score?: number;
    feedback?: string;
  };
}

interface InterviewData {
  questions: QuestionData[];
  candidate: string;
  skills: string[];
}

interface EvaluationResult {
  score: number;
  criteria: {
    technical_accuracy: number;
    communication: number;
    problem_solving: number;
    confidence: number;
  };
  feedback: string;
}

class AIService {
  private model: string = 'gpt-3.5-turbo';

  /**
   * Generate interview questions based on skills and resume content
   */
  async generateQuestions(options: GenerateQuestionsOptions) {
    const {
      skills = [],
      resumeContent = '',
      difficulty = 'intermediate',
      questionCount = 5,
      questionType = 'technical',
      experience = 'fresher',
      interviewType = 'online'
    } = options;

    try {
      const prompt = this.buildQuestionPrompt({
        skills,
        resumeContent,
        difficulty,
        questionCount,
        questionType,
        experience,
        interviewType
      });

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert technical interviewer. Generate relevant, challenging, and fair interview questions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const content = response.choices[0].message.content || '';
      return this.parseQuestions(content);
    } catch (error) {
      console.error('Error generating questions:', error);
      throw new Error('Failed to generate interview questions');
    }
  }

  /**
   * Evaluate candidate's answer
   */
  async evaluateAnswer(question: string, answer: string, expectedAnswer: string | null = null): Promise<EvaluationResult> {
    try {
      const prompt = this.buildEvaluationPrompt(question, answer, expectedAnswer);

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert interviewer evaluating candidate responses. Provide fair, constructive feedback with scores.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const content = response.choices[0].message.content || '';
      return this.parseEvaluation(content);
    } catch (error) {
      console.error('Error evaluating answer:', error);
      throw new Error('Failed to evaluate answer');
    }
  }

  /**
   * Generate follow-up questions based on candidate's answer
   */
  async generateFollowUp(originalQuestion: string, candidateAnswer: string): Promise<string[]> {
    try {
      const prompt = `
Based on the following interview question and candidate's response, generate 1-2 relevant follow-up questions:

Original Question: ${originalQuestion}
Candidate's Answer: ${candidateAnswer}

Generate follow-up questions that explore deeper understanding.
Return only the follow-up questions, one per line.
      `;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert interviewer generating insightful follow-up questions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 300
      });

      const content = response.choices[0].message.content || '';
      return content.split('\n').filter(line => line.trim().length > 0);
    } catch (error) {
      console.error('Error generating follow-up questions:', error);
      return [];
    }
  }

  /**
   * Analyze sentiment and confidence from answer text
   */
  async analyzeResponse(answerText: string) {
    try {
      const prompt = `
Analyze the following interview response and provide sentiment, confidence level, and clarity score.

Response: ${answerText}

Format your response as JSON:
{
  "sentiment": "positive|neutral|negative",
  "confidence_level": "high|medium|low",
  "clarity_score": 1-10,
  "keywords": ["keyword1", "keyword2"],
  "communication_quality": "excellent|good|fair|poor"
}
      `;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert in communication analysis. Return only valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 500
      });

      const content = response.choices[0].message.content || '';
      return JSON.parse(content);
    } catch (error) {
      console.error('Error analyzing response:', error);
      return {
        sentiment: 'neutral',
        confidence_level: 'medium',
        clarity_score: 5,
        keywords: [],
        communication_quality: 'fair'
      };
    }
  }

  /**
   * Generate overall interview feedback
   */
  async generateOverallFeedback(interviewData: InterviewData) {
    const { questions, candidate, skills } = interviewData;
    
    try {
      const prompt = `
Generate comprehensive interview feedback for a candidate based on their performance.

Candidate Skills: ${skills.join(', ')}
Number of Questions: ${questions.length}

Provide:
1. Overall assessment
2. Top 3 strengths
3. Top 3 areas for improvement
4. Hiring recommendation

Format as JSON.
      `;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a senior technical interviewer providing comprehensive candidate feedback.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1500
      });

      const content = response.choices[0].message.content || '';
      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating overall feedback:', error);
      return {
        overall_assessment: 'Unable to generate comprehensive feedback due to system error.',
        strengths: ['Participated in the interview'],
        improvements: ['Review technical concepts'],
        recommendation: 'neutral',
        technical_feedback: 'Please review individual question feedback.'
      };
    }
  }

  /**
   * Generate online interview questions with automated assessment
   */
  async generateOnlineInterviewQuestions(options: GenerateQuestionsOptions) {
    const {
      skills = [],
      difficulty = 'intermediate',
      questionCount = 10,
      experience = 'fresher',
      duration = 30
    } = options;

    try {
      const prompt = `
Generate ${questionCount} interview questions for an online AI-driven interview.

Skills: ${skills.join(', ')}
Experience Level: ${experience}
Difficulty: ${difficulty}
Duration: ${duration} minutes

Requirements:
1. Questions should be answerable in 2-3 minutes each
2. Include technical and behavioral questions
3. Provide expected answer keywords
4. Format as JSON array with structure:
   {
     "id": "q1",
     "question": "question text",
     "type": "technical|behavioral",
     "skill": "relevant skill",
     "difficulty": 1-10,
     "expectedKeywords": ["keyword1", "keyword2"]
   }
      `;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI interview system designer. Generate structured questions with assessment criteria.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 3000
      });

      const content = response.choices[0].message.content || '';
      try {
        const questions = JSON.parse(content);
        return Array.isArray(questions) ? questions : [];
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        return this.generateFallbackQuestions(skills, difficulty, questionCount);
      }
    } catch (error) {
      console.error('Error generating online interview questions:', error);
      return this.generateFallbackQuestions(skills, difficulty, questionCount);
    }
  }

  /**
   * Assess candidate's answer with detailed scoring
   */
  async assessAnswer(question: string, candidateAnswer: string, assessmentCriteria: string[]) {
    try {
      const prompt = `
Assess this interview answer on a scale of 1-10 for each criterion:

Question: ${question}
Candidate's Answer: ${candidateAnswer}
Assessment Criteria: ${assessmentCriteria.join(', ')}

Provide assessment in JSON format:
{
  "overallScore": 1-10,
  "criteriaScores": {
    "technical_accuracy": 1-10,
    "completeness": 1-10,
    "communication": 1-10,
    "problem_solving": 1-10
  },
  "strengths": ["strength1", "strength2"],
  "improvements": ["area1", "area2"],
  "feedback": "detailed feedback text"
}
      `;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert interview assessor providing detailed feedback.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const content = response.choices[0].message.content || '';
      try {
        return JSON.parse(content);
      } catch (parseError) {
        console.error('Error parsing assessment response:', parseError);
        return this.generateFallbackAssessment();
      }
    } catch (error) {
      console.error('Error assessing answer:', error);
      return this.generateFallbackAssessment();
    }
  }

  // Helper methods

  private buildQuestionPrompt(options: any): string {
    const { skills, resumeContent, difficulty, questionCount, questionType, experience } = options;

    return `
Generate ${questionCount} ${difficulty} level ${questionType} interview questions for a ${experience} candidate.

Skills to focus on: ${skills.join(', ')}

${resumeContent ? `Resume content:\n${resumeContent}\n` : ''}

Requirements:
- Questions should be relevant to the candidate's experience level
- Focus on practical problem-solving
- Include both conceptual and implementation questions

For each question, provide:
1. The question text
2. Expected answer outline
3. Key evaluation criteria

Format each question as:
Q: [Question text]
Expected: [Expected answer outline]
Criteria: [Evaluation criteria]

---
    `;
  }

  private parseQuestions(content: string) {
    const questions: Array<{question: string; expectedAnswer: string; evaluationCriteria: string}> = [];
    const questionBlocks = content.split('---').filter((block: string) => block.trim());

    questionBlocks.forEach((block: string) => {
      const lines = block.trim().split('\n');
      let question = '';
      let expectedAnswer = '';
      let criteria = '';

      lines.forEach((line: string) => {
        if (line.startsWith('Q:')) {
          question = line.substring(2).trim();
        } else if (line.startsWith('Expected:')) {
          expectedAnswer = line.substring(9).trim();
        } else if (line.startsWith('Criteria:')) {
          criteria = line.substring(9).trim();
        }
      });

      if (question) {
        questions.push({
          question,
          expectedAnswer,
          evaluationCriteria: criteria
        });
      }
    });

    return questions;
  }

  private buildEvaluationPrompt(question: string, answer: string, expectedAnswer: string | null): string {
    return `
Evaluate this interview response:

Question: ${question}
${expectedAnswer ? `Expected Answer: ${expectedAnswer}` : ''}
Candidate's Answer: ${answer}

Provide evaluation in this format:
Score: [0-10]
Technical Accuracy: [0-10]
Communication: [0-10]
Problem Solving: [0-10]
Confidence: [0-10]

Feedback: [Detailed constructive feedback]
    `;
  }

  private parseEvaluation(content: string): EvaluationResult {
    const lines = content.split('\n');
    const evaluation: EvaluationResult = {
      score: 5,
      criteria: {
        technical_accuracy: 5,
        communication: 5,
        problem_solving: 5,
        confidence: 5
      },
      feedback: ''
    };

    let feedbackStarted = false;
    let feedbackLines: string[] = [];

    lines.forEach((line: string) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('Score:')) {
        evaluation.score = parseInt(trimmed.split(':')[1]) || 5;
      } else if (trimmed.startsWith('Technical Accuracy:')) {
        evaluation.criteria.technical_accuracy = parseInt(trimmed.split(':')[1]) || 5;
      } else if (trimmed.startsWith('Communication:')) {
        evaluation.criteria.communication = parseInt(trimmed.split(':')[1]) || 5;
      } else if (trimmed.startsWith('Problem Solving:')) {
        evaluation.criteria.problem_solving = parseInt(trimmed.split(':')[1]) || 5;
      } else if (trimmed.startsWith('Confidence:')) {
        evaluation.criteria.confidence = parseInt(trimmed.split(':')[1]) || 5;
      } else if (trimmed.startsWith('Feedback:')) {
        feedbackStarted = true;
        feedbackLines.push(trimmed.substring(9));
      } else if (feedbackStarted && trimmed.length > 0) {
        feedbackLines.push(trimmed);
      }
    });

    evaluation.feedback = feedbackLines.join(' ').trim();
    return evaluation;
  }

  private generateFallbackQuestions(skills: string[], difficulty: string, count: number) {
    const fallbackQuestions = [
      {
        id: 'fallback1',
        question: 'Tell me about your experience with the technologies in your profile.',
        type: 'behavioral',
        skill: 'general',
        difficulty: 3,
        expectedKeywords: skills,
        timeLimit: '3'
      },
      {
        id: 'fallback2',
        question: 'Describe a challenging technical problem you solved recently.',
        type: 'technical',
        skill: 'problem_solving',
        difficulty: 5,
        expectedKeywords: ['problem', 'solution', 'approach'],
        timeLimit: '4'
      }
    ];

    return fallbackQuestions.slice(0, count);
  }

  private generateFallbackAssessment() {
    return {
      overallScore: 5,
      criteriaScores: {
        technical_accuracy: 5,
        completeness: 5,
        communication: 5,
        problem_solving: 5
      },
      strengths: ['Attempted to answer the question'],
      improvements: ['Could provide more specific examples'],
      feedback: 'Please provide more detailed responses with specific examples.'
    };
  }
}

export default new AIService();
