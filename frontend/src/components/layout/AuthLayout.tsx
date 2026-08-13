import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 text-xl font-bold text-white">
              F
            </div>
          </Link>
          <h1 className="mt-4 text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-muted-foreground">{subtitle}</p>
        </div>
        <Card>
          <CardContent className="pt-6">{children}</CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
