import OpenAI from 'openai';
import CandidateProfile, { ICandidateProfile, IProject, IExperience, IEducation } from '../models/CandidateProfile';

interface ParsedResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
    github?: string;
    portfolio?: string;
  };
  summary?: string;
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
    languages: string[];
  };
  experience: IExperience[];
  projects: IProject[];
  education: IEducation[];
  certifications: Array<{
    name: string;
    issuer: string;
    year?: string;
    credentialId?: string;
  }>;
  totalExperience?: string;
  currentRole?: string;
}

class ResumeParserService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Parse resume text using AI to extract structured data
   */
  async parseResumeWithAI(resumeText: string): Promise<ParsedResumeData> {
    try {
      const prompt = `You are an expert resume parser. Extract structured information from the following resume text and return ONLY a valid JSON object with this exact structure:

{
  "personalInfo": {
    "fullName": "Full Name",
    "email": "email@example.com",
    "phone": "phone number if available",
    "location": "city, country if available",
    "linkedIn": "LinkedIn URL if available",
    "github": "GitHub URL if available",
    "portfolio": "Portfolio URL if available"
  },
  "summary": "Professional summary or objective",
  "skills": {
    "technical": ["list of technical skills like programming languages, frameworks"],
    "soft": ["list of soft skills like leadership, communication"],
    "tools": ["list of tools like Git, Docker, JIRA"],
    "languages": ["spoken languages like English, Spanish"]
  },
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "duration": "Jan 2020 - Present",
      "location": "City, Country",
      "responsibilities": ["responsibility 1", "responsibility 2"],
      "technologies": ["tech used in this role"]
    }
  ],
  "projects": [
    {
      "title": "Project Name",
      "description": "Project description",
      "technologies": ["tech stack used"],
      "role": "Your role",
      "duration": "Project duration",
      "achievements": ["key achievements"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University/College Name",
      "year": "Graduation year",
      "grade": "GPA or grade if available",
      "major": "Major/specialization if available"
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing organization",
      "year": "Year obtained",
      "credentialId": "Credential ID if available"
    }
  ],
  "totalExperience": "Total years of experience (e.g., '5 years')",
  "currentRole": "Current job title or 'Not specified'"
}

Important instructions:
1. Extract ALL information available in the resume
2. If a field is not found, use null or empty array as appropriate
3. Be thorough in extracting skills - look for them in experience, projects, and skills sections
4. Parse dates and durations accurately
5. Return ONLY the JSON object, no additional text or markdown
6. Ensure the JSON is valid and properly formatted

Resume text:
${resumeText}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional resume parser that extracts structured data from resumes. Always return valid JSON only, without any markdown formatting or additional text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      // Remove markdown code blocks if present
      let jsonContent = content.trim();
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/```\n?/g, '');
      }

      const parsedData: ParsedResumeData = JSON.parse(jsonContent);

      // Validate and sanitize data
      return this.validateAndSanitize(parsedData);
    } catch (error: any) {
      console.error('Error parsing resume with AI:', error);
      throw new Error(`Failed to parse resume: ${error.message}`);
    }
  }

  /**
   * Validate and sanitize parsed data
   */
  private validateAndSanitize(data: any): ParsedResumeData {
    return {
      personalInfo: {
        fullName: data.personalInfo?.fullName || 'Not Provided',
        email: data.personalInfo?.email || 'not-provided@example.com',
        phone: data.personalInfo?.phone || undefined,
        location: data.personalInfo?.location || undefined,
        linkedIn: data.personalInfo?.linkedIn || undefined,
        github: data.personalInfo?.github || undefined,
        portfolio: data.personalInfo?.portfolio || undefined,
      },
      summary: data.summary || undefined,
      skills: {
        technical: Array.isArray(data.skills?.technical) ? data.skills.technical : [],
        soft: Array.isArray(data.skills?.soft) ? data.skills.soft : [],
        tools: Array.isArray(data.skills?.tools) ? data.skills.tools : [],
        languages: Array.isArray(data.skills?.languages) ? data.skills.languages : [],
      },
      experience: Array.isArray(data.experience) ? data.experience : [],
      projects: Array.isArray(data.projects) ? data.projects : [],
      education: Array.isArray(data.education) ? data.education : [],
      certifications: Array.isArray(data.certifications) ? data.certifications : [],
      totalExperience: data.totalExperience || undefined,
      currentRole: data.currentRole || undefined,
    };
  }

  /**
   * Save parsed resume data to database
   */
  async saveToDatabase(
    userId: string,
    parsedData: ParsedResumeData,
    resumeUrl: string,
    cloudinaryPublicId: string | undefined,
    rawText: string
  ): Promise<ICandidateProfile> {
    try {
      // Check if profile already exists
      const existingProfile = await CandidateProfile.findOne({ userId });

      if (existingProfile) {
        // Update existing profile
        existingProfile.resumeUrl = resumeUrl;
        existingProfile.cloudinaryPublicId = cloudinaryPublicId;
        existingProfile.personalInfo = parsedData.personalInfo;
        existingProfile.summary = parsedData.summary;
        existingProfile.skills = parsedData.skills;
        existingProfile.experience = parsedData.experience;
        existingProfile.projects = parsedData.projects;
        existingProfile.education = parsedData.education;
        existingProfile.certifications = parsedData.certifications;
        existingProfile.totalExperience = parsedData.totalExperience;
        existingProfile.currentRole = parsedData.currentRole;
        existingProfile.rawText = rawText;
        existingProfile.extractedAt = new Date();
        existingProfile.extractionMethod = 'ai';

        await existingProfile.save();
        return existingProfile;
      } else {
        // Create new profile
        const newProfile = new CandidateProfile({
          userId,
          resumeUrl,
          cloudinaryPublicId,
          personalInfo: parsedData.personalInfo,
          summary: parsedData.summary,
          skills: parsedData.skills,
          experience: parsedData.experience,
          projects: parsedData.projects,
          education: parsedData.education,
          certifications: parsedData.certifications,
          totalExperience: parsedData.totalExperience,
          currentRole: parsedData.currentRole,
          rawText,
          extractionMethod: 'ai',
        });

        await newProfile.save();
        return newProfile;
      }
    } catch (error: any) {
      console.error('Error saving candidate profile:', error);
      throw new Error(`Failed to save profile: ${error.message}`);
    }
  }

  /**
   * Generate interview questions based on candidate profile
   */
  async generateInterviewQuestions(profile: ICandidateProfile, skillFocus?: string[]): Promise<string[]> {
    try {
      const skillsToFocus = skillFocus || profile.skills.technical.slice(0, 5);
      
      const prompt = `Based on the following candidate profile, generate 10 relevant technical interview questions:

Candidate Profile:
- Name: ${profile.personalInfo.fullName}
- Current Role: ${profile.currentRole || 'Not specified'}
- Total Experience: ${profile.totalExperience || 'Not specified'}
- Technical Skills: ${profile.skills.technical.join(', ')}
- Recent Projects: ${profile.projects.map(p => p.title).join(', ')}

Focus Skills: ${skillsToFocus.join(', ')}

Generate questions that:
1. Test practical knowledge of the mentioned skills
2. Are appropriate for their experience level
3. Relate to their project experience
4. Cover both theoretical and practical aspects

Return the questions as a JSON array of strings.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert technical interviewer. Generate relevant, challenging interview questions.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      // Parse JSON response
      let jsonContent = content.trim();
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/```\n?/g, '');
      }

      const questions: string[] = JSON.parse(jsonContent);
      return questions;
    } catch (error: any) {
      console.error('Error generating interview questions:', error);
      return [];
    }
  }
}

export default new ResumeParserService();
