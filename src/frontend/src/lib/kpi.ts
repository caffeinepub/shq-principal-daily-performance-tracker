export const ACTIVITIES = [
  {
    key: 'briefing',
    label: 'Briefing',
    description: 'Morning briefing with staff',
    points: 16.67,
  },
  {
    key: 'supervision',
    label: 'Classroom Supervision',
    description: 'Observe and evaluate classroom teaching',
    points: 16.67,
  },
  {
    key: 'attendance',
    label: 'Teacher Attendance Check',
    description: 'Verify and record teacher attendance',
    points: 16.67,
  },
  {
    key: 'qpc',
    label: 'Qur\'anic Parenting Center',
    description: 'Quality and performance assessment',
    points: 16.67,
  },
  {
    key: 'liqo',
    label: 'Weekly Liqo',
    description: 'Weekly spiritual gathering',
    points: 16.67,
  },
  {
    key: 'administration',
    label: 'Administration',
    description: 'Administrative tasks and documentation',
    points: 16.67,
  },
];

export interface KPIPreview {
  total: number;
  breakdown: Record<string, number>;
}

export function computeKPIPreview(activities: Record<string, boolean>): KPIPreview {
  const pointsPerActivity = 100 / 6;
  const breakdown: Record<string, number> = {};

  ACTIVITIES.forEach((activity) => {
    breakdown[activity.key] = activities[activity.key] ? pointsPerActivity : 0;
  });

  const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

  return {
    total: Math.min(100, Math.max(0, total)),
    breakdown,
  };
}
