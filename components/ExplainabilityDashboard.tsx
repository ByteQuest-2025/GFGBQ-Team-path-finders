import React, { useState } from 'react';
import { verifyLegalText, verifyCaseCitation, verifyStatute } from '../services/verificationService';
import type { TrustedOutput } from '../types';
import { Spinner } from './Spinner';
import { TrustBadge, VerificationStatus, TrustScoreBar } from './TrustBadge';
import { EyeIcon } from './icons/EyeIcon';

export const ExplainabilityDashboard: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [verificationResult, setVerificationResult] = useState<TrustedOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<number | null>(null);

  const handleVerify = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to verify.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setVerificationResult(null);
    setSelectedClaim(null);

    try {
      const result = await verifyLegalText(inputText);
      setVerificationResult({
        originalText: inputText,
        verificationResults: result.verificationResults,
        overallTrustScore: result.overallTrustScore,
      });
    } catch (e) {
      console.error(e);
      setError('An error occurred during verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSourceColor = (source?: string): string => {
    if (!source) return 'gray';
    if (source.includes('landmark') || source.includes('known')) return 'green';
    if (source.includes('suspicious') || source.includes('fake')) return 'red';
    return 'yellow';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[rgb(var(--foreground))] flex items-center gap-2">
          <EyeIcon className="w-8 h-8" />
          Explainability Dashboard
        </h1>
        <p className="text-[rgb(var(--muted-foreground))] mt-2">
          Understand how AI makes decisions and verify the trustworthiness of legal content
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-[rgb(var(--card))] p-6 rounded-lg shadow-md border border-[rgb(var(--border))] mb-6">
        <h2 className="text-xl font-semibold mb-3 text-[rgb(var(--card-foreground))]">
          Enter AI-Generated Legal Content
        </h2>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste AI-generated legal analysis, case summaries, or legal arguments here for transparency analysis..."
          className="w-full h-32 p-3 border border-[rgb(var(--border))] rounded-md focus:ring-2 focus:ring-[rgb(var(--ring))] bg-[rgb(var(--background))] text-[rgb(var(--foreground))]"
          disabled={isLoading}
        />
        <button
          onClick={handleVerify}
          disabled={isLoading || !inputText.trim()}
          className="mt-3 px-6 py-3 bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] font-semibold rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Spinner /> Analyzing...
            </>
          ) : (
            <>
              <EyeIcon className="w-5 h-5" /> Explain & Verify
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg mb-6" role="alert">
          <p>
            <strong className="font-bold">Error: </strong>
            {error}
          </p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-[rgb(var(--muted-foreground))]">
              Extracting claims and verifying sources...
            </p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {verificationResult && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Overall Trust & Claims List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overall Trust Score */}
            <div className="bg-[rgb(var(--card))] p-6 rounded-lg shadow-md border border-[rgb(var(--border))]">
              <h2 className="text-xl font-semibold mb-4 text-[rgb(var(--card-foreground))]">
                Overall Trust Assessment
              </h2>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-4xl font-bold text-[rgb(var(--foreground))]">
                    {(verificationResult.overallTrustScore * 100).toFixed(1)}%
                  </p>
                  <TrustBadge trustScore={verificationResult.overallTrustScore} size="large" />
                </div>
                <div className="text-right text-sm text-[rgb(var(--muted-foreground))]">
                  <p>{verificationResult.verificationResults.length} claims analyzed</p>
                  <p>
                    {verificationResult.verificationResults.filter((r) => r.status === 'verified').length}{' '}
                    verified
                  </p>
                  <p>
                    {verificationResult.verificationResults.filter((r) => r.status === 'hallucinated').length}{' '}
                    hallucinated
                  </p>
                </div>
              </div>
              <TrustScoreBar trustScore={verificationResult.overallTrustScore} showLabel={false} />
              <p className="text-sm text-[rgb(var(--muted-foreground))] mt-3">
                This score represents the overall trustworthiness of the AI-generated content based on
                verification of factual claims, citations, and legal references.
              </p>
            </div>

            {/* Claims List */}
            <div className="bg-[rgb(var(--card))] p-6 rounded-lg shadow-md border border-[rgb(var(--border))]">
              <h2 className="text-xl font-semibold mb-4 text-[rgb(var(--card-foreground))]">
                Extracted Claims & Verification
              </h2>
              <div className="space-y-3">
                {verificationResult.verificationResults.map((claim, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedClaim(index)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedClaim === index
                        ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/5'
                        : 'border-[rgb(var(--border))] hover:border-[rgb(var(--primary))]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-mono text-[rgb(var(--muted-foreground))]">
                        Claim #{index + 1}
                      </span>
                      <VerificationStatus
                        status={claim.status}
                        confidence={claim.confidence}
                        size="small"
                      />
                    </div>
                    <p className="text-sm text-[rgb(var(--foreground))]">{claim.claim}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-grow h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            claim.confidence >= 0.7
                              ? 'bg-green-500'
                              : claim.confidence >= 0.4
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${claim.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-[rgb(var(--muted-foreground))]">
                        {(claim.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Explanation for Selected Claim */}
          <div className="lg:col-span-1">
            <div className="bg-[rgb(var(--card))] p-6 rounded-lg shadow-md border border-[rgb(var(--border))] sticky top-6">
              <h2 className="text-lg font-semibold mb-4 text-[rgb(var(--card-foreground))]">
                Verification Details
              </h2>
              {selectedClaim !== null ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
                      Selected Claim:
                    </h3>
                    <p className="text-sm text-[rgb(var(--muted-foreground))] bg-[rgb(var(--muted))] p-3 rounded">
                      {verificationResult.verificationResults[selectedClaim].claim}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
                      Verification Status:
                    </h3>
                    <VerificationStatus
                      status={verificationResult.verificationResults[selectedClaim].status}
                      confidence={verificationResult.verificationResults[selectedClaim].confidence}
                      size="medium"
                    />
                  </div>

                  {verificationResult.verificationResults[selectedClaim].source && (
                    <div>
                      <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
                        Verification Source:
                      </h3>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-mono bg-${getSourceColor(
                          verificationResult.verificationResults[selectedClaim].source
                        )}-100 text-${getSourceColor(
                          verificationResult.verificationResults[selectedClaim].source
                        )}-800`}
                      >
                        {verificationResult.verificationResults[selectedClaim].source}
                      </span>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
                      Explanation:
                    </h3>
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">
                      {verificationResult.verificationResults[selectedClaim].explanation}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
                      Confidence Score:
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="flex-grow h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            verificationResult.verificationResults[selectedClaim].confidence >= 0.7
                              ? 'bg-green-500'
                              : verificationResult.verificationResults[selectedClaim].confidence >= 0.4
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{
                            width: `${
                              verificationResult.verificationResults[selectedClaim].confidence * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-[rgb(var(--foreground))]">
                        {(verificationResult.verificationResults[selectedClaim].confidence * 100).toFixed(
                          1
                        )}
                        %
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[rgb(var(--border))]">
                    <p className="text-xs text-[rgb(var(--muted-foreground))] italic">
                      Click on other claims in the list to see their verification details.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-[rgb(var(--muted-foreground))] py-8">
                  <p className="text-sm">Select a claim from the list to see detailed verification information</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!verificationResult && !isLoading && !error && (
        <div className="bg-[rgb(var(--card))] p-12 rounded-lg shadow-md border border-[rgb(var(--border))] text-center">
          <EyeIcon className="w-16 h-16 mx-auto mb-4 text-[rgb(var(--muted-foreground))] opacity-50" />
          <h3 className="text-xl font-semibold text-[rgb(var(--card-foreground))] mb-2">
            No Content to Analyze
          </h3>
          <p className="text-[rgb(var(--muted-foreground))]">
            Enter AI-generated legal content above to see transparency and verification analysis
          </p>
        </div>
      )}
    </div>
  );
};
