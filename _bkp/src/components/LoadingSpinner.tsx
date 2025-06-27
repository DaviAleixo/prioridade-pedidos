/**
 * Componente de loading reutilizável
 */

import { Package } from 'lucide-react';

export const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Package className="w-6 h-6 text-primary" />
        </div>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Carregando pedidos...</h3>
        <p className="text-sm text-muted-foreground">Aguarde enquanto buscamos os dados mais recentes</p>
      </div>
    </div>
  );
};