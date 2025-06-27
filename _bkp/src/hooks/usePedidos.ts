import { useState, useEffect, useCallback } from 'react';
import { Pedido } from '@/models/pedido';
import { pedidosService } from '@/services/pedidosServices';

interface UsePedidosReturn {
  pedidos: Pedido[];
  loading: boolean;
  error: string | null;
  atualizarOrdem: (pedidoId: string, novaPrioridade: number) => Promise<void>;
  recarregarPedidos: () => Promise<void>;
  setPedidosManualmente: (novosPedidos: Pedido[]) => void;
}

export const usePedidos = (): UsePedidosReturn => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarPedidos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Usuário não autenticado');

      //const pedidosApi = await pedidosService.buscarPedidoSupraWS();
      //setPedidos(pedidosApi);

      const pedidosApi = await pedidosService.buscarPedidosJSON();
      setPedidos(pedidosApi);

      console.log('Pedidos carregados:', pedidosApi.length);
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
      //setPedidos(pedidosWS);
      console.log('Pedidos carregados: buscarPedidoSupraWS');
    
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar pedidos';
      setError(errorMessage);
      console.error('Erro ao carregar pedidos:', err);
    } finally {
      setLoading(false);
    }
  }, [setPedidos, setLoading, setError]);




  const atualizarOrdem = useCallback(
    async (pedidoId: string, novaPrioridade: number) => {
      try {
        setError(null);

        setPedidos((prevPedidos) => {
          const pedidosAguardando = prevPedidos.filter((p) => p.status === 'AGUARDANDO');
          const outrosPedidos = prevPedidos.filter((p) => p.status !== 'AGUARDANDO');

          const index = pedidosAguardando.findIndex((p) => p.id === pedidoId);
          if (index === -1) return prevPedidos;

          const [pedidoMovido] = pedidosAguardando.splice(index, 1);
          pedidosAguardando.splice(novaPrioridade - 1, 0, pedidoMovido);

          const aguardandoComNovaPrioridade = pedidosAguardando.map((p, i) => ({
            ...p,
            prioridade: i + 1,
          }));

          return [...aguardandoComNovaPrioridade, ...outrosPedidos];
        });

        await pedidosService.atualizarPosicaoPedido(pedidoId, novaPrioridade);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao atualizar ordem';
        setError(errorMessage);
        console.error('Erro ao atualizar ordem:', err);
        await carregarPedidos();
      }
    },
    [carregarPedidos]
  );

  const recarregarPedidos = useCallback(async () => {
    try {
      //const pedidosAtualizados = await pedidosService.buscarPedidoSupraWS();
      const pedidosAtualizados = await pedidosService.buscarPedidosJSON();
      //await pedidosService.enviarPedidoJson(pedidosAtualizados);
      setPedidos(pedidosAtualizados);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao recarregar pedidos';
      setError(errorMessage);
      console.error('Erro ao recarregar pedidos:', err);
    }
  }, []);

  const setPedidosManualmente = (novosPedidos: Pedido[]) => {
    setPedidos(novosPedidos);
  };

  
  useEffect(() => {
    carregarPedidos();
    //carregarPedidoWS();

    const intervalo = setInterval(() => {
      //carregarPedidos();
      carregarPedidoWS();
    }, 10000);

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
