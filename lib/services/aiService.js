const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class AIService {
  constructor() {
    this.model = 'gpt-3.5-turbo';
  }

  /**
   * Generate interview questions based on skills and resume content
   */
  async generateQuestions(options) {
    const {
      skills = [],
      resumeContent = '',
      difficulty = 'intermediate',
      questionCount = 5,
      questionType = 'technical',
      experience = 'fresher',
      interviewType = 'online' // online or in-person
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

      const content = response.choices[0].message.content;
      return this.parseQuestions(content);
    } catch (error) {
      console.error('Error generating questions:', error);
      throw new Error('Failed to generate interview questions');
    }
  }

  /**
   * Evaluate candidate's answer
   */
  async evaluateAnswer(question, answer, expectedAnswer = null) {
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

      const content = response.choices[0].message.content;
      return this.parseEvaluation(content);
    } catch (error) {
      console.error('Error evaluating answer:', error);
      throw new Error('Failed to evaluate answer');
    }
  }

  /**
   * Generate follow-up questions based on candidate's answer
   */
  async generateFollowUp(originalQuestion, candidateAnswer) {
    try {
      const prompt = `
Based on the following interview question and candidate's response, generate 1-2 relevant follow-up questions to probe deeper:

Original Question: ${originalQuestion}
Candidate's Answer: ${candidateAnswer}

Generate follow-up questions that:
1. Explore implementation details
2. Test deeper understanding
3. Challenge assumptions
4. Explore edge cases

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

      const content = response.choices[0].message.content;
      return content.split('\n').filter(line => line.trim().length > 0);
    } catch (error) {
      console.error('Error generating follow-up questions:', error);
      return [];
    }
  }

  /**
   * Analyze sentiment and confidence from answer text
   */
  async analyzeResponse(answerText) {
    try {
      const prompt = `
Analyze the following interview response and provide:
1. Sentiment (positive, neutral, negative)
2. Confidence level (high, medium, low)
3. Clarity score (1-10)
4. Key technical keywords mentioned
5. Communication quality (excellent, good, fair, poor)

Response: ${answerText}

Format your response as JSON:
{
  "sentiment": "...",
  "confidence_level": "...",
  "clarity_score": number,
  "keywords": ["..."],
  "communication_quality": "..."
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

      const content = response.choices[0].message.content;
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
  async generateOverallFeedback(interviewData) {
    const { questions, candidate, skills } = interviewData;
    
    try {
      const prompt = `
Generate comprehensive interview feedback for a candidate based on their performance:

Candidate Skills: ${skills.join(', ')}
Number of Questions: ${questions.length}

Questions and Responses:
${questions.map((q, i) => `
Q${i + 1}: ${q.question}
Answer: ${q.answer?.text || 'No answer provided'}
Score: ${q.evaluation?.score || 'Not scored'}/10
`).join('\n')}

Provide:
1. Overall assessment (2-3 sentences)
2. Top 3 strengths
3. Top 3 areas for improvement
4. Hiring recommendation (strongly_recommend, recommend, neutral, not_recommend, strongly_not_recommend)
5. Specific technical feedback

Format as JSON:
{
  "overall_assessment": "...",
  "strengths": ["...", "...", "..."],
  "improvements": ["...", "...", "..."],
  "recommendation": "...",
  "technical_feedback": "..."
}
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

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating overall feedback:', error);
      return {
        overall_assessment: 'Unable to generate comprehensive feedback due to system error.',
        strengths: ['Participated in the interview'],
        improvements: ['Review technical concepts', 'Practice communication skills'],
        recommendation: 'neutral',
        technical_feedback: 'Please review the individual question feedback for details.'
      };
    }
  }

  // Helper methods

  buildQuestionPrompt(options) {
    const { skills, resumeContent, difficulty, questionCount, questionType, experience } = options;

    return `
Generate ${questionCount} ${difficulty} level ${questionType} interview questions for a ${experience} candidate.

Skills to focus on: ${skills.join(', ')}

${resumeContent ? `Resume content to consider:\n${resumeContent}\n` : ''}

Requirements:
- Questions should be relevant to the candidate's experience level
- Focus on practical problem-solving
- Include both conceptual and implementation questions
- Ensure questions test real-world scenarios
- Vary difficulty within the specified level

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

  parseQuestions(content) {
    const questions = [];
    const questionBlocks = content.split('---').filter(block => block.trim());

    questionBlocks.forEach(block => {
      const lines = block.trim().split('\n');
      let question = '';
      let expectedAnswer = '';
      let criteria = '';

      lines.forEach(line => {
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

  buildEvaluationPrompt(question, answer, expectedAnswer) {
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

Feedback: [Detailed constructive feedback highlighting strengths and areas for improvement]

Key Points:
- [Point 1]
- [Point 2]
- [Point 3]
    `;
  }

  parseEvaluation(content) {
    const lines = content.split('\n');
    const evaluation = {
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
    let feedbackLines = [];

    lines.forEach(line => {
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

  /**
   * Generate questions specifically for online interviews with automated assessment
   */
  async generateOnlineInterviewQuestions(options) {
    const {
      skills = [],
      difficulty = 'intermediate',
      questionCount = 10,
      experience = 'fresher',
      duration = 30 // minutes
    } = options;

    try {
      const prompt = `
Generate ${questionCount} interview questions for an online AI-driven interview with the following specifications:

Skills: ${skills.join(', ')}
Experience Level: ${experience}
Difficulty: ${difficulty}
Interview Duration: ${duration} minutes

Requirements:
1. Questions should be clearly answerable in 2-3 minutes each
2. Include both technical and behavioral questions
3. Provide expected answer keywords for automated assessment
4. Include difficulty scoring for each question
5. Format as JSON array with structure:
   {
     "id": "q1",
     "question": "question text",
     "type": "technical|behavioral",
     "skill": "relevant skill",
     "difficulty": 1-10,
     "expectedKeywords": ["keyword1", "keyword2"],
     "timeLimit": "minutes",
     "assessmentCriteria": ["criteria1", "criteria2"]
   }

Generate diverse questions covering different aspects of the specified skills.
      `;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI interview system designer. Generate structured questions with assessment criteria for automated evaluation.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 3000
      });

      const content = response.choices[0].message.content;
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
  async assessAnswer(question, candidateAnswer, assessmentCriteria) {
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
  "feedback": "detailed feedback text",
  "keywordMatch": 0-100
}
      `;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert interview assessor providing detailed, constructive feedback.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const content = response.choices[0].message.content;
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

  /**
   * Generate AI suggestions for interviewers (for in-person interviews)
   */
  async generateInterviewerSuggestions(candidateProfile, currentQuestion, previousAnswers = []) {
    try {
      const prompt = `
You are an AI assistant helping an interviewer conduct a live interview.

Candidate Profile:
- Skills: ${candidateProfile.skills?.join(', ') || 'N/A'}
- Experience: ${candidateProfile.experience || 'N/A'}

Current Question: ${currentQuestion}
Previous Answers Summary: ${previousAnswers.length > 0 ? 'Candidate has answered ' + previousAnswers.length + ' questions' : 'First question'}

Provide suggestions in JSON format:
{
  "followUpQuestions": ["question1", "question2", "question3"],
  "assessmentPoints": ["point1", "point2"],
  "redFlags": ["flag1", "flag2"],
  "strengths": ["strength1", "strength2"],
  "nextTopics": ["topic1", "topic2"],
  "timeManagement": "suggestion about pacing"
}
      `;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert interview coach providing real-time suggestions to interviewers.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 800
      });

      const content = response.choices[0].message.content;
      try {
        return JSON.parse(content);
      } catch (parseError) {
        console.error('Error parsing interviewer suggestions:', parseError);
        return this.generateFallbackSuggestions();
      }
    } catch (error) {
      console.error('Error generating interviewer suggestions:', error);
      return this.generateFallbackSuggestions();
    }
  }

  /**
   * Generate fallback questions when AI fails
   */
  generateFallbackQuestions(skills, difficulty, count) {
    const fallbackQuestions = [
      {
        id: 'fallback1',
        question: 'Tell me about your experience with the technologies mentioned in your profile.',
        type: 'behavioral',
        skill: 'general',
        difficulty: 3,
        expectedKeywords: skills,
        timeLimit: '3',
        assessmentCriteria: ['experience_depth', 'communication']
      },
      {
        id: 'fallback2',
        question: 'Describe a challenging technical problem you solved recently.',
        type: 'technical',
        skill: 'problem_solving',
        difficulty: 5,
        expectedKeywords: ['problem', 'solution', 'approach'],
        timeLimit: '4',
        assessmentCriteria: ['problem_solving', 'technical_depth']
      }
    ];

    return fallbackQuestions.slice(0, count);
  }

  /**
   * Generate fallback assessment when AI fails
   */
  generateFallbackAssessment() {
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
      feedback: 'Please provide more detailed responses with specific examples.',
      keywordMatch: 50
    };
  }

  /**
   * Generate fallback suggestions for interviewers
   */
  generateFallbackSuggestions() {
    return {
      followUpQuestions: [
        'Can you elaborate on that point?',
        'How would you handle edge cases?',
        'What challenges did you face?'
      ],
      assessmentPoints: ['Technical depth', 'Communication clarity'],
      redFlags: [],
      strengths: [],
      nextTopics: ['Technical skills', 'Problem-solving approach'],
      timeManagement: 'Stay on schedule for remaining questions'
    };
  }
}

module.exports = new AIService();
