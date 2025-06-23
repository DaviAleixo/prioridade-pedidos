import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Pedido } from '@/models/pedido';

interface PedidoRowProps {
  pedido: Pedido;
  isDragging?: boolean;
}

export const PedidoRow = ({ pedido, isDragging = false }: PedidoRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: pedido.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCurrentlyDragging = isDragging || isSortableDragging;

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`
        bg-card border-b border-border hover:bg-accent/50 transition-colors text-sm
        ${isCurrentlyDragging ? 'opacity-70 shadow-lg z-10' : ''}
      `}
    >
      {/* Coluna de Drag Handle */}
      <td className="px-2 py-2 text-center">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:cursor-grabbing inline-flex items-center justify-center p-1 rounded hover:bg-accent touch-manipulation"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </td>

      <td className="px-2 py-2 text-center font-bold text-primary">
        #{pedido.prioridade}
      </td>

      <td className="px-2 py-2 text-center font-bold text-foreground">
        {pedido.numeroPedido}
      </td>

      <td className="px-2 py-2 text-center text-muted-foreground">
        {formatDateTime(pedido.data)}
      </td>

      <td className="px-2 py-2 text-center font-medium text-foreground">
        {pedido.tipoPedido}
      </td>

      <td className="px-2 py-2 text-center font-medium text-foreground">
        {pedido.cliente}
      </td>

      <td className="px-2 py-2 text-center text-muted-foreground">
        {pedido.cidade} - {pedido.siglaEstado}
      </td>

      <td className="px-2 py-2 text-center text-muted-foreground">
        {pedido.vendedor}
      </td>

      <td className="px-2 py-2 text-center text-muted-foreground">
        {pedido.transportadora}
      </td>

      <td className="px-2 py-2 text-center font-bold text-primary">
        {pedido.itens}
      </td>
    </tr>
  );
};
