import ml5 from 'ml5';

export default defineNuxtPlugin(nuxtApp => {
  return {
    provide: {
      ml5
    }
  }
});
