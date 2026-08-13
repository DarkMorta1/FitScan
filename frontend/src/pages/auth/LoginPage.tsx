import { useState } from 'react';
import { ArrowRight, Activity, Eye, EyeOff, Gauge, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      if (!user.onboardingComplete && user.role !== 'admin') navigate('/onboarding');
      else navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b18] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.25),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.12),transparent_25%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/70 shadow-[0_40px_120px_rgba(15,23,42,0.75)] backdrop-blur-xl ring-1 ring-white/5 lg:grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden flex-col justify-between bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 p-8 lg:flex">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl font-black shadow-lg shadow-violet-500/20 backdrop-blur-sm">
                F
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-violet-100/80">FitScan</p>
                <p className="text-lg font-semibold text-white">AI fitness command center</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-violet-100/80">Performance overview</p>
                <h2 className="mt-4 max-w-md text-4xl font-bold leading-tight text-white">
                  Train smarter with data-driven daily coaching.
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <Activity className="mb-3 h-5 w-5 text-cyan-200" />
                  <p className="text-2xl font-bold text-white">86%</p>
                  <p className="text-xs text-violet-100/80">Workout completion</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <Gauge className="mb-3 h-5 w-5 text-cyan-200" />
                  <p className="text-2xl font-bold text-white">+24%</p>
                  <p className="text-xs text-violet-100/80">Recovery gain</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <ShieldCheck className="mb-3 h-5 w-5 text-cyan-200" />
                  <p className="text-2xl font-bold text-white">4.9/5</p>
                  <p className="text-xs text-violet-100/80">Coach rating</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-violet-100/80">
              <Sparkles className="h-4 w-4" />
              Personalized nutrition, training, and progress insights.
            </div>
          </div>

          <div className="bg-slate-950/80 p-6 sm:p-8 lg:p-10">
            <div className="mb-8 flex items-center justify-between">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 text-lg font-black text-white shadow-lg shadow-violet-500/20">
                  F
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">FitScan</p>
                </div>
              </Link>
              <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-violet-200">
                Smart health
              </span>
            </div>

            <div className="mb-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">Welcome back</p>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Log in to continue</h1>
              <p className="mt-3 text-sm text-slate-300/80">
                Pick up where you left off with your fitness and nutrition insights.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-200">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={errors.email ? 'border-red-500/60 bg-red-500/5 focus-visible:ring-red-500/40' : 'h-12 border-white/10 bg-slate-900/70 text-white placeholder:text-slate-400'}
                  {...register('email')}
                />
                {errors.email && <p className="text-xs text-red-300">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-200">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={errors.password ? 'border-red-500/60 bg-red-500/5 pr-11 focus-visible:ring-red-500/40' : 'h-12 border-white/10 bg-slate-900/70 pr-11 text-white placeholder:text-slate-400'}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition hover:text-slate-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-300">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-end">
                <Link to="/forgot-password" className="text-sm font-medium text-violet-300 transition hover:text-violet-200">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-purple-500 disabled:opacity-60" disabled={loading}>
                {loading ? 'Signing in...' : 'Log in'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>

              <p className="text-center text-sm text-slate-300/80">
                No account yet?{' '}
                <Link to="/register" className="font-medium text-violet-300 transition hover:text-violet-200">
                  Create account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
