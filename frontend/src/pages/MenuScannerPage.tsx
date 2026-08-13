import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';

import { ImageUploader } from '@/components/scanner/ImageUploader';
import { foodApi } from '@/api/foods';
import { scanApi } from '@/api/scans';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import type { Food } from '@/types';

export default function MenuScannerPage() {
  const navigate = useNavigate();

  const [preview, setPreview] = useState<string | null>(null);
  const [_file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [detectedItems, setDetectedItems] = useState<any[]>([]);

  // Manual fallback if OCR cannot detect anything
  const [search, setSearch] = useState('');
  const [ocrFailed, setOcrFailed] = useState(false);

  const { data: matchedFoods } = useQuery({
    queryKey: ['menu-foods', search],
    queryFn: async () =>
      (await foodApi.search({ search, limit: 10 })).data.foods,
    enabled: search.length > 1,
  });

  const handleFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setProcessing(true);
    setOcrFailed(false);
    setDetectedItems([]);

    try {
      const { data } = await scanApi.upload(selectedFile);

      if (data.success && data.detected && data.items && data.items.length > 0) {
        // Show detected menu items for manual selection
        setDetectedItems(data.items);
        return;
      }

      setOcrFailed(true);

      alert(data.message || 'Food could not be detected. Please search manually.');
    } catch (error) {
      console.error(error);

      setOcrFailed(true);

      alert('Failed to upload image.');
    } finally {
      setProcessing(false);
    }
  };

  const analyzeFood = async (food: Food) => {
    setProcessing(true);

    try {
      const { data } = await scanApi.analyze(food._id, true);

      navigate(`/results/${data.scan._id}`);
    } catch (err) {
      console.error(err);
      alert('Unable to analyze food.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-violet-500" />

          <div>
            <h1 className="text-2xl font-bold">
              AI Menu Scanner
            </h1>

            <p className="text-muted-foreground">
              Upload a restaurant menu and let AI analyze it.
            </p>
          </div>
        </div>
      </motion.div>

      <ImageUploader
        preview={preview}
        scanning={processing}
        onFileSelect={handleFile}
        onClear={() => {
          setPreview(null);
          setFile(null);
          setSearch('');
          setOcrFailed(false);
          setDetectedItems([]);
        }}
      />

      {detectedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detected Menu Items</CardTitle>
            <p className="text-sm text-muted-foreground">Choose a dish to analyze</p>
          </CardHeader>

          <CardContent className="space-y-4">
            {detectedItems.map((it) => (
              <div key={it.food._id} className="rounded-xl border p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-lg">{it.food.name}</div>
                  <div className="text-sm text-muted-foreground">{it.food.category}</div>

                  <div className="mt-2 text-sm">
                    <div>{it.food.calories} kcal</div>
                    <div>Protein {it.food.protein}g</div>
                    <div>Carbs {it.food.carbs}g</div>
                    <div>Fat {it.food.fat}g</div>
                  </div>

                  {it.food.allergens?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {it.food.allergens.map((a: string) => (
                        <div key={a} className="text-xs text-red-400">⚠ {a}</div>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 text-xs text-muted-foreground">Match confidence: {(it.confidence * 100).toFixed(0)}%</div>
                </div>

                <div className="flex items-center">
                  <Button onClick={() => analyzeFood(it.food)} disabled={processing}>
                    Analyze This Dish
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {ocrFailed && (
        <Card className="border-yellow-500">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-500">
              OCR could not detect any food from this image.
              You can search for the food manually below.
            </p>
          </CardContent>
        </Card>
      )}

      {ocrFailed && (
        <Card>
          <CardHeader>
            <CardTitle>
              Search Food Manually
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Input
              placeholder="Search food..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {matchedFoods?.map((food) => (
              <button
                key={food._id}
                onClick={() => analyzeFood(food)}
                disabled={processing}
                className="flex w-full items-center justify-between rounded-xl border p-3 hover:bg-violet-500/10"
              >
                <div>
                  <div className="font-semibold">
                    {food.name}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {food.calories} kcal
                  </div>
                </div>

                <Button>
                  Analyze
                </Button>
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}