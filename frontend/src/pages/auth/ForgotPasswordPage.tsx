import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { authApi } from '@/api/auth';

const schema = z.object({ email: z.string().email('Invalid email') });

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: { email: string }) => {
    setLoading(true);
    try {
      const { data: res } = await authApi.forgotPassword(data.email);
      setMessage(res.message);
      if (res.resetToken) setResetToken(res.resetToken);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot password" subtitle="We'll send you reset instructions">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {message && (
          <div className="rounded-lg bg-violet-500/10 p-3 text-sm text-violet-300">
            {message}
            {resetToken && (
              <p className="mt-2">
                Dev reset token:{' '}
                <Link to={`/reset-password?token=${resetToken}`} className="underline">
                  Click to reset
                </Link>
              </p>
            )}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
        <p className="text-center text-sm">
          <Link to="/login" className="text-violet-400 hover:underline">Back to login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
