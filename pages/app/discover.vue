<template>
    <div>
        <h1>Discover public</h1>
        <div v-if="records.length === 0" class="text-center py-8 text-gray-500">
            No public records found.
        </div>
        <div v-else class="grid grid-cols-1 gap-4 p-6">
            <div v-for="record in records" :key="record.id" class="border rounded-lg p-4 shadow-sm">
                <div v-if="record.image" class="mb-3">
            <img :src="record.image" :alt="record.title" class="w-full h-48 object-cover rounded-md" />
          </div>
                <h3 class="font-semibold text-lg">{{ record.title }}</h3>
                <p class="text-gray-600 mt-1">{{ record.description }}</p>
                <p class="text-gray-600 mt-1">{{ record.created_at }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
  layout: "appmain"
})
const records = ref([])

const supabase = useSupabase()

const getUserSession = async () => {
  const {data, error} = await supabase.auth.getSession()
  if (error) {
    console.error(error)
    console.log(data)
  }
  return data.session
}

onMounted(async () => {
    const session = await getUserSession()
  const userId = session.user.id
  console.log(userId)
  const {data, error} = await supabase.from("motions").select().eq("public", true)
  
  records.value = data
})
</script>