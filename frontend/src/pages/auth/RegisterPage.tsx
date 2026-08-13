import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Sparkles, Target, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const passwordValue = watch('password') || '';

  const passwordStrength = useMemo(() => {
    let score = 0;

    if (passwordValue.length >= 8) score += 1;
    if (/[A-Z]/.test(passwordValue)) score += 1;
    if (/[0-9]/.test(passwordValue)) score += 1;
    if (/[^A-Za-z0-9]/.test(passwordValue)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-400' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-400' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-sky-400' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-400' };
  }, [passwordValue]);

  const onSubmit = async (data: FormData) => {
    setError('');
    setLoading(true);
    try {
      await registerUser(data);
      navigate('/onboarding');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b18] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.2),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.12),transparent_25%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/70 shadow-[0_40px_120px_rgba(15,23,42,0.75)] backdrop-blur-xl ring-1 ring-white/5 lg:grid lg:grid-cols-[1.08fr_0.92fr]">
          <div className="hidden flex-col justify-between bg-gradient-to-br from-slate-950 via-violet-950 to-indigo-900 p-8 lg:flex">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-xl font-black text-white shadow-lg shadow-violet-500/20">
                F
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-violet-200/80">FitScan</p>
                <p className="text-lg font-semibold text-white">Build your best season</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-violet-200/80">Launch plan</p>
                <h2 className="mt-4 max-w-md text-4xl font-bold leading-tight text-white">
                  Make every meal and workout work harder for you.
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Target className="h-5 w-5 text-violet-200" />
                  <div>
                    <p className="font-semibold text-white">Goal-based tracking</p>
                    <p className="text-sm text-slate-300/80">Set targets and stay accountable.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <TrendingUp className="h-5 w-5 text-cyan-200" />
                  <div>
                    <p className="font-semibold text-white">Progress insights</p>
                    <p className="text-sm text-slate-300/80">Monitor trends with AI-powered recommendations.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-violet-100/80">
              <Sparkles className="h-4 w-4" />
              Join the next generation of smarter fitness habits.
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
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-cyan-200">
                Create account
              </span>
            </div>

            <div className="mb-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">Start your journey</p>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Build your fitness profile</h1>
              <p className="mt-3 text-sm text-slate-300/80">
                Set up your account and unlock AI-guided nutrition and training support.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-slate-200">
                  Full name
                </Label>
                <Input
                  id="name"
                  autoComplete="name"
                  placeholder="John Doe"
                  className={errors.name ? 'border-red-500/60 bg-red-500/5 focus-visible:ring-red-500/40' : 'h-12 border-white/10 bg-slate-900/70 text-white placeholder:text-slate-400'}
                  {...register('name')}
                />
                {errors.name && <p className="text-xs text-red-300">{errors.name.message}</p>}
              </div>

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
                <Label htmlFor="phone" className="text-sm font-medium text-slate-200">
                  Phone number <span className="text-slate-400">(optional)</span>
                </Label>
                <Input
                  id="phone"
                  autoComplete="tel"
                  placeholder="+1 (555) 112-3344"
                  className="h-12 border-white/10 bg-slate-900/70 text-white placeholder:text-slate-400"
                  {...register('phone')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-200">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
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

                {passwordValue && (
                  <div className="pt-1">
                    <div className="mb-2 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
                      <span>Password strength</span>
                      <span className="text-slate-200">{passwordStrength.label}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[0, 1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className={`h-2 rounded-full ${step < passwordStrength.score ? passwordStrength.color : 'bg-slate-800/80'}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {errors.password && <p className="text-xs text-red-300">{errors.password.message}</p>}
              </div>

              <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-purple-500 disabled:opacity-60" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>

              <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-xs text-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                Secure onboarding with AI-powered health setup.
              </div>

              <p className="text-center text-sm text-slate-300/80">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-violet-300 transition hover:text-violet-200">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
