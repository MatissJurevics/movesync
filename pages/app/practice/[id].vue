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
              ref="webcamVideo"
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
              <span v-if="completedPoses.size > 0" class="ml-2 px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                {{ completedPoses.size }} completed
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
                  isPoseCompleted(index) ? 'border-green-500 bg-green-50' : ''
                ]"
                style="width: 180px;"
              >
                <!-- Completion Badge -->
                <div 
                  v-if="isPoseCompleted(index)"
                  class="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg z-10"
                >
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
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
import * as poseDetection from "@tensorflow-models/pose-detection";

definePageMeta({
  layout: "appmain",
});

const motionId = useRoute().params.id;
const supabase = useSupabase();

const proximityResult = ref(null);
const motionData = ref(null);
const keyPoses = ref([]);
const poseCanvases = ref([]);
const webcamVideo = ref(null);
const poseCanvas = ref(null);
const cameraActive = ref(false);
const selectedPoseIndex = ref(null);
const selectedPose = ref(null);
const stream = ref(null);
const isPlaying = ref(false);
const poseSimilarity = ref(null);
const videoBorderColor = ref('border-gray-200');
const canvasWidth = 150;
const canvasHeight = 100;

// Pose adjustment controls
const poseScaleX = ref(1.0);
const poseScaleY = ref(1.0);
const poseOffsetX = ref(0);
const poseOffsetY = ref(0);
const showAdjustmentModal = ref(false);

// Completion tracking
const completedPoses = ref(new Set());
const completionThreshold = 0.8; // 80%

let frameCounter = 0;
const PROXIMITY_CHECK_INTERVAL = 6;

let detector = null;
let animationFrame = null;

const formatTime = (timestamp) => {
  const seconds = Math.floor(timestamp / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const calculatePoseSimilarity = (currentPose, referencePose) => {
  if (!currentPose?.keypoints || !referencePose?.keypoints) {
    return 0;
  }

  const confidenceThreshold = 0.3;
  const keypointDistances = [];

  // Get actual video dimensions
  const videoWidth = webcamVideo.value?.videoWidth || 640;
  const videoHeight = webcamVideo.value?.videoHeight || 480;

  // Important keypoints for overall pose comparison
  const importantKeypoints = [
    5, 6,   // shoulders
    7, 8,   // elbows  
    9, 10,  // wrists
    11, 12, // hips
    13, 14, // knees
    15, 16  // ankles
  ];

  for (const keypointIndex of importantKeypoints) {
    const currentKeypoint = currentPose.keypoints[keypointIndex];
    const referenceKeypoint = referencePose.keypoints[keypointIndex];

    if (currentKeypoint?.score > confidenceThreshold && 
        referenceKeypoint?.score > confidenceThreshold) {
      
      // Normalize coordinates to 0-1 range first
      const currentX = currentKeypoint.x / videoWidth;
      const currentY = currentKeypoint.y / videoHeight;
      const refX = referenceKeypoint.x / videoWidth;
      const refY = referenceKeypoint.y / videoHeight;
      
      // Apply transformations in normalized space
      const transformedRefX = (refX * poseScaleX.value) + (poseOffsetX.value / videoWidth);
      const transformedRefY = (refY * poseScaleY.value) + (poseOffsetY.value / videoHeight);

      // Calculate Euclidean distance in normalized space
      const distance = Math.sqrt(
        Math.pow(currentX - transformedRefX, 2) + Math.pow(currentY - transformedRefY, 2)
      );

      keypointDistances.push(distance);
    }
  }

  if (keypointDistances.length === 0) return 0;

  // Sort distances and take the top 50% (closest keypoints)
  keypointDistances.sort((a, b) => a - b);
  const top50PercentCount = Math.max(1, Math.ceil(keypointDistances.length * 0.5));
  const bestDistances = keypointDistances.slice(0, top50PercentCount);

  // Calculate average distance of the best matching keypoints
  const averageDistance = bestDistances.reduce((sum, dist) => sum + dist, 0) / bestDistances.length;
  
  // Convert average distance to similarity score (0-1)
  // Use dynamic max distance based on actual data
  const maxDistance = Math.sqrt(2); // Maximum possible distance in normalized space
  const similarity = Math.max(0, 1 - (averageDistance / (maxDistance * 0.3))); // Scale for better sensitivity
  
  return similarity;
};

const updateBorderColor = (similarity) => {
  if (similarity === null) {
    videoBorderColor.value = 'border-gray-200';
  } else if (similarity > 0.7) {
    videoBorderColor.value = 'border-green-500';
  } else if (similarity > 0.4) {
    videoBorderColor.value = 'border-yellow-500';
  } else {
    videoBorderColor.value = 'border-red-500';
  }
};

const markPoseAsCompleted = (poseIndex) => {
  if (!completedPoses.value.has(poseIndex)) {
    completedPoses.value.add(poseIndex);
    // Trigger reactivity
    completedPoses.value = new Set(completedPoses.value);
    
    // Optional: Show completion feedback
    console.log(`Pose ${poseIndex + 1} completed!`);
  }
};

const isPoseCompleted = (poseIndex) => {
  return completedPoses.value.has(poseIndex);
};

const resetPoseAdjustments = () => {
  poseScaleX.value = 1.0;
  poseScaleY.value = 1.0;
  poseOffsetX.value = 0;
  poseOffsetY.value = 0;
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

    // Draw poses on canvases after data is loaded
    await nextTick();
    drawPosesOnCanvases();
  } catch (err) {
    console.error('Error loading motion data:', err);
  }
};

const initializePoseDetector = async () => {
  try {
    const model = poseDetection.SupportedModels.MoveNet;
    detector = await poseDetection.createDetector(model, {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER
    });
  } catch (err) {
    console.error('Error initializing pose detector:', err);
  }
};

const startCamera = async () => {
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({ 
      video: { width: 640, height: 480 },
      audio: false 
    });
    
    if (webcamVideo.value) {
      webcamVideo.value.srcObject = stream.value;
      cameraActive.value = true;
      
      // Start pose detection loop
      detectPoses();
    }
  } catch (err) {
    console.error('Error accessing camera:', err);
  }
};

