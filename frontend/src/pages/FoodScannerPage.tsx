import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ImageUploader } from '@/components/scanner/ImageUploader';
import { scanApi } from '@/api/scans';
import { foodApi } from '@/api/foods';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Food } from '@/types';

export default function FoodScannerPage() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const { data: foods } = useQuery({
    queryKey: ['foods-manual', search],
    queryFn: async () => (await foodApi.search({ search, limit: 8 })).data.foods,
    enabled: manualMode,
  });

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setManualMode(false);
    setError('');
  };

  const handleScan = async () => {
    if (!file) return;
    setScanning(true);
    setError('');
    try {
      const { data } = await scanApi.upload(file);
      if (data.detected && data.scan) {
        navigate(`/results/${data.scan._id}`);
      } else {
        setManualMode(true);
        setError(data.message || 'Could not detect food. Please select manually.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const handleManualSelect = async (food: Food) => {
    setScanning(true);
    try {
      const { data } = await scanApi.analyze(food._id, true);
      navigate(`/results/${data.scan._id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold gradient-text">Food Scanner</h1>
        <p className="text-muted-foreground">Upload or capture food to get AI risk analysis</p>
      </motion.div>

      <ImageUploader
        preview={preview}
        scanning={scanning}
        onFileSelect={handleFile}
        onClear={() => { setPreview(null); setFile(null); setManualMode(false); }}
      />

      {error && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
          {error}
        </div>
      )}

      {file && !manualMode && (
        <Button className="w-full" onClick={handleScan} disabled={scanning}>
          {scanning ? 'Scanning...' : 'Analyze Food'}
        </Button>
      )}

      {(manualMode || !file) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Manual Food Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Search food..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="space-y-2">
              {foods?.map((food) => (
                <button
                  key={food._id}
                  onClick={() => handleManualSelect(food)}
                  disabled={scanning}
                  className="flex w-full items-center justify-between rounded-xl bg-background/50 p-3 text-left hover:bg-violet-500/10"
                >
                  <span>{food.name}</span>
                  <span className="text-sm text-muted-foreground">{food.calories} kcal</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
