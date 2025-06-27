/**
 * Componente de filtro de status com múltipla seleção
 */

import { useState } from 'react';
import { StatusPedido } from '@/models/pedido';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter, X } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface StatusFilterProps {
  selectedStatuses: StatusPedido[];
  onStatusChange: (statuses: StatusPedido[]) => void;
  className?: string;
}

const allStatuses: StatusPedido[] = ['AGUARDANDO', 'SEPARAÇÃO', 'FATURAMENTO', 'CONFERENCIA'];

export const StatusFilter = ({ selectedStatuses, onStatusChange, className = '' }: StatusFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusToggle = (status: StatusPedido) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status];
    
    onStatusChange(newStatuses);
  };

  const clearFilters = () => {
    onStatusChange([]);
  };

  const selectAll = () => {
    onStatusChange(allStatuses);
  };

  const hasFilters = selectedStatuses.length > 0 && selectedStatuses.length < allStatuses.length;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={`gap-2 bg-white/50 hover:bg-white/70 border-primary/20 ${hasFilters ? 'border-primary text-primary' : ''}`}
          >
            <Filter className="h-4 w-4" />
            Filtrar Status
            {hasFilters && (
              <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {selectedStatuses.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 bg-white border-primary/20" align="start">
          <DropdownMenuLabel className="flex items-center justify-between">
            Filtrar por Status
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="p-2">
            <div className="flex gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAll}
                className="h-7 px-2 text-xs"
                disabled={selectedStatuses.length === allStatuses.length}
              >
                Todos
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 px-2 text-xs"
                disabled={selectedStatuses.length === 0}
              >
                Nenhum
              </Button>
            </div>
          </div>

          {allStatuses.map((status) => (
            <DropdownMenuCheckboxItem
              key={status}
              checked={selectedStatuses.includes(status)}
              onCheckedChange={() => handleStatusToggle(status)}
              className="flex items-center gap-2 py-2"
            >
              <StatusBadge status={status} className="scale-90" />
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Mostra filtros ativos em telas maiores */}
      {hasFilters && (
        <div className="hidden lg:flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtros:</span>
          {selectedStatuses.map((status) => (
            <div key={status} className="flex items-center gap-1 bg-primary/10 rounded-full px-2 py-1">
              <StatusBadge status={status} className="scale-75" />
              <button
                onClick={() => handleStatusToggle(status)}
                className="text-primary hover:text-primary/70 ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
