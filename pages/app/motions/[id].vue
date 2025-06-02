<template>
  <div class="container mx-auto p-4">
    <!-- Back Button -->
    <div class="mb-4">
      <div 
        @click="$router.back()" 
        class="inline-flex items-center justify-center w-10 h-10 text-gray-700  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
      </div>
    </div>
    <div v-if="!motionData" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else>
      <!-- Motion Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold mb-2">{{ motionData.title || 'Motion Preview' }}</h1>
        <p v-if="motionData.description" class="text-gray-600">{{ motionData.description }}</p>
      </div>

      <!-- Video Section -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Video Recording</h2>
        <div class="relative bg-gray-100 rounded-lg overflow-hidden">
          <video 
            v-if="videoUrl" 
            :src="videoUrl" 
            controls 
            class="w-full h-auto"
            @loadedmetadata="onVideoLoaded"
          >
            Your browser does not support the video tag.
          </video>
          <div v-else class="flex items-center justify-center h-64 text-gray-500">
            No video available
          </div>
        </div>
      </div>

      <!-- Practice Button -->
      <div class="mb-6">
        <button 
          @click="navigateTo(`/app/practice/${motionId}`)"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3 cursor-pointer"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Start Practice Session
        </button>
      </div>

      <!-- Key Poses Section -->
      <div v-if="keyPoses && keyPoses.length > 0">
        <h2 class="text-xl font-semibold mb-4">Key Poses ({{ keyPoses.length }})</h2>
        <div class="flex overflow-x-auto gap-4 pb-4">
          <div 
            v-for="(keyPose, index) in keyPoses" 
            :key="index"
            class="flex-none bg-white border border-gray-200 rounded-lg p-3 shadow-sm w-48"
          >
            <h3 class="text-sm font-medium mb-1">Key Pose {{ index + 1 }}</h3>
            <p class="text-xs text-gray-600 mb-2">
              Time: {{ formatTime(keyPose.timestamp) }}
            </p>
            <div class="relative">
              <canvas 
                :ref="el => poseCanvases[index] = el"
                class="w-full border border-gray-300 rounded bg-gray-50"
                :width="canvasWidth"
                :height="canvasHeight"
              ></canvas>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-8">
        <p class="text-gray-500">No key poses available for this motion.</p>
      </div>

    <!-- Delete Motion Section -->
    <div class="mt-8 mb-16 pt-6 border-t border-gray-200">
      <div class="flex justify-center">
        <button 
          @click="deleteMotion"
          class="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center gap-2 cursor-pointer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          Delete Motion
        </button>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import * as poseDetection from "@tensorflow-models/pose-detection";
import { usePoseUtils } from "~/composables/usePoseUtils";

definePageMeta({
  layout: "appmain",
});

const motionId = useRoute().params.id;
const supabase = useSupabase();

const motionData = ref(null);
const videoUrl = ref(null);
const keyPoses = ref([]);
const poseCanvases = ref([]);
const canvasWidth = 300;
const canvasHeight = 200;

const { isValidPose, drawPoseOnCanvas } = usePoseUtils();

const formatTime = (timestamp) => {
  const seconds = Math.floor(timestamp / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const loadMotionData = async () => {
  try {
    const { data: motion, error } = await supabase
      .from('motions')
      .select('*')
      .eq('id', motionId)
      .single();

    if (error) {
      console.error('Error loading motion:', error);
      return;
    }

    motionData.value = motion;
    keyPoses.value = motion.key_poses || [];

    // Load video URL if video path exists
    if (motion.video) {
      const { data: videoData } = await supabase.storage
        .from('videos')
        .getPublicUrl(motion.video);
      console.log("videoData", videoData)
      let url = videoData.publicUrl.replace("/videos/videos", "/videos")
      console.log("videoUrl", url)
      if (url) {
        videoUrl.value = url;
      }
    }
  } catch (err) {
    console.error('Error loading motion data:', err);
  }
};

const deleteMotion = async () => {
    console.log("deleting motion", motionId)
  const { data: motion, error } = await supabase
    .from('motions')
    .delete()
    .eq('id', motionId);

  console.log("motion", motion, error)
  if (error) {
    console.error('Error deleting motion:', error);
  } else {
    navigateTo('/app');
  }
}

const renderKeyPoses = () => {
  nextTick(() => {
    keyPoses.value.forEach((keyPose, index) => {
      const canvas = poseCanvases.value[index];
      if (canvas && isValidPose(keyPose)) {
        const scaleX = canvas.width / 640;
        const scaleY = canvas.height / 480;
        drawPoseOnCanvas(canvas, keyPose, { scaleX, scaleY });
      }
    });
  });
};

const onVideoLoaded = () => {
  // Video loaded, can perform additional actions if needed
  console.log('Video loaded successfully');
};

onMounted(async () => {
  await loadMotionData();
  renderKeyPoses();
});

watch(keyPoses, () => {
  renderKeyPoses();
}, { deep: true });
</script>