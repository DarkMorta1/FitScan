import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { History } from 'lucide-react';
import { scanApi } from '@/api/scans';
import { recommendationApi } from '@/api/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton, ErrorState } from '@/components/ui/skeleton';
import { getRiskColor, formatDate } from '@/lib/utils';

export default function MealHistoryPage() {
  const { data: scans, isLoading, error, refetch } = useQuery({
    queryKey: ['scan-history'],
    queryFn: async () => (await scanApi.getHistory()).data.scans,
  });

  const { data: meals } = useQuery({
    queryKey: ['meal-recommendations'],
    queryFn: async () => (await recommendationApi.getMeals()).data.recommendations,
  });

  if (isLoading) return <Skeleton className="h-64" />;
  if (error) return <ErrorState message="Failed to load history" onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <History className="h-8 w-8 text-violet-400" />
        <div>
          <h1 className="text-2xl font-bold">Meal History</h1>
          <p className="text-muted-foreground">Your scans and recommended meals</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Food Scans</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {!scans?.length ? (
            <p className="text-sm text-muted-foreground">No scans yet. Try the <Link to="/scanner" className="text-violet-400">Food Scanner</Link>.</p>
          ) : (
            scans.map((scan) => (
              <Link key={scan._id} to={`/results/${scan._id}`} className="flex items-center justify-between rounded-xl bg-background/50 p-4 hover:bg-violet-500/10">
                <div>
                  <p className="font-medium">{scan.detectedFoodName || 'Food scan'}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(scan.createdAt)}</p>
                </div>
                <Badge className={getRiskColor(scan.prediction)}>{scan.prediction}</Badge>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      {meals && (
        <Card>
          <CardHeader><CardTitle>Suggested Meals</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(meals).flatMap(([type, items]) =>
                (items as { _id: string; name: string; calories: number }[]).slice(0, 1).map((food) => (
                  <div key={`${type}-${food._id}`} className="rounded-xl bg-background/50 p-3">
                    <p className="text-xs text-muted-foreground">{type}</p>
                    <p className="font-medium">{food.name}</p>
                    <p className="text-sm text-violet-400">{food.calories} kcal</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
