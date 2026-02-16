import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, AlertCircle } from 'lucide-react';
import { ACTIVITIES, getActivityLabel } from '../../lib/kpi';
import type { KPIConfig } from '../../backend';

interface DailyActivityWeightsCardProps {
  weights: KPIConfig | null;
  isLoading: boolean;
  isEditable: boolean;
  onSave?: (weights: KPIConfig) => Promise<void>;
  isSaving?: boolean;
}

export default function DailyActivityWeightsCard({
  weights,
  isLoading,
  isEditable,
  onSave,
  isSaving = false,
}: DailyActivityWeightsCardProps) {
  const [editMode, setEditMode] = useState(false);
  const [editedWeights, setEditedWeights] = useState<KPIConfig | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (weights) {
      setEditedWeights(weights);
    }
  }, [weights]);

  const handleWeightChange = (key: keyof KPIConfig, value: string) => {
    if (!editedWeights) return;

    const numValue = parseFloat(value);
    setEditedWeights({
      ...editedWeights,
      [key]: isNaN(numValue) ? 0 : numValue,
    });
    setValidationError(null);
  };

  const handleNameChange = (key: keyof KPIConfig, value: string) => {
    if (!editedWeights) return;

    setEditedWeights({
      ...editedWeights,
      [key]: value,
    });
    setValidationError(null);
  };

  const validateWeights = (config: KPIConfig): string | null => {
    // Only validate the 5 visible activity weights
    const weights = [
      config.activity1weight,
      config.activity2weight,
      config.activity3weight,
      config.activity4weight,
      config.activity5weight,
    ];
    
    // Check for negative values
    if (weights.some(w => w < 0)) {
      return 'All weights must be non-negative.';
    }

    // Check total equals 100 (with tolerance) for the 5 visible activities only
    const total = weights.reduce((sum, w) => sum + w, 0);
    if (Math.abs(total - 100) > 0.1) {
      return `Total weight must equal 100. Current total: ${total.toFixed(2)}`;
    }

    return null;
  };

  const handleSave = async () => {
    if (!editedWeights || !onSave) return;

    const error = validateWeights(editedWeights);
    if (error) {
      setValidationError(error);
      return;
    }

    try {
      await onSave(editedWeights);
      setEditMode(false);
      setValidationError(null);
    } catch (error: any) {
      setValidationError(error.message || 'Failed to save weights. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditedWeights(weights);
    setEditMode(false);
    setValidationError(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!editedWeights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Daily Activity KPI Weights
          </CardTitle>
          <CardDescription>Unable to load KPI configuration</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Calculate total for the 5 visible activities only
  const currentTotal = 
    editedWeights.activity1weight +
    editedWeights.activity2weight +
    editedWeights.activity3weight +
    editedWeights.activity4weight +
    editedWeights.activity5weight;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Daily Activity KPI Weights
        </CardTitle>
        <CardDescription>
          {isEditable
            ? 'Configure point weights for each activity (must total 100)'
            : 'Current point weights for each activity'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {ACTIVITIES.map((activity) => {
            const activityName = editedWeights[activity.nameKey] as string;
            const activityWeight = editedWeights[activity.weightKey] as number;
            
            return (
              <div key={activity.key} className="flex items-center gap-4">
                <div className="flex-1">
                  {editMode ? (
                    <div className="space-y-2">
                      <Label htmlFor={`name-${activity.key}`} className="font-medium">
                        Activity Name
                      </Label>
                      <Input
                        id={`name-${activity.key}`}
                        type="text"
                        value={activityName}
                        onChange={(e) => handleNameChange(activity.nameKey, e.target.value)}
                        placeholder={activity.label}
                      />
                    </div>
                  ) : (
                    <>
                      <Label htmlFor={`weight-${activity.key}`} className="font-medium">
                        {activityName || activity.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </>
                  )}
                </div>
                <div className="w-24">
                  {editMode ? (
                    <div className="space-y-2">
                      <Label htmlFor={`weight-${activity.key}`} className="text-xs">
                        Weight
                      </Label>
                      <Input
                        id={`weight-${activity.key}`}
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={activityWeight}
                        onChange={(e) => handleWeightChange(activity.weightKey, e.target.value)}
                        className="text-right"
                      />
                    </div>
                  ) : (
                    <div className="text-right font-semibold text-lg">
                      {activityWeight.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Total:</span>
            <span className={`text-lg font-bold ${
              Math.abs(currentTotal - 100) < 0.1 
                ? 'text-emerald-600' 
                : 'text-orange-600'
            }`}>
              {currentTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {validationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        {isEditable && (
          <div className="flex gap-2 pt-2">
            {editMode ? (
              <>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={isSaving}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setEditMode(true)}
                variant="outline"
                className="w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit Weights
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
