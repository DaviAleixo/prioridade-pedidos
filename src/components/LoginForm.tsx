import React, { useState, useEffect } from 'react';
import MD5 from 'crypto-js/md5';
import {
  Eye,
  EyeOff,
  User,
  Lock,
  Wifi,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/context/authContext';
import { useNavigate } from 'react-router-dom';
import logoMedh from '@/assets/logo-medh.png';

type FormData = {
  ip: string;
  porta: number;
  usuario: string;
  senha: string;
};

type Errors = Partial<Record<keyof FormData, string>>;

const LoginForm = () => {
  const { signIn } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    ip: '',
    porta: 0,
    usuario: '',
    senha: '',
  });

  const [baseUrlSalvo, setBaseUrlSalvo] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const baseURL = localStorage.getItem('baseURL');
    const ip = localStorage.getItem('ip');
    const porta = localStorage.getItem('porta');

    if (baseURL && ip && porta) {
      setBaseUrlSalvo(baseURL);
      setFormData((prev) => ({
        ...prev,
        ip,
        porta: Number(porta),
      }));
    }
  }, []);

  const validateIP = (ip: string) => {
    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  const validateForm = () => {
    const newErrors: Errors = {};

    if (!baseUrlSalvo) {
      if (!formData.ip) newErrors.ip = 'IP é obrigatório';
      else if (!validateIP(formData.ip)) newErrors.ip = 'Formato de IP inválido';

      if (formData.porta !== 0 && (formData.porta < 1 || formData.porta > 65535))
        newErrors.porta = 'Porta deve ser entre 1 e 65535';
    }

    if (!formData.usuario) newErrors.usuario = 'Usuário é obrigatório';

    if (!formData.senha) newErrors.senha = 'Senha é obrigatória';
    else if (formData.senha.length < 1)
      newErrors.senha = 'Senha deve ter pelo menos 1 caracteres';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const senhaHash = MD5(formData.senha).toString();

      await signIn(formData.ip, formData.porta, formData.usuario, senhaHash);

      const baseURL = `http://${formData.ip}:${formData.porta}`;
      localStorage.setItem('baseURL', baseURL);
      localStorage.setItem('ip', formData.ip);
      localStorage.setItem('porta', formData.porta.toString());

      toast({
        title: 'Login realizado com sucesso!',
        description: `Conectado ao servidor ${baseURL}`,
      });

      navigate('/');
    } catch (error) {
      toast({
        title: 'Erro no login',
        description: 'Não foi possível conectar ao servidor',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === 'porta') {
      const numberValue = Number(value);
      setFormData((prev) => ({
        ...prev,
        porta: isNaN(numberValue) ? 0 : numberValue,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleResetBaseURL = () => {
    localStorage.removeItem('baseURL');
    localStorage.removeItem('ip');
    localStorage.removeItem('porta');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-white shadow-md border border-gray-300 flex items-center justify-center overflow-hidden">
              <img src={logoMedh} alt="Logo Medh" className="object-contain w-full h-full" />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!baseUrlSalvo && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ip">Endereço IP</Label>
                  <div className="relative">
                    <Wifi className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="ip"
                      type="text"
                      placeholder="192.168.1.100"
                      value={formData.ip}
                      onChange={(e) => handleInputChange('ip', e.target.value)}
                      className={errors.ip ? 'border-red-500' : ''}
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                  {errors.ip && <p className="text-sm text-red-600">{errors.ip}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="porta">Porta</Label>
                  <div className="relative">
                    <Wifi className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="porta"
                      type="number"
                      placeholder="8080"
                      value={formData.porta === 0 ? '' : formData.porta}
                      onChange={(e) => handleInputChange('porta', e.target.value)}
                      className={errors.porta ? 'border-red-500' : ''}
                      style={{ paddingLeft: '2.5rem' }}
                      min={1}
                      max={65535}
                    />
                  </div>
                  {errors.porta && <p className="text-sm text-red-600">{errors.porta}</p>}
                </div>
              </>
            )}

            {/* Usuário */}
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuário</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="usuario"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={formData.usuario}
                  onChange={(e) => handleInputChange('usuario', e.target.value)}
                  className={errors.usuario ? 'border-red-500' : ''}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
              {errors.usuario && <p className="text-sm text-red-600">{errors.usuario}</p>}
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  value={formData.senha}
                  onChange={(e) => handleInputChange('senha', e.target.value)}
                  className={errors.senha ? 'border-red-500' : ''}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.senha && <p className="text-sm text-red-600">{errors.senha}</p>}
            </div>

            <Button type="submit" className="w-full mt-6 h-11" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Conectando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>

            {/* {baseUrlSalvo && (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-4"
                onClick={handleResetBaseURL}
              >
                Alterar IP/Porta
              </Button>
            )} */}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
