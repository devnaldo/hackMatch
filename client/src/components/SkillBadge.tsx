import React from 'react';

interface SkillBadgeProps {
  skill: string;
}

const getCategoryColor = (skillName: string): string => {
  const normalizedSkill = skillName.trim().toLowerCase();

  // Frontend
  if (['react', 'vue', 'angular', 'html/css', 'typescript', 'javascript'].includes(normalizedSkill)) {
    return 'bg-cream text-brown border-beige';
  }
  // Backend
  if (['node.js', 'express', 'python', 'django', 'go', 'java', 'php'].includes(normalizedSkill)) {
    return 'bg-beige/40 text-brown border-beige';
  }
  // Mobile
  if (['react native', 'flutter', 'android', 'ios/swift'].includes(normalizedSkill)) {
    return 'bg-dusty-rose/20 text-brown border-dusty-rose/40';
  }
  // Data/AI
  if (['machine learning', 'deep learning', 'data analysis', 'tensorflow', 'pytorch'].includes(normalizedSkill)) {
    return 'bg-peach/20 text-brown border-peach/40';
  }
  // Technical - Other
  if (['blockchain', 'cloud (aws/gcp/azure)', 'devops', 'cybersecurity', 'ui/ux design'].includes(normalizedSkill)) {
    return 'bg-sage/20 text-brown border-sage/40';
  }
  // Non-Technical / Default
  return 'bg-terracotta/20 text-brown border-terracotta/40';
};

const SkillBadge: React.FC<SkillBadgeProps> = ({ skill }) => {
  const colors = getCategoryColor(skill);

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${colors}`}>
      {skill}
    </span>
  );
};

export default SkillBadge;
