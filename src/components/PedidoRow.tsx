import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlertCircle, GripVertical } from 'lucide-react';
import { Pedido } from '@/models/pedido';

interface PedidoRowProps {
  pedido: Pedido;
  isDragging?: boolean;
}

export const PedidoRow = ({ pedido, isDragging = false }: PedidoRowProps) => {
  const [mostrarObservacao, setMostrarObservacao] = useState(false);

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

  const alternarObservacao = () => {
    setMostrarObservacao((prev) => !prev);
  };

  return (
    <>
      <tr
        ref={setNodeRef}
        style={style}
        className={`
          ${pedido.prioridade! % 2 === 0 ? 'bg-muted' : 'bg-background'} 
          border-b border-border hover:bg-accent/50 transition-colors text-sm
          ${isCurrentlyDragging ? 'opacity-70 shadow-lg z-10' : ''}
        `}
      >
        <td className="px-2 py-2 text-left">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing inline-flex items-center justify-center p-1 rounded hover:bg-accent touch-manipulation"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </td>

        <td className="px-2 py-2 text-left font-bold text-primary">
          #{pedido.prioridade}
        </td>

        <td className="px-2 py-2 text-left font-bold text-foreground">
          {pedido.numeroPedido}
        </td>

        <td className="px-2 py-2 text-left text-muted-foreground">
          {new Date(pedido.data).toLocaleDateString('pt-BR')}
        </td>

        <td className="px-2 py-2 text-left text-muted-foreground">
          {pedido.dataConfirmacao &&
            !isNaN(new Date(pedido.dataConfirmacao).getTime())
            ? new Date(pedido.dataConfirmacao).toLocaleString('pt-BR')
            : '---'}
        </td>

        <td className="px-2 py-2 text-left text-muted-foreground">
          {pedido.tempoDesdeConfirmacao}
        </td>

        <td className="px-2 py-2 text-left text-muted-foreground">
          {pedido.tipoPedido}
        </td>

        <td className="px-2 py-2 text-left text-muted-foreground">
          {pedido.cliente}
        </td>

        <td className="px-2 py-2 text-left text-muted-foreground">
          {pedido.cidade} - {pedido.siglaEstado}
        </td>

        <td className="px-2 py-2 text-left text-muted-foreground">
          {pedido.vendedor}
        </td>

        <td className="px-2 py-2 text-left">
          {pedido.observacao?.trim() && (
            <button
              onClick={alternarObservacao}
              title="Ver observação"
              className="hover:opacity-80"
            >
              <AlertCircle className="text-[#B63039]" />
            </button>
          )}
        </td>
      </tr>

      {mostrarObservacao && (
        <tr className="bg-muted/80 border-b border-Prioborder shadow-sm rounded">
          <td
            colSpan={11}
            className="px-4 py-3 text-left text-foreground whitespace-pre-line bg-accent/30 border border-accent rounded-md shadow-md"
          >
            <span className="font-semibold text-primary">Observação:</span>
            {'\n' + pedido.observacao}
          </td>
        </tr>

      )}
    </>
  );
};
