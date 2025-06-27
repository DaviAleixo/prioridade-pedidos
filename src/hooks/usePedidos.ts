import { useState, useEffect, useCallback } from 'react';
import { Pedido } from '@/models/pedido';
import { pedidosService } from '@/services/pedidosServices';

interface PedidoComTempo extends Pedido {
  tempoDesdeConfirmacao?: string;
}

interface UsePedidosReturn {
  pedidos: PedidoComTempo[];
  loading: boolean;
  error: string | null;
  atualizarOrdem: (pedidoId: string, novaPrioridade: number) => Promise<void>;
  recarregarPedidos: () => Promise<void>;
  setPedidosManualmente: (novosPedidos: PedidoComTempo[]) => void;
}

export const usePedidos = (): UsePedidosReturn => {
  const [pedidos, setPedidos] = useState<PedidoComTempo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function calcularTempoDesdeConfirmacao(dataConfirmacao: string): string {
    if (!dataConfirmacao) return 'Não confirmada';
    const dataConf = new Date(dataConfirmacao);
    if (isNaN(dataConf.getTime())) return '---';
    const agora = new Date();
    const diffMs = agora.getTime() - dataConf.getTime();
    const diffSeg = Math.floor(diffMs / 1000);
    const horas = Math.floor(diffSeg / 3600);
    const minutos = Math.floor((diffSeg % 3600) / 60);
    return ` ${horas}h ${minutos}m`;
  }

  const recarregarPedidos = useCallback(async () => {
    try {
      const pedidosWS = await pedidosService.buscarPedidoSupraWS();
      await pedidosService.atualizarPedidoJson(pedidosWS);
      const pedidosAtualizados = await pedidosService.buscarPedidosJSON();
      const pedidosComTempo: PedidoComTempo[] = pedidosAtualizados.map((pedido) => ({
        ...pedido,
        tempoDesdeConfirmacao: calcularTempoDesdeConfirmacao(pedido.dataConfirmacao),
      }));
      setPedidos(pedidosComTempo);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao recarregar pedidos';
      setError(errorMessage);
      console.error('Erro ao recarregar pedidos:', err);
    }
  }, []);
  const atualizarOrdem = useCallback(
    async (pedidoId: string, novaPrioridade: number) => {
      try {
        setError(null);
  
        let novoEstado: PedidoComTempo[] = [];
  
        setPedidos((prevPedidos) => {
          const pedidosAguardando = prevPedidos.filter((p) => p.status === 'AGUARDANDO');
          const outrosPedidos = prevPedidos.filter((p) => p.status !== 'AGUARDANDO');
  
          const index = pedidosAguardando.findIndex((p) => p.id === pedidoId);
          if (index === -1) return prevPedidos;
  
          if (index === novaPrioridade - 1) return prevPedidos;
  
          const [pedidoMovido] = pedidosAguardando.splice(index, 1);
  
          const posSegura = Math.max(0, Math.min(novaPrioridade - 1, pedidosAguardando.length));
          pedidosAguardando.splice(posSegura, 0, pedidoMovido);
  
          const aguardandoComNovaPrioridade = pedidosAguardando.map((p, i) => ({
            ...p,
            prioridade: i + 1, 
          }));
  
          novoEstado = [...aguardandoComNovaPrioridade, ...outrosPedidos];
          return novoEstado;
        });
  
        console.log('[DEBUG] Atualizando pedido:', { pedidoId, novaPrioridade });
  
       
        await pedidosService.atualizarPosicaoPedido(pedidoId, novaPrioridade - 1);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao atualizar ordem';
        setError(errorMessage);
        console.error('Erro ao atualizar ordem:', err);
        await recarregarPedidos();
      }
    },
    [recarregarPedidos]
  );
  
  

  const carregarPedidos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Usuário não autenticado');

      const pedidosWS = await pedidosService.buscarPedidoSupraWS();
      await pedidosService.atualizarPedidoJson(pedidosWS);

      const pedidosApi = await pedidosService.buscarPedidosJSON();

      const pedidosComTempo: PedidoComTempo[] = pedidosApi.map((pedido) => ({
        ...pedido,
        tempoDesdeConfirmacao: calcularTempoDesdeConfirmacao(pedido.dataConfirmacao),
      }));

      setPedidos(pedidosComTempo);
      console.log('Pedidos carregados:', pedidosComTempo.length);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar pedidos';
      setError(errorMessage);
      console.error('Erro ao carregar pedidos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const carregarPedidoWS = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Usuário não autenticado');

      const pedidosWS = await pedidosService.buscarPedidoSupraWS();
      await pedidosService.atualizarPedidoJson(pedidosWS);
      console.log('Pedidos carregados via WS');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar pedidos do WS';
      setError(errorMessage);
      console.error('Erro ao carregar pedidos do WS:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const setPedidosManualmente = (novosPedidos: PedidoComTempo[]) => {
    setPedidos(novosPedidos);
  };

  useEffect(() => {
    carregarPedidos();
    const intervalo = setInterval(() => {
      carregarPedidoWS();
    }, 600000);
  
    return () => clearInterval(intervalo);
  }, [carregarPedidos, carregarPedidoWS]);
  

  return {
    pedidos,
    loading,
    error,
    atualizarOrdem,
    recarregarPedidos,
    setPedidosManualmente,
  };
};
