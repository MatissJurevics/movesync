<template>
  <div class="min-h-screen bg-white">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">MotionApp</h1>
          </div>
          <div class="flex items-center space-x-4">
            <button @click="() => goToLogin()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              {{ loggedIn ? "Go to App" : "Log In" }}
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div class="text-center">
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          Track Your Motion,
          <span class="text-blue-600">Perfect Your Form</span>
        </h1>
        <p class="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Record, analyze, and improve your movements with our advanced motion tracking technology. 
          Perfect for athletes, fitness enthusiasts, and anyone looking to optimize their performance.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button @click="() => goToLogin()" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
            Get Started
          </button>
          <button class="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="bg-gray-50 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Choose MotionApp?
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform combines cutting-edge technology with user-friendly design to help you achieve your goals.
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Record Sessions</h3>
            <p class="text-gray-600">Capture your movements with high-quality video recording and real-time analysis.</p>
          </div>
          
          <div class="text-center">
            <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Analyze Data</h3>
            <p class="text-gray-600">Get detailed insights and analytics to understand your movement patterns and progress.</p>
          </div>
          
          <div class="text-center">
            <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Improve Performance</h3>
            <p class="text-gray-600">Use data-driven insights to optimize your technique and reach your full potential.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="bg-blue-600 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to Transform Your Training?
        </h2>
        <p class="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
          Join thousands of athletes and fitness enthusiasts who are already using MotionApp to improve their performance.
        </p>
        <button @click="() => goToLogin()" class="bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 rounded-lg text-lg font-medium transition-colors">
          Start Your Journey
        </button>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-gray-400">© 2024 MotionApp. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>

const supabase = useSupabase()
const loggedIn = ref(false)

onMounted(async () => {
  const { data, error} = await supabase.auth.getSession()
  console.log(data)
  loggedIn.value = data.session ? true : false;

})

const goToLogin = () => {
  navigateTo("/auth/login")
}

</script>
