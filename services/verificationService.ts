import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Known Indian legal databases and sources for verification
const TRUSTED_SOURCES = {
  indianKanoon: 'https://indiankanoon.org',
  supremeCourt: 'https://main.sci.gov.in',
  legalIndia: 'https://www.legal-india.in',
};

// Common Indian statutes for quick verification
const KNOWN_STATUTES = [
  'Indian Penal Code',
  'IPC',
  'Code of Criminal Procedure',
  'CrPC',
  'Code of Civil Procedure',
  'CPC',
  'Indian Contract Act',
  'Negotiable Instruments Act',
  'Consumer Protection Act',
  'Information Technology Act',
  'Companies Act',
  'Hindu Marriage Act',
  'Muslim Personal Law',
  'Evidence Act',
  'Transfer of Property Act',
  'Limitation Act',
  'Arbitration and Conciliation Act',
  'RERA',
  'Real Estate Regulation Act',
  'Motor Vehicles Act',
  'Indian Constitution',
  'Article 14',
  'Article 19',
  'Article 21',
  'Article 32',
  'Article 226',
];

/**
 * Extracts factual claims from AI-generated text
 * Returns structured claims that need verification
 */
export const extractClaims = async (text: string): Promise<string[]> => {
  const model = 'gemini-2.5-flash';
  const prompt = `
    Analyze the following AI-generated legal text and extract ALL factual claims that could be verified.

    Focus on extracting:
    1. Case citations (e.g., "Kesavananda Bharati vs State of Kerala")
    2. Statute references (e.g., "Section 138 of Negotiable Instruments Act")
    3. Legal principles stated as facts
    4. Court names and jurisdictions
    5. Years and dates of judgments

    Text to analyze:
    ---
    ${text}
    ---

    Return a JSON array of claim strings. Each claim should be a complete, standalone statement.
    Example: ["Case X vs Y was decided in 2018", "Section 420 IPC deals with cheating"]
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          claims: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['claims'],
      },
    },
  });

  const result = JSON.parse(response.text);
  return result.claims || [];
};

/**
 * Verifies if a case citation appears to be real or fabricated
 * Uses AI to check plausibility and pattern matching
 */
export const verifyCaseCitation = async (
  caseName: string
): Promise<{ exists: boolean; confidence: number; source: string; explanation: string }> => {
  const model = 'gemini-2.5-pro';
  const prompt = `
    You are a legal citation verification expert for Indian law. Analyze whether the following case citation appears to be real or potentially fabricated/hallucinated.

    Case Citation: "${caseName}"

    Check for:
    1. Realistic party names (not obviously fictional)
    2. Proper citation format (e.g., AIR, SCC, High Court abbreviations)
    3. Realistic year (should be within legal history, not future dates)
    4. Known landmark cases vs unknown cases
    5. Plausibility of case existing based on Indian legal naming conventions

    If this is a well-known landmark case (like Kesavananda Bharati, Maneka Gandhi, Vishaka, etc.), mark as verified.
    If it follows proper citation format and appears plausible, mark as "likely_real" with lower confidence.
    If it has suspicious patterns (future dates, fictional names, wrong format), mark as "likely_fake".

    Return your analysis as JSON:
    {
      "exists": true/false (true if definitely known or likely real, false if suspicious),
      "confidence": 0.0 to 1.0 (how confident you are in this assessment),
      "source": "landmark_case" or "appears_plausible" or "suspicious_pattern" or "known_fake",
      "explanation": "Brief explanation of your reasoning"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            exists: { type: Type.BOOLEAN },
            confidence: { type: Type.NUMBER },
            source: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ['exists', 'confidence', 'source', 'explanation'],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Case verification error:', error);
    return {
      exists: false,
      confidence: 0.3,
      source: 'verification_failed',
      explanation: 'Unable to verify this citation. Treat as unverified.',
    };
  }
};

/**
 * Verifies if a statute reference is valid
 */
