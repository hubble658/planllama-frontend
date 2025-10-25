import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env variables for the current mode so VITE_LLM_URL is available here
  const env = loadEnv(mode, process.cwd())
  const llmTarget = env.VITE_LLM_URL || process.env.VITE_LLM_URL || 'http://localhost:8000'

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        // Proxy /vllm/* -> VITE_LLM_URL (set in .env). This avoids CORS during development.
        '/vllm': {
          target: llmTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/vllm/, '')
        }
      }
    }
  }
})
