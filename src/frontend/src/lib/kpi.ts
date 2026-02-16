import type { KPIConfig } from '../backend';

// Map of 5 visible activities to their KPIConfig keys
export const ACTIVITIES = [
  {
    key: 'activity1',
    label: 'Activity 1',
    description: 'First daily activity',
    nameKey: 'activity1name' as keyof KPIConfig,
    weightKey: 'activity1weight' as keyof KPIConfig,
    activeKey: 'activity1active' as keyof KPIConfig,
    kpiTallyKey: 'energy' as const,
  },
  {
    key: 'activity2',
    label: 'Activity 2',
    description: 'Second daily activity',
    nameKey: 'activity2name' as keyof KPIConfig,
    weightKey: 'activity2weight' as keyof KPIConfig,
    activeKey: 'activity2active' as keyof KPIConfig,
    kpiTallyKey: 'flow' as const,
  },
  {
    key: 'activity3',
    label: 'Activity 3',
    description: 'Third daily activity',
    nameKey: 'activity3name' as keyof KPIConfig,
    weightKey: 'activity3weight' as keyof KPIConfig,
    activeKey: 'activity3active' as keyof KPIConfig,
    kpiTallyKey: 'focus' as const,
  },
  {
    key: 'activity4',
    label: 'Activity 4',
    description: 'Fourth daily activity',
    nameKey: 'activity4name' as keyof KPIConfig,
    weightKey: 'activity4weight' as keyof KPIConfig,
    activeKey: 'activity4active' as keyof KPIConfig,
    kpiTallyKey: 'health' as const,
  },
  {
    key: 'activity5',
    label: 'Activity 5',
    description: 'Fifth daily activity',
    nameKey: 'activity5name' as keyof KPIConfig,
    weightKey: 'activity5weight' as keyof KPIConfig,
    activeKey: 'activity5active' as keyof KPIConfig,
    kpiTallyKey: 'habit' as const,
  },
];

export interface KPIPreview {
  total: number;
  breakdown: Record<string, number>;
}

// Default equal weights fallback (5 activities at 20% each)
const DEFAULT_WEIGHTS: KPIConfig = {
  activity1name: 'Activity 1',
  activity1weight: 20.0,
  activity1active: true,
  activity2name: 'Activity 2',
  activity2weight: 20.0,
  activity2active: true,
  activity3name: 'Activity 3',
  activity3weight: 20.0,
  activity3active: true,
  activity4name: 'Activity 4',
  activity4weight: 20.0,
  activity4active: true,
  activity5name: 'Activity 5',
  activity5weight: 20.0,
  activity5active: true,
};

export function computeKPIPreview(
  activities: Record<string, boolean>,
  weights?: KPIConfig | null
): KPIPreview {
  const config = weights || DEFAULT_WEIGHTS;
  const breakdown: Record<string, number> = {};

  // Only compute for the 5 visible activities
  ACTIVITIES.forEach((activity) => {
    const weight = config[activity.weightKey] as number;
    breakdown[activity.key] = activities[activity.key] ? weight : 0;
  });

  const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

  return {
    total: Math.min(100, Math.max(0, total)),
    breakdown,
  };
}

export function getActivityPoints(weights?: KPIConfig | null): Record<string, number> {
  const config = weights || DEFAULT_WEIGHTS;
  const points: Record<string, number> = {};

  // Only return points for the 5 visible activities
  ACTIVITIES.forEach((activity) => {
    points[activity.key] = config[activity.weightKey] as number;
  });

  return points;
}

export function getActivityLabel(activityKey: string, weights?: KPIConfig | null): string {
  const config = weights || DEFAULT_WEIGHTS;
  const activity = ACTIVITIES.find(a => a.key === activityKey);
  if (!activity) return activityKey;
  
  const customName = config[activity.nameKey] as string;
  return customName || activity.label;
}
