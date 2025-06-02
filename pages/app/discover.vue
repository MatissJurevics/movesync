<template>
    <div class="container mx-auto p-4">
        <!-- Header Section -->
        <div class="mb-8">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">Discover</h1>
                    <p class="text-gray-600">Explore public motions shared by the community</p>
                </div>
                
                <!-- View Toggle -->
                <div class="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                        @click="viewMode = 'grid'"
                        :class="[
                            'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                            viewMode === 'grid' 
                                ? 'bg-white text-gray-900 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-900'
                        ]"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                        </svg>
                        Cards
                    </button>
                    <button
                        @click="viewMode = 'list'"
                        :class="[
                            'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                            viewMode === 'list' 
                                ? 'bg-white text-gray-900 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-900'
                        ]"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                        </svg>
                        List
                    </button>
                </div>
            </div>
        </div>

        <!-- Content Section -->
        <div v-if="records.length === 0" class="flex flex-col items-center justify-center py-16">
            <div class="text-center">
                <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No public motions yet</h3>
                <p class="text-gray-500 max-w-sm">Be the first to share a motion with the community! Create and publish your motions to get started.</p>
            </div>
        </div>

        <!-- Grid View -->
        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
                v-for="record in records" 
                :key="record.id" 
                class="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
                <!-- Image Section -->
                <div 
                    v-if="record.image" 
                    class="aspect-video bg-gray-100 cursor-pointer"
                    @click="navigateTo(`/app/motions/${record.id}`)"
                >
                    <img 
                        :src="record.image" 
                        :alt="record.title" 
                        class="w-full h-full object-cover" 
                    />
                </div>
                <div 
                    v-else 
                    class="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center cursor-pointer"
                    @click="navigateTo(`/app/motions/${record.id}`)"
                >
                    <svg class="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                </div>

                <!-- Content Section -->
                <div class="p-4">
                    <div class="flex items-start justify-between mb-2">
                        <h3 
                            class="font-semibold text-lg text-gray-900 line-clamp-2 cursor-pointer flex-1"
                            @click="navigateTo(`/app/motions/${record.id}`)"
                        >
                            {{ record.title || 'Untitled Motion' }}
                        </h3>
                        <button
                            @click="toggleBookmark(record.id)"
                            :class="[
                                'ml-2 p-2 transition-colors duration-200',
                                bookmarkedMotions.has(record.id) 
                                    ? 'text-blue-500 hover:text-blue-600' 
                                    : 'text-gray-400 hover:text-yellow-500'
                            ]"
                            :title="bookmarkedMotions.has(record.id) ? 'Remove bookmark' : 'Bookmark this motion'"
                        >
                            <svg class="w-5 h-5" :fill="bookmarkedMotions.has(record.id) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                            </svg>
                        </button>
                    </div>
                    <p 
                        class="text-gray-600 text-sm mb-3 line-clamp-2 cursor-pointer"
                        @click="navigateTo(`/app/motions/${record.id}`)"
                    >
                        {{ record.description || 'No description available' }}
                    </p>
                    
                    <!-- Footer -->
                    <div class="flex items-center justify-between text-xs text-gray-500">
                        <div class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>{{ formatDate(record.created_at) }}</span>
                        </div>
                        <div class="flex items-center gap-1">
                            <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>Public</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- List View -->
        <div v-else class="space-y-3">
            <div 
                v-for="record in records" 
                :key="record.id" 
                class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 overflow-hidden"
            >
                <div class="flex">
                    <!-- Thumbnail -->
                    <div 
                        class="w-24 h-20 sm:w-28 sm:h-24 md:w-32 md:h-28 flex-shrink-0 cursor-pointer"
                        @click="navigateTo(`/app/motions/${record.id}`)"
                    >
                        <div v-if="record.image" class="w-full h-full bg-gray-100">
                            <img 
                                :src="record.image" 
                                :alt="record.title" 
                                class="w-full h-full object-cover" 
                            />
                        </div>
                        <div v-else class="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                            <svg class="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="flex-1 p-3 sm:p-4 min-w-0">
                        <div class="flex items-start justify-between">
                            <div class="flex-1 min-w-0 pr-3">
                                <h3 
                                    class="font-semibold text-base sm:text-lg text-gray-900 line-clamp-1 cursor-pointer mb-1"
                                    @click="navigateTo(`/app/motions/${record.id}`)"
                                >
                                    {{ record.title || 'Untitled Motion' }}
                                </h3>
                                <p 
                                    class="text-gray-600 text-sm line-clamp-2 cursor-pointer mb-3"
                                    @click="navigateTo(`/app/motions/${record.id}`)"
                                >
                                    {{ record.description || 'No description available' }}
                                </p>
                                
                                <!-- Footer -->
                                <div class="flex items-center gap-4 text-xs text-gray-500">
                                    <div class="flex items-center gap-1">
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        <span>{{ formatDate(record.created_at) }}</span>
                                    </div>
                                    <div class="flex items-center gap-1">
                                        <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span>Public</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Bookmark Action -->
                            <div class="flex-shrink-0">
                                <button
                                    @click="toggleBookmark(record.id)"
                                    :class="[
                                        'p-2 rounded-lg transition-colors duration-200',
                                        bookmarkedMotions.has(record.id) 
                                            ? 'text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100' 
                                            : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-50'
                                    ]"
                                    :title="bookmarkedMotions.has(record.id) ? 'Remove bookmark' : 'Bookmark this motion'"
                                >
                                    <svg class="w-5 h-5" :fill="bookmarkedMotions.has(record.id) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
  layout: "appmain"
})

