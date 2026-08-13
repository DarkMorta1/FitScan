import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { authApi } from '@/api/auth';

const schema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<{ token: string; password: string }>({
    resolver: zodResolver(schema),
    defaultValues: { token: params.get('token') || '' },
  });

  const onSubmit = async (data: { token: string; password: string }) => {
    setLoading(true);
    try {
      await authApi.resetPassword(data.token, data.password);
      navigate('/login');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset password" subtitle="Enter your new password">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
        <div className="space-y-2">
          <Label htmlFor="token">Reset Token</Label>
          <Input id="token" {...register('token')} />
          {errors.token && <p className="text-xs text-red-400">{errors.token.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input id="password" type="password" {...register('password')} />
          {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
        <p className="text-center text-sm">
          <Link to="/login" className="text-violet-400 hover:underline">Back to login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
