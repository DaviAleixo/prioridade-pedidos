import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

// Ajuste a interface User conforme o que sua API realmente retorna
interface User {
  id: number;       // se o id é number, troque aqui
  nome: string;
  login?: string;
  token?: string;
  dataValidadeToken?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (ip: string, porta: number, usuario: string, senha: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const recoveredUser = authService.recoverUserInformation();
    if (recoveredUser) {
      setUser(recoveredUser);
    }
    setIsLoading(false);
  }, []);

  const signIn = async (ip: string, porta: number, usuario: string, senha: string) => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.signIn(ip, porta, usuario, senha);
      setUser(loggedUser);
      navigate('/');
    } catch (error: any) {
      // Aqui você pode lançar um toast, alert ou propagar o erro para o componente tratar
      // Por exemplo: throw new Error(error.message || 'Erro na autenticação');
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    authService.signOut();
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
