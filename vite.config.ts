import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
        caissiere: resolve(__dirname, 'caissiere.html'),
        scanner: resolve(__dirname, 'scanner.html'),
        stock: resolve(__dirname, 'stock.html'),
        gestionStock: resolve(__dirname, 'gestion-stock.html'),
        links: resolve(__dirname, 'links.html'),
        resetPassword: resolve(__dirname, 'reset-password.html'),
      },
    },
  },
})
