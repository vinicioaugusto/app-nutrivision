'use client';

import { Camera, Upload } from 'lucide-react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase, uploadMealImage } from '@/lib/supabase';
import { toast } from 'sonner';

interface AddMealButtonProps {
  onMealAnalyzed: (imageUrl: string, analysis: any) => void;
}

export function AddMealButton({ onMealAnalyzed }: AddMealButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Verificar se Supabase está configurado
    if (!supabase) {
      toast.error('Configure suas credenciais do Supabase primeiro!');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsAnalyzing(true);

    try {
      // Upload para Supabase
      const imageUrl = await uploadMealImage(file);

      // Analisar com IA
      const response = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        throw new Error('Erro ao analisar imagem');
      }

      const analysis = await response.json();
      onMealAnalyzed(imageUrl, analysis);
      setIsOpen(false);
      setPreview(null);
      toast.success('Refeição analisada com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao processar imagem. Tente novamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full shadow-2xl hover:shadow-emerald-500/50 hover:scale-110 transition-all duration-300"
      >
        <Camera className="w-7 h-7" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Refeição</DialogTitle>
            <DialogDescription>
              Tire uma foto ou escolha uma imagem da galeria
            </DialogDescription>
          </DialogHeader>

          {!supabase && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                ⚠️ Configure suas credenciais do Supabase para usar esta funcionalidade.
              </p>
            </div>
          )}

          {preview && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden mb-4">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Analisando sua refeição...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={() => cameraInputRef.current?.click()}
                disabled={!supabase}
              >
                <Camera className="w-8 h-8" />
                <span className="text-sm">Câmera</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={!supabase}
              >
                <Upload className="w-8 h-8" />
                <span className="text-sm">Galeria</span>
              </Button>
            </div>
          )}

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
