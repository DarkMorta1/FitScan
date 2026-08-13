import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { userApi } from '@/api/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserProfile } from '@/types';

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await userApi.getProfile()).data,
  });

  const updateMutation = useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  if (isLoading) return <Skeleton className="h-64" />;

  const profile = data?.user.profile || {};

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const equipment = fd.getAll('equipment').map((item) => String(item));
    const medicalConditions = fd.getAll('medicalConditions').map((item) => String(item));
    const allergies = fd.getAll('allergies').map((item) => String(item));
    const updatedProfile: UserProfile = {
      age: Number(fd.get('age')),
      gender: fd.get('gender') as UserProfile['gender'],
      height: Number(fd.get('height')),
      weight: Number(fd.get('weight')),
      goal: fd.get('goal') as UserProfile['goal'],
      activityLevel: fd.get('activityLevel') as UserProfile['activityLevel'],
      dietaryPreference: (fd.get('dietaryPreference') as UserProfile['dietaryPreference']) || 'Non-Vegetarian',
      medicalConditions,
      allergies,
      fitnessLevel: fd.get('fitnessLevel') ? (fd.get('fitnessLevel') as UserProfile['fitnessLevel']) : undefined,
      workoutDays: Number(fd.get('workoutDays')),
      workoutDurationMinutes: Number(fd.get('workoutDurationMinutes')),
      equipment,
      preferredWorkoutType: fd.get('preferredWorkoutType') as UserProfile['preferredWorkoutType'],
    };
    updateMutation.mutate({
      name: fd.get('name') as string,
      phone: fd.get('phone') as string,
      profile: updatedProfile,
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
        <CardContent>
          <Button variant="outline" onClick={toggleTheme}>
            Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Name</Label><Input name="name" defaultValue={data?.user.name} /></div>
              <div><Label>Phone</Label><Input name="phone" defaultValue={data?.user.phone} /></div>
              <div><Label>Age</Label><Input name="age" type="number" defaultValue={profile.age} /></div>
              <div>
                <Label>Gender</Label>
                <select name="gender" defaultValue={profile.gender} className="flex h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div><Label>Height (cm)</Label><Input name="height" type="number" defaultValue={profile.height} /></div>
              <div><Label>Weight (kg)</Label><Input name="weight" type="number" defaultValue={profile.weight} /></div>
              <div>
                <Label>Goal</Label>
                <select name="goal" defaultValue={profile.goal} className="flex h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm">
                  <option value="Bulking">Bulking</option>
                  <option value="Cutting">Cutting</option>
                  <option value="Maintain">Maintain</option>
                </select>
              </div>
              <div>
                <Label>Dietary Preference</Label>
                <select name="dietaryPreference" defaultValue={profile.dietaryPreference || 'Non-Vegetarian'} className="flex h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm">
                  <option value="Vegan">Vegan</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                </select>
              </div>
              <div>
                <Label>Activity</Label>
                <select name="activityLevel" defaultValue={profile.activityLevel} className="flex h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm">
                  {['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'].map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Fitness Level</Label>
                <select name="fitnessLevel" defaultValue={profile.fitnessLevel || ''} className="flex h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm">
                  <option value="">Auto Detect</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <Label>Workout Days</Label>
                <select name="workoutDays" defaultValue={profile.workoutDays || 3} className="flex h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm">
                  {[1, 2, 3, 4, 5, 6].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Duration (minutes)</Label>
                <select name="workoutDurationMinutes" defaultValue={profile.workoutDurationMinutes || 45} className="flex h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm">
                  {[15, 30, 45, 60, 90].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Preferred Workout Type</Label>
                <select name="preferredWorkoutType" defaultValue={profile.preferredWorkoutType || 'Mixed'} className="flex h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm">
                  <option value="Strength">Strength</option>
                  <option value="Cardio">Cardio</option>
                  <option value="Mixed">Mixed</option>
                  <option value="Bodyweight">Bodyweight</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label>Equipment</Label>
                <div className="flex flex-wrap gap-2">
                  {['None', 'Dumbbell', 'Barbell', 'Cable Machine', 'Machine', 'Pull-up Bar', 'Kettlebell', 'Resistance Band', 'Bench', 'Treadmill', 'Bicycle'].map((item) => (
                    <label key={item} className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        name="equipment"
                        value={item}
                        defaultChecked={profile.equipment?.includes(item)}
                        className="h-4 w-4"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              {saved && <span className="text-sm text-emerald-400 self-center">Saved!</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <p className="text-sm">Role: <span className="capitalize">{user?.role}</span></p>
          <Button variant="destructive" onClick={logout}>Sign Out</Button>
        </CardContent>
      </Card>
    </div>
  );
}
