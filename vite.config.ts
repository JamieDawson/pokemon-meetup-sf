import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const SHEET_CSV_PATH =
  '/spreadsheets/d/1hSrs56BXU-VedniroXwDoZFQo4EWUaOwDArTPQbRgKw/gviz/tq?tqx=out:csv&sheet=Sheet1'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/sheet.csv': {
        target: 'https://docs.google.com',
        changeOrigin: true,
        rewrite: () => SHEET_CSV_PATH,
      },
    },
  },
  preview: {
    proxy: {
      '/api/sheet.csv': {
        target: 'https://docs.google.com',
        changeOrigin: true,
        rewrite: () => SHEET_CSV_PATH,
      },
    },
  },
})
