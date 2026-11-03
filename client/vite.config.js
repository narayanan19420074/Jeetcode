import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { designTokensPlugin } from './scripts/designTokensPlugin.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [designTokensPlugin(), react()],
  server:{port:5173, strictPort:true, proxy:{'/api':'http://localhost:5000'}}
})
