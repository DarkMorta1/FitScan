import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  preview?: string | null;
  onClear?: () => void;
  scanning?: boolean;
  className?: string;
}

export function ImageUploader({ onFileSelect, preview, onClear, scanning, className }: ImageUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (file && file.type.startsWith('image/')) onFileSelect(file);
    },
    [onFileSelect]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          'relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300',
          dragOver ? 'border-violet-500 bg-violet-500/10' : 'border-border bg-card/40',
          preview ? 'border-solid' : 'min-h-[280px]'
        )}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="max-h-80 w-full object-cover" />
            <AnimatePresence>
              {scanning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/40"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-violet-400 to-transparent animate-scan" />
                  <p className="absolute inset-0 flex items-center justify-center text-lg font-medium text-white">
                    Analyzing...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            {onClear && !scanning && (
              <button
                onClick={onClear}
                className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="rounded-2xl bg-violet-500/20 p-4">
              <Upload className="h-8 w-8 text-violet-400" />
            </div>
            <div>
              <p className="font-medium">Drag & drop your food image</p>
              <p className="mt-1 text-sm text-muted-foreground">or use camera / gallery</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => cameraRef.current?.click()}>
                <Camera className="h-4 w-4" /> Camera
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                <ImageIcon className="h-4 w-4" /> Gallery
              </Button>
            </div>
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
