import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Activity,
  Droplets,
  Flame,
  Scale,
  Shield,
  TrendingUp,
  Utensils,
  ScanLine,
  Dumbbell,
  ChevronRight,
} from 'lucide-react';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { dashboardApi } from '@/api/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton, ErrorState } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getRiskColor } from '@/lib/utils';

const COLORS = ['#34d399', '#fbbf24', '#fb7185'];

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  delay,
}: {
  icon: typeof Activity;
  label: string;
  value: string | number;
  sub?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <div className="stat-card relative overflow-hidden">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl transition-all duration-500 group-hover:bg-violet-500/20" />

        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {label}
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-white">
              {value}
            </p>

            {sub && (
              <p className="mt-1 text-xs text-muted-foreground">
                {sub}
              </p>
            )}
          </div>

          <div className="icon-box">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Activity;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="section-icon">
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <h2 className="font-semibold tracking-tight text-white">
          {title}
        </h2>

        {subtitle && (
          <p className="text-xs text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await dashboardApi.get()).data.dashboard,
  });

  if (isLoading) {
    return (
      <div className="page-shell space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-[24px]" />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-[330px] rounded-[24px] lg:col-span-2" />
          <Skeleton className="h-[330px] rounded-[24px]" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <ErrorState
        message="Failed to load dashboard"
        onRetry={() => refetch()}
      />
    );
  }

  const riskScore =
    data.riskSummary.high * 3 +
    data.riskSummary.moderate * 2 +
    data.riskSummary.safe;

  const riskData = [
    { name: 'Safe', value: data.riskSummary.safe || 1 },
    { name: 'Moderate', value: data.riskSummary.moderate || 0 },
    { name: 'High', value: data.riskSummary.high || 0 },
  ];

  const calorieData = [
    {
      name: 'Calories',
      Consumed: data.consumedCalories,
      Remaining: Math.max(
        0,
        data.dailyCalories - data.consumedCalories
      ),
    },
  ];

  const macroData = [
    {
      name: 'Protein',
      value: data.nutritionSummary.protein,
      fill: '#a78bfa',
    },
    {
      name: 'Fat',
      value: data.nutritionSummary.fat,
      fill: '#fbbf24',
    },
    {
      name: 'Carbs',
      value: data.nutritionSummary.carbs,
      fill: '#34d399',
    },
  ];

  const calorieProgress =
    data.dailyCalories > 0
      ? Math.min(
          100,
          Math.round(
            (data.consumedCalories / data.dailyCalories) * 100
          )
        )
      : 0;

  const workoutProgress =
    data.workoutSummary.target > 0
      ? Math.min(
          100,
          Math.round(
            (data.workoutSummary.completed /
              data.workoutSummary.target) *
              100
          )
        )
      : 0;

  return (
    <div className="page-shell space-y-7 pb-10">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-header"
      >
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="status-dot" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-violet-300">
              FitScan Dashboard
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Your daily overview
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Keep track of your nutrition, activity and fitness progress.
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Scale}
          label="BMI"
          value={data.bmi || '—'}
          sub="Body mass index"
          delay={0}
        />

        <StatCard
          icon={Flame}
          label="Calories"
          value={`${data.consumedCalories}/${data.dailyCalories}`}
          sub="Consumed / daily target"
          delay={0.05}
        />

        <StatCard
          icon={Droplets}
          label="Water"
          value={`${data.waterIntake}L`}
          sub="Daily intake"
          delay={0.1}
        />

        <StatCard
          icon={Shield}
          label="Risk Score"
          value={riskScore}
          sub="Lower is better"
          delay={0.15}
        />
      </div>

      {/* Main analytics */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* Macros */}
        <Card className="premium-card lg:col-span-2">
          <CardHeader>
            <SectionTitle
              icon={Activity}
              title="Macronutrients"
              subtitle="Today's nutrition breakdown"
            />
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                data={macroData}
                barCategoryGap="28%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  stroke="#71717a"
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="#71717a"
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{
                    background: '#181522',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 14,
                    color: '#fff',
                  }}
                />

                <Bar
                  dataKey="value"
                  radius={[10, 10, 4, 4]}
                />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="metric-pill">
                <span className="metric-dot bg-violet-400" />
                <div>
                  <p className="font-semibold text-white">
                    {data.nutritionSummary.protein}g
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Protein
                  </p>
                </div>
              </div>

              <div className="metric-pill">
                <span className="metric-dot bg-amber-400" />
                <div>
                  <p className="font-semibold text-white">
                    {data.nutritionSummary.fat}g
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Fat
                  </p>
                </div>
              </div>

              <div className="metric-pill">
                <span className="metric-dot bg-emerald-400" />
                <div>
                  <p className="font-semibold text-white">
                    {data.nutritionSummary.carbs}g
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Carbs
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk */}
        <Card className="premium-card">
          <CardHeader>
            <SectionTitle
              icon={Shield}
              title="Food Risk"
              subtitle="Recent scan distribution"
            />
          </CardHeader>

          <CardContent>
            <div className="relative">
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={82}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {riskData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      background: '#181522',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 14,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">
                    {riskScore}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Score
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-emerald-400/5 px-3 py-2">
                <span className="flex items-center gap-2 text-sm">
                  <span className="metric-dot bg-emerald-400" />
                  Safe
                </span>
                <span className="font-semibold">
                  {data.riskSummary.safe}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-amber-400/5 px-3 py-2">
                <span className="flex items-center gap-2 text-sm">
                  <span className="metric-dot bg-amber-400" />
                  Moderate
                </span>
                <span className="font-semibold">
                  {data.riskSummary.moderate}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-rose-400/5 px-3 py-2">
                <span className="flex items-center gap-2 text-sm">
                  <span className="metric-dot bg-rose-400" />
                  High
                </span>
                <span className="font-semibold">
                  {data.riskSummary.high}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <div className="grid gap-5 lg:grid-cols-2">

        {/* Calories */}
        <Card className="premium-card">
          <CardHeader>
            <SectionTitle
              icon={Flame}
              title="Calorie Progress"
              subtitle="Today's calorie target"
            />
          </CardHeader>

          <CardContent>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <span className="text-3xl font-bold text-white">
                  {data.consumedCalories}
                </span>
                <span className="ml-2 text-sm text-muted-foreground">
                  / {data.dailyCalories} kcal
                </span>
              </div>

              <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
                {calorieProgress}%
              </span>
            </div>

            <div className="progress-track">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${calorieProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="progress-fill"
              />
            </div>

            <ResponsiveContainer
              width="100%"
              height={120}
              className="mt-5"
            >
              <AreaChart data={calorieData}>
                <defs>
                  <linearGradient
                    id="calGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#a78bfa"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="#a78bfa"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <Area
                  type="monotone"
                  dataKey="Consumed"
                  stroke="#a78bfa"
                  fill="url(#calGrad)"
                  strokeWidth={2}
                />

                <Tooltip
                  contentStyle={{
                    background: '#181522',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 14,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Workout */}
        <Card className="premium-card">
          <CardHeader>
            <SectionTitle
              icon={Dumbbell}
              title="Workout Today"
              subtitle="Your current workout progress"
            />
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-end gap-2">
                  <span className="gradient-text text-5xl font-bold">
                    {data.workoutSummary.completed}
                  </span>

                  <span className="mb-1 text-xl text-muted-foreground">
                    / {data.workoutSummary.target}
                  </span>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  workouts completed
                </p>
              </div>

              <div className="workout-orb">
                <TrendingUp className="h-7 w-7" />
              </div>
            </div>

            <div className="mt-7">
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Progress
                </span>

                <span className="font-semibold text-violet-300">
                  {workoutProgress}%
                </span>
              </div>

              <div className="progress-track">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${workoutProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="progress-fill"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meals + scans */}
      <div className="grid gap-5 lg:grid-cols-2">

        {/* Meals */}
        <Card className="premium-card">
          <CardHeader>
            <SectionTitle
              icon={Utensils}
              title="Today's Meals"
              subtitle="Your logged meals"
            />
          </CardHeader>

          <CardContent>
            {data.todayMeals.length === 0 ? (
              <div className="empty-state">
                <Utensils className="h-7 w-7" />
                <p>No meals logged today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.todayMeals.map(
                  (
                    meal: {
                      _id: string;
                      mealType: string;
                      foodName?: string;
                      calories?: number;
                    },
                    index: number
                  ) => (
                    <motion.div
                      key={meal._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="list-item"
                    >
                      <div className="flex items-center gap-3">
                        <div className="list-icon">
                          <Utensils className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="font-medium text-white">
                            {meal.foodName || 'Meal'}
                          </p>

                          <p className="text-xs capitalize text-muted-foreground">
                            {meal.mealType}
                          </p>
                        </div>
                      </div>

                      <span className="font-semibold text-violet-300">
                        {meal.calories || 0} kcal
                      </span>
                    </motion.div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scans */}
        <Card className="premium-card">
          <CardHeader>
            <SectionTitle
              icon={ScanLine}
              title="Recent Scans"
              subtitle="Latest food analysis results"
            />
          </CardHeader>

          <CardContent>
            {data.recentScans.length === 0 ? (
              <div className="empty-state">
                <ScanLine className="h-7 w-7" />
                <p>No scans yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentScans.map((scan) => (
                  <div
                    key={scan._id}
                    className="list-item"
                  >
                    <div className="flex items-center gap-3">
                      <div className="list-icon">
                        <ScanLine className="h-4 w-4" />
                      </div>

                      <p className="font-medium text-white">
                        {scan.detectedFoodName || 'Food'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        className={getRiskColor(
                          scan.prediction
                        )}
                      >
                        {scan.prediction}
                      </Badge>

                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}