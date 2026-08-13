import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { userApi } from '@/api/users';
import { useAuth } from '@/context/AuthContext';
import type { UserProfile } from '@/types';

const GOALS = ['Bulking', 'Cutting', 'Maintain'] as const;
const ACTIVITY = ['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'] as const;
const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
const FITNESS_OPTIONS = ['Auto Detect', ...FITNESS_LEVELS] as const;
const WORKOUT_DAYS = [1, 2, 3, 4, 5, 6] as const;
const DURATION_OPTIONS = [15, 30, 45, 60, 90] as const;
const PREFERRED_WORKOUT_TYPES = ['Strength', 'Cardio', 'Mixed', 'Bodyweight'] as const;
const EQUIPMENT_OPTIONS = [
  'None',
  'Dumbbell',
  'Barbell',
  'Cable Machine',
  'Machine',
  'Pull-up Bar',
  'Kettlebell',
  'Resistance Band',
  'Bench',
  'Treadmill',
  'Bicycle',
] as const;
const DIETARY_PREFERENCES = ['Vegan', 'Vegetarian', 'Non-Vegetarian'] as const;
const CONDITIONS = ['Diabetes', 'Hypertension', 'High Cholesterol', 'Heart Disease', 'Kidney Disease', 'Liver Disease', 'Thyroid Disorder', 'PCOS', 'Gastritis'] as const;
const ALLERGIES = ['Milk', 'Peanut', 'Egg', 'Gluten', 'Soy', 'Fish', 'Shellfish', 'Tree Nuts', 'Sesame', 'Wheat'] as const;

