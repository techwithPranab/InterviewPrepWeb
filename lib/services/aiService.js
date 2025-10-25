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
      experience = 'fresher'
    } = options;

    try {
      const prompt = this.buildQuestionPrompt({
        skills,
        resumeContent,
        difficulty,
        questionCount,
        questionType,
        experience
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
}

module.exports = new AIService();
