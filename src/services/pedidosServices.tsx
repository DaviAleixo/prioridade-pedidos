import axios from 'axios';
import { Pedido } from '@/models/pedido';

export const pedidosService = {
  async buscarPedidoSupraWS(): Promise<Pedido[]> {
    const token = localStorage.getItem('token') || '';
    const baseURL = localStorage.getItem('baseURL');
    const url = `${baseURL}/supraWS/rest/logistica/movimentoEstoque/pedidosColetor?somenteCabecalho=true`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          appVersion: '470',
          'Content-Type': 'application/json',
        },
      });

      const pedidosWS = response.data.data;
      console.log(pedidosWS);
      return pedidosWS;

    } catch (error: any) {
      console.error('Erro ao buscar pedidos:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar pedidos');
    }
  },

  async buscarPedidosJSON(): Promise<Pedido[]> {
    const token = localStorage.getItem('token') || '';
    const baseURL = 'http://localhost';
    const url = `${baseURL}/supraWSLocal/`;

    console.log('buscarPedidosJSON', url);

    try {
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(response.data.data);
      const pedidosApi = response.data.data;

      const pedidosConvertidos: Pedido[] = pedidosApi.map((pedido: any) => {
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
          data: formatarData(pedido.dataEmissao),
          dataConfirmacao: formatarData(pedido.dataConfirmacao),
          dataEntrega: '',
          itens: pedido.quantidadeVolumes ?? 0,
          siglaEstado: pedido.siglaEstado ?? '---',
          prioridade: null,
          observacao: pedido.observacaoExpedicao,
        };
      });

      let contadorPrioridade = 1;
      const pedidosComPrioridade = pedidosConvertidos.map((pedido) => {
        if (pedido.status === 'AGUARDANDO') {
          return { ...pedido, prioridade: contadorPrioridade++ };
        }
        return pedido;
      });

      return pedidosComPrioridade;
    } catch (error: any) {
      console.error('Erro ao buscar pedidos:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar pedidos');
    }
  },

  async atualizarPosicaoPedido(id: string, prioridade: number): Promise<void> {
    const baseURL = 'http://localhost';
    const url = `${baseURL}/supraWSLocal/`;
    await axios.put(url, { id, prioridade }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  async atualizarPedidoJson(pedidos: Pedido[]): Promise<void> {
    const baseURL = 'http://localhost';
    const url = `${baseURL}/supraWSLocal/`;
    const json = { data: pedidos };
    await axios.post(url, json, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  async consultar(): Promise<Pedido[]> {
    const url = `http://localhost/supraWSLocal/`;
    try {
      const response = await axios.get(url);
      const pedidosApi: Pedido[] = response.data;

      pedidosApi.sort((a, b) => {
        const prioridadeA = a.prioridade ?? 0;
        const prioridadeB = b.prioridade ?? 0;
        return prioridadeB - prioridadeA; // DESC
      });

      return pedidosApi;
    } catch (error) {
      console.error('Erro ao consultar pedidos:', error);
      throw error;
    }
  },

  async verificarStatusServidor(): Promise<'ONLINE' | 'OFFLINE'> {
    const baseURL = localStorage.getItem('baseURL');
    if (!baseURL) return 'OFFLINE';

    try {
      const response = await axios.get(`${baseURL}/status`, {
        timeout: 3000,
      });
      return response.status === 200 ? 'ONLINE' : 'OFFLINE';
    } catch {
      return 'OFFLINE';
    }
  },
};

function formatarData(dataStr: string | null | undefined): string {
  if (!dataStr || typeof dataStr !== 'string') return '---';

  try {
    const [data, hora] = dataStr.trim().split(' ');
    const [dia, mes, ano] = data.split('-');
    if (!dia || !mes || !ano) return '---';
    return `${ano}-${mes}-${dia}${hora ? ` ${hora}` : ''}`;
  } catch (err) {
    return '---';
  }
}
