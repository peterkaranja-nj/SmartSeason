/**
 * Field Status Logic
 *
 * Status is computed from stage + planting_date:
 *
 * - "completed"  → stage is 'harvested'
 * - "at_risk"    → stage is NOT 'harvested' AND days since planting exceeds
 *                  expected max duration for that stage:
 *                    planted  → >21 days without moving to growing
 *                    growing  → >90 days without moving to ready
 *                    ready    → >14 days without being harvested (crop spoilage risk)
 * - "active"     → everything else (progressing normally)
 */

const STAGE_MAX_DAYS = {
  planted: 21,
  growing: 90,
  ready: 14,
};

const computeStatus = (stage, plantingDate, updatedAt) => {
  if (stage === 'harvested') return 'completed';

  const referenceDate = updatedAt ? new Date(updatedAt) : new Date();
  const planting = new Date(plantingDate);
  const daysSincePlanting = Math.floor((referenceDate - planting) / (1000 * 60 * 60 * 24));

  // Estimate time in current stage based on typical progression
  const stageDaysMap = {
    planted: daysSincePlanting,
    growing: Math.max(0, daysSincePlanting - 21),
    ready: Math.max(0, daysSincePlanting - 111), // 21 + 90
  };

  const daysInStage = stageDaysMap[stage] || 0;
  const maxDays = STAGE_MAX_DAYS[stage];

  if (daysInStage > maxDays) return 'at_risk';
  return 'active';
};

module.exports = { computeStatus };