export default function OnboardingPage() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile & { name: string; phone: string }>({
    name: '',
    phone: '',
    age: 25,
    gender: 'Male',
    height: 170,
    weight: 70,
    goal: 'Maintain',
    activityLevel: 'Moderate',
    dietaryPreference: 'Non-Vegetarian',
    medicalConditions: [],
    allergies: [],
    workoutDays: 3,
    workoutDurationMinutes: 45,
    equipment: [],
    preferredWorkoutType: 'Mixed',
  });

  const toggleArray = (key: 'medicalConditions' | 'allergies', value: string) => {
    setProfile((p) => {
      const arr = p[key] || [];
      return {
        ...p,
        [key]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value],
      };
    });
  };

  const toggleEquipment = (value: string) => {
    setProfile((p) => {
      const arr = p.equipment || [];
      if (value === 'None') {
        return { ...p, equipment: arr.includes('None') ? [] : ['None'] };
      }
      const withoutNone = arr.filter((x) => x !== 'None');
      return { ...p, equipment: withoutNone.includes(value) ? withoutNone.filter((x) => x !== value) : [...withoutNone, value] };
    });
  };

  const validateProfile = (profile: UserProfile & { name: string; phone: string }) => {
    const workoutDays = profile.workoutDays ?? 0;
    const workoutDurationMinutes = profile.workoutDurationMinutes ?? 0;

    if (profile.fitnessLevel != null && !FITNESS_LEVELS.includes(profile.fitnessLevel as any)) {
      return 'Fitness level must be Beginner, Intermediate, Advanced, or Auto Detect.';
    }
    if (!Number.isInteger(workoutDays) || workoutDays < 1 || workoutDays > 6) {
      return 'Workout days must be between 1 and 6.';
    }
    if (!Number.isInteger(workoutDurationMinutes) || workoutDurationMinutes < 15 || workoutDurationMinutes > 180) {
      return 'Workout duration must be between 15 and 180 minutes.';
    }
    if (!PREFERRED_WORKOUT_TYPES.includes(profile.preferredWorkoutType as any)) {
      return 'Preferred workout type is invalid.';
    }
    if (profile.equipment && !Array.isArray(profile.equipment)) {
      return 'Equipment must be an array.';
    }
    return null;
  };

  const submit = async () => {
    setLoading(true);
    try {
      const error = validateProfile(profile);
      if (error) {
        alert(error);
        return;
      }

      const { name, phone, ...profileData } = profile;
      const normalizedProfile = {
        ...profileData,
        dietaryPreference: profile.dietaryPreference || 'Non-Vegetarian',
        fitnessLevel: profile.fitnessLevel === undefined ? undefined : profile.fitnessLevel,
        workoutDays: Number(profile.workoutDays),
        workoutDurationMinutes: Number(profile.workoutDurationMinutes),
        equipment: profile.equipment || [],
        preferredWorkoutType: profile.preferredWorkoutType,
      } as UserProfile;

      await userApi.updateProfile({ name, phone, profile: normalizedProfile });
      await refreshUser();
      navigate('/dashboard');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    <div key="basic" className="space-y-4">
      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Phone</Label>
        <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Age</Label>
          <Input type="number" value={profile.age} onChange={(e) => setProfile({ ...profile, age: +e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <select
            className="flex h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm"
            value={profile.gender}
            onChange={(e) => setProfile({ ...profile, gender: e.target.value as UserProfile['gender'] })}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>,
    <div key="body" className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Height (cm)</Label>
          <Input type="number" value={profile.height} onChange={(e) => setProfile({ ...profile, height: +e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Weight (kg)</Label>
          <Input type="number" value={profile.weight} onChange={(e) => setProfile({ ...profile, weight: +e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Goal</Label>
        <div className="grid grid-cols-3 gap-2">
          {GOALS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setProfile({ ...profile, goal: g })}
              className={`rounded-xl border p-3 text-sm transition-all ${profile.goal === g ? 'border-violet-500 bg-violet-500/20' : 'border-border hover:border-violet-500/50'}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Activity Level</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ACTIVITY.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setProfile({ ...profile, activityLevel: a })}
              className={`rounded-xl border p-2 text-xs transition-all ${profile.activityLevel === a ? 'border-violet-500 bg-violet-500/20' : 'border-border'}`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>,
    <div key="workout" className="space-y-4">
      <div>
        <Label>Fitness Level</Label>
        <div className="grid grid-cols-4 gap-2">
          {FITNESS_OPTIONS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setProfile({ ...profile, fitnessLevel: f === 'Auto Detect' ? undefined : f as any })}
              className={`rounded-xl border p-3 text-sm transition-all ${((f === 'Auto Detect' && profile.fitnessLevel === undefined) || profile.fitnessLevel === f) ? 'border-violet-500 bg-violet-500/20' : 'border-border hover:border-violet-500/50'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Workout Days Per Week</Label>
        <div className="grid grid-cols-6 gap-2">
          {WORKOUT_DAYS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setProfile({ ...profile, workoutDays: d })}
              className={`rounded-xl border p-2 text-sm ${profile.workoutDays === d ? 'border-violet-500 bg-violet-500/20' : 'border-border'}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Workout Duration (minutes)</Label>
        <div className="grid grid-cols-5 gap-2">
          {DURATION_OPTIONS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setProfile({ ...profile, workoutDurationMinutes: m })}
              className={`rounded-xl border p-2 text-sm ${profile.workoutDurationMinutes === m ? 'border-violet-500 bg-violet-500/20' : 'border-border'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Available Equipment (select any)</Label>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_OPTIONS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => toggleEquipment(e === 'None' ? 'None' : e)}
              className={`rounded-full border px-4 py-2 text-sm ${profile.equipment?.includes(e === 'None' ? 'None' : e) ? 'border-violet-500 bg-violet-500/20' : 'border-border'}`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Preferred Workout Type</Label>
        <div className="grid grid-cols-4 gap-2">
          {PREFERRED_WORKOUT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setProfile({ ...profile, preferredWorkoutType: t as any })}
              className={`rounded-xl border p-2 text-sm ${profile.preferredWorkoutType === t ? 'border-violet-500 bg-violet-500/20' : 'border-border'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>,
    <div key="health" className="space-y-6">
      <div>
        <Label className="mb-3 block">Dietary Preference</Label>
        <div className="flex flex-wrap gap-2">
          {DIETARY_PREFERENCES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setProfile({ ...profile, dietaryPreference: d })}
              className={`rounded-full border px-4 py-2 text-sm ${profile.dietaryPreference === d ? 'border-violet-500 bg-violet-500/20 text-violet-300' : 'border-border'}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label className="mb-3 block">Medical Conditions</Label>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleArray('medicalConditions', c)}
              className={`rounded-full border px-4 py-2 text-sm ${profile.medicalConditions?.includes(c) ? 'border-amber-500 bg-amber-500/20 text-amber-300' : 'border-border'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label className="mb-3 block">Allergies</Label>
        <div className="flex flex-wrap gap-2">
          {ALLERGIES.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => toggleArray('allergies', a)}
              className={`rounded-full border px-4 py-2 text-sm ${profile.allergies?.includes(a) ? 'border-red-500 bg-red-500/20 text-red-300' : 'border-border'}`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>,
  ];

  return (
    <div className="mx-auto flex min-h-screen max-w-lg items-center p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="gradient-text">Complete Your Profile</CardTitle>
          <p className="text-sm text-muted-foreground">Step {step + 1} of {steps.length}</p>
          <div className="mt-2 flex gap-1">
            {steps.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-violet-500' : 'bg-muted'}`} />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {steps[step]}
          </motion.div>
          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
            ) : (
              <Button onClick={submit} disabled={loading}>
                {loading ? 'Saving...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
