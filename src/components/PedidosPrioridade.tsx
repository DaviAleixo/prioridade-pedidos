import {
  RefreshCw,
  Building2,
  Package,
  CheckCircle,
  BarChart3,
  Clock,
  LogOut,
} from 'lucide-react';
import { usePedidos } from '@/hooks/usePedidos';
import { PedidosTable } from './PedidosTable';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import logoSupra from '@/assets/logo-horizontal.png';
import logoMedh from '@/assets/logo-medh.png';
import { saveAs } from 'file-saver';
import { ChangeEvent, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/context/authContext';

const PedidosPrioridade = () => {
  const {
    pedidos,
    loading,
    error,
    atualizarOrdem,
    recarregarPedidos,
    setPedidosManualmente,
  } = usePedidos();

  const { signOut } = useAuthContext();
  const { toast } = useToast();
  const inputImportRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    signOut();
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado do sistema',
    });
  };

  const handleReorder = async (pedidoId: string, novaPrioridade: number) => {
    try {
      await atualizarOrdem(pedidoId, novaPrioridade);
      const pedido = pedidos.find(p => p.id === pedidoId);
      if (pedido) {
        toast({
          title: 'Prioridade atualizada',
          description: `Pedido ${pedido.numeroPedido} movido para prioridade ${novaPrioridade}`,
        });
      }
    } catch {
      toast({
        title: 'Erro ao atualizar prioridade',
        description: 'Tente novamente em alguns instantes',
        variant: 'destructive',
      });
    }
  };

  const handleRefresh = async () => {
    try {
      await recarregarPedidos();
      toast({
        title: 'Pedidos atualizados',
        description: 'Lista de pedidos recarregada com sucesso',
      });
    } catch {
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível recarregar os pedidos',
        variant: 'destructive',
      });
    }
  };

  const exportarPedidosParaJson = () => {
    const pedidosAguardar = pedidos.filter(p => p.status === 'AGUARDANDO');
    const json = JSON.stringify(pedidosAguardar, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    saveAs(blob, 'pedidos-aguardando-exportados.json');
  };

  const importarPedidosDoJson = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      try {
        const pedidosImportados = JSON.parse(text);
        if (Array.isArray(pedidosImportados)) {
          toast({
            title: 'Pedidos importados',
            description: 'Pedidos atualizados com sucesso!',
          });
          setPedidosManualmente(pedidosImportados);
        }
      } catch {
        toast({
          title: 'Erro ao importar JSON',
          description: 'Verifique se o arquivo está no formato correto',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  const pedidosSeparacao = pedidos.filter(p => p.status === 'AGUARDANDO');
  const pedidosConferencia = pedidos.filter(p => p.status === 'CONFERENCIA');

  const totalPedidos = pedidos.length;
  const aSeparar = pedidosSeparacao.length;
  const aConferir = pedidosConferencia.length;

  const ultimaAtualizacao = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <div className="max-w-[1800px] mx-auto p-3 lg:p-6 space-y-4 lg:space-y-6">
        {/* Cabeçalho */}
        <div className="glass-effect rounded-2xl p-4 lg:p-5 shadow-modern sticky top-0 z-50 bg-white/80 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16 lg:w-20 lg:h-20 border-2 border-primary/20 rounded-lg overflow-hidden">
                <AvatarImage
                  src={logoMedh}
                  alt="Logo da Distribuidora"
                  className="object-contain w-full h-full"
                />

                <AvatarFallback className="bg-white text-primary font-bold text-lg lg:text-xl rounded-full">
                  <Building2 className="w-6 h-6 lg:w-7 lg:h-7" />
                </AvatarFallback>
              </Avatar>
            </div>

            <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent text-center flex-grow">
              Prioridade de Separação
            </h1>

            <div className="flex flex-col items-center space-y-2">
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-1 lg:p-2">
                <img
                  src={logoSupra}
                  alt="Logo da Empresa"
                  className="h-3 lg:h-5 w-auto object-contain"
                />

              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-primary/10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
              <MetricCard
                icon={<BarChart3 className="h-3 w-3 lg:h-4 lg:w-4 text-white" />}
                bg="bg-slate-500"
                border="border-slate-200"
                title="Total"
                value={totalPedidos}
                textColor="text-slate-800"
                labelColor="text-slate-600"
              />
              <MetricCard
                icon={<Package className="h-3 w-3 lg:h-4 lg:w-4 text-white" />}
                bg="bg-yellow-500"
                border="border-yellow-200"
                title="A Separar"
                value={aSeparar}
                textColor="text-yellow-800"
                labelColor="text-yellow-700"
              />
              <MetricCard
                icon={<CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 text-white" />}
                bg="bg-blue-500"
                border="border-blue-200"
                title="A Conferir"
                value={aConferir}
                textColor="text-blue-800"
                labelColor="text-blue-700"
              />
              <MetricCard
                icon={<Clock className="h-3 w-3 lg:h-4 lg:w-4 text-white" />}
                bg="bg-green-500"
                border="border-green-200"
                title="Atualizada"
                value={ultimaAtualizacao}
                textColor="text-green-800"
                labelColor="text-green-700"
                action={
                  <button
                    onClick={handleRefresh}
                    className="text-green-600 hover:text-green-800 transition"
                    aria-label="Atualizar agora"
                  >
                    <RefreshCw
                      className={`h-3 w-3 lg:h-4 lg:w-4 ${loading ? 'animate-spin' : ''
                        }`}
                    />
                  </button>
                }
              />
            </div>
          </div>
        </div>

        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} onRetry={handleRefresh} />}

        {!loading && !error && pedidosSeparacao.length > 0 && (
          <>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary/20 shadow-modern overflow-hidden">
              <PedidosTable pedidos={pedidosSeparacao} onReorder={handleReorder} />
            </div>

            <div className="flex flex-col lg:flex-row justify-center items-center mt-6 gap-4 relative">
              <div className="flex gap-4">
                <button
                  onClick={exportarPedidosParaJson}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  Exportar pedidos (.json)
                </button>
                <button
                  onClick={() => inputImportRef.current?.click()}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Importar pedidos (.json)
                </button>
                <input
                  type="file"
                  accept=".json"
                  ref={inputImportRef}
                  onChange={importarPedidosDoJson}
                  className="hidden"
                />
              </div>

              <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:block">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-1 lg:p-2">
                  <img
                    src={logoSupra}
                    alt="Logo da Empresa"
                    className="h-6 lg:h-8 w-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {!loading && !error && pedidosSeparacao.length === 0 && (
          <div className="text-center py-12 lg:py-16">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-6 h-6 lg:w-8 lg:h-8 text-primary" />
            </div>
            <h3 className="text-lg lg:text-xl font-semibold text-foreground mb-2">
              Nenhum pedido para separação
            </h3>
            <p className="text-muted-foreground">
              Não há pedidos em separação no momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PedidosPrioridade;

// Subcomponente auxiliar
type MetricProps = {
  icon: JSX.Element;
  bg: string;
  border: string;
  title: string;
  value: string | number;
  textColor: string;
  labelColor: string;
  action?: JSX.Element;
};

const MetricCard = ({
  icon,
  bg,
  border,
  title,
  value,
  textColor,
  labelColor,
  action,
}: MetricProps) => (
  <div
    className={`relative bg-gradient-to-br from-white to-slate-50 backdrop-blur-sm rounded-lg p-2 lg:p-3 border ${border} shadow-sm`}
  >
    {action && <div className="absolute top-1 right-1">{action}</div>}
    <div className="flex items-center gap-2">
      <div
        className={`w-6 h-6 lg:w-7 lg:h-7 ${bg} rounded-lg flex items-center justify-center`}
      >
        {icon}
      </div>
      <div>
        <p className={`text-xs lg:text-sm font-medium ${labelColor} mb-0.5`}>
          {title}
        </p>
        <p className={`text-base lg:text-xl font-bold ${textColor}`}>
          {value}
        </p>
      </div>
    </div>
  </div>
);
