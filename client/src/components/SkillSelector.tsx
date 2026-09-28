import React from 'react';

interface SkillSelectorProps {
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
}

export const SKILL_CATEGORIES = [
  {
    name: 'Technical — Frontend',
    skills: ['React', 'Vue', 'Angular', 'HTML/CSS', 'TypeScript', 'JavaScript']
  },
  {
    name: 'Technical — Backend',
    skills: ['Node.js', 'Python', 'Java', 'PHP', 'Go', 'Django', 'Express']
  },
  {
    name: 'Technical — Mobile',
    skills: ['React Native', 'Flutter', 'Android', 'iOS/Swift']
  },
  {
    name: 'Technical — Data/AI',
    skills: ['Machine Learning', 'Deep Learning', 'Data Analysis', 'TensorFlow', 'PyTorch']
  },
  {
    name: 'Technical — Other',
    skills: ['Blockchain', 'Cloud (AWS/GCP/Azure)', 'DevOps', 'Cybersecurity', 'UI/UX Design']
  },
  {
    name: 'Non-Technical',
    skills: ['Product Management', 'Marketing', 'Business Development', 'Presentation', 'Graphic Design', 'Video Editing']
  }
];

const SkillSelector: React.FC<SkillSelectorProps> = ({ selectedSkills, onChange }) => {
  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      onChange(selectedSkills.filter(s => s !== skill));
    } else {
      onChange([...selectedSkills, skill]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Selected skills summary */}
      <div>
        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
          Selected Skills ({selectedSkills.length})
        </label>
        {selectedSkills.length === 0 ? (
          <p className="text-xs text-slate-400 italic bg-cream/30 border border-dashed border-beige rounded-lg p-3">
            No skills selected yet. Click skills below to add them to your profile.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 bg-cream/30 border border-beige rounded-lg p-3">
            {selectedSkills.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-brown text-white hover:bg-primary-hover shadow-sm transition-all"
              >
                {skill}
                <span className="text-white opacity-80 text-[10px]">✕</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid of skill categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SKILL_CATEGORIES.map(category => (
          <div key={category.name} className="border border-beige rounded-xl p-4 bg-cream/40">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">
              {category.name}
            </h4>
            <div className="flex flex-wrap gap-2">
              {category.skills.map(skill => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-brown text-white border border-brown/30 shadow-sm'
                        : 'bg-cream text-brown border border-beige hover:bg-beige/40'
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillSelector;
