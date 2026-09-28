import React from 'react';

interface CompatibilityBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

const CompatibilityBadge: React.FC<CompatibilityBadgeProps> = ({ score, size = 'md' }) => {
  let colorClasses = '';
  if (score >= 70) {
    colorClasses = 'bg-sage/20 text-brown border-sage/40';
  } else if (score >= 40) {
    colorClasses = 'bg-peach/20 text-brown border-peach/40';
  } else {
    colorClasses = 'bg-terracotta/20 text-brown border-terracotta/40';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 border',
    md: 'text-sm px-2.5 py-1 border font-semibold',
    lg: 'text-lg px-4 py-2 border-2 font-bold rounded-full'
  };

  return (
    <span className={`inline-flex items-center rounded-full ${colorClasses} ${sizeClasses[size]} transition-all duration-300 shadow-sm`}>
      <span className="mr-1 text-[10px] uppercase font-bold tracking-wider opacity-70">Match</span>
      {score}%
    </span>
  );
};

export default CompatibilityBadge;
