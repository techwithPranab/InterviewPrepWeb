import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const sessionId = formData.get('sessionId') as string;
    const questionId = formData.get('questionId') as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    if (!sessionId || !questionId) {
      return NextResponse.json(
        { error: 'Session ID and Question ID are required' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'audio');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = audioFile.name.split('.').pop() || 'webm';
    const filename = `${sessionId}_${questionId}_${timestamp}_${randomString}.${extension}`;
    const filepath = path.join(uploadsDir, filename);

    // Convert File to Buffer and save
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // TODO: Implement speech-to-text conversion using OpenAI Whisper API
    // For now, we'll return the file path and a placeholder transcription
    const audioUrl = `/uploads/audio/${filename}`;

    // In a real implementation, you would call OpenAI Whisper API here:
    // const transcription = await transcribeAudio(filepath);

    return NextResponse.json({
      success: true,
      audioUrl,
      filename,
      message: 'Audio uploaded successfully',
      // transcription: transcription // Will be added when Whisper API is integrated
    });

  } catch (error) {
    console.error('Audio upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload audio',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function for future Whisper API integration
async function transcribeAudio(filepath: string): Promise<string> {
  // This will be implemented when OpenAI Whisper API is integrated
  // Example implementation:
  /*
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filepath),
    model: "whisper-1",
    language: "en"
  });

  return transcription.text;
  */
  
  return 'Transcription will be available once Whisper API is integrated';
}
