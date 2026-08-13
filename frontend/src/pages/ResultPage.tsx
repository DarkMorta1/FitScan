import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { scanApi } from '@/api/scans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoader, ErrorState } from '@/components/ui/skeleton';
import { getRiskColor } from '@/lib/utils';

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['scan', id],
    queryFn: async () => (await scanApi.getById(id!)).data.scan,
    enabled: !!id,
  });

  if (isLoading) return <PageLoader />;
  if (error || !data) return <ErrorState message="Result not found" />;

  const food = data.food;
  const riskVariant = data.prediction === 'Safe' ? 'success' : data.prediction === 'Moderate Risk' ? 'warning' : 'danger';

  const allergyWarnings = data.allergyWarnings ?? data.allergenWarnings ?? [];
  const dietaryWarnings = data.dietaryWarnings ?? [];
  const medicalWarnings = data.medicalWarnings ?? [];
  const personalizationReasons = data.personalizationReasons ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Button>

      {(data.imageUrl || food?.imageUrl) && (
        <img
          src={data.imageUrl?.startsWith('http') ? data.imageUrl : `${data.imageUrl}`}
          alt={food?.name}
          className="h-56 w-full rounded-2xl object-cover"
        />
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{food?.name || data.detectedFoodName}</h1>
          <p className="text-muted-foreground">AI Nutrition Analysis</p>
        </div>
        <Badge variant={riskVariant} className={`text-sm ${getRiskColor(data.prediction)}`}>
          {data.prediction}
        </Badge>
      </div>

      <Card className="border-violet-500/30">
        <CardContent className="flex items-center gap-6 pt-6">
          <div className="text-center">
            <p className="text-4xl font-bold gradient-text">{data.confidence}%</p>
            <p className="text-sm text-muted-foreground">Confidence</p>
          </div>
          <div className="h-12 w-px bg-border" />
          <div>
            <p className="font-medium">Risk Assessment</p>
            <p className="text-sm text-muted-foreground">Powered by FITSCAN AI</p>
          </div>
        </CardContent>
      </Card>

      {allergyWarnings.length > 0 && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <p className="font-semibold">Allergy Alert</p>
          </div>
          <div className="mt-3 space-y-2">
            {allergyWarnings.map((a) => (
              <p key={a} className="text-red-300">⚠ Contains {a}</p>
            ))}
          </div>
        </div>
      )}

      {dietaryWarnings.length > 0 && (
        <div className="rounded-2xl border border-violet-500/40 bg-violet-500/10 p-5">
          <div className="flex items-center gap-2 text-violet-400">
            <AlertTriangle className="h-5 w-5" />
            <p className="font-semibold">Dietary Warning</p>
          </div>
          <div className="mt-3 space-y-2">
            {dietaryWarnings.map((warning) => (
              <p key={warning} className="text-violet-300">⚠ {warning}</p>
            ))}
          </div>
        </div>
      )}

      {medicalWarnings.length > 0 && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            <p className="font-semibold">Medical Warning</p>
          </div>
          <div className="mt-3 space-y-2">
            {medicalWarnings.map((warning) => (
              <p key={warning} className="text-amber-300">⚠ {warning}</p>
            ))}
          </div>
        </div>
      )}

      {personalizationReasons.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Personalization Notes</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {personalizationReasons.map((reason) => (
              <div key={reason} className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 text-slate-400" />
                {reason}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {data.reasons.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Reasons</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.reasons.map((r) => (
              <div key={r} className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                {r}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {food && (
        <Card>
          <CardHeader><CardTitle>Nutrition Facts</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3 text-center">
              {[
                { l: 'Cal', v: food.calories },
                { l: 'Protein', v: `${food.protein}g` },
                { l: 'Fat', v: `${food.fat}g` },
                { l: 'Carbs', v: `${food.carbs}g` },
              ].map((n) => (
                <div key={n.l} className="rounded-xl bg-background/50 p-3">
                  <p className="text-xs text-muted-foreground">{n.l}</p>
                  <p className="font-bold">{n.v}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.alternatives.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Healthy Alternatives</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.alternatives.map((alt) => (
              <div key={alt} className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                {alt}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
