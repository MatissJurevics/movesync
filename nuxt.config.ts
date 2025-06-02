import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  modules: ['@nuxt/icon', '@vueuse/motion/nuxt'],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['@mediapipe/pose']
    }
  },
  build: {
    transpile: ['@mediapipe/pose']
  },
  css: ["~/assets/app.css"],
  motion: {
    directives: {
      'motion': {}
    }
  },
  
})