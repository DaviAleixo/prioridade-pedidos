import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Server, User, Lock, Wifi, Save, RotateCcw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { pedidosService } from '@/services/pedidosServices';

const Configuracoes = () => {
  const [formData, setFormData] = useState({
    ip: '',
    porta: '',
    usuario: '',
    senha: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'ONLINE' | 'OFFLINE' | '...'>('...');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = {
      ip: localStorage.getItem('ip') || '',
      porta: localStorage.getItem('porta') || '',
      usuario: localStorage.getItem('usuario') || '',
      senha: localStorage.getItem('senha') || '',
    };
    setFormData(saved);
    if (saved.ip && saved.porta) verificarStatus();
  }, []);

  const verificarStatus = async () => {
    setStatus('...');
    const statusAtual = await pedidosService.verificarStatusServidor();
    setStatus(statusAtual);
  };

  const handleRedefinir = () => {
    setIsEditing(true);
    toast({ title: "Modo de edição ativado", description: "Agora você pode alterar as configurações" });
  };

  const handleCancelar = () => {
    const saved = {
      ip: localStorage.getItem('ip') || '',
      porta: localStorage.getItem('porta') || '',
      usuario: localStorage.getItem('usuario') || '',
      senha: localStorage.getItem('senha') || '',
    };
    setFormData(saved);
    setIsEditing(false);
    toast({ title: "Edição cancelada", description: "Alterações descartadas" });
  };

  const handleSalvar = async () => {
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      localStorage.setItem('ip', formData.ip);
      localStorage.setItem('porta', formData.porta);
      localStorage.setItem('usuario', formData.usuario);
      localStorage.setItem('senha', formData.senha);

      // Atualiza baseURL
      if (formData.ip && formData.porta) {
        const baseURL = `http://${formData.ip}:${formData.porta}`;
        localStorage.setItem('baseURL', baseURL);
      } else {
        localStorage.removeItem('baseURL');
      }

      setIsEditing(false);
      await verificarStatus();
      toast({ title: "Configurações salvas", description: "Conexão atualizada com sucesso" });
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Função para retornar a classe da cor conforme status
  const getStatusColor = (status: 'ONLINE' | 'OFFLINE' | '...') => {
    switch (status) {
      case '...':
        return 'text-blue-500';
      case 'OFFLINE':
        return 'text-red-500';
      case 'ONLINE':
        return 'text-green-500';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />Voltar
            </Button>
            <h1 className="text-2xl font-bold">Configurações</h1>
          </div>
          {!isEditing ? (
            <Button onClick={handleRedefinir} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />Redefinir
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancelar} variant="outline" size="sm">Cancelar</Button>
              <Button onClick={handleSalvar} size="sm" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          )}
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />Dados de Conexão
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ip" className="text-sm font-medium">Endereço IP</Label>
              <div className="relative">
                <Wifi className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="ip"
                  type="text"
                  value={formData.ip}
                  onChange={e => handleInputChange('ip', e.target.value)}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="porta" className="text-sm font-medium">Porta</Label>
              <div className="relative">
                <Server className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="porta"
                  type="text"
                  value={formData.porta}
                  onChange={e => handleInputChange('porta', e.target.value)}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#FDECEC] border-[#F5C6C7]">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#FAD1D3] rounded-full flex items-center justify-center">
                <Wifi className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Status da Conexão</h3>
                <p className={`text-sm ${getStatusColor(status)}`}>
                  {status === 'ONLINE'
                    ? `Conectado ao servidor ${formData.ip}:${formData.porta}`
                    : status === 'OFFLINE'
                      ? 'Servidor offline ou configuração inválida.'
                      : 'Verificando status...'}
                </p>
                {status !== '...' && (
                  <p className="text-xs mt-1">
                    Última verificação: {new Date().toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Configuracoes;
