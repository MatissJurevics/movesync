<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header with Back Button -->
      <div class="mb-8">
        <button 
          @click="$router.back()" 
          class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-6"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          <span class="font-medium">Back to Motions</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="!motionData" class="flex items-center justify-center py-32">
        <div class="text-center">
          <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600 font-medium">Loading motion...</p>
        </div>
      </div>
      
      <div v-else class="space-y-8">
        <!-- Motion Header Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="text-center">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">
              {{ motionData.title || 'Motion Preview' }}
            </h1>
            <p v-if="motionData.description" class="text-gray-600 max-w-2xl mx-auto">
              {{ motionData.description }}
            </p>
            <div class="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Created {{ formatDate(motionData.created_at) }}
            </div>
          </div>
        </div>

        <!-- Video Section Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-8 py-6 border-b border-gray-100">
            <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              Video Recording
            </h2>
          </div>
          <div class="relative bg-gray-900">
            <video 
              v-if="videoUrl" 
              :src="videoUrl" 
              controls 
              class="w-full h-auto"
              @loadedmetadata="onVideoLoaded"
            >
              Your browser does not support the video tag.
            </video>
            <div v-else class="flex flex-col items-center justify-center h-64 text-gray-400">
              <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              <p class="text-lg font-medium">No video available</p>
              <p class="text-sm">Video recording was not found for this motion</p>
            </div>
          </div>
        </div>

        <!-- Key Poses Section Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="px-8 py-6 border-b border-gray-100">
            <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Key Poses
              <span class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {{ keyPoses?.length || 0 }}
              </span>
            </h2>
          </div>
          
          <div v-if="keyPoses && keyPoses.length > 0" class="p-8">
            <div class="flex overflow-x-auto gap-4 pb-4">
              <div 
                v-for="(keyPose, index) in keyPoses" 
                :key="index"
                class="flex-none bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 w-64"
              >
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-sm font-semibold text-gray-900">Pose {{ index + 1 }}</h3>
                  <span class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {{ formatTime(keyPose.timestamp) }}
                  </span>
                </div>
                <div class="relative">
                  <canvas 
                    :ref="el => poseCanvases[index] = el"
                    class="w-full border border-gray-300 rounded-md bg-white shadow-sm"
                    :width="canvasWidth"
                    :height="canvasHeight"
                  ></canvas>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="p-16 text-center">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Key Poses</h3>
            <p class="text-gray-500">Key poses were not detected or saved for this motion.</p>
          </div>
        </div>

        <!-- Delete Motion Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div class="text-center">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Delete Motion</h3>
            <p class="text-gray-600 mb-6 max-w-md mx-auto">
              This action cannot be undone. This will permanently delete the motion and its video recording.
            </p>
            <button 
              @click="deleteMotion"
              class="bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto shadow-sm hover:shadow-md"
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
  </div>
</template>

<script setup>
import * as poseDetection from "@tensorflow-models/pose-detection";

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

const formatTime = (timestamp) => {
  const seconds = Math.floor(timestamp / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
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

const drawPoseOnCanvas = (canvas, pose) => {
  if (!canvas || !pose || !pose.keypoints) return;

  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Calculate scaling factors to fit pose in canvas
  const scaleX = canvas.width / 640; // Assuming original video width of 640
  const scaleY = canvas.height / 480; // Assuming original video height of 480

  // Draw connections (skeleton)
  const connections = poseDetection.util.getAdjacentPairs(
    poseDetection.SupportedModels.BlazePose
  );

  if (pose.keypoints) {
    // Draw skeleton connections
    connections.forEach(([i, j]) => {
      const keypoint1 = pose.keypoints[i];
      const keypoint2 = pose.keypoints[j];

      if (keypoint1 && keypoint2 && keypoint1.score > 0.5 && keypoint2.score > 0.5) {
        context.beginPath();
        context.moveTo(keypoint1.x * scaleX, keypoint1.y * scaleY);
        context.lineTo(keypoint2.x * scaleX, keypoint2.y * scaleY);
        context.lineWidth = 2;
        context.strokeStyle = '#3b82f6';
        context.stroke();
      }
    });

    // Draw keypoints
    pose.keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.5) {
        context.beginPath();
        context.arc(keypoint.x * scaleX, keypoint.y * scaleY, 4, 0, 2 * Math.PI);
        context.fillStyle = '#ef4444';
        context.fill();
      }
    });
  }
};

const renderKeyPoses = () => {
  nextTick(() => {
    keyPoses.value.forEach((keyPose, index) => {
      const canvas = poseCanvases.value[index];
      if (canvas) {
        drawPoseOnCanvas(canvas, keyPose);
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