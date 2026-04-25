import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
  };
  summary: string;
  experience: {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  education: {
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
  }[];
  skills: string[];
}

export const generateResumeFromDetails = async (details: string): Promise<ResumeData> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Transform the following user details into a professional, high-quality resume JSON object.
    Details: ${details}
    
    The output MUST be a valid JSON matching this structure:
    {
      "personalInfo": { "fullName": "", "email": "", "phone": "", "location": "", "website": "" },
      "summary": "Professional summary...",
      "experience": [ { "company": "", "position": "", "startDate": "", "endDate": "", "description": "" } ],
      "education": [ { "school": "", "degree": "", "startDate": "", "endDate": "" } ],
      "skills": ["Skill 1", "Skill 2"]
    }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          personalInfo: {
            type: Type.OBJECT,
            properties: {
              fullName: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              location: { type: Type.STRING },
              website: { type: Type.STRING },
            },
            required: ["fullName", "email", "phone", "location"]
          },
          summary: { type: Type.STRING },
          experience: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                company: { type: Type.STRING },
                position: { type: Type.STRING },
                startDate: { type: Type.STRING },
                endDate: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ["company", "position", "startDate", "endDate", "description"]
            }
          },
          education: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                school: { type: Type.STRING },
                degree: { type: Type.STRING },
                startDate: { type: Type.STRING },
                endDate: { type: Type.STRING },
              },
              required: ["school", "degree", "startDate", "endDate"]
            }
          },
          skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["personalInfo", "summary", "experience", "education", "skills"]
      }
    }
  });

  return JSON.parse(response.text);
};

export interface ResumeAudit {
  score: number;
  strengths: string[];
  weaknesses: string[];
  tips: string[];
  stats: {
    keywordDensity: number;
    readabilityScore: number;
    impactScore: number;
  };
}

export const auditResume = async (resumeText: string, resumeImage?: { data: string, mimeType: string }): Promise<ResumeAudit> => {
  const parts: any[] = [{ text: `Analyze the following resume and provide a detailed audit in JSON format.
  If an image is provided, extract the text and analyze it.
  
  The audit must include:
  - An overall score out of 100.
  - A list of strengths.
  - A list of weaknesses.
  - Actionable tips for improvement.
  - Statistics: keyword density (0-100), readability score (0-100), and impact score (0-100).
  
  Resume Content: ${resumeText}` }];

  if (resumeImage) {
    parts.push({
      inlineData: {
        data: resumeImage.data,
        mimeType: resumeImage.mimeType
      }
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          tips: { type: Type.ARRAY, items: { type: Type.STRING } },
          stats: {
            type: Type.OBJECT,
            properties: {
              keywordDensity: { type: Type.NUMBER },
              readabilityScore: { type: Type.NUMBER },
              impactScore: { type: Type.NUMBER },
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const compareResumes = async (resumes: string[]): Promise<{
  comparison: string;
  winner_index: number;
  metrics: { name: string, scores: number[] }[];
}> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Compare the following resumes and provide a detailed side-by-side comparison.
    Resumes:
    ${resumes.map((r, i) => `Resume ${i + 1}:\n${r}`).join("\n\n")}
    
    Provide:
    1. A detailed comparison summary.
    2. Which one is better overall (winner_index, 0-indexed).
    3. Specific metrics like "Clarity", "Experience", "Formatting" with scores for each resume.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          comparison: { type: Type.STRING },
          winner_index: { type: Type.NUMBER },
          metrics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                scores: { type: Type.ARRAY, items: { type: Type.NUMBER } }
              }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text);
};
