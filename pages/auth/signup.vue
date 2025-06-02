<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Start your motion learning journey
        </p>
      </div>
      
      <div class="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
        <div class="space-y-6">
          <!-- Google Sign In Button -->
          <button
            @click="loginWithGoogle"
            class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              class="mr-3"
              viewBox="0 0 16 16"
            >
              <path
                d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"
              />
            </svg>
            Continue with Google
          </button>

          <!-- Divider -->
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSignUp" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                class="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Create a password"
              />
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="text-red-600 text-sm text-center">
              {{ errorMessage }}
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <div v-if="isLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {{ isLoading ? 'Creating account...' : 'Create account' }}
            </button>
          </form>
        </div>
      </div>

      <!-- Login Link -->
      <div class="text-center">
        <span class="text-sm text-gray-600">Already have an account?</span>
        <NuxtLink
          to="/auth/login"
          class="ml-1 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
        >
          Sign in
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const email = ref("");
const password = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

const supabase = useSupabase();

const { data, error } = await supabase.auth.getSession();

if (data.session) {
  navigateTo("/app");
}

const handleSignUp = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = "Please fill in all fields";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value
    });

    if (error) {
      console.error("Error signing up:", error);
      errorMessage.value = error.message;
    } else {
      navigateTo("/app");
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    errorMessage.value = "An unexpected error occurred";
  } finally {
    isLoading.value = false;
  }
};

const loginWithGoogle = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    
    if (error) {
      console.error("Error with Google sign in:", error);
      errorMessage.value = error.message;
    }
  } catch (err) {
    console.error("Unexpected error with Google sign in:", err);
    errorMessage.value = "An unexpected error occurred with Google sign in";
  }
};
</script>
