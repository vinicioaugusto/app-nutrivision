'use client';

import { useState, useEffect } from 'react';
import { MealCard } from '@/components/custom/meal-card';
import { supabase } from '@/lib/supabase';
import { Meal } from '@/types/nutrition';
import { format, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HistoryPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyTotal, setDailyTotal] = useState({
    calorias: 0,
    proteina: 0,
    carboidrato: 0,
    gordura: 0,
  });

  useEffect(() => {
    loadMeals();
  }, [selectedDate]);

  const loadMeals = async () => {
    try {
      const start = startOfDay(selectedDate);
      const end = endOfDay(selectedDate);

      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .gte('data_hora', start.toISOString())
        .lte('data_hora', end.toISOString())
        .order('data_hora', { ascending: false });

      if (error) throw error;

      const mealsData = data as Meal[];
      setMeals(mealsData);

      // Calcular totais do dia
      const totals = mealsData.reduce(
        (acc, meal) => ({
          calorias: acc.calorias + meal.total_calorias,
          proteina: acc.proteina + meal.proteina,
          carboidrato: acc.carboidrato + meal.carboidrato,
          gordura: acc.gordura + meal.gordura,
        }),
        { calorias: 0, proteina: 0, carboidrato: 0, gordura: 0 }
      );

      setDailyTotal(totals);
    } catch (error) {
      console.error('Erro ao carregar refeições:', error);
    }
  };

  const goToPreviousDay = () => {
    setSelectedDate((prev) => new Date(prev.setDate(prev.getDate() - 1)));
  };

  const goToNextDay = () => {
    setSelectedDate((prev) => new Date(prev.setDate(prev.getDate() + 1)));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Histórico
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visualize suas refeições anteriores
          </p>
        </div>

        {/* Date Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousDay}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-emerald-500" />
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextDay}
              className="rounded-full"
              disabled={format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {format(selectedDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') && (
            <Button
              variant="outline"
              onClick={goToToday}
              className="w-full"
            >
              Ir para hoje
            </Button>
          )}
        </div>

        {/* Daily Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Resumo do dia
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Calorias</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {dailyTotal.calorias}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">kcal</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Proteína</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {dailyTotal.proteina.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">gramas</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Carboidrato</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {dailyTotal.carboidrato.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">gramas</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Gordura</p>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {dailyTotal.gordura.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">gramas</p>
            </div>
          </div>
        </div>

        {/* Meals List */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Refeições ({meals.length})
          </h2>
          {meals.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm">
              <p className="text-gray-500 dark:text-gray-400">
                Nenhuma refeição registrada neste dia
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
