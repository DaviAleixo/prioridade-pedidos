/**
 * Tipos e interfaces para o sistema de pedidos
 */

export type StatusPedido = 'AGUARDANDO' | 'SEPARAÇÃO' | 'FATURAMENTO' | 'CONFERENCIA' | 'OUTRO';

export interface Pedido {
  id: string;
  prioridade: number;
  status: StatusPedido;
  tipoPedido: string;
  numeroPedido: string;
  cliente: string;
  data: string;
  dataConfirmacao: string;
  vendedor: string;
  transportadora: string;
  itens: number;
  cidade: string;
  dataEntrega: string;
  siglaEstado: string;
}

export interface AtualizarPrioridadeRequest {
  pedidoId: string;
  novaPrioridade: number;
}

export interface PedidosResponse {
  pedidos: Pedido[];
  total: number;
}