const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
    stream.value = null;
  }
  
  if (webcamVideo.value) {
    webcamVideo.value.srcObject = null;
  }
  
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
  
  cameraActive.value = false;
  clearPoseOverlay();
};

const detectPoses = async () => {
  if (!detector || !webcamVideo.value || !cameraActive.value) return;

  try {
    const poses = await detector.estimatePoses(webcamVideo.value);
    
    if (poses.length > 0) {
      const currentPose = poses[0];
      drawCurrentPose(currentPose);
      
      // If a pose is selected, compare similarity and update border
      if (selectedPose.value && selectedPoseIndex.value !== null) {
        const similarity = calculatePoseSimilarity(currentPose, selectedPose.value);
        poseSimilarity.value = similarity;
        updateBorderColor(similarity);
        drawPoseOverlay(selectedPose.value);
        
        // Check for completion
        if (similarity > completionThreshold) {
          markPoseAsCompleted(selectedPoseIndex.value);
        }
      }
    }
    
    animationFrame = requestAnimationFrame(detectPoses);
  } catch (err) {
    console.error('Error detecting poses:', err);
    animationFrame = requestAnimationFrame(detectPoses);
  }
};

const drawCurrentPose = (pose) => {
  if (!poseCanvas.value) return;
  
  const canvas = poseCanvas.value;
  const context = canvas.getContext('2d');
  
  // Set canvas size to match video
  canvas.width = webcamVideo.value.videoWidth || 640;
  canvas.height = webcamVideo.value.videoHeight || 480;
  
  // Clear canvas
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw current pose in green
  drawPoseKeypoints(context, pose, '#00FF00', 4);
  drawPoseSkeleton(context, pose, '#00FF00', 3);
};

const drawPoseOverlay = (referencePose) => {
  if (!poseCanvas.value || !referencePose.keypoints) return;
  
  const canvas = poseCanvas.value;
  const context = canvas.getContext('2d');
  
  // Create transformed pose with separate X/Y scale and offset
  const transformedPose = {
    keypoints: referencePose.keypoints.map(keypoint => ({
      ...keypoint,
      x: (keypoint.x * poseScaleX.value) + poseOffsetX.value,
      y: (keypoint.y * poseScaleY.value) + poseOffsetY.value
    }))
  };
  
  // Draw reference pose in semi-transparent blue
  drawPoseKeypoints(context, transformedPose, 'rgba(0, 100, 255, 0.7)', 6);
  drawPoseSkeleton(context, transformedPose, 'rgba(0, 100, 255, 0.7)', 4);
};

const clearPoseOverlay = () => {
  if (!poseCanvas.value) return;
  
  const canvas = poseCanvas.value;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
};

const selectPose = (keyPose, index) => {
  selectedPoseIndex.value = index;
  selectedPose.value = keyPose;
  poseSimilarity.value = null;
  updateBorderColor(null);
  resetPoseAdjustments();
};

const drawPosesOnCanvases = () => {
  keyPoses.value.forEach((pose, index) => {
    nextTick(() => {
      const canvas = poseCanvases.value[index];
      if (canvas && pose.keypoints) {
        drawPoseOnCanvas(canvas, pose);
      }
    });
  });
};

const drawPoseOnCanvas = (canvas, pose) => {
  if (!canvas || !pose || !pose.keypoints) return;

  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  // Scale pose to fit canvas
  const scaleX = canvas.width / 640;
  const scaleY = canvas.height / 480;
  
  // Draw keypoints
  drawPoseKeypoints(context, pose, '#ff0000', 2, scaleX, scaleY);
  drawPoseSkeleton(context, pose, '#0000ff', 1.5, scaleX, scaleY);
};

const drawPoseKeypoints = (context, pose, color, radius, scaleX = 1, scaleY = 1) => {
  context.fillStyle = color;
  
  pose.keypoints.forEach(keypoint => {
    if (keypoint.score > 0.3) {
      context.beginPath();
      context.arc(
        keypoint.x * scaleX, 
        keypoint.y * scaleY, 
        radius, 
        0, 
        2 * Math.PI
      );
      context.fill();
    }
  });
};

const drawPoseSkeleton = (context, pose, color, lineWidth, scaleX = 1, scaleY = 1) => {
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  
  const connections = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet);
  connections.forEach(([startIdx, endIdx]) => {
    const startPoint = pose.keypoints[startIdx];
    const endPoint = pose.keypoints[endIdx];
    
    if (startPoint.score > 0.3 && endPoint.score > 0.3) {
      context.beginPath();
      context.moveTo(startPoint.x * scaleX, startPoint.y * scaleY);
      context.lineTo(endPoint.x * scaleX, endPoint.y * scaleY);
      context.stroke();
    }
  });
};

onMounted(async () => {
  await loadMotionData();
  await initializePoseDetector();
  await startCamera();
});

onUnmounted(() => {
  stopCamera();
});
</script> 