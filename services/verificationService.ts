import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

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

export const extractClaims = async (text: string): Promise<string[]> => {
  const model = 'llama-3.3-70b-versatile';
  const prompt = `Extract ALL factual claims from the following AI-generated legal text. Return a JSON array of claim strings.

  Text: ${text}

  Return format: {"claims": ["claim1", "claim2", ...]}`;

  const response = await groq.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  try {
    const content = response.choices[0]?.message?.content || '{}';
    const result = JSON.parse(content);
    return result.claims || [];
  } catch {
    return [];
  }
};

export const verifyCaseCitation = async (
  caseName: string
): Promise<{ exists: boolean; confidence: number; source: string; explanation: string }> => {
  // Check for future dates (obvious hallucination)
  const yearMatch = caseName.match(/\(?\s*(\d{4})\s*\)?/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    const currentYear = new Date().getFullYear();
    if (year > currentYear) {
      return {
        exists: false,
        confidence: 0.0,
        source: 'known_fake',
        explanation: `Future date detected (${year}). Cases cannot be from the future. This is likely a hallucination.`,
      };
    }
  }

  // List of well-known landmark cases
  const landmarkCases = [
    'kesavananda bharati',
    'maneka gandhi',
    'vishakha',
    'minerva mills',
    'golaknath',
    'indira sawhney',
    'navtej singh johar',
    'shreya singhal',
    'k.s. puttaswamy',
  ];

  const normalizedCase = caseName.toLowerCase();
  const isLandmark = landmarkCases.some(landmark => normalizedCase.includes(landmark));

  if (isLandmark) {
    return {
      exists: true,
      confidence: 1.0,
      source: 'landmark_case',
      explanation: 'This is a well-known landmark case in Indian legal history.',
    };
  }

  // For other cases, use AI with skepticism
  const model = 'llama-3.3-70b-versatile';
  const prompt = `You are a strict legal citation verifier. Is "${caseName}" a REAL, VERIFIED Indian court case?

Be VERY skeptical. Only return high confidence if you're absolutely certain it's a real case.
Check for: realistic party names, proper citation format, plausible year.

Return JSON: {"exists": true/false, "confidence": 0.0-1.0, "source": "string", "explanation": "string"}`;

  try {
    const response = await groq.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const result = JSON.parse(content);

    // Lower confidence for non-landmark cases
    if (result.confidence > 0.6) {
      result.confidence = 0.5;
      result.source = 'appears_plausible';
    }

    return result;
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

export const verifyStatute = async (
  statuteName: string
): Promise<{ exists: boolean; confidence: number; explanation: string }> => {
  const normalized = statuteName.toLowerCase();

  // Check for invalid Article numbers (Constitution has 395 articles + some deleted)
  const articleMatch = statuteName.match(/article\s+(\d+)/i);
  if (articleMatch) {
    const articleNum = parseInt(articleMatch[1]);

    // Articles beyond 395 are definitely fake
    if (articleNum > 500) {
      return {
        exists: false,
        confidence: 0.0,
        explanation: `Article ${articleNum} does not exist. The Indian Constitution has only 395 articles (max valid article number).`,
      };
    }

    // Check for deleted articles
    const deletedArticles = [31]; // Article 31 (Right to Property) was deleted by 44th Amendment
    if (deletedArticles.includes(articleNum)) {
      return {
        exists: false,
        confidence: 0.3,
        explanation: `Article ${articleNum} (Right to Property) was part of the Constitution but has been deleted by the 44th Amendment. It is no longer a fundamental right.`,
      };
    }

    // Valid article number range
    if (articleNum >= 1 && articleNum <= 395) {
      return {
        exists: true,
        confidence: 1.0,
        explanation: `Article ${articleNum} is a valid article of the Indian Constitution.`,
      };
    }
  }

  // Check for known statutes
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

  // Check IPC sections (valid range: 1-511)
  const ipcMatch = statuteName.match(/section\s+(\d+[A-Z]?)\s+(?:of\s+)?ipc/i);
  if (ipcMatch) {
    const sectionNum = parseInt(ipcMatch[1]);
    if (sectionNum >= 1 && sectionNum <= 511) {
      return {
        exists: true,
        confidence: 1.0,
        explanation: `Section ${ipcMatch[1]} IPC is a valid provision of the Indian Penal Code.`,
      };
    } else {
      return {
        exists: false,
        confidence: 0.0,
        explanation: `Section ${sectionNum} IPC does not exist. Valid IPC sections range from 1 to 511.`,
      };
    }
  }

  // Use AI for deeper verification with skepticism
  const model = 'llama-3.3-70b-versatile';
  const prompt = `Is "${statuteName}" a REAL Indian statute, act, or legal provision?

Be STRICT. Only return high confidence if you're certain it exists.

Return JSON: {"exists": true/false, "confidence": 0.0-1.0, "explanation": "string"}`;

  try {
    const response = await groq.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const result = JSON.parse(content);

    // Be skeptical - lower confidence for unverified statutes
    if (result.confidence > 0.6) {
      result.confidence = 0.5;
    }

    return result;
  } catch (error) {
    console.error('Statute verification error:', error);
    return {
      exists: false,
      confidence: 0.5,
      explanation: 'Unable to verify this statute reference.',
    };
  }
};

export const checkLinkValidity = async (
  url: string
): Promise<{ valid: boolean; status: string }> => {
  try {
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(url)) {
      return { valid: false, status: 'Invalid URL format' };
    }

    const hasProtocol = url.startsWith('http://') || url.startsWith('https://');

    return {
      valid: hasProtocol,
      status: hasProtocol ? 'URL format appears valid' : 'Missing protocol (http/https)',
    };
  } catch (error) {
    return { valid: false, status: 'URL validation failed' };
  }
};

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
  const claims = await extractClaims(text);

  const verificationResults = await Promise.all(
    claims.map(async (claim) => {
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

      return {
        claim,
        status: 'partial' as const,
        confidence: 0.5,
        source: 'requires_manual_verification',
        explanation: 'This claim requires manual verification or additional context.',
      };
    })
  );

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
