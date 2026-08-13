import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { foodApi } from '@/api/foods';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton, ErrorState } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function FoodSearchPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await foodApi.getCategories()).data.categories,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['foods', search, category],
    queryFn: async () => (await foodApi.search({ search, category, limit: 24 })).data,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Food Search</h1>
        <p className="text-muted-foreground">Browse our nutrition database</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search foods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {categories && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('')}
            className={`rounded-full px-4 py-1.5 text-sm ${!category ? 'bg-violet-500/20 text-violet-300' : 'bg-muted'}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-1.5 text-sm ${category === c ? 'bg-violet-500/20 text-violet-300' : 'bg-muted'}`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      )}

      {error && <ErrorState message="Failed to load foods" onRetry={() => refetch()} />}

      {data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.foods.map((food) => (
            <Link key={food._id} to={`/foods/${food._id}`}>
              <Card className="overflow-hidden transition-transform hover:scale-[1.02]">
                {food.imageUrl && (
                  <img src={food.imageUrl} alt={food.name} className="h-36 w-full object-cover" />
                )}
                <CardContent className="pt-4">
                  <h3 className="font-semibold">{food.name}</h3>
                  <p className="text-sm text-muted-foreground">{food.category}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-violet-400 font-medium">{food.calories} kcal</span>
                    <span className="text-xs text-muted-foreground">P: {food.protein}g</span>
                  </div>
                  {food.allergens.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {food.allergens.map((a) => <Badge key={a} variant="danger">{a}</Badge>)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
