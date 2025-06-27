/**
 * Componente de cabeçalho ordenável para tabela
 */

import { ChevronDown, ChevronUp } from 'lucide-react';

interface SortableHeaderProps {
  children: React.ReactNode;
  sortKey: string;
  currentSort: string | null;
  sortDirection: 'asc' | 'desc';
  onSort: (key: string) => void;
  className?: string;
}

export const SortableHeader = ({
  children,
  sortKey,
  currentSort,
  sortDirection,
  onSort,
  className = '',
}: SortableHeaderProps) => {
  const isActive = currentSort === sortKey;

  // Ajuste para flex container: se a classe "text-center" estiver presente,
  // adiciona justify-center para centralizar conteúdo, senão mantém gap normal
  // para alinhamento padrão à esquerda
  const isCenter = className.includes('text-left');

  return (
    <th
      className={`
        px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider
        cursor-pointer hover:bg-muted/70 transition-colors select-none
        ${className}
      `}
      onClick={() => onSort(sortKey)}
    >
      <div
        className={`flex items-left gap-2 ${
          isCenter ? 'justify-left' : ''
        }`}
      >
        {children}
        <div className="flex flex-col">
          <ChevronUp
            className={`w-3 h-3 ${
              isActive && sortDirection === 'asc'
                ? 'text-primary'
                : 'text-muted-foreground/50'
            }`}
          />
          <ChevronDown
            className={`w-3 h-3 -mt-1 ${
              isActive && sortDirection === 'desc'
                ? 'text-primary'
                : 'text-muted-foreground/50'
            }`}
          />
        </div>
      </div>
    </th>
  );
};
