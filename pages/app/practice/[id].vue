<template>
  <div class="min-h-screen bg-gray-50 mb-16">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
      <button 
        @click="$router.back()"
        class="p-2 -ml-2 text-gray-600 hover:text-gray-900"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      <h1 class="flex-1 text-center text-lg font-semibold text-gray-900 pr-10">Practice Motion</h1>
    </div>

    <!-- Loading State -->
    <div v-if="!motionData" class="flex items-center justify-center py-32">
      <div class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600 font-medium">Loading motion...</p>
      </div>
    </div>

    <div v-else class="flex flex-col h-screen">
      <!-- Webcam Section -->
      <div class="flex-1 p-4">
        <div 
          :class="[
            'bg-white rounded-xl shadow-sm border-4 h-full flex flex-col transition-colors duration-300',
            videoBorderColor
          ]"
        >
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-xl font-bold text-gray-900 flex items-center gap-3">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z"></path>
              </svg>
              {{ motionData.title || 'Practice Session' }}
              <span v-if="selectedPose && poseSimilarity !== null" class="ml-auto text-sm font-medium">
                <span :class="poseSimilarity > 0.7 ? 'text-green-600' : poseSimilarity > 0.4 ? 'text-yellow-600' : 'text-red-600'">
                  {{ Math.round(poseSimilarity * 100) }}% Match
                </span>
              </span>
              
              <!-- Settings Button -->
              <button 
                v-if="selectedPose"
                @click="showAdjustmentModal = true"
                class="ml-3 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </button>
            </h2>
          </div>
          
          <div class="flex-1 relative bg-gray-900 rounded-b-xl overflow-hidden">
            <video 
              ref="videoElement"
              :srcObject="cameraStream"
              class="w-full h-full object-cover"
              autoplay
              muted
              playsinline
            ></video>
            
            <!-- Pose Overlay Canvas -->
            <canvas 
              ref="poseCanvas"
              class="absolute inset-0 w-full h-full pointer-events-none"
            ></canvas>
            
            <!-- No Camera Message -->
            <div v-if="!cameraActive" class="absolute inset-0 flex items-center justify-center text-white">
              <div class="text-center">
                <svg class="w-16 h-16 mx-auto mb-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z"></path>
                </svg>
                <p class="text-lg font-medium">Starting Camera...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div v-if="keyPoses && keyPoses.length > 0" class="px-4 pb-2">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Progress</span>
            <span class="text-sm font-medium text-gray-900">
              {{ completedPoses.filter(Boolean).length }} / {{ keyPoses.length }}
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-green-500 h-2 rounded-full transition-all duration-500"
              :style="{ width: `${(completedPoses.filter(Boolean).length / keyPoses.length) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Poses Section -->
      <div class="p-4 pt-0">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-xl font-bold text-gray-900 flex items-center gap-3">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Key Poses
              <span class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {{ keyPoses?.length || 0 }}
              </span>
            </h2>
          </div>
          
          <div v-if="keyPoses && keyPoses.length > 0" class="p-4">
            <div class="flex gap-3 overflow-x-auto pb-2">
              <div 
                v-for="(keyPose, index) in keyPoses" 
                :key="index"
                @click="selectPose(keyPose, index)"
                :class="[
                  'bg-gray-50 border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md flex-shrink-0 relative',
                  selectedPoseIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200',
                  completedPoses[index] ? 'ring-2 ring-green-500' : ''
                ]"
                style="width: 180px;"
              >
                <!-- Completed Badge -->
                <div v-if="completedPoses[index]" class="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-xs font-semibold text-gray-900">Pose {{ index + 1 }}</h3>
                  <div class="flex items-center gap-1">
                    <span class="text-xs font-medium text-blue-600 bg-white px-1.5 py-0.5 rounded">
                      {{ formatTime(keyPose.timestamp) }}
                    </span>
                    <div v-if="selectedPoseIndex === index" class="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  </div>
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
          
          <div v-else class="flex items-center justify-center p-8">
            <div class="text-center">
              <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No Key Poses</h3>
              <p class="text-gray-500 text-sm">No poses available for this motion.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Congratulations Modal -->
    <div 
      v-if="showCongratulationsModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl p-8 m-4 max-w-md w-full text-center">
        <!-- Success Animation -->
        <div class="mb-6">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h2>
          <p class="text-gray-600">You've successfully completed all poses in this motion practice!</p>
        </div>

        <!-- Stats -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="grid grid-cols-2 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-blue-600">{{ keyPoses.length }}</div>
              <div class="text-sm text-gray-600">Poses Completed</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-green-600">100%</div>
              <div class="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button 
            @click="resetProgress"
            class="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Practice Again
          </button>
          <button 
            @click="$router.back()"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Finish
          </button>
        </div>
      </div>
    </div>

    <!-- Pose Adjustment Modal -->
    <div 
      v-if="showAdjustmentModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showAdjustmentModal = false"
    >
      <div 
        class="bg-white rounded-xl p-6 m-4 max-w-sm w-full"
        @click.stop
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Adjust Reference Pose</h3>
          <button 
            @click="showAdjustmentModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Horizontal Scale Control -->
        <div class="mb-4">
          <label class="text-sm font-medium text-gray-700 block mb-2">
            Horizontal Scale: {{ poseScaleX.toFixed(1) }}x
          </label>
          <input 
            v-model.number="poseScaleX"
            type="range" 
            min="0.3" 
            max="2.0" 
            step="0.1"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <!-- Vertical Scale Control -->
        <div class="mb-4">
          <label class="text-sm font-medium text-gray-700 block mb-2">
            Vertical Scale: {{ poseScaleY.toFixed(1) }}x
          </label>
          <input 
            v-model.number="poseScaleY"
            type="range" 
            min="0.3" 
            max="2.0" 
            step="0.1"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <!-- X Offset Control -->
        <div class="mb-4">
          <label class="text-sm font-medium text-gray-700 block mb-2">
            Horizontal Position: {{ poseOffsetX }}px
          </label>
          <input 
            v-model.number="poseOffsetX"
            type="range" 
            min="-200" 
            max="200" 
            step="10"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <!-- Y Offset Control -->
        <div class="mb-6">
          <label class="text-sm font-medium text-gray-700 block mb-2">
            Vertical Position: {{ poseOffsetY }}px
          </label>
          <input 
            v-model.number="poseOffsetY"
            type="range" 
            min="-200" 
            max="200" 
            step="10"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button 
            @click="resetPoseAdjustments"
            class="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Reset
          </button>
          <button 
            @click="showAdjustmentModal = false"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
