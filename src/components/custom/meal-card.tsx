'use client';

import Image from 'next/image';
import { Clock, Flame } from 'lucide-react';
import { Meal } from '@/types/nutrition';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MealCardProps {
  meal: Meal;
  onClick?: () => void;
}

export function MealCard({ meal, onClick }: MealCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={meal.image_url}
          alt="Refeição"
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              {format(new Date(meal.data_hora), "HH:mm", { locale: ptBR })}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-bold">{meal.total_calorias} kcal</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Proteína</p>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {meal.proteina}g
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Carbo</p>
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              {meal.carboidrato}g
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Gordura</p>
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
              {meal.gordura}g
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
