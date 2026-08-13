import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, Utensils } from 'lucide-react';
import { recommendationApi } from '@/api/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton, ErrorState } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

export default function RecommendationsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['meal-recommendations'],
    queryFn: async () => (await recommendationApi.getMeals()).data.recommendations,
  });

  if (isLoading) return <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>;
  if (error) return <ErrorState message="Complete your profile to get recommendations" onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-violet-400" />
          <div>
            <h1 className="text-2xl font-bold gradient-text">AI Meal Recommendations</h1>
            <p className="text-muted-foreground">Personalized based on your goal, BMI & activity</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {MEAL_TYPES.map((type, i) => (
          <motion.div key={type} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Utensils className="h-4 w-4 text-violet-400" />
                <CardTitle>{type}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data?.[type]?.length ? data[type].map((food) => (
                  <Link
                    key={food._id}
                    to={`/foods/${food._id}`}
                    className="flex items-center gap-3 rounded-xl bg-background/50 p-3 transition-colors hover:bg-violet-500/10"
                  >
                    {food.imageUrl && <img src={food.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />}
                    <div className="flex-1">
                      <p className="font-medium">{food.name}</p>
                      <p className="text-xs text-muted-foreground">{food.calories} kcal · {food.protein}g protein</p>
                    </div>
                  </Link>
                )) : <p className="text-sm text-muted-foreground">No recommendations</p>}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
