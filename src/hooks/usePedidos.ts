import { useState, useEffect, useCallback } from 'react';
import { Pedido } from '@/models/pedido';
import { pedidosService } from '@/services/pedidosServices';

interface UsePedidosReturn {
  pedidos: Pedido[];
  loading: boolean;
  error: string | null;
  atualizarOrdem: (pedidoId: string, novaPrioridade: number) => Promise<void>;
  recarregarPedidos: () => Promise<void>;
  setPedidosManualmente: (novosPedidos: Pedido[]) => void; // adiciona no tipo
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
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const pedidosApi = await pedidosService.buscarPedidosComPrioridade();
      setPedidos(pedidosApi);
      console.log('Pedidos carregados:', pedidosApi.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar pedidos';
      setError(errorMessage);
      console.error('Erro ao carregar pedidos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const atualizarOrdem = useCallback(async (pedidoId: string, novaPrioridade: number) => {
    try {
      setError(null);

      setPedidos(prevPedidos => {
        const pedidosAtualizados = [...prevPedidos];
        const pedidoIndex = pedidosAtualizados.findIndex(p => p.id === pedidoId);
        if (pedidoIndex === -1) return prevPedidos;

        const [pedidoMovido] = pedidosAtualizados.splice(pedidoIndex, 1);
        pedidosAtualizados.splice(novaPrioridade - 1, 0, pedidoMovido);

        const pedidosComNovaOrdem = pedidosAtualizados.map((pedido, index) => ({
          ...pedido,
          prioridade: index + 1,
        }));

        return pedidosComNovaOrdem;
      });

      // Se quiser, envie para backend: await pedidosService.salvarNovaOrdem(...);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar ordem';
      setError(errorMessage);
      console.error('Erro ao atualizar ordem:', err);
      await carregarPedidos();
    }
  }, [carregarPedidos]);

  const recarregarPedidos = useCallback(async () => {
    await carregarPedidos();
  }, [carregarPedidos]);

  // === AQUI A FUNÇÃO NOVA ===
  const setPedidosManualmente = (novosPedidos: Pedido[]) => {
    setPedidos(novosPedidos);
  };

  useEffect(() => {
    carregarPedidos();
  }, [carregarPedidos]);

  return {
    pedidos,
    loading,
    error,
    atualizarOrdem,
    recarregarPedidos,
    setPedidosManualmente, // expõe no return
  };
};
