<template>
  <div>
    <button
      @click="loginWithGoogle"
      class="btn btn-outline border-gray-300 rounded-md h-12 mb-2 flex items-center justify-center transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:bg-gray-50"
      
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class="bi bi-google mr-2"
        viewBox="0 0 16 16"
      >
        <path
          d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"
        />
      </svg>
      Sign in with Google
    </button>
    <div class="flex flex-col">
      <input v-model="email" class="input" type="text" name="emaill" placeholder="Email" id="">
      <input v-model="password" class="input" type="password" name="password" placeholder="Email" id="">
      <button class="btn btn-primary" @click="() => handleLogin()">Sign In</button>
    </div>
    <div
      class="mt-6 text-center text-sm"
      
    >
      <span class="text-gray-600">New to the app? </span>
      <NuxtLink
        to="/auth/signup"
        class="text-indigo-500 hover:text-indigo-600 transition-colors duration-200"
        >Create account</NuxtLink
      >
    </div>
  </div>
</template>

<script setup>
const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");

const supabase = useSupabase();

const { data, error } = await supabase.auth.getSession();

if (data.session) {
  navigateTo("/app");
}

const handleLogin = async () => {
  supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })
};

const loginWithGoogle = async () => {
  supabase.auth.signInWithOAuth({
    provider: "google",
  });
};
</script>
