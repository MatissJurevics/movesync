<template>
  <main>

    <div class="">
        <!-- Popular Today Section -->
        <div class="relative mb-8 p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden pb-12">
          <!-- Slanted divider at bottom -->
          <div class="absolute bottom-0 left-0 right-0 h-6 -mb-2 bg-base-100 transform -skew-y-1 origin-bottom-left"></div>
          
          <div class="relative z-10">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">Popular Today</h2>
            
            <div v-if="!popularMotionLoaded" class="flex items-center justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
            
            <div v-else-if="popularMotion" class="max-w-sm">
              <!-- Glassmorphism container -->
              <div 
                @click="navigateTo(`/app/motions/${popularMotion.id}`)" 
                class="cursor-pointer group relative backdrop-blur-sm bg-white/20 border border-white/30 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/30"
              >
                <div class="flex items-stretch space-x-4 h-full">
                  <!-- Motion thumbnail/icon -->
                  <div class="flex-shrink-0 w-20 h-full bg-white/40 rounded-xl flex items-center justify-center border border-white/50 overflow-hidden">
                    <img 
                      v-if="popularMotion.image" 
                      :src="popularMotion.image" 
                      :alt="popularMotion.title || 'Motion thumbnail'"
                      class="w-full h-full object-cover rounded-xl"
                    />
                    <svg 
                      v-else 
                      class="w-8 h-8 text-indigo-600" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                  
                  <!-- Motion details -->
                  <div class="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 class="text-lg font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                      {{ popularMotion.title || 'Untitled Motion' }}
                    </h3>
                    <p class="text-sm text-gray-600 mt-1 line-clamp-2">
                      {{ popularMotion.description || 'No description available' }}
                    </p>
                    <div class="flex items-center mt-3 space-x-3">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        Trending
                      </span>
                      <span class="text-xs text-gray-500">
                        {{ formatDate(popularMotion.created_at) }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- Hover arrow -->
                <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-8 text-gray-500">
              No popular motions available today
            </div>
          </div>
        </div>

        

      <div class="px-6">
        <h1 class="my-4 font-bold text-2xl">Your Motions</h1>
      <div v-if="!recordsLoaded" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
      <div v-else-if="records.length === 0" class="text-center py-8 text-gray-500">
        No records found. Create your first record!
      </div>
      <div class="flex overflow-x-auto gap-4 pb-6">
        <div v-for="record in records" :key="record.id" @click="navigateTo(`/app/motions/${record.id}`)" class="relative shadow-xl cursor-pointer hover:shadow-2xl transition-shadow flex-none w-56 h-40 rounded-lg overflow-hidden" :style="record.image ? `background-image: url(${record.image}); background-size: cover; background-position: center;` : 'background-color: #f3f4f6;'">
          <div class="absolute inset-0 bg-black/50"></div>
          <div class="relative z-10 p-4 text-white flex flex-col justify-end h-full">
            <h2 class="text-base font-bold text-white">{{ record.title }}</h2>
            <p class="text-white/80 text-sm">{{ record.description }}</p>
            <p class="text-white/60 text-xs">{{ formatDate(record.created_at) }}</p>
          </div>
        </div>
      </div>
      </div>
      <!-- Saved Motions Section -->
      <div class="px-6 mb-8">
          <h1 class="my-4 font-bold text-2xl">Saved Motions</h1>
          <div v-if="!savedMotionsLoaded" class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
          <div v-else-if="savedMotionsData.length === 0" class="text-center py-8 text-gray-500">
            No saved motions yet. Discover motions to save them!
          </div>
          <div v-else class="flex overflow-x-auto gap-4 pb-6">
            <div v-for="motion in savedMotionsData" :key="motion.id" @click="navigateTo(`/app/motions/${motion.id}`)" class="relative shadow-xl cursor-pointer hover:shadow-2xl transition-shadow flex-none w-56 h-40 rounded-lg overflow-hidden" :style="motion.image ? `background-image: url(${motion.image}); background-size: cover; background-position: center;` : 'background-color: #f3f4f6;'">
              <div class="absolute inset-0 bg-black/50"></div>
              <div class="relative z-10 p-4 text-white flex flex-col justify-end h-full">
                <div class="absolute top-3 right-3">
                  <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h2 class="text-base font-bold text-white">{{ motion.title }}</h2>
                <p class="text-white/80 text-sm">{{ motion.description }}</p>
                <p class="text-white/60 text-xs">{{ formatDate(motion.created_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      
    </div>
  </main>
</template>

<script setup>
definePageMeta({
  layout: "appmain"
})
const supabase  = useSupabase()
const records = ref([])
const recordsLoaded = ref(false)
const popularMotion = ref(null)
const popularMotionLoaded = ref(false)
const savedMotions = ref([])
const savedMotionsData = ref([])
const savedMotionsLoaded = ref(false)


const getUserSession = async () => {
  const {data, error} = await supabase.auth.getSession()
  if (error) {
    console.error(error)
    console.log(data)
  }
  return data.session
}

const getPopularMotion = async () => {
  const {data, error} = await supabase.from("motions").select().order("created_at", { ascending: false }).limit(1)
  return data[0]
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const getSavedMotionsData = async (motionIds) => {
  if (!motionIds || motionIds.length === 0) return []
  
  const { data, error } = await supabase
    .from("motions")
    .select("*")
    .in("id", motionIds)
  
  if (error) {
    console.error("Error fetching saved motions:", error)
    return []
  }
  
  return data || []
}

onMounted(async() => {
  const session = await getUserSession()
  const userId = session.user.id
  console.log(userId)
  popularMotion.value = await getPopularMotion()
  popularMotionLoaded.value = true
  const {data, error} = await supabase.from("motions").select().eq("creator_id", userId).eq("completed", true)
  recordsLoaded.value = true
  records.value = data
  const {data: userData, error: userError} = await supabase.from("users").select("saved_motions").eq("id", userId)
  savedMotions.value = userData[0]?.saved_motions || []
  
  // Fetch saved motions data
  savedMotionsData.value = await getSavedMotionsData(savedMotions.value)
  savedMotionsLoaded.value = true
})
</script>