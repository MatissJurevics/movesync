<template>
  <div class="min-h-screen bg-white">
    <h1>Landing Page</h1>
    <button @click="() => goToLogin()" class="btn btn-primary">{{ loggedIn ? "Go to App" : "Log In" }}</button>
  </div>
</template>

<script setup>

const supabase = useSupabase()

onMounted(async () => {
  const { data, error} = await supabase.auth.getSession()
  console.log(data)
  const loggedIn = data.session ? true : false;

})

const goToLogin = () => {
  navigateTo("/auth/login")
}

</script>
