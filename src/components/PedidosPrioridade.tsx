import {
  RefreshCw,
  Building2,
  Package,
  CheckCircle,
  BarChart3,
  Clock,
  Power,
  EyeOff,
  Eye,
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
import Separacao from '@/assets/separacao.svg';
import Conferencia from '@/assets/conferencia.svg';
import { Navigate, useNavigate } from 'react-router-dom';


import { useState } from 'react';
import { useAuthContext } from '@/context/authContext';

const PedidosPrioridade = () => {
  const {
    pedidos,
    loading,
    error,
    atualizarOrdem,
    recarregarPedidos,
  } = usePedidos();

  const { signOut } = useAuthContext();
  const { toast } = useToast();
  const [menuAberto, setMenuAberto] = useState(false);
  const [headerVisivel, setHeaderVisivel] = useState(true); 
  const navigate = useNavigate();


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
      const pedido = pedidos.find((p) => p.id === pedidoId);
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

  const pedidosSeparacao = pedidos.filter((p) => p.status === 'AGUARDANDO');
  const pedidosConferencia = pedidos.filter((p) => p.status === 'CONFERENCIA');

  const totalPedidos = pedidos.length;
  const aSeparar = pedidosSeparacao.length;
  const aConferir = pedidosConferencia.length;

  const ultimaAtualizacao = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">

        {/* Botão para ocultar/mostrar o header */}
        <div className="flex justify-end mb-2">
          {!headerVisivel && (
            <button
              onClick={() => setHeaderVisivel(true)}

            >
              <Eye className="w-5 h-5 text-[#B63039]" />
            </button>
          )}

        </div>

        {/* Renderiza o header só se estiver visível */}
        {headerVisivel && (
          <header className="glass-effect rounded-xl p-2 lg:p-3 shadow-md sticky top-0 z-50 bg-white/90 backdrop-blur-md border border-[#B63039]/20">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center justify-center lg:justify-start flex-shrink-0">
                <Avatar className="w-10 h-10 sm:w-16 sm:h-16 lg:w-14 lg:h-14 rounded-lg overflow-hidden">
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

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center text-[#B63039] tracking-tight flex-grow">
                Prioridade de Separação
              </h1>

              <div className="flex items-center justify-center lg:justify-end flex-shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-14 lg:h-14 rounded-lg overflow-hidden">
                  <img
                    src={logoSupra}
                    alt="Logo da Empresa"
                    className="object-contain w-full h-full"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-[#B63039]/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 flex-grow">
                <MetricCard
                  icon={<img src={Separacao} alt="Separação" className="w-6 h-6" />}
                  bg="bg-yellow-500"
                  border="border-yellow-200"
                  title="Separação"
                  value={aSeparar}
                  textColor="text-yellow-800"
                  labelColor="text-yellow-700"
                />

                <MetricCard
                  icon={
                    <img
                      src={Conferencia}
                      alt="Ícone Conferência"
                      className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
                    />
                  }
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
                      <Clock className={`h-3 w-3 text-white ${loading ? 'animate-spin' : ''}`} />
                    </button>
                  }
                  bg="bg-green-500"
                  border="border-green-200"
                  title="Última atualização"
                  value={ultimaAtualizacao}
                  textColor="text-green-800"
                  labelColor="text-green-700"
                />
              </div>

              <div className="relative ml-auto">
                <button
                  onClick={toggleMenu}
                  className="bg-white border border-gray-300 rounded-md p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#B63039]"
                  aria-label="Abrir menu"
                >
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

                {menuAberto && (
                  <div
                    onMouseLeave={fecharMenu}
                    className="absolute mt-2 w-44 bg-white border border-gray-300 rounded-md shadow-lg z-50 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0"
                  >
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => setHeaderVisivel(!headerVisivel)}
                    >
                      <EyeOff className="w-5 h-5" /> Ocultar
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => navigate('/configuracoes')}
                    >
                      <Settings className="w-5 h-5" /> Configurações
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                      onClick={handleLogout}
                    >
                      <Power className="w-5 h-5" /> Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} onRetry={handleRefresh} />}

        {!loading && !error && pedidosSeparacao.length > 0 && (
          <>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#B63039]/10 shadow-lg overflow-auto">
              <PedidosTable pedidos={pedidosSeparacao} onReorder={handleReorder} />
            </div>
            <div className="flex justify-center mt-6 relative">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:block">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2">
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
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-[#B63039]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-6 h-6 lg:w-8 lg:h-8 text-[#B63039]" />
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

const MetricCard = ({
  icon,
  bg,
  border,
  title,
  value,
  textColor,
  labelColor,
  action,
}: {
  icon: React.ReactNode;
  bg: string;
  border: string;
  title: string;
  value: string | number;
  textColor: string;
  labelColor: string;
  action?: React.ReactNode;
}) => (
  <div
    className={`relative bg-transparent border ${border} rounded-lg pt-2 pb-2 px-4 shadow-none`}
  >
    {/* Título flutuante com fundo igual ao cabeçalho */}
    <div className="absolute -top-3 left-4 px-2 py-0.5 bg-white/90 backdrop-blur-md text-xs font-bold text-[#B63039]  rounded z-10">
      {title}
    </div>

    {action && <div className="absolute top-2 right-2">{action}</div>}

    <div className="flex items-center gap-3 mt-2">
      <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className={`text-base sm:text-xl font-bold ${textColor}`}>{value}</p>
      </div>
    </div>
  </div>
);