const records = ref([])
const viewMode = ref('grid') // 'grid' or 'list'
const bookmarkedMotions = ref(new Set())
const supabase = useSupabase()

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
}

const toggleBookmark = async (motionId) => {
  const session = await getUserSession()
  const userId = session.user.id
  
  // Get current saved motions from database
  const {data: userData, error: userError} = await supabase
    .from("users")
    .select("saved_motions")
    .eq("id", userId)
    .single()
  
  if (userError) {
    console.error('Error fetching user data:', userError)
    return
  }
  
  // Handle NULL JSONB field properly - initialize as empty array if NULL
  let savedMotions = userData?.saved_motions || []
  
  // Ensure it's an array (in case it's not null but also not an array)
  if (!Array.isArray(savedMotions)) {
    savedMotions = []
  }
  
  const isCurrentlyBookmarked = savedMotions.includes(motionId)
  
  if (isCurrentlyBookmarked) {
    // Remove motionId from saved motions
    savedMotions = savedMotions.filter(id => id !== motionId)
    bookmarkedMotions.value.delete(motionId)
    console.log('Removed bookmark for motion:', motionId)
    
    // Decrement save_count on motions table
    const {data: motionData, error: motionError} = await supabase
      .from("motions")
      .select("save_count")
      .eq("id", motionId)
      .single()
    
    if (!motionError && motionData) {
      const newSaveCount = Math.max((motionData.save_count || 0) - 1, 0)
      
      await supabase
        .from("motions")
        .update({save_count: newSaveCount})
        .eq("id", motionId)
    }
  } else {
    // Add motionId to saved motions
    savedMotions.push(motionId)
    bookmarkedMotions.value.add(motionId)
    console.log('Bookmarked motion:', motionId)
    
    // Increment save_count on motions table
    const {data: motionData, error: motionError} = await supabase
      .from("motions")
      .select("save_count")
      .eq("id", motionId)
      .single()
    
    if (!motionError && motionData) {
      const newSaveCount = (motionData.save_count || 0) + 1
      
      await supabase
        .from("motions")
        .update({save_count: newSaveCount})
        .eq("id", motionId)
    }
  }
  
  // Update user's saved_motions JSONB field
  const {data: updateData, error: updateError} = await supabase
    .from("users")
    .update({saved_motions: JSON.stringify(savedMotions)})
    .eq("id", userId)
    .select()
  
  console.log("updateData", updateData)
  if (updateError) {
    console.error('Error updating saved motions:', updateError)
    // Revert local state on error
    if (isCurrentlyBookmarked) {
      bookmarkedMotions.value.add(motionId)
    } else {
      bookmarkedMotions.value.delete(motionId)
    }
  } else {
    console.log('Successfully updated saved motions:', savedMotions)
  }
}

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
  const {data: userBookmarks, error: userBookmarksError} = await supabase.from("users").select("saved_motions").eq("id", userId).single()
  records.value = data
  bookmarkedMotions.value = new Set(userBookmarks.saved_motions)
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>