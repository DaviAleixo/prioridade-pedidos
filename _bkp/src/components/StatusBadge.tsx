/**
 * Componente para exibir o status do pedido com cores diferenciadas
 */

import { StatusPedido } from '@/models/pedido';
import { Clock, Package, Users, Truck } from 'lucide-react';

interface StatusBadgeProps {
  status: StatusPedido;
  className?: string;
}

export const StatusBadge = ({ status, className = '' }: StatusBadgeProps) => {
  const getStatusConfig = (status: StatusPedido) => {
    switch (status) {
      case 'AGUARDANDO':
        return {
          colors: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
        };
      case 'SEPARAÇÃO':
        return {
          colors: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Package,
        };
      case 'FATURAMENTO':
        return {
          colors: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Users,
        };
      case 'CONFERENCIA':
        return {
          colors: 'bg-green-100 text-green-800 border-green-200',
          icon: Truck,
        };
      default:
        return {
          colors: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock,
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  
  return (
    <span 
      className={`
        inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border
        ${config.colors} ${className}
      `}
    >
      <Icon className="w-3 h-3 mr-1.5" />
      {status}
    </span>
  );
};
