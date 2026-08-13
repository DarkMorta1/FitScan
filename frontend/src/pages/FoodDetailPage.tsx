import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { foodApi } from '@/api/foods';
import { scanApi } from '@/api/scans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoader, ErrorState } from '@/components/ui/skeleton';

export default function FoodDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['food', id],
    queryFn: async () => (await foodApi.getById(id!)).data.food,
    enabled: !!id,
  });

  const analyze = useMutation({
    mutationFn: () => scanApi.analyze(id!, true),
    onSuccess: (res) => navigate(`/results/${res.data.scan._id}`),
  });

  if (isLoading) return <PageLoader />;
  if (error || !data) return <ErrorState message="Food not found" />;

  const nutrients = [
    { label: 'Calories', value: `${data.calories} kcal` },
    { label: 'Protein', value: `${data.protein}g` },
    { label: 'Fat', value: `${data.fat}g` },
    { label: 'Carbs', value: `${data.carbs}g` },
    { label: 'Sugar', value: `${data.sugar}g` },
    { label: 'Fiber', value: `${data.fiber}g` },
    { label: 'Sodium', value: `${data.sodium}mg` },
    { label: 'Cholesterol', value: `${data.cholesterol}mg` },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      {data.imageUrl && (
        <img src={data.imageUrl} alt={data.name} className="h-64 w-full rounded-2xl object-cover" />
      )}

      <div>
        <h1 className="text-2xl font-bold">{data.name}</h1>
        <p className="text-muted-foreground">{data.category}</p>
      </div>

      {data.allergens.length > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="font-medium text-red-400">Allergen Warning</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.allergens.map((a) => <Badge key={a} variant="danger">⚠ Contains {a}</Badge>)}
          </div>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Nutrition Facts</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {nutrients.map((n) => (
              <div key={n.label} className="rounded-xl bg-background/50 p-3">
                <p className="text-xs text-muted-foreground">{n.label}</p>
                <p className="font-semibold">{n.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" onClick={() => analyze.mutate()} disabled={analyze.isPending}>
        <Sparkles className="h-4 w-4" />
        {analyze.isPending ? 'Analyzing with AI...' : 'Analyze with AI'}
      </Button>
    </motion.div>
  );
}
