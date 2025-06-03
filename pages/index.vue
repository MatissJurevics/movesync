<template>
  <div class="min-h-screen bg-white">
    <!-- Navigation -->
    <nav class="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <span class="ml-2 text-xl font-bold text-gray-900">MotionAI</span>
            </div>
          </div>
          <div class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-4">
              <a href="#features" class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">Features</a>
              <a href="#how-it-works" class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">How It Works</a>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <NuxtLink
              to="/auth/login"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Sign In
            </NuxtLink>
            <NuxtLink
              to="/auth/signup"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Get Started
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-20 pb-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          <div class="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h1 class="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Master Any
              <span class="text-blue-600">Motion</span>
              with AI
            </h1>
            <p class="mt-6 text-xl text-gray-600 sm:max-w-3xl">
              Revolutionary AI-powered motion learning platform that provides real-time feedback on your form and technique using advanced pose detection technology.
            </p>
            <div class="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
              <div class="flex flex-col sm:flex-row gap-4">
                <NuxtLink
                  to="/auth/signup"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors text-center"
                >
                  Start Learning Free
                </NuxtLink>
              </div>
              <p class="mt-4 text-sm text-gray-500">
                No credit card required
              </p>
            </div>
          </div>
          <div class="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div class="relative mx-auto w-full rounded-lg lg:max-w-md">
              <!-- Mock App Interface -->
              <div class="bg-white rounded-xl shadow-2xl overflow-hidden">
                <div class="bg-gray-900 h-48 relative">
                  <div class="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                  <div class="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    92% Match
                  </div>
                  <!-- Pose visualization mockup -->
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="text-white/60 text-center">
                      <svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      <p class="text-sm">AI Pose Detection</p>
                    </div>
                  </div>
                </div>
                <div class="p-4">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="font-semibold text-gray-900">Yoga Flow Practice</h3>
                    <span class="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">4/6 poses</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-green-500 h-2 rounded-full" style="width: 67%"></div>
                  </div>
                  <p class="text-xs text-gray-500 mt-2">Great form! Keep it up!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900 sm:text-4xl">
            Powered by Advanced AI Technology
          </h2>
          <p class="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Our cutting-edge pose detection technology provides instant feedback to help you perfect your movements and achieve your goals faster.
          </p>
        </div>

        <div class="mt-16">
          <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <!-- Real-time Analysis -->
            <div class="text-center">
              <div class="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mx-auto">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 class="mt-6 text-xl font-semibold text-gray-900">Real-time Analysis</h3>
              <p class="mt-4 text-gray-600">
                Get instant feedback on your form with our AI-powered pose detection that analyzes your movements in real-time through your camera.
              </p>
            </div>

            <!-- Progress Tracking -->
            <div class="text-center">
              <div class="flex items-center justify-center w-16 h-16 bg-green-100 rounded-xl mx-auto">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 class="mt-6 text-xl font-semibold text-gray-900">Progress Tracking</h3>
              <p class="mt-4 text-gray-600">
                Monitor your improvement over time with detailed analytics and completion tracking for every motion and pose you practice.
              </p>
            </div>

            <!-- Personalized Learning -->
            <div class="text-center">
              <div class="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-xl mx-auto">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h3 class="mt-6 text-xl font-semibold text-gray-900">Personalized Learning</h3>
              <p class="mt-4 text-gray-600">
                Adaptive difficulty and customized feedback based on your skill level and learning pace to maximize your improvement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="how-it-works" class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900 sm:text-4xl">
            How MotionAI Works
          </h2>
          <p class="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Start learning any motion in just three simple steps. Our AI technology does the rest.
          </p>
        </div>

        <div class="mt-16">
          <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <!-- Step 1 -->
            <div class="text-center">
              <div class="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-6 text-xl font-bold">
                1
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Choose Your Motion</h3>
              <p class="text-gray-600">
                Select from our library of movements including yoga, fitness, dance, sports techniques, and more. Each motion is broken down into key poses.
              </p>
            </div>

            <!-- Step 2 -->
            <div class="text-center">
              <div class="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-6 text-xl font-bold">
                2
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Practice with AI Feedback</h3>
              <p class="text-gray-600">
                Use your camera to practice while our AI analyzes your form in real-time, providing instant feedback and similarity scores.
              </p>
            </div>

            <!-- Step 3 -->
            <div class="text-center">
              <div class="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mx-auto mb-6 text-xl font-bold">
                3
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Track Your Progress</h3>
              <p class="text-gray-600">
                Complete poses with high accuracy to unlock achievements, track your improvement, and master each motion step by step.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 sm:text-4xl">
              Perfect Your Form with AI Precision
            </h2>
            <p class="mt-6 text-xl text-gray-600">
              Traditional learning methods can't provide the instant, detailed feedback that MotionAI delivers. Our advanced pose detection technology ensures you're always improving with proper form.
            </p>
            <div class="mt-8 space-y-6">
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <svg class="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-lg font-semibold text-gray-900">Instant Feedback</h3>
                  <p class="text-gray-600">Get real-time corrections as you practice, not after you're done.</p>
                </div>
              </div>
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <svg class="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-lg font-semibold text-gray-900">Precise Measurements</h3>
                  <p class="text-gray-600">AI-powered similarity scoring with 90%+ accuracy for objective assessment.</p>
                </div>
              </div>
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <svg class="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-lg font-semibold text-gray-900">Learn Anywhere</h3>
                  <p class="text-gray-600">Practice at home with just your computer or phone camera.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-12 lg:mt-0">
            <!-- Feature visualization -->
            <div class="bg-gray-900 rounded-xl p-8 relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-white font-semibold">Live Practice Session</h3>
                  <div class="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center">
                    <div class="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                    LIVE
                  </div>
                </div>
                
                <!-- Mock similarity score -->
                <div class="bg-white/10 rounded-lg p-4 mb-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-white/80 text-sm">Pose Similarity</span>
                    <span class="text-green-400 font-bold text-lg">94%</span>
                  </div>
                  <div class="w-full bg-white/20 rounded-full h-2">
                    <div class="bg-green-400 h-2 rounded-full transition-all duration-500" style="width: 94%"></div>
                  </div>
                </div>
                
                <!-- Mock keypoints -->
                <div class="grid grid-cols-2 gap-3 text-white/60 text-sm">
                  <div class="flex justify-between">
                    <span>Head Position:</span>
                    <span class="text-green-400">✓ Aligned</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Shoulders:</span>
                    <span class="text-green-400">✓ Level</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Arms:</span>
                    <span class="text-yellow-400">⚠ Adjust</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Balance:</span>
                    <span class="text-green-400">✓ Good</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-blue-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold text-white sm:text-4xl">
          Ready to Transform Your Learning?
        </h2>
        <p class="mt-4 text-xl text-blue-100 max-w-3xl mx-auto">
          Join learners who are improving their movements with AI-powered feedback.
        </p>
        <div class="mt-8">
          <NuxtLink
            to="/auth/signup"
            class="bg-white hover:bg-gray-50 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-block"
          >
            Start Your Journey Free
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="col-span-1 md:col-span-2">
            <div class="flex items-center">
              <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <span class="ml-2 text-xl font-bold text-white">MotionAI</span>
            </div>
            <p class="mt-4 text-gray-400 max-w-md">
              Revolutionary AI-powered motion learning platform that helps you master any movement with real-time feedback and progress tracking.
            </p>
          </div>
          <div>
            <h3 class="text-white font-semibold mb-4">Product</h3>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#features" class="hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" class="hover:text-white transition-colors">How It Works</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 MotionAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
// Set page metadata
useSeoMeta({
  title: 'MotionAI - Master Any Motion with AI-Powered Learning',
  description: 'Revolutionary AI-powered motion learning platform that provides real-time feedback on your form and technique using advanced pose detection technology.',
  ogTitle: 'MotionAI - Master Any Motion with AI-Powered Learning',
  ogDescription: 'Revolutionary AI-powered motion learning platform that provides real-time feedback on your form and technique using advanced pose detection technology.',
  ogType: 'website',
  twitterCard: 'summary_large_image'
})

// Check if user is already authenticated and redirect
const supabase = useSupabase()

onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  if (data.session) {
    await navigateTo('/app')
  }
})
</script>