definePageMeta({
  layout: "appmain",
});

const supabase = useSupabase()
const poseUtils = useStandardPose()

// Camera and video refs
const cameraStream = poseUtils.cameraStream
const videoElement = ref(null)
const cameraActive = ref(false)
const poseCanvas = ref(null)

// Pose data
const currentPose = ref(null)
const poseSimilarity = ref(null)
const selectedPose = ref(null)
const selectedPoseIndex = ref(0)

// Canvas management
const poseCanvases = ref([])
const canvasWidth = 160
const canvasHeight = 120

// Motion data
const motionId = useRoute().params.id
const motionData = ref(null)
const keyPoses = ref([])

// Progress tracking
const completedPoses = ref([])
const showCongratulationsModal = ref(false)

// UI state
const showAdjustmentModal = ref(false)

// Pose adjustment controls
const poseScaleX = ref(1.0)
const poseScaleY = ref(1.0)
const poseOffsetX = ref(0)
const poseOffsetY = ref(0)

// Animation frame for pose detection loop
const animationFrameId = ref(null)

// Computed properties
const videoBorderColor = computed(() => {
  if (poseSimilarity.value === null) return 'border-gray-300'
  if (poseSimilarity.value > 0.8) return 'border-green-500'
  if (poseSimilarity.value > 0.6) return 'border-yellow-500'
  return 'border-red-500'
})

