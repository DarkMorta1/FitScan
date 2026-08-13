import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Utensils, Scan, BarChart3, Plus, Trash2, Pencil } from 'lucide-react';
import { adminApi } from '@/api/dashboard';
import { foodApi } from '@/api/foods';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Skeleton, ErrorState } from '@/components/ui/skeleton';
import type { Food } from '@/types';

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editFood, setEditFood] = useState<Food | null>(null);

  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => (await adminApi.getStats()).data.stats,
  });

  const { data: foods } = useQuery({
    queryKey: ['admin-foods'],
    queryFn: async () => (await foodApi.search({ limit: 50 })).data.foods,
  });

  const deleteFood = useMutation({
    mutationFn: foodApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-foods'] }),
  });

  const saveFood = useMutation({
    mutationFn: (data: Partial<Food> & { _id?: string }) =>
      data._id ? foodApi.update(data._id, data) : foodApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-foods'] });
      setShowForm(false);
      setEditFood(null);
    },
  });

  if (isLoading) return <Skeleton className="h-96" />;
  if (error) return <ErrorState message="Failed to load admin data" onRetry={() => refetch()} />;

  const statCards = [
    { icon: Users, label: 'Users', value: stats?.users },
    { icon: Utensils, label: 'Foods', value: stats?.foods },
    { icon: Scan, label: 'Scans', value: stats?.scans },
    { icon: BarChart3, label: 'Meals', value: stats?.meals },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold gradient-text">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage foods, users, and view statistics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <Icon className="h-8 w-8 text-violet-400" />
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Foods</CardTitle>
          <Button size="sm" onClick={() => { setEditFood(null); setShowForm(true); }}>
            <Plus className="h-4 w-4" /> Add Food
          </Button>
        </CardHeader>
        <CardContent>
          {(showForm || editFood) && (
            <form
              className="mb-6 grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                saveFood.mutate({
                  _id: editFood?._id,
                  name: fd.get('name') as string,
                  category: fd.get('category') as string,
                  calories: Number(fd.get('calories')),
                  protein: Number(fd.get('protein')),
                  fat: Number(fd.get('fat')),
                  carbs: Number(fd.get('carbs')),
                  sugar: Number(fd.get('sugar')),
                  fiber: Number(fd.get('fiber')),
                  sodium: Number(fd.get('sodium')),
                  cholesterol: Number(fd.get('cholesterol')),
                  imageUrl: fd.get('imageUrl') as string,
                  allergens: [],
                });
              }}
            >
              <div><Label>Name</Label><Input name="name" defaultValue={editFood?.name} required /></div>
              <div><Label>Category</Label><Input name="category" defaultValue={editFood?.category} required /></div>
              <div><Label>Calories</Label><Input name="calories" type="number" defaultValue={editFood?.calories} required /></div>
              <div><Label>Protein</Label><Input name="protein" type="number" defaultValue={editFood?.protein} required /></div>
              <div><Label>Fat</Label><Input name="fat" type="number" defaultValue={editFood?.fat} required /></div>
              <div><Label>Carbs</Label><Input name="carbs" type="number" defaultValue={editFood?.carbs} required /></div>
              <div><Label>Sugar</Label><Input name="sugar" type="number" defaultValue={editFood?.sugar ?? 0} /></div>
              <div><Label>Fiber</Label><Input name="fiber" type="number" defaultValue={editFood?.fiber ?? 0} /></div>
              <div><Label>Sodium</Label><Input name="sodium" type="number" defaultValue={editFood?.sodium ?? 0} /></div>
              <div><Label>Cholesterol</Label><Input name="cholesterol" type="number" defaultValue={editFood?.cholesterol ?? 0} /></div>
              <div className="sm:col-span-2"><Label>Image URL</Label><Input name="imageUrl" defaultValue={editFood?.imageUrl} /></div>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" size="sm">{editFood ? 'Update' : 'Create'}</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); setEditFood(null); }}>Cancel</Button>
              </div>
            </form>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {foods?.map((food) => (
              <div key={food._id} className="flex items-center justify-between rounded-xl bg-background/50 p-3">
                <div>
                  <p className="font-medium">{food.name}</p>
                  <p className="text-xs text-muted-foreground">{food.category} · {food.calories} kcal</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => { setEditFood(food); setShowForm(false); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteFood.mutate(food._id)}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
