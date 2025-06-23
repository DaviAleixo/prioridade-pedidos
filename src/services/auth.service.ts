import axios from 'axios';

export interface Usuario {
  id: number;
  nome: string;
  login: string;
  token: string;
  dataValidadeToken: string;
  // outros campos que aparecerem
}

export const authService = {
  async signIn(ip: string, porta: number, usuario: string, senha: string): Promise<Usuario> {
    const url = `http://${ip}:${porta}/supraWS/rest/cadastro/usuario/token`;

    try {
      const response = await axios.post(url, {
        login: usuario,
        senha: senha,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Erro ao autenticar');
      }

      const token = data.token;
      const user = data.data[0];

      if (!token) {
        throw new Error('Token não retornado pela API');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return user;
    } catch (error: any) {
      // Pode customizar mensagem ou logar para um serviço externo
      throw new Error(error.response?.data?.message || error.message || 'Erro na autenticação');
    }
  },

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  recoverUserInformation(): Usuario | null {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },
};
