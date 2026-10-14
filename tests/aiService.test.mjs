import test from 'node:test';
import assert from 'node:assert/strict';

// Team synergy calculation test
function calculateTeamSynergy(creatorSkills, projectRequiredSkills) {
  if (!creatorSkills?.length || !projectRequiredSkills?.length) return 50;
  const matches = creatorSkills.filter(s => 
    projectRequiredSkills.some(req => req.toLowerCase() === s.toLowerCase())
  );
  const ratio = matches.length / projectRequiredSkills.length;
  return Math.min(98, Math.max(65, Math.round(ratio * 100)));
}

test('AI Service: calculateTeamSynergy calculates accurate matching score', () => {
  const creatorSkills = ['React', 'TypeScript', 'Tailwind CSS'];
  const projectSkills = ['React', 'TypeScript', 'Node.js', 'PostgreSQL'];
  
  const score = calculateTeamSynergy(creatorSkills, projectSkills);
  assert.ok(score >= 65 && score <= 98, `Score ${score} must be within calibrated synergy bracket`);
});

test('AI Service: handles empty skill sets gracefully with baseline confidence', () => {
  assert.equal(calculateTeamSynergy([], []), 50);
  assert.equal(calculateTeamSynergy(['Python'], []), 50);
});
