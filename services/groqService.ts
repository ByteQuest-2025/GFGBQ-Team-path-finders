import Groq from 'groq-sdk';
import type {
  RAGResult,
  CitizenAnalysisResult,
  PrecedentAnalysisResult,
  SimilarCaseAnalysisResult,
  CaseChatMessage,
  AIResearchPipelineResult,
  LegalDraftType,
  BiasAnalysisResult,
  NextStepsResponse,
  ArgumentBuilderResult,
} from '../types';

// Initialize Groq client
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // Allow browser usage
});

// Helper to parse JSON from model's response
const parseJsonFromMarkdown = <T>(markdown: string): T => {
  const trimmedMarkdown = markdown.trim();
  // Look for a JSON code block
  const jsonMatch = trimmedMarkdown.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.error('Failed to parse JSON from markdown:', jsonMatch[1]);
      throw new Error('Invalid JSON response from model.');
    }
  }
  // If no code block, try to parse the whole string as JSON
  try {
    return JSON.parse(trimmedMarkdown);
  } catch (e) {
    console.error('Failed to parse the entire string as JSON:', trimmedMarkdown);
    throw new Error('Invalid response from model. Expected a JSON object.');
  }
};

// Function for Citizen Dashboard
export const analyzeDispute = async (
  disputeText: string
): Promise<CitizenAnalysisResult> => {
  const model = 'llama-3.3-70b-versatile'; // Fast and capable model
  const prompt = `Analyze the following legal dispute description and provide a structured JSON response.

  Dispute Description:
  ---
  ${disputeText}
  ---

  Based on the Indian legal context, provide the following:
  1.  "case_classification": A brief, high-level classification (e.g., "Civil - Property Dispute", "Criminal - Cheque Bounce", "Consumer Complaint").
  2.  "legal_domain": The primary area of Indian law involved (e.g., "Property Law", "Negotiable Instruments Act, 1881", "Consumer Protection Act, 2019").
  3.  "primary_issue": A concise statement of the main legal issue.
  4.  "legal_summary": A brief, easy-to-understand summary of the situation from a legal perspective.
  5.  "probable_remedy": An array of strings outlining the next steps for the user. Provide at least 2-3 clear, actionable steps in order.
  6.  "suggested_lawyer_type": The type of lawyer best suited for this case (e.g., "Civil Lawyer specializing in Property Disputes", "Corporate Lawyer").
  7.  "recommended_lawyers": An array of 3 fictional but realistic-looking lawyers. Each object should have "name", "specialization", "experience_years" (number), "success_rate" (string like "92%"), "location" (major Indian city), "profile_id" (a unique string), and "contact_option" ("Send Request").
  8.  "lawyer_request_summary": A one-paragraph summary of the case to be sent to a lawyer.
  9.  "urgency": Assess the urgency as "Low", "Medium", or "High".
  10. "portal_recommendation": Suggest a relevant government portal if applicable (e.g., "National Consumer Helpline (consumerhelpline.gov.in)", "State RERA portal"), otherwise "N/A".

  Ensure the entire output is a single valid JSON object wrapped in a markdown code block.
  `;

  const response = await groq.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content || '{}';
  return parseJsonFromMarkdown<CitizenAnalysisResult>(content);
};

// Function for Precedent Search
export const performRAGSearch = async (
  query: string,
  documentText: string
): Promise<RAGResult> => {
  const model = 'llama-3.3-70b-versatile';
  const prompt = `
    Context Document:
    ---
    ${documentText}
    ---

    Question: "${query}"

    Based ONLY on the context document provided, answer the question. Also, provide up to 3 direct quotes from the document that support your answer as citations.

    Format your response as a JSON object inside a markdown code block with the following structure:
    {
      "answer": "Your direct answer to the question.",
      "citations": [
        "Direct quote 1 from the document.",
        "Direct quote 2 from the document.",
        "Direct quote 3 from the document."
      ]
    }
  `;

  const response = await groq.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content || '{}';
  return parseJsonFromMarkdown<RAGResult>(content);
};

// Function for Explainable AI
export const getPrecedentAnalysis = async (
  documentText: string
): Promise<PrecedentAnalysisResult> => {
  const model = 'llama-3.3-70b-versatile';
  const prompt = `
      Analyze the following legal document (likely a court judgment) from an Indian legal perspective.

      Document:
      ---
      ${documentText}
      ---

      Provide a detailed analysis in a JSON object format within a markdown code block.
    `;

  const response = await groq.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
  });

  const content = response.choices[0]?.message?.content || '{}';
  return parseJsonFromMarkdown<PrecedentAnalysisResult>(content);
};

// Function for Similar Case Analyzer
export const getSimilarCases = async (
  caseFacts: string
): Promise<SimilarCaseAnalysisResult> => {
  const model = 'llama-3.3-70b-versatile';
  const prompt = `
      Analyze the following case facts from the perspective of an Indian advocate. Find 3-4 similar but fictional Indian case laws that would be relevant.

      Case Facts:
      ---
      ${caseFacts}
      ---

      Provide the output as a JSON object inside a markdown block.
    `;

  const response = await groq.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content || '{}';
  return parseJsonFromMarkdown<SimilarCaseAnalysisResult>(content);
};

