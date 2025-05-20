<template>
  <div class="p-6 pb-20">
    <h1 class="text-2xl font-bold mb-6">
      Settings (THIS IS A PLACEHOLDER PAGE, NONE OF THE STUFF HERE WORKS)
    </h1>

    <div class="space-y-6">
      <button
        @click="() => handleLogOut()"
        class="border-2 border-red-500 text-red-500 hover:bg-red-50 transistion-ease-in duration-300 p-4 w-full cursor-pointer"
      >
        Log Out
      </button>
    </div>
  </div>
  <BottomNav />
</template>

<script setup>
    definePageMeta({
        layout: "appmain"
    })

   const supabase = useSupabase()
    
    const handleLogOut = async () => {
        console.log("Logging out")
        let { error } = supabase.auth.signOut();
        if (error) {console.error("ERROR: ", error)}
        navigateTo("/auth/login")
    }
</script>
