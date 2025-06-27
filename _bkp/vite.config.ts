import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import svgr from 'vite-plugin-svgr';


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy para a API do backend
      '/supraWS': {
        target: 'http://15.204.52.56:8098',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    react(),
    svgr(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
