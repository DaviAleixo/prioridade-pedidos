import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';

import { Pedido } from '@/models/pedido';
import { PedidoRow } from './PedidoRow';
import { SortableHeader } from './SortableHeader';
import { GripVertical } from 'lucide-react';

interface PedidosTableProps {
  pedidos: Pedido[];
  onReorder: (pedidoId: string, novaOrdem: number) => void;
}

type SortKey =
  | 'numeroPedido'
  | 'tipoPedido'
  | 'cliente'
  | 'data'
  | 'dataConfirmacao'
  | 'dataEntrega'
  | 'itens'
  | 'vendedor'
  | 'prioridade'
  | 'cidade'
  | 'transportadora';

export const PedidosTable = ({ pedidos, onReorder }: PedidosTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedPedidos = useMemo(() => {
    if (!sortKey) {
      return [...pedidos].sort((a, b) => (a.prioridade ?? 9999) - (b.prioridade ?? 9999));
    }

    return [...pedidos].sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];

      if (sortKey === 'data' || sortKey === 'dataConfirmacao' || sortKey === 'dataEntrega') {
        aValue = aValue ? new Date(aValue as string).getTime() : 0;
        bValue = bValue ? new Date(bValue as string).getTime() : 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [pedidos, sortKey, sortDirection]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeIndex = sortedPedidos.findIndex((p) => p.id === active.id);
    const overIndex = sortedPedidos.findIndex((p) => p.id === over.id);
    if (activeIndex === -1 || overIndex === -1) return;

    // Reordena array localmente
    const pedidosReordenados = [...sortedPedidos];
    const [movedPedido] = pedidosReordenados.splice(activeIndex, 1);
    pedidosReordenados.splice(overIndex, 0, movedPedido);

    // Atualiza prioridade sequencial
    pedidosReordenados.forEach((pedido, index) => {
      const novaPrioridade = index + 1;
      if (pedido.prioridade !== novaPrioridade) {
        onReorder(pedido.id, novaPrioridade);
      }
    });
  };

  const pedidoIds = sortedPedidos.map((pedido) => pedido.id);

  return (
    <div className="space-y-4">
      {/* Tabela desktop */}
      <div className="hidden lg:block bg-card rounded-lg border border-border overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full">
          <thead className="bg-muted/50 border-b border-border">
  <tr>
    <th className="px-4 py-4"></th>
    <SortableHeader sortKey="prioridade" currentSort={sortKey} sortDirection={sortDirection} onSort={handleSort} className="text-center">
      Ordem
    </SortableHeader>
    <SortableHeader sortKey="numeroPedido" currentSort={sortKey} sortDirection={sortDirection} onSort={handleSort} className="text-center">
      Pedido
    </SortableHeader>
    <SortableHeader sortKey="data" currentSort={sortKey} sortDirection={sortDirection} onSort={handleSort} className="text-center">
      DT. Pedido
    </SortableHeader>
    <SortableHeader sortKey="tipoPedido" currentSort={sortKey} sortDirection={sortDirection} onSort={handleSort} className="text-center">
      Tipo de Pedido
    </SortableHeader>
    <SortableHeader sortKey="cliente" currentSort={sortKey} sortDirection={sortDirection} onSort={handleSort} className="text-center">
      Cliente
    </SortableHeader>
    <SortableHeader sortKey="cidade" currentSort={sortKey} sortDirection={sortDirection} onSort={handleSort} className="text-center">
      Cidade
    </SortableHeader>
    <SortableHeader sortKey="vendedor" currentSort={sortKey} sortDirection={sortDirection} onSort={handleSort} className="text-center">
      Vendedor
    </SortableHeader>
    <SortableHeader sortKey="transportadora" currentSort={sortKey} sortDirection={sortDirection} onSort={handleSort} className="text-center">
      Transportadora
    </SortableHeader>
    <SortableHeader sortKey="itens" currentSort={sortKey} sortDirection={sortDirection} onSort={handleSort} className="text-center">
      Nº Itens
    </SortableHeader>
  </tr>
</thead>
            <tbody>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              >
                <SortableContext items={pedidoIds} strategy={verticalListSortingStrategy}>
                  {sortedPedidos.map((pedido) => (
                    <PedidoRow key={pedido.id} pedido={pedido} />
                  ))}
                </SortableContext>
              </DndContext>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards mobile */}
      <div className="lg:hidden space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext items={pedidoIds} strategy={verticalListSortingStrategy}>
            {sortedPedidos.map((pedido, index) => (
              <MobilePedidoCard key={pedido.id} pedido={pedido} index={index + 1} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

// Componente MobilePedidoCard continua igual (sem alterações)


// Componente para cards mobile com drag-and-drop
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MobilePedidoCardProps {
  pedido: Pedido;
  index: number;
}

const MobilePedidoCard = ({ pedido, index }: MobilePedidoCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pedido.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white/80 backdrop-blur-sm rounded-xl border border-primary/20 p-4 shadow-lg touch-manipulation ${
        isDragging ? 'opacity-70 shadow-2xl z-50' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing p-2 rounded hover:bg-accent touch-manipulation"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">#{index}</span>
          <span className="text-xl font-bold text-primary">{pedido.numeroPedido}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            Ordem {pedido.prioridade}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">DT. Pedido:</span>
            <span className="font-medium">{new Date(pedido.data).toLocaleDateString('pt-BR')}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Tipo de Pedido:</span>
            <span className="font-medium">{pedido.tipoPedido}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cliente:</span>
            <span className="font-medium">{pedido.cliente}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cidade:</span>
            <span className="font-medium">{pedido.cidade} - {pedido.siglaEstado}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vendedor:</span>
            <span className="font-medium">{pedido.vendedor}</span>
          </div>
          {pedido.transportadora && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transportadora:</span>
              <span className="font-medium">{pedido.transportadora}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nº Itens:</span>
            <span className="font-bold text-lg text-primary">{pedido.itens}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