// Function for Argument Builder
export const generateArguments = async (
  caseFacts: string,
  desiredOutcome: string,
  legalStance: 'Plaintiff' | 'Defendant'
): Promise<ArgumentBuilderResult> => {
  const model = 'llama-3.3-70b-versatile';
  const prompt = `
    As an expert legal strategist in the Indian legal system, analyze the following case details and construct a structured legal argument.

    **Case Facts:**
    ---
    ${caseFacts}
    ---

    **My Legal Stance:** ${legalStance}

    **Desired Outcome:** ${desiredOutcome}

    Generate a comprehensive JSON object wrapped in a markdown code block.
  `;

  const response = await groq.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6,
  });

  const content = response.choices[0]?.message?.content || '{}';
  return parseJsonFromMarkdown<ArgumentBuilderResult>(content);
};

// Function for Case Chat Summary
export const getChatSummary = async (
  history: CaseChatMessage[]
): Promise<string> => {
  const model = 'llama-3.3-70b-versatile';
  const chatHistoryText = history.map((m) => `${m.role}: ${m.text}`).join('\n');
  const prompt = `Summarize the following conversation between an advocate and a citizen. Be concise and focus on the key legal points and actions agreed upon.

  Conversation:
  ---
  ${chatHistoryText}
  ---

  Summary:
  `;

  const response = await groq.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content || '';
};

// Function for Case Chat Next Steps
export const getSuggestedNextSteps = async (
  history: CaseChatMessage[]
): Promise<NextStepsResponse> => {
  const model = 'llama-3.3-70b-versatile';
  const chatHistoryText = history.map((m) => `${m.role}: ${m.text}`).join('\n');
  const prompt = `
    Based on the following chat between an advocate and a citizen, suggest 2-3 concrete next steps for the advocate.

    Chat History:
    ---
    ${chatHistoryText}
    ---

    Provide your response as a JSON object inside a markdown block.
  `;

  const response = await groq.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
  });

  const content = response.choices[0]?.message?.content || '{}';
  return parseJsonFromMarkdown<NextStepsResponse>(content);
};

// Function for AI Research Hub
export const getAIResearchSummary = async (
  caseFacts: string,
  similarCases: SimilarCaseAnalysisResult,
  ragResult: RAGResult
): Promise<AIResearchPipelineResult> => {
  const model = 'llama-3.3-70b-versatile';
  const prompt = `
      You are an AI legal assistant. Synthesize the provided information into a final research summary for an advocate.

      1. Original Case Facts:
      ---
      ${caseFacts}
      ---

      2. Similar Cases Found:
      ---
      ${JSON.stringify(similarCases.similar_cases_found, null, 2)}
      ---

      3. Relevant Statutes from RAG search:
      ---
      ${JSON.stringify(ragResult, null, 2)}
      ---

      Generate a final JSON object inside a markdown block.
    `;

  const response = await groq.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
  });

  const content = response.choices[0]?.message?.content || '{}';
  return parseJsonFromMarkdown<AIResearchPipelineResult>(content);
};

// Function for Bias Monitor
export const monitorForBias = async (
  documentText: string
): Promise<BiasAnalysisResult> => {
  const model = 'llama-3.3-70b-versatile';
  const prompt = `
      Analyze the following text for potential biases and AI hallucinations.

      Text to Analyze:
      ---
      ${documentText}
      ---

      Provide the analysis as a JSON object inside a markdown block.
    `;

  const response = await groq.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content || '{}';
  return parseJsonFromMarkdown<BiasAnalysisResult>(content);
};

// Function for Legal Draft Generator
export const generateLegalDraft = async (
  draftType: LegalDraftType,
  caseContext: string,
  keyPoints: string
): Promise<string> => {
  const model = 'llama-3.3-70b-versatile';
  const prompt = `
      Generate a professional legal draft for a "${draftType}" based on Indian legal standards.

      Case Context:
      ---
      ${caseContext}
      ---

      Key Points to Include:
      ---
      ${keyPoints}
      ---

      Please generate the full text of the ${draftType}.
    `;

  const response = await groq.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
  });

  return response.choices[0]?.message?.content || '';
};

// Function for Chatbot - simplified for Groq
export const createChatSession = (systemInstruction?: string) => {
  const model = 'llama-3.3-70b-versatile';
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }

  return {
    sendMessage: async (userMessage: string): Promise<string> => {
      messages.push({ role: 'user', content: userMessage });

      const response = await groq.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
      });

      const assistantMessage = response.choices[0]?.message?.content || '';
      messages.push({ role: 'assistant', content: assistantMessage });

      return assistantMessage;
    },
  };
};
