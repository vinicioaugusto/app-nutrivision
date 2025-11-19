export interface MacroNutrients {
  proteina: number;
  carboidrato: number;
  gordura: number;
}

export interface MealItem {
  id?: string;
  meal_id?: string;
  alimento: string;
  quantidade_g: number;
  calorias: number;
  proteina: number;
  carboidrato: number;
  gordura: number;
}

export interface Meal {
  id: string;
  user_id: string;
  image_url: string;
  data_hora: string;
  total_calorias: number;
  proteina: number;
  carboidrato: number;
  gordura: number;
  items?: MealItem[];
}

export interface User {
  id: string;
  nome: string;
  email: string;
  meta_calorias_diarias: number;
  foto_perfil?: string;
  peso_inicial?: number;
  peso_atual?: number;
}

export interface DailyProgress {
  consumed: number;
  goal: number;
  macros: MacroNutrients;
}

export interface AIAnalysisResponse {
  itens: Array<{
    alimento: string;
    quantidade_g: number;
    calorias: number;
    macros: MacroNutrients;
  }>;
  total: {
    calorias: number;
    proteina: number;
    carboidrato: number;
    gordura: number;
  };
}