const formatTime = (timestamp) => {
  timestamp = timestamp / 1000
  const minutes = Math.floor(timestamp / 60)
  const seconds = Math.floor(timestamp % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const loadData = async () => {
  const { data, err } = await supabase.from("motions").select("*").eq("id", motionId).single()
  if (err) {
    console.error(err)
    return;
  }
  motionData.value = data
  keyPoses.value = data.key_poses
  
  // Initialize completed poses array
  completedPoses.value = new Array(keyPoses.value.length).fill(false)
  
  // Select first pose by default
  if (keyPoses.value.length > 0) {
    selectPose(keyPoses.value[0], 0)
  }
  
  console.log("Key Points", keyPoses.value)
}

const setupVideo = async () => {
  let detectorStarted = await poseUtils.initializePoseDetector();
  await poseUtils.startCamera(videoElement.value)
  console.log("Stream", cameraStream.value)
  cameraActive.value = true
  if (detectorStarted) {
    console.log("Detector Started")
    videoElement.value.addEventListener("loadeddata", startPoseDetectionLoop)
  } else {
    console.log("Detector Not Started")
  }
}

const startPoseDetectionLoop = async () => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
  
  const detectPose = async () => {
    let pose = await poseUtils.getStandardPose(videoElement.value)
    if (pose) {
      currentPose.value = pose
      
      // Draw user pose in green
      poseUtils.drawOnCanvas(poseCanvas.value, pose, {
        color: '#10B981',
        lineWidth: 2,
        pointRadius: 3,
        clear: true
      })
      
      // Draw reference pose overlay if selected
      if (selectedPose.value) {
        const adjustedReferencePose = adjustPoseForDisplay(selectedPose.value)
        poseUtils.drawOnCanvas(poseCanvas.value, adjustedReferencePose, {
          color: '#EF4444',
          lineWidth: 2,
          pointRadius: 3,
          alpha: 0.7,
          clear: false
        })
        
        // Calculate similarity
        const similarity = calculatePoseSimilarity(pose, selectedPose.value)
        poseSimilarity.value = similarity
        
        // Check if pose is completed (above threshold)
        if (similarity > 0.8 && selectedPoseIndex.value !== null && !completedPoses.value[selectedPoseIndex.value]) {
          markPoseCompleted(selectedPoseIndex.value)
        }
      }
    }
    
    animationFrameId.value = requestAnimationFrame(detectPose)
  }
  
  detectPose()
}

const adjustPoseForDisplay = (pose) => {
  // Create a copy of the pose with adjustments applied
  const adjustedPose = {
    ...pose,
    keypoints: pose.keypoints.map(keypoint => ({
      ...keypoint,
      x: (keypoint.x * poseScaleX.value) + (poseOffsetX.value / (poseCanvas.value?.width || 640)),
      y: (keypoint.y * poseScaleY.value) + (poseOffsetY.value / (poseCanvas.value?.height || 480))
    }))
  }
  return adjustedPose
}

const calculatePoseSimilarity = (userPose, referencePose, toleranceThreshold = 0.15) => {
  if (!userPose || !referencePose || !userPose.keypoints || !referencePose.keypoints) {
    return 0;
  }

  let totalError = 0;
  let validKeypoints = 0;

  // Compare each keypoint between user pose and reference pose
  userPose.keypoints.forEach((userKeypoint, index) => {
    const referenceKeypoint = referencePose.keypoints[index];
    
    // Only compare keypoints that are visible and have confidence
    if (userKeypoint.score > 0.3 && referenceKeypoint.score > 0.3) {
      const xError = Math.abs(userKeypoint.x - referenceKeypoint.x);
      const yError = Math.abs(userKeypoint.y - referenceKeypoint.y);
      const euclideanError = Math.sqrt(xError * xError + yError * yError);
      
      totalError += euclideanError;
      validKeypoints++;
    }
  });

  if (validKeypoints === 0) {
    return 0;
  }

  const averageError = totalError / validKeypoints;
  const similarity = Math.max(0, Math.min(1, 1 - (averageError / toleranceThreshold)));
  
  return similarity;
};

const markPoseCompleted = (poseIndex) => {
  completedPoses.value[poseIndex] = true
  
  // Check if all poses are completed
  if (completedPoses.value.every(completed => completed)) {
    showCongratulationsModal.value = true
  }
}

const renderKeyPoses = () => {
  nextTick(() => {
    keyPoses.value.forEach((keyPose, index) => {
      const canvas = poseCanvases.value[index];
      if (canvas) {
        // Setup canvas dimensions
        poseUtils.setupCanvas(canvas, {
          width: canvasWidth,
          height: canvasHeight
        })
        
        // Draw the key pose
        poseUtils.drawOnCanvas(canvas, keyPose, {
          color: '#3B82F6',
          lineWidth: 1,
          pointRadius: 2
        })
      }
    });
  })
};

const selectPose = (keyPose, index) => {
  console.log("selecting pose", keyPose, index)
  selectedPose.value = keyPose
  selectedPoseIndex.value = index
}

const resetProgress = () => {
  completedPoses.value = new Array(keyPoses.value.length).fill(false)
  showCongratulationsModal.value = false
  poseSimilarity.value = null
}

const resetPoseAdjustments = () => {
  poseScaleX.value = 1.0
  poseScaleY.value = 1.0
  poseOffsetX.value = 0
  poseOffsetY.value = 0
}

// Setup canvas when pose canvas ref changes
watch(poseCanvas, (newCanvas) => {
  if (newCanvas) {
    // Setup main pose canvas
    const resizeCanvas = () => {
      const rect = newCanvas.getBoundingClientRect()
      newCanvas.width = rect.width
      newCanvas.height = rect.height
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    onUnmounted(() => {
      window.removeEventListener('resize', resizeCanvas)
    })
  }
})

onMounted(async () => {
  await loadData()
  await setupVideo()
  renderKeyPoses()
})

onUnmounted(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
  poseUtils.cleanup()
})
</script> 