'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types/nutrition';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { User as UserIcon, Target, Scale, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [user, setUser] = useState<User>({
    id: '1',
    nome: 'Usuário',
    email: 'usuario@nutrivision.com',
    meta_calorias_diarias: 2000,
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          nome: user.nome,
          email: user.email,
          meta_calorias_diarias: user.meta_calorias_diarias,
          peso_inicial: user.peso_inicial,
          peso_atual: user.peso_atual,
        });

      if (error) throw error;

      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao salvar perfil');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Perfil
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie suas informações e metas
          </p>
        </div>

        {/* Profile Card */}
        <Card className="p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
              <UserIcon className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {user.nome}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Nome */}
            <div>
              <Label htmlFor="nome" className="flex items-center gap-2 mb-2">
                <UserIcon className="w-4 h-4" />
                Nome
              </Label>
              <Input
                id="nome"
                value={user.nome}
                onChange={(e) => setUser({ ...user, nome: e.target.value })}
                disabled={!isEditing}
                className="text-lg"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                disabled={!isEditing}
                className="text-lg"
              />
            </div>

            {/* Meta de Calorias */}
            <div>
              <Label htmlFor="meta" className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4" />
                Meta de Calorias Diárias
              </Label>
              <Input
                id="meta"
                type="number"
                value={user.meta_calorias_diarias}
                onChange={(e) =>
                  setUser({
                    ...user,
                    meta_calorias_diarias: parseInt(e.target.value),
                  })
                }
                disabled={!isEditing}
                className="text-lg"
              />
            </div>

            {/* Peso Inicial */}
            <div>
              <Label htmlFor="peso-inicial" className="flex items-center gap-2 mb-2">
                <Scale className="w-4 h-4" />
                Peso Inicial (kg)
              </Label>
              <Input
                id="peso-inicial"
                type="number"
                step="0.1"
                value={user.peso_inicial || ''}
                onChange={(e) =>
                  setUser({
                    ...user,
                    peso_inicial: parseFloat(e.target.value),
                  })
                }
                disabled={!isEditing}
                placeholder="Ex: 75.5"
                className="text-lg"
              />
            </div>

            {/* Peso Atual */}
            <div>
              <Label htmlFor="peso-atual" className="flex items-center gap-2 mb-2">
                <Scale className="w-4 h-4" />
                Peso Atual (kg)
              </Label>
              <Input
                id="peso-atual"
                type="number"
                step="0.1"
                value={user.peso_atual || ''}
                onChange={(e) =>
                  setUser({
                    ...user,
                    peso_atual: parseFloat(e.target.value),
                  })
                }
                disabled={!isEditing}
                placeholder="Ex: 73.2"
                className="text-lg"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  Editar Perfil
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Stats Card */}
        {user.peso_inicial && user.peso_atual && (
          <Card className="p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Progresso
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Peso Inicial
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {user.peso_inicial}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">kg</p>
              </div>
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Peso Atual
                </p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {user.peso_atual}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">kg</p>
              </div>
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Diferença
                </p>
                <p
                  className={`text-3xl font-bold ${
                    user.peso_atual < user.peso_inicial
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {(user.peso_atual - user.peso_inicial).toFixed(1)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">kg</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
