'use client';

import { useState, useEffect } from 'react';
import { ProgressRing } from '@/components/custom/progress-ring';
import { MealCard } from '@/components/custom/meal-card';
import { AddMealButton } from '@/components/custom/add-meal-button';
import { supabase } from '@/lib/supabase';
import { Meal, User } from '@/types/nutrition';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Flame, TrendingUp } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [dailyProgress, setDailyProgress] = useState({
    consumed: 0,
    goal: 2000,
    proteina: 0,
    carboidrato: 0,
    gordura: 0,
  });

  useEffect(() => {
    // Renderizar data apenas no cliente
    setCurrentDate(format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR }));
    
    loadUserData();
    loadTodayMeals();
    loadWeeklyData();
  }, []);

  const loadUserData = async () => {
    // Mock user - em produção, usar autenticação real
    const mockUser: User = {
      id: '1',
      nome: 'Usuário',
      email: 'usuario@nutrivision.com',
      meta_calorias_diarias: 2000,
    };
    setUser(mockUser);
  };

  const loadTodayMeals = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .gte('data_hora', today.toISOString())
        .order('data_hora', { ascending: false });

      if (error) throw error;

      const meals = data as Meal[];
      setTodayMeals(meals);

      // Calcular progresso diário
      const totalCalorias = meals.reduce((sum, meal) => sum + meal.total_calorias, 0);
      const totalProteina = meals.reduce((sum, meal) => sum + meal.proteina, 0);
      const totalCarbo = meals.reduce((sum, meal) => sum + meal.carboidrato, 0);
      const totalGordura = meals.reduce((sum, meal) => sum + meal.gordura, 0);

      setDailyProgress({
        consumed: totalCalorias,
        goal: user?.meta_calorias_diarias || 2000,
        proteina: totalProteina,
        carboidrato: totalCarbo,
        gordura: totalGordura,
      });
    } catch (error) {
      console.error('Erro ao carregar refeições:', error);
    }
  };

  const loadWeeklyData = async () => {
    try {
      const today = new Date();
      const weekStart = startOfWeek(today, { locale: ptBR });
      const days = eachDayOfInterval({
        start: subDays(today, 6),
        end: today,
      });

      const { data, error } = await supabase
        .from('meals')
        .select('data_hora, total_calorias')
        .gte('data_hora', subDays(today, 6).toISOString());

      if (error) throw error;

      const meals = data as Meal[];
      const chartData = days.map((day) => {
        const dayMeals = meals.filter(
          (meal) =>
            format(new Date(meal.data_hora), 'yyyy-MM-dd') ===
            format(day, 'yyyy-MM-dd')
        );
        const totalCalorias = dayMeals.reduce(
          (sum, meal) => sum + meal.total_calorias,
          0
        );

        return {
          day: format(day, 'EEE', { locale: ptBR }),
          calorias: totalCalorias,
        };
      });

      setWeeklyData(chartData);
    } catch (error) {
      console.error('Erro ao carregar dados semanais:', error);
    }
  };

  const handleMealAnalyzed = async (imageUrl: string, analysis: any) => {
    try {
      // Salvar refeição
      const { data: mealData, error: mealError } = await supabase
        .from('meals')
        .insert({
          user_id: user?.id || '1',
          image_url: imageUrl,
          total_calorias: analysis.total.calorias,
          proteina: analysis.total.proteina,
          carboidrato: analysis.total.carboidrato,
          gordura: analysis.total.gordura,
        })
        .select()
        .single();

      if (mealError) throw mealError;

      // Salvar itens da refeição
      const items = analysis.itens.map((item: any) => ({
        meal_id: mealData.id,
        alimento: item.alimento,
        quantidade_g: item.quantidade_g,
        calorias: item.calorias,
        proteina: item.macros.proteina,
        carboidrato: item.macros.carboidrato,
        gordura: item.macros.gordura,
      }));

      const { error: itemsError } = await supabase
        .from('meal_items')
        .insert(items);

      if (itemsError) throw itemsError;

      // Recarregar dados
      loadTodayMeals();
      loadWeeklyData();
    } catch (error) {
      console.error('Erro ao salvar refeição:', error);
      toast.error('Erro ao salvar refeição');
    }
  };

  const progressPercentage = (dailyProgress.consumed / dailyProgress.goal) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Olá, {user?.nome || 'Usuário'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {currentDate || '\u00A0'}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {dailyProgress.consumed} kcal
            </span>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="flex justify-center py-8">
          <ProgressRing
            progress={progressPercentage}
            consumed={dailyProgress.consumed}
            goal={dailyProgress.goal}
          />
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Proteína</span>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {dailyProgress.proteina.toFixed(0)}g
            </p>
            <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${Math.min((dailyProgress.proteina / 150) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Carboidrato</span>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {dailyProgress.carboidrato.toFixed(0)}g
            </p>
            <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-500"
                style={{ width: `${Math.min((dailyProgress.carboidrato / 250) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Gordura</span>
              <TrendingUp className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {dailyProgress.gordura.toFixed(0)}g
            </p>
            <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 transition-all duration-500"
                style={{ width: `${Math.min((dailyProgress.gordura / 70) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Últimos 7 dias
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <XAxis
                dataKey="day"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number) => [`${value} kcal`, 'Calorias']}
              />
              <Bar
                dataKey="calorias"
                fill="#10B981"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Meals */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Refeições de hoje
          </h2>
          {todayMeals.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm">
              <p className="text-gray-500 dark:text-gray-400">
                Nenhuma refeição registrada hoje. Adicione sua primeira refeição!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todayMeals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddMealButton onMealAnalyzed={handleMealAnalyzed} />
    </div>
  );
}