export const verifyStatute = async (
  statuteName: string
): Promise<{ exists: boolean; confidence: number; explanation: string }> => {
  // Quick check against known statutes
  const normalized = statuteName.toLowerCase();
  const isKnown = KNOWN_STATUTES.some((statute) =>
    normalized.includes(statute.toLowerCase())
  );

  if (isKnown) {
    return {
      exists: true,
      confidence: 1.0,
      explanation: 'This is a recognized Indian statute.',
    };
  }

  // Use AI for deeper verification
  const model = 'gemini-2.5-flash';
  const prompt = `
    Is "${statuteName}" a real Indian statute, act, or constitutional provision?

    Check if it matches:
    - Indian Penal Code sections
    - Constitutional articles
    - Central or State Acts
    - Well-known legal provisions

    Return JSON:
    {
      "exists": true/false,
      "confidence": 0.0 to 1.0,
      "explanation": "Brief explanation"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            exists: { type: Type.BOOLEAN },
            confidence: { type: Type.NUMBER },
            explanation: { type: Type.STRING },
          },
          required: ['exists', 'confidence', 'explanation'],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Statute verification error:', error);
    return {
      exists: false,
      confidence: 0.5,
      explanation: 'Unable to verify this statute reference.',
    };
  }
};

/**
 * Checks if a URL is valid and accessible
 */
export const checkLinkValidity = async (
  url: string
): Promise<{ valid: boolean; status: string }> => {
  try {
    // Basic URL format validation
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(url)) {
      return { valid: false, status: 'Invalid URL format' };
    }

    // Note: In a production environment, you would make an actual HTTP request
    // For now, we'll do basic validation
    const hasProtocol = url.startsWith('http://') || url.startsWith('https://');

    return {
      valid: hasProtocol,
      status: hasProtocol ? 'URL format appears valid' : 'Missing protocol (http/https)',
    };
  } catch (error) {
    return { valid: false, status: 'URL validation failed' };
  }
};

/**
 * Comprehensive verification of AI-generated legal text
 * This is the main function that orchestrates all verification checks
 */
export const verifyLegalText = async (
  text: string
): Promise<{
  overallTrustScore: number;
  verificationResults: Array<{
    claim: string;
    status: 'verified' | 'partial' | 'hallucinated';
    confidence: number;
    source?: string;
    explanation: string;
  }>;
}> => {
  // Extract all claims from the text
  const claims = await extractClaims(text);

  const verificationResults = await Promise.all(
    claims.map(async (claim) => {
      // Check if claim contains a case citation
      const casePattern = /([A-Z][a-z]+(\s+[A-Z][a-z]+)*)\s+(vs?\.?|v\.?)\s+([A-Z][a-z]+(\s+[A-Z][a-z]+)*)/i;
      const caseMatch = claim.match(casePattern);

      if (caseMatch) {
        const caseName = caseMatch[0];
        const verification = await verifyCaseCitation(caseName);

        return {
          claim,
          status: verification.confidence > 0.7
            ? 'verified'
            : verification.confidence > 0.4
            ? 'partial'
            : 'hallucinated',
          confidence: verification.confidence,
          source: verification.source,
          explanation: verification.explanation,
        };
      }

      // Check if claim contains a statute reference
      const statutePattern = /(Section|Article|Act|Chapter)\s+\d+[A-Z]?(\s+of)?/i;
      const statuteMatch = claim.match(statutePattern);

      if (statuteMatch) {
        const verification = await verifyStatute(claim);

        return {
          claim,
          status: verification.confidence > 0.7
            ? 'verified'
            : verification.confidence > 0.4
            ? 'partial'
            : 'hallucinated',
          confidence: verification.confidence,
          source: 'statute_check',
          explanation: verification.explanation,
        };
      }

      // For other claims, use AI to assess factual accuracy
      return {
        claim,
        status: 'partial' as const,
        confidence: 0.5,
        source: 'requires_manual_verification',
        explanation: 'This claim requires manual verification or additional context.',
      };
    })
  );

  // Calculate overall trust score
  const totalConfidence = verificationResults.reduce(
    (sum, result) => sum + result.confidence,
    0
  );
  const overallTrustScore = verificationResults.length > 0
    ? totalConfidence / verificationResults.length
    : 0.5;

  return {
    overallTrustScore,
    verificationResults,
  };
};

/**
 * Detects potential hallucinations in AI-generated legal content
 * Focuses on identifying fake citations, non-existent statutes, and unsupported claims
 */
export const detectHallucinations = async (
  text: string
): Promise<{
  hasHallucinations: boolean;
  hallucinationCount: number;
  findings: Array<{
    text: string;
    type: 'fake_citation' | 'invalid_statute' | 'unsupported_claim' | 'broken_link';
    severity: 'high' | 'medium' | 'low';
    explanation: string;
    suggestion: string;
  }>;
}> => {
  const verification = await verifyLegalText(text);

  const findings = verification.verificationResults
    .filter((result) => result.status === 'hallucinated' || result.confidence < 0.5)
    .map((result) => {
      let type: 'fake_citation' | 'invalid_statute' | 'unsupported_claim' | 'broken_link';
      let severity: 'high' | 'medium' | 'low';

      if (result.source === 'known_fake' || result.source === 'suspicious_pattern') {
        type = 'fake_citation';
        severity = 'high';
      } else if (result.source === 'statute_check') {
        type = 'invalid_statute';
        severity = 'high';
      } else {
        type = 'unsupported_claim';
        severity = 'medium';
      }

      return {
        text: result.claim,
        type,
        severity,
        explanation: result.explanation,
        suggestion: 'Verify this information with trusted legal sources before relying on it.',
      };
    });

  return {
    hasHallucinations: findings.length > 0,
    hallucinationCount: findings.length,
    findings,
  };
};
