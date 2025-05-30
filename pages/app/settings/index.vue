<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
      <button 
        @click="$router.back()"
        class="p-2 -ml-2 text-gray-600 hover:text-gray-900 cursor-alias"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      <h1 class="flex-1 text-center text-lg font-semibold text-gray-900 pr-10">Settings</h1>
    </div>

    <div class="p-4">
      <!-- Search Bar -->
      
      <!-- Settings Menu -->
      <div class="bg-white rounded-lg overflow-hidden shadow-sm">
        <!-- Account -->
        <button 
          @click="navigateTo('/app/settings/account')"
          class="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <div class="flex items-center space-x-3">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <span class="text-gray-900 font-medium">Account</span>
          </div>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>

      <!-- Logout Section -->
      <div class="mt-8">
        <button 
          @click="logout"
          class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Log Out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "appmain",
});

const supabase = useSupabase();

const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      navigateTo('/');
    }
  } catch (err) {
    console.error('Logout error:', err);
  }
};
</script>