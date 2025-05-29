<template>
    <div>
    <slot/>
  </div>
</template>

<script setup>

    const supabase = useSupabase()

    onMounted(async () => {
        const { data, error} = await supabase.auth.getSession()
    console.log(data)
    if (!data.session) {
        navigateTo("/auth/login")
    }
    })
</script>