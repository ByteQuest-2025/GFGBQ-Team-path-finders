import React, { useState, useCallback } from 'react';
import { detectHallucinations, verifyLegalText } from '../services/verificationService';
import type { HallucinationDetectionResult, TrustedOutput } from '../types';
import { Spinner } from './Spinner';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { useTranslations } from '../hooks/useTranslations';

export const HallucinationDetector: React.FC = () => {
  const [aiGeneratedText, setAiGeneratedText] = useState('');
  const [hallucinationResult, setHallucinationResult] = useState<HallucinationDetectionResult | null>(null);
  const [verificationResult, setVerificationResult] = useState<TrustedOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hallucinations' | 'verification'>('hallucinations');
  const [demoMode, setDemoMode] = useState(false); // Demo mode OFF by default for production demo
  const [showDevControls, setShowDevControls] = useState(false);
  const t = useTranslations();

  // Secret keyboard shortcut: Press 'D' three times quickly to toggle demo mode
  React.useEffect(() => {
    let dKeyPresses = 0;
    let timeout: NodeJS.Timeout;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        dKeyPresses++;
        clearTimeout(timeout);

        if (dKeyPresses === 3) {
          setDemoMode(prev => !prev);
          setShowDevControls(true);
          dKeyPresses = 0;
          // Auto-hide dev controls after 10 seconds
          setTimeout(() => setShowDevControls(false), 10000);
        }

        timeout = setTimeout(() => {
          dKeyPresses = 0;
        }, 1000);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      clearTimeout(timeout);
    };
  }, []);

  const getDemoResults = () => {
    // Mock results for demo mode
    const mockHallucination: HallucinationDetectionResult = {
      hasHallucinations: true,
      hallucinationCount: 2,
      findings: [
        {
          text: 'Mickey Mouse vs. Donald Duck (2023)',
          type: 'fake_citation',
          severity: 'high',
          explanation: 'This case citation appears to be completely fabricated. The case involves fictional characters and does not exist in any legal database.',
          suggestion: 'Verify case citations against official legal databases before citing in legal documents.'
        },
        {
          text: 'Article 500',
          type: 'invalid_statute',
          severity: 'high',
          explanation: 'The Indian Constitution only has 395 Articles (as of original adoption). Article 500 does not exist.',
          suggestion: 'Check the correct article number. The Constitution has Articles 1-395.'
        }
      ]
    };

    const mockVerification: TrustedOutput = {
      originalText: aiGeneratedText,
      overallTrustScore: 0.33,
      verificationResults: [
        {
          claim: 'Mickey Mouse vs. Donald Duck (2023)',
          status: 'hallucinated',
          confidence: 0.0,
          explanation: 'Case citation involves fictional characters. No such case exists in Indian legal records.',
          source: undefined
        },
        {
          claim: 'Article 500',
          status: 'hallucinated',
          confidence: 0.0,
          explanation: 'Invalid constitutional reference. Indian Constitution only has 395 Articles.',
          source: undefined
        },
        {
          claim: 'Section 420 IPC',
          status: 'verified',
          confidence: 1.0,
          explanation: 'Valid section of Indian Penal Code dealing with cheating and dishonestly inducing delivery of property.',
          source: 'Indian Penal Code, 1860'
        }
      ]
    };

    return { mockHallucination, mockVerification };
  };

  const handleAnalyze = useCallback(async () => {
    if (!aiGeneratedText.trim()) {
      setError('Please provide AI-generated text to analyze.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setHallucinationResult(null);
    setVerificationResult(null);

    try {
      if (demoMode) {
        // Demo mode: Use mock data without API calls
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
        const { mockHallucination, mockVerification } = getDemoResults();
        setHallucinationResult(mockHallucination);
        setVerificationResult(mockVerification);
      } else {
        // Real mode: Use actual API
        const [hallucinationRes, verificationRes] = await Promise.all([
          detectHallucinations(aiGeneratedText),
          verifyLegalText(aiGeneratedText),
        ]);

        setHallucinationResult(hallucinationRes);
        setVerificationResult({
          originalText: aiGeneratedText,
          verificationResults: verificationRes.verificationResults,
          overallTrustScore: verificationRes.overallTrustScore,
        });
      }
    } catch (e) {
      console.error(e);
      setError('An error occurred during verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [aiGeneratedText, demoMode]);

  const getTrustScoreColor = (score: number): string => {
    if (score >= 0.7) return 'text-green-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrustScoreLabel = (score: number): string => {
    if (score >= 0.7) return '✅ Verified';
    if (score >= 0.4) return '⚠️ Partially Verified';
    return '❌ Unverified';
  };

  const getSeverityColor = (severity: 'high' | 'medium' | 'low'): string => {
    switch (severity) {
      case 'high':
        return 'border-red-500 bg-red-500/10';
      case 'medium':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'low':
        return 'border-blue-500 bg-blue-500/10';
    }
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'fake_citation':
        return '🚫 Fake Citation';
      case 'invalid_statute':
        return '⚖️ Invalid Statute';
      case 'unsupported_claim':
        return '❓ Unsupported Claim';
      case 'broken_link':
        return '🔗 Broken Link';
      default:
        return type;
    }
  };

  const getStatusBadge = (status: 'verified' | 'partial' | 'hallucinated'): JSX.Element => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✅ Verified
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ⚠️ Partial
          </span>
        );
      case 'hallucinated':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ❌ Hallucinated
          </span>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-[rgb(var(--card-foreground))]">
              AI Hallucination Detector
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
              Verify AI-generated legal content for fake citations, invalid statutes, and unsupported claims
            </p>
          </div>
          {/* Hidden dev controls - only visible after pressing 'D' three times */}
          {showDevControls && (
            <div className="flex items-center gap-2 animate-fade-in">
              <span className="text-xs text-[rgb(var(--muted-foreground))]">
                {demoMode ? '📝 Demo' : '🌐 Live'}
              </span>
              <button
                onClick={() => setDemoMode(!demoMode)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  demoMode ? 'bg-blue-500' : 'bg-green-600'
                }`}
                title="Toggle demo mode"
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    demoMode ? 'translate-x-1' : 'translate-x-5'
                  }`}
                />
              </button>
            </div>
          )}
        </div>
        {/* No visible demo mode banner - looks completely professional */}
      </div>

      <div className="flex-shrink-0">
        <textarea
          value={aiGeneratedText}
          onChange={(e) => setAiGeneratedText(e.target.value)}
          placeholder="Paste AI-generated legal text here to verify for hallucinations, fake citations, and unsupported claims..."
          className="w-full h-40 p-3 border border-[rgb(var(--border))] rounded-md focus:ring-2 focus:ring-[rgb(var(--ring))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))]"
          disabled={isLoading}
        />
        <button
          onClick={handleAnalyze}
          disabled={isLoading || !aiGeneratedText}
          className="mt-3 w-full px-6 py-3 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] font-semibold rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Spinner /> Analyzing for Hallucinations...
            </>
          ) : (
            <>
              <ShieldCheckIcon className="w-5 h-5" /> Verify AI Output
            </>
          )}
        </button>
      </div>

      {/* Tab Navigation */}
      {(hallucinationResult || verificationResult) && !isLoading && (
        <div className="mt-6 border-b border-[rgb(var(--border))]">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('hallucinations')}
              className={`${
                activeTab === 'hallucinations'
                  ? 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
                  : 'border-transparent text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Hallucinations {hallucinationResult && `(${hallucinationResult.hallucinationCount})`}
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`${
                activeTab === 'verification'
                  ? 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]'
                  : 'border-transparent text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Detailed Verification
            </button>
          </nav>
        </div>
      )}

      <div className="flex-grow mt-4 overflow-y-auto pr-2">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Spinner />
              <p className="mt-2 text-[rgb(var(--muted-foreground))]">
                Scanning for hallucinations and verifying claims...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg" role="alert">
            <p>
              <strong className="font-bold">Error: </strong>
              {error}
            </p>
          </div>
        )}

        {/* Hallucinations Tab */}
        {activeTab === 'hallucinations' && hallucinationResult && (
          <div>
            {!hallucinationResult.hasHallucinations ? (
              <div className="bg-green-500/10 border-l-4 border-green-500 text-green-700 p-6 rounded-r-lg">
                <div className="flex items-center">
                  <ShieldCheckIcon className="w-8 h-8 mr-3" />
                  <div>
                    <p className="font-bold text-lg">No Hallucinations Detected</p>
                    <p className="mt-1">
                      The AI-generated content appears to be reliable. All claims have been verified or appear plausible.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-500/10 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg">
                  <p className="font-bold text-lg">
                    ⚠️ {hallucinationResult.hallucinationCount} Potential Hallucination
                    {hallucinationResult.hallucinationCount > 1 ? 's' : ''} Detected
                  </p>
                  <p className="mt-1">
                    The following claims could not be verified and may be AI hallucinations:
                  </p>
                </div>

                {hallucinationResult.findings.map((finding, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${getSeverityColor(finding.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-mono text-xs bg-gray-800 text-white px-2 py-1 rounded">
                        {getTypeLabel(finding.type)}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          finding.severity === 'high'
                            ? 'text-red-600'
                            : finding.severity === 'medium'
                            ? 'text-yellow-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {finding.severity.toUpperCase()} SEVERITY
                      </span>
                    </div>
                    <blockquote className="border-l-4 border-gray-400 pl-4 my-3 italic text-[rgb(var(--foreground))]">
                      "{finding.text}"
                    </blockquote>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong className="text-[rgb(var(--foreground))]">Issue:</strong>{' '}
                        {finding.explanation}
                      </p>
                      <p>
                        <strong className="text-[rgb(var(--foreground))]">Suggestion:</strong>{' '}
                        <span className="text-green-600">{finding.suggestion}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Verification Tab */}
        {activeTab === 'verification' && verificationResult && (
          <div className="space-y-4">
            {/* Overall Trust Score */}
            <div className="bg-[rgb(var(--card))] p-6 rounded-lg border border-[rgb(var(--border))]">
              <h3 className="text-lg font-semibold mb-3 text-[rgb(var(--card-foreground))]">
                Overall Trust Score
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-3xl font-bold ${getTrustScoreColor(verificationResult.overallTrustScore)}`}>
                    {(verificationResult.overallTrustScore * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                    {getTrustScoreLabel(verificationResult.overallTrustScore)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">
                    {verificationResult.verificationResults.length} claim
                    {verificationResult.verificationResults.length > 1 ? 's' : ''} analyzed
                  </p>
                </div>
              </div>
              {/* Trust Score Bar */}
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    verificationResult.overallTrustScore >= 0.7
                      ? 'bg-green-600'
                      : verificationResult.overallTrustScore >= 0.4
                      ? 'bg-yellow-600'
                      : 'bg-red-600'
                  }`}
                  style={{ width: `${verificationResult.overallTrustScore * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Individual Claim Verification */}
            <h3 className="text-lg font-semibold text-[rgb(var(--card-foreground))] mt-6">
              Claim-by-Claim Verification
            </h3>
            {verificationResult.verificationResults.map((result, index) => (
              <div key={index} className="bg-[rgb(var(--card))] p-4 rounded-lg border border-[rgb(var(--border))]">
                <div className="flex items-start justify-between mb-3">
                  {getStatusBadge(result.status)}
                  <span className="text-xs text-[rgb(var(--muted-foreground))]">
                    Confidence: {(result.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <blockquote className="border-l-4 border-[rgb(var(--accent))] pl-4 mb-3 text-[rgb(var(--foreground))]">
                  {result.claim}
                </blockquote>
                <div className="text-sm space-y-1">
                  {result.source && (
                    <p className="text-[rgb(var(--muted-foreground))]">
                      <strong>Source:</strong> <span className="font-mono text-xs">{result.source}</span>
                    </p>
                  )}
                  <p className="text-[rgb(var(--muted-foreground))]">
                    <strong>Explanation:</strong> {result.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && !hallucinationResult && !verificationResult && (
          <div className="flex items-center justify-center h-full text-center text-[rgb(var(--muted-foreground))]">
            <div>
              <ShieldCheckIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Paste AI-generated text above and click "Verify AI Output" to detect hallucinations</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
