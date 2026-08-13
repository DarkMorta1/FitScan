import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { recommendationApi } from '@/api/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Skeleton, ErrorState } from '@/components/ui/skeleton';

export default function ProgressPage() {
  const [range, setRange] = useState<'weekly' | 'monthly'>('weekly');
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['progress', range],
    queryFn: async () => (await recommendationApi.getProgress(range)).data,
  });

  const updateMutation = useMutation({
    mutationFn: recommendationApi.updateProgress,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['progress'] }),
  });

  const chartData = data?.progress.map((p) => ({
    date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: p.weight,
    calories: p.calories,
    bmi: p.bmi,
    workouts: p.workoutsCompleted,
  })) || [];

  if (isLoading) return <Skeleton className="h-96" />;
  if (error) return <ErrorState message="Failed to load progress" onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Progress Dashboard</h1>
          <p className="text-muted-foreground">Track your fitness journey</p>
        </div>
        <div className="flex gap-2">
          {(['weekly', 'monthly'] as const).map((r) => (
            <Button key={r} variant={range === r ? 'default' : 'outline'} size="sm" onClick={() => setRange(r)}>
              {r === 'weekly' ? 'Weekly' : 'Monthly'}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Log Today</CardTitle></CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                updateMutation.mutate({
                  weight: Number(fd.get('weight')) || undefined,
                  calories: Number(fd.get('calories')) || undefined,
                  waterIntake: Number(fd.get('water')) || undefined,
                  workoutsCompleted: Number(fd.get('workouts')) || undefined,
                });
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Weight (kg)</Label><Input name="weight" type="number" step="0.1" /></div>
                <div><Label>Calories</Label><Input name="calories" type="number" /></div>
                <div><Label>Water (L)</Label><Input name="water" type="number" step="0.1" /></div>
                <div><Label>Workouts</Label><Input name="workouts" type="number" /></div>
              </div>
              <Button type="submit" size="sm" disabled={updateMutation.isPending}>Save</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Meal Completion</CardTitle></CardHeader>
          <CardContent>
            <p className="text-4xl font-bold gradient-text">
              {data?.mealCompletion.completed}/{data?.mealCompletion.total}
            </p>
            <p className="text-sm text-muted-foreground">meals completed in this period</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {[
          { title: 'Weight Progress', key: 'weight', color: '#B7F34A' },
          { title: 'Calories', key: 'calories', color: '#f59e0b' },
          { title: 'BMI Trend', key: 'bmi', color: '#10b981' },
          { title: 'Workouts', key: 'workouts', color: '#ec4899' },
        ].map((chart, i) => (
          <motion.div key={chart.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardHeader><CardTitle className="text-base">{chart.title}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  {chart.key === 'workouts' ? (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" stroke="#888" fontSize={11} />
                      <YAxis stroke="#888" fontSize={11} />
                      <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 12 }} />
                      <Bar dataKey={chart.key} fill={chart.color} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" stroke="#888" fontSize={11} />
                      <YAxis stroke="#888" fontSize={11} />
                      <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 12 }} />
                      <Legend />
                      <Line type="monotone" dataKey={chart.key} stroke={chart.color} strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
