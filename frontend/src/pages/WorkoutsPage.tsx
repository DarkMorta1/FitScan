import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Calendar } from 'lucide-react';
import { recommendationApi } from '@/api/dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton, ErrorState } from '@/components/ui/skeleton';

export default function WorkoutsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['workouts'],
    queryFn: async () => (await recommendationApi.getWorkouts()).data,
  });

  const [inProgress, setInProgress] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>({});

  const markCompleteMutation = useMutation({
    mutationFn: async () => {
      // increment workoutsCompleted by 1 for today (backend will upsert)
      return (await recommendationApi.updateProgress({ workoutsCompleted: 1 })).data;
    },
  });

  const handleStart = (key: string) => {
    setInProgress((s) => ({ ...s, [key]: true }));
  };

  const handleComplete = async (key: string) => {
    try {
      await markCompleteMutation.mutateAsync();
      setCompleted((s) => ({ ...s, [key]: true }));
      setInProgress((s) => ({ ...s, [key]: false }));
    } catch (err) {
      console.error(err);
      alert('Unable to mark complete');
    }
  };

  const handleCompleteDay = async (dayKey: string) => {
    try {
      await markCompleteMutation.mutateAsync();
      setCompletedDays((s) => ({ ...s, [dayKey]: true }));
    } catch (err) {
      console.error(err);
      alert('Unable to mark workout complete');
    }
  };

  if (isLoading) return <Skeleton className="h-96" />;
  if (error) return <ErrorState message="Complete profile for workout plans" onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3">
          <Dumbbell className="h-8 w-8 text-violet-400" />
          <div>
            <h1 className="text-2xl font-bold">FITSCAN WORKOUT PLAN</h1>
            <p className="text-muted-foreground">
              {data?.fitnessLevel} level · {data?.goal} · {data?.activityLevel}
            </p>
            <div className="text-sm text-muted-foreground mt-2">
              Workout Days: {data?.daysPerWeek} · Estimated Weekly Duration: {data?.estimatedWeeklyDuration} min · Estimated Weekly Calories: {data?.estimatedWeeklyCalories} kcal
            </div>
            {data?.planReason && <p className="mt-2 text-sm">{data.planReason}</p>}
          </div>
        </div>
        <Badge className="mt-3" variant="default">{data?.fitnessLevel} Program</Badge>
      </motion.div>

      <div className="flex items-center gap-2">
        <Button onClick={() => refetch()} disabled={isLoading}>Regenerate Plan</Button>
        <p className="text-sm text-muted-foreground">Adjust intensity and regenerate</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data?.weeklyPlan.map((day: any, i: number) => (
          <motion.div key={day.day} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Calendar className="h-4 w-4 text-violet-400" />
                <div>
                  <CardTitle className="text-base">{day.day}</CardTitle>
                  <p className="text-sm text-muted-foreground">{day.focus}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-2 text-xs text-muted-foreground">Estimated Duration: {day.estimatedDuration} min · Estimated Calories: {day.estimatedCalories} kcal</div>
                {day.focus === 'Rest' ? (
                  <div className="rounded-lg border border-dashed border-muted p-6 text-center text-sm text-muted-foreground">REST DAY</div>
                ) : (
                  <ul className="space-y-2">
                    {day.exercises.map((ex: any) => (
                      <li key={ex.name} className="flex flex-col gap-2 rounded-lg bg-background/50 px-3 py-2 text-sm">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{ex.name}</div>
                          <div className="text-xs text-muted-foreground">{ex.difficulty}</div>
                        </div>

                        <div className="text-xs text-muted-foreground">Muscle Group: {ex.muscleGroup}</div>
                        <div className="text-sm">{ex.sets} × {ex.reps} · {ex.restSeconds} sec rest</div>
                        <div className="text-xs text-muted-foreground">Equipment: {ex.equipment.length ? ex.equipment.join(', ') : 'Bodyweight'}</div>
                        {ex.instructions?.length > 0 && (
                          <details>
                            <summary className="text-xs text-muted-foreground">Instructions</summary>
                            <ul className="mt-2 list-disc pl-5 text-xs">
                              {ex.instructions.map((ins: string, idx: number) => <li key={idx}>{ins}</li>)}
                            </ul>
                          </details>
                        )}

                        <div className="mt-2 flex gap-2">
                          {!inProgress[`${day.day}-${ex.name}`] && !completed[`${day.day}-${ex.name}`] && (
                            <Button onClick={() => handleStart(`${day.day}-${ex.name}`)}>Start Workout</Button>
                          )}

                          {inProgress[`${day.day}-${ex.name}`] && !completed[`${day.day}-${ex.name}`] && (
                            <Button onClick={() => handleComplete(`${day.day}-${ex.name}`)} variant="secondary">Mark Complete</Button>
                          )}

                          {completed[`${day.day}-${ex.name}`] && (
                            <div className="rounded px-3 py-1 bg-green-600 text-white">Completed</div>
                          )}
                        </div>
                      </li>
                    ))}
                    <div className="mt-3">
                      {!completedDays[day.day] ? (
                        <Button onClick={() => handleCompleteDay(day.day)} variant="secondary">Complete Workout</Button>
                      ) : (
                        <div className="text-sm text-green-500">Workout completed</div>
                      )}
                    </div>
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
