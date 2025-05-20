import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/icon', '@vueuse/motion/nuxt'],
  vite: {
    plugins: [tailwindcss()],
  },
  css: ["~/assets/app.css"],
  motion: {
    directives: {
      'motion': {}
    }
  },
  plugins: [
    { src: '~/plugins/ml5.client.js', mode: 'client' }
  ]
})