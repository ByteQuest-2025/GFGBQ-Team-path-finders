import React from 'react';

export interface TrustBadgeProps {
  trustScore: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showPercentage?: boolean;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  trustScore,
  size = 'medium',
  showLabel = true,
  showPercentage = false,
}) => {
  const getStatus = (): 'verified' | 'partial' | 'unverified' => {
    if (trustScore >= 0.7) return 'verified';
    if (trustScore >= 0.4) return 'partial';
    return 'unverified';
  };

  const status = getStatus();

  const getIcon = (): string => {
    switch (status) {
      case 'verified':
        return '✅';
      case 'partial':
        return '⚠️';
      case 'unverified':
        return '❌';
    }
  };

  const getLabel = (): string => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'partial':
        return 'Partially Verified';
      case 'unverified':
        return 'Unverified';
    }
  };

  const getColorClasses = (): string => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unverified':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getSizeClasses = (): string => {
    switch (size) {
      case 'small':
        return 'text-xs px-2 py-0.5';
      case 'medium':
        return 'text-sm px-2.5 py-1';
      case 'large':
        return 'text-base px-3 py-1.5';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${getColorClasses()} ${getSizeClasses()}`}
      title={`Trust Score: ${(trustScore * 100).toFixed(1)}%`}
    >
      <span>{getIcon()}</span>
      {showLabel && <span>{getLabel()}</span>}
      {showPercentage && <span className="ml-1">({(trustScore * 100).toFixed(0)}%)</span>}
    </span>
  );
};

export interface VerificationStatusProps {
  status: 'verified' | 'partial' | 'hallucinated';
  confidence?: number;
  size?: 'small' | 'medium' | 'large';
}

export const VerificationStatus: React.FC<VerificationStatusProps> = ({
  status,
  confidence,
  size = 'medium',
}) => {
  const getIcon = (): string => {
    switch (status) {
      case 'verified':
        return '✅';
      case 'partial':
        return '⚠️';
      case 'hallucinated':
        return '❌';
    }
  };

  const getLabel = (): string => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'partial':
        return 'Partial';
      case 'hallucinated':
        return 'Hallucinated';
    }
  };

  const getColorClasses = (): string => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hallucinated':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getSizeClasses = (): string => {
    switch (size) {
      case 'small':
        return 'text-xs px-2 py-0.5';
      case 'medium':
        return 'text-sm px-2.5 py-1';
      case 'large':
        return 'text-base px-3 py-1.5';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${getColorClasses()} ${getSizeClasses()}`}
      title={confidence ? `Confidence: ${(confidence * 100).toFixed(1)}%` : undefined}
    >
      <span>{getIcon()}</span>
      <span>{getLabel()}</span>
      {confidence !== undefined && <span className="ml-1">({(confidence * 100).toFixed(0)}%)</span>}
    </span>
  );
};

export interface TrustScoreBarProps {
  trustScore: number;
  showLabel?: boolean;
}

export const TrustScoreBar: React.FC<TrustScoreBarProps> = ({ trustScore, showLabel = true }) => {
  const getColor = (): string => {
    if (trustScore >= 0.7) return 'bg-green-600';
    if (trustScore >= 0.4) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getTextColor = (): string => {
    if (trustScore >= 0.7) return 'text-green-600';
    if (trustScore >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[rgb(var(--foreground))]">Trust Score</span>
          <span className={`text-sm font-bold ${getTextColor()}`}>
            {(trustScore * 100).toFixed(1)}%
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${trustScore * 100}%` }}
        ></div>
      </div>
    </div>
  );
};
