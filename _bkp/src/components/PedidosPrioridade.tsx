import {
  RefreshCw,
  Building2,
  Package,
  CheckCircle,
  BarChart3,
  Clock,
  Power,
  Settings,
} from 'lucide-react';
import { usePedidos } from '@/hooks/usePedidos';
import { PedidosTable } from './PedidosTable';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import logoSupra from '@/assets/logo-erp-supramais.png';
import logoSupra2 from '@/assets/logo-horizontal.png';
import logoMedh from '@/assets/logo-medh.png';
import { saveAs } from 'file-saver';
import { ChangeEvent, useRef, useState } from 'react';
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

  const [menuAberto, setMenuAberto] = useState(false);

  const toggleMenu = () => setMenuAberto(!menuAberto);
  const fecharMenu = () => setMenuAberto(false);

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
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
        {/* Cabeçalho */}
        <header className="glass-effect rounded-2xl p-4 lg:p-6 shadow-modern sticky top-0 z-50 bg-white/90 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left: Logo Medh */}
            <div className="flex items-center justify-center lg:justify-start flex-shrink-0">
              <Avatar className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 border-2 border-primary/20 rounded-lg overflow-hidden">
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

            {/* Center: Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center text-[#B63039] flex-grow">
              Prioridade de Separação
            </h1>

            {/* Right: Logo Supra */}
            <div className="flex items-center justify-center lg:justify-end flex-shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden">
                <img
                  src={logoSupra}
                  alt="Logo da Empresa"
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Cards métricas e menu */}
          <div className="mt-5 pt-5 border-t border-primary/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Cards: grid responsivo */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 flex-grow">
              <MetricCard
                icon={<Package className="h-4 w-4 sm:h-5 sm:w-5 text-white" />}
                bg="bg-yellow-500"
                border="border-yellow-200"
                title="Separação"
                value={aSeparar}
                textColor="text-yellow-800"
                labelColor="text-yellow-700"
              />
              <MetricCard
                icon={<CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />}
                bg="bg-blue-500"
                border="border-blue-200"
                title="Conferência"
                value={aConferir}
                textColor="text-blue-800"
                labelColor="text-blue-700"
              />
              <MetricCard
                icon={<BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />}
                bg="bg-slate-500"
                border="border-slate-200"
                title="Total"
                value={totalPedidos}
                textColor="text-slate-800"
                labelColor="text-slate-600"
              />
              <MetricCard
                icon={
                  <button
                    onClick={handleRefresh}
                    className="bg-green-600 rounded p-0.5 hover:bg-green-700 transition"
                    aria-label="Atualizar agora"
                  >
                    <Clock
                      className={`h-3 w-3 text-white ${loading ? 'animate-spin' : ''}`}
                    />
                  </button>
                }
                bg="bg-green-500"
                border="border-green-200"
                title="Atualizada"
                value={ultimaAtualizacao}
                textColor="text-green-800"
                labelColor="text-green-700"
              />
            </div>

            {/* Botão menu - aparece em todos os tamanhos */}
            <div className="relative ml-auto">
              <button
                onClick={toggleMenu}
                className="bg-white border border-gray-300 rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Abrir menu"
              >
                {/* Ícone tipo hamburger */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Dropdown responsivo */}
              {menuAberto && (
                <div
                  onMouseLeave={fecharMenu}
                  className="absolute mt-2 w-40 sm:w-44 bg-white border border-gray-300 rounded-md shadow-lg z-50
                 left-1/2 -translate-x-1/2
                 sm:left-auto sm:right-0"
                >
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => { handleLogout() }}
                  >
                    <Power className="w-5 h-5" /> Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Conteúdo principal */}

        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} onRetry={handleRefresh} />}

        {!loading && !error && pedidosSeparacao.length > 0 && (
          <>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary/20 shadow-modern overflow-auto">
              <PedidosTable pedidos={pedidosSeparacao} onReorder={handleReorder} />
            </div>

            {/* Logo fixa no canto direito em desktop */}
            <div className="flex justify-center mt-6 relative">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:block">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-1 lg:p-2">
                  <img
                    src={logoSupra2}
                    alt="Logo da Empresa"
                    className="h-6 lg:h-8 w-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {!loading && !error && pedidosSeparacao.length === 0 && (
          <div className="text-center py-12 lg:py-16 px-4">
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
    className={`relative bg-gradient-to-br from-white to-slate-50 backdrop-blur-sm rounded-lg p-3 border ${border} shadow-sm`}
  >
    {action && <div className="absolute top-2 right-2">{action}</div>}
    <div className="flex items-center gap-3">
      <div
        className={`w-7 h-7 sm:w-8 sm:h-8 ${bg} rounded-lg flex items-center justify-center`}
      >
        {icon}
      </div>
      <div>
        <p className={`text-xs sm:text-sm font-medium ${labelColor} mb-1`}>
          {title}
        </p>
        <p className={`text-base sm:text-xl font-bold ${textColor}`}>{value}</p>
      </div>
    </div>
  </div>
);
