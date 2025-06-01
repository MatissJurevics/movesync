<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
      <button 
        @click="$router.back()"
        class="p-2 -ml-2 text-gray-600 hover:text-gray-900 cursor-pointer"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      <h1 class="flex-1 text-center text-lg font-semibold text-gray-900 pr-10">Account</h1>
    </div>

    <div class="p-4">
      <!-- Account Settings Form -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">Account Information</h2>
        
        <!-- Username Section -->
        <!-- First Name Section -->
        <div class="mb-6">
          <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
            First Name
          </label>
          <div class="relative">
            <input 
              id="firstName"
              v-model="firstName"
              type="text" 
              placeholder="Enter your first name"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :disabled="isUpdating"
            >
          </div>
        </div>

        <!-- Last Name Section -->
        <div class="mb-6">
          <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
            Last Name
          </label>
          <div class="relative">
            <input 
              id="lastName"
              v-model="lastName"
              type="text" 
              placeholder="Enter your last name"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :disabled="isUpdating"
            >
          </div>
        </div>

        <!-- Username Section -->
        <div class="mb-6">
          <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <div class="relative">
            <input 
              id="username"
              v-model="username"
              type="text" 
              placeholder="Enter your username"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :disabled="isUpdating"
            >
          </div>
        </div>

        

        <!-- Save Button -->
        <div class="flex justify-end">
          <button 
            @click="updateProfile"
            :disabled="isUpdating"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <svg v-if="isUpdating" class="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span>{{ isUpdating ? 'Updating...' : 'Save Changes' }}</span>
          </button>
        </div>

        <!-- Success/Error Messages -->
        <div v-if="successMessage" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-sm text-green-700">{{ successMessage }}</p>
        </div>
        <div v-if="errorMessage" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-700">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
definePageMeta({
  layout: "appmain",
});

const supabase = useSupabase();
const firstName = ref('');
const lastName = ref('');
const username = ref('');


onMounted(async () => {
  const { data: userData, error: userError } = await supabase.auth.getSession()
  const userId = userData.session?.user.id;

  const { data: user, error: dataError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
    console.log(user);
    firstName.value = user.first_name;
    lastName.value = user.last_name;
    username.value = user.username;
  
});

const updateUsername = async () => {
  const { data: userData, error: userError } = await supabase.auth.getSession()
  const userId = userData.session?.user.id;

  const { data: user, error: dataError } = await supabase
    .from('users')  
    .update({
      first_name: firstName.value,
      last_name: lastName.value,
      username: username.value
    })
    .eq('id', userId)
    .single();

  if (dataError) {
    console.error('Error updating username:', dataError);
  } else {
    console.log('Username updated successfully');
  }
};

</script>
