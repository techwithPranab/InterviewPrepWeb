import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Question {
  questionId: string;
  questionNumber: number;
  question: string;
  type: string;
  difficulty: string;
  answer?: string;
  timeSpent?: number;
  evaluation?: {
    score: number;
    feedback: string;
    criteria: {
      technical_accuracy: number;
      communication: number;
      problem_solving: number;
      confidence: number;
    };
    strengths: string[];
    improvements: string[];
  };
}

interface InterviewSession {
  _id: string;
  title: string;
  type: string;
  difficulty: string;
  skills: string[];
  duration: number;
  status: string;
  questions: Question[];
  overallEvaluation?: {
    overallScore: number;
    summary: string;
    performanceBySkill: { [key: string]: number };
    criteriaBreakdown: {
      technical_accuracy: number;
      communication: number;
      problem_solving: number;
      confidence: number;
    };
    strengths: string[];
    areasForImprovement: string[];
    recommendations: string[];
  };
  startedAt: string;
  completedAt?: string;
}

export const generateInterviewPDF = (session: InterviewSession, userName: string = 'User') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to check if we need a new page
  const checkPageBreak = (heightNeeded: number) => {
    if (yPosition + heightNeeded > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Title
  doc.setFontSize(24);
  doc.setTextColor(31, 41, 55); // gray-800
  doc.text('Interview Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Session Info
  doc.setFontSize(12);
  doc.setTextColor(75, 85, 99); // gray-600
  doc.text(`Candidate: ${userName}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Date: ${new Date(session.startedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Interview Type: ${session.type} - ${session.difficulty}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Skills: ${session.skills.join(', ')}`, 20, yPosition);
  yPosition += 7;
  
  if (session.completedAt) {
    const durationMinutes = Math.floor(
      (new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 60000
    );
    doc.text(`Duration: ${durationMinutes} minutes`, 20, yPosition);
    yPosition += 10;
  }

  // Separator Line
  doc.setDrawColor(229, 231, 235); // gray-200
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 15;

  // Overall Score
  const answeredQuestions = session.questions.filter(q => q.answer);
  const avgScore = answeredQuestions.length > 0
    ? answeredQuestions.reduce((sum, q) => sum + (q.evaluation?.score || 0), 0) / answeredQuestions.length
    : 0;

  checkPageBreak(30);
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55);
  doc.text('Overall Performance', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setTextColor(75, 85, 99);
  doc.text(`Average Score: ${avgScore.toFixed(1)}/10`, 20, yPosition);
  yPosition += 7;
  doc.text(`Questions Answered: ${answeredQuestions.length}/${session.questions.length}`, 20, yPosition);
  yPosition += 15;

  // Performance Criteria Breakdown
  if (session.overallEvaluation?.criteriaBreakdown) {
    checkPageBreak(60);
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('Performance Breakdown', 20, yPosition);
    yPosition += 10;

    const criteria = session.overallEvaluation.criteriaBreakdown;
    const criteriaData = [
      ['Technical Accuracy', `${criteria.technical_accuracy.toFixed(1)}/10`],
      ['Communication', `${criteria.communication.toFixed(1)}/10`],
      ['Problem Solving', `${criteria.problem_solving.toFixed(1)}/10`],
      ['Confidence', `${criteria.confidence.toFixed(1)}/10`],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Criteria', 'Score']],
      body: criteriaData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 }, // blue-600
      alternateRowStyles: { fillColor: [249, 250, 251] }, // gray-50
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Strengths
  if (session.overallEvaluation?.strengths && session.overallEvaluation.strengths.length > 0) {
    checkPageBreak(50);
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('Strengths', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    session.overallEvaluation.strengths.forEach((strength, index) => {
      checkPageBreak(10);
      const lines = doc.splitTextToSize(`${index + 1}. ${strength}`, pageWidth - 50);
      doc.text(lines, 25, yPosition);
      yPosition += lines.length * 6;
    });
    yPosition += 10;
  }

  // Areas for Improvement
  if (session.overallEvaluation?.areasForImprovement && session.overallEvaluation.areasForImprovement.length > 0) {
    checkPageBreak(50);
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('Areas for Improvement', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    session.overallEvaluation.areasForImprovement.forEach((area, index) => {
      checkPageBreak(10);
      const lines = doc.splitTextToSize(`${index + 1}. ${area}`, pageWidth - 50);
      doc.text(lines, 25, yPosition);
      yPosition += lines.length * 6;
    });
    yPosition += 10;
  }

  // Recommendations
  if (session.overallEvaluation?.recommendations && session.overallEvaluation.recommendations.length > 0) {
    checkPageBreak(50);
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('AI Recommendations', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    session.overallEvaluation.recommendations.forEach((rec, index) => {
      checkPageBreak(10);
      const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 50);
      doc.text(lines, 25, yPosition);
      yPosition += lines.length * 6;
    });
    yPosition += 10;
  }

  // New Page for Questions
  doc.addPage();
  yPosition = 20;

  doc.setFontSize(18);
  doc.setTextColor(31, 41, 55);
  doc.text('Question-by-Question Analysis', 20, yPosition);
  yPosition += 15;

  // Questions Details
  answeredQuestions.forEach((question, index) => {
    checkPageBreak(80);

    // Question Header
    doc.setFontSize(13);
    doc.setTextColor(31, 41, 55);
    doc.text(`Question ${index + 1}`, 20, yPosition);
    yPosition += 8;

    // Question Text
    doc.setFontSize(11);
    doc.setTextColor(55, 65, 81);
    const questionLines = doc.splitTextToSize(question.question, pageWidth - 40);
    doc.text(questionLines, 20, yPosition);
    yPosition += questionLines.length * 6 + 5;

    // Question Metadata
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(`Type: ${question.type} | Difficulty: ${question.difficulty} | Time: ${question.timeSpent}s`, 20, yPosition);
    yPosition += 8;

    // Answer
    if (question.answer) {
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      doc.text('Your Answer:', 20, yPosition);
      yPosition += 6;

      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      const answerLines = doc.splitTextToSize(question.answer, pageWidth - 40);
      const maxAnswerLines = Math.min(answerLines.length, 15); // Limit answer length
      for (let i = 0; i < maxAnswerLines; i++) {
        checkPageBreak(6);
        doc.text(answerLines[i], 25, yPosition);
        yPosition += 5;
      }
      if (answerLines.length > maxAnswerLines) {
        doc.text('... (answer truncated)', 25, yPosition);
        yPosition += 5;
      }
      yPosition += 5;
    }

    // Evaluation
    if (question.evaluation) {
      checkPageBreak(40);
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      doc.text(`Score: ${question.evaluation.score}/10`, 20, yPosition);
      yPosition += 8;

      doc.text('Feedback:', 20, yPosition);
      yPosition += 6;

      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      const feedbackLines = doc.splitTextToSize(question.evaluation.feedback, pageWidth - 40);
      feedbackLines.forEach((line: string) => {
        checkPageBreak(6);
        doc.text(line, 25, yPosition);
        yPosition += 5;
      });
    }

    yPosition += 10;

    // Separator
    if (index < answeredQuestions.length - 1) {
      checkPageBreak(10);
      doc.setDrawColor(229, 231, 235);
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;
    }
  });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175); // gray-400
    doc.text(
      `Page ${i} of ${totalPages} | Generated on ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const filename = `interview-report-${session._id}-${new Date().getTime()}.pdf`;
  doc.save(filename);
};
