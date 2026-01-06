import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface InterviewData {
  title: string;
  date: string;
  duration: number;
  score: number;
  feedback: string;
  questions?: any[];
}

export function generateInterviewPDF(data: InterviewData, filename: string = 'interview-report.pdf') {
  try {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Interview Report', 20, 20);
    
    // Basic info
    doc.setFontSize(12);
    doc.text(`Title: ${data.title}`, 20, 40);
    doc.text(`Date: ${data.date}`, 20, 50);
    doc.text(`Duration: ${data.duration} minutes`, 20, 60);
    doc.text(`Score: ${data.score}/100`, 20, 70);
    
    // Feedback section
    doc.setFontSize(14);
    doc.text('Feedback:', 20, 85);
    doc.setFontSize(11);
    const feedback = data.feedback || 'No feedback available';
    doc.text(feedback, 20, 95, { maxWidth: 170 });
    
    // Save the PDF
    doc.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}
