import axios from 'axios';
import { Pedido } from '@/models/pedido';

export const pedidosService = {
  async buscarPedidosComPrioridade(): Promise<Pedido[]> {
    const token = localStorage.getItem('token') || '';
    const url = `/supraWS/rest/logistica/movimentoEstoque/pedidosColetor?somenteCabecalho=true`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          appVersion: '470',
          'Content-Type': 'application/json',
        },
      });

      const pedidosApi = response.data.data;

      const pedidosComPrioridade: Pedido[] = pedidosApi.map((pedido: any, index: number) => {
        let status: Pedido['status'] = 'OUTRO';

        if (pedido.situacaoSeparacao === 'AGUARDANDO_SEPARACAO') {
          status = 'AGUARDANDO';
        } else if (pedido.situacaoSeparacao === 'AGUARDANDO_CONFERENCIA') {
          status = 'CONFERENCIA';
        }

        return {
          id: String(pedido.id),
          numeroPedido: String(pedido.id),
          tipoPedido: pedido.tipoPedido?.nome ?? '---',
          status,
          cliente: pedido.nomeCliente ?? '---',
          cidade: pedido.nomeCidade ?? '---',
          vendedor: pedido.nomeVendedor ?? '---',
          transportadora: pedido.nomeTransportadora ?? '---',
          data: formatarData(pedido.dataEmissao),
          dataConfirmacao: '',
          dataEntrega: '',
          itens: pedido.quantidadeVolumes ?? 0,
          siglaEstado: pedido.siglaEstado ?? '---',
          prioridade: null,
        };
      });

      return pedidosComPrioridade;
    } catch (error: any) {
      console.error('Erro ao buscar pedidos:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar pedidos');
    }
  },
};

// Helper para formatar data
function formatarData(dataStr: string): string {
  const [dia, mes, ano] = dataStr.split(' ')[0].split('-');
  return `${ano}-${mes}-${dia}`;
}
