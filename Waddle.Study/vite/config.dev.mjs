import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: './',
    plugins: [
        react(),
    ],
    envDir: '../',
    server: {
        port: 8080
    }
})
