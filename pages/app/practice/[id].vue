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
import * as poseDetection from "@tensorflow-models/pose-detection";

definePageMeta({
  layout: "appmain",
});

const poseUtils = usePoseUtils()

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

// Pose completion tracking
const completedPoses = ref([]);
const showCongratulationsModal = ref(false);
const consecutiveHighSimilarity = ref(0);
const SIMILARITY_THRESHOLD = 0.9;
const CONSECUTIVE_FRAMES_REQUIRED = 10;

// Pose adjustment controls
const poseScaleX = ref(1.0);
const poseScaleY = ref(1.0);
const poseOffsetX = ref(0);
const poseOffsetY = ref(0);
const showAdjustmentModal = ref(false);

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

const resetPoseAdjustments = () => {
  poseScaleX.value = 1.0;
  poseScaleY.value = 1.0;
  poseOffsetX.value = 0;
  poseOffsetY.value = 0;
};

const resetProgress = () => {
  completedPoses.value = new Array(keyPoses.value.length).fill(false);
  selectedPoseIndex.value = null;
  selectedPose.value = null;
  poseSimilarity.value = null;
  consecutiveHighSimilarity.value = 0;
  showCongratulationsModal.value = false;
  updateBorderColor(null);
};

const checkPoseCompletion = (similarity) => {
  if (selectedPoseIndex.value === null) return;
  
  if (similarity > SIMILARITY_THRESHOLD) {
    consecutiveHighSimilarity.value++;
    
    if (consecutiveHighSimilarity.value >= CONSECUTIVE_FRAMES_REQUIRED) {
      // Mark current pose as completed
      completedPoses.value[selectedPoseIndex.value] = true;
      consecutiveHighSimilarity.value = 0;
      
      // Find next incomplete pose
      const nextIncompleteIndex = completedPoses.value.findIndex((completed, index) => 
        !completed && index > selectedPoseIndex.value
      );
      
      // If no next incomplete pose, check if all are completed
      if (nextIncompleteIndex === -1) {
        // Check if all poses are completed
        const allCompleted = completedPoses.value.every(completed => completed);
        if (allCompleted) {
          showCongratulationsModal.value = true;
          selectedPose.value = null;
          selectedPoseIndex.value = null;
          poseSimilarity.value = null;
          updateBorderColor(null);
          return;
        }
        
        // If not all completed, find first incomplete pose from beginning
        const firstIncompleteIndex = completedPoses.value.findIndex(completed => !completed);
        if (firstIncompleteIndex !== -1) {
          selectPose(keyPoses.value[firstIncompleteIndex], firstIncompleteIndex);
        }
      } else {
        // Move to next incomplete pose
        selectPose(keyPoses.value[nextIncompleteIndex], nextIncompleteIndex);
      }
    }
  } else {
    consecutiveHighSimilarity.value = 0;
  }
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
    
    // Initialize completion tracking
    completedPoses.value = new Array(keyPoses.value.length).fill(false);

    // Draw poses on canvases after data is loaded
    await nextTick();
    poseUtils.drawPosesOnCanvases();
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
      const standardizedPose = poseUtils.standardizePose(poses[0]);
      
      if (standardizedPose) {
        drawCurrentPose(standardizedPose);
        
        // If a pose is selected, compare similarity and update border
        if (selectedPose.value) {
          const similarity = poseUtils.calculatePoseSimilarity(standardizedPose, selectedPose.value);
          poseSimilarity.value = similarity;
          updateBorderColor(similarity);
          drawPoseOverlay(selectedPose.value);
          
          // Check for pose completion
          checkPoseCompletion(similarity);
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
  poseUtils.drawPoseOnCanvas(canvas, pose, { scaleX: canvas.width / 640, scaleY: canvas.height / 480 });
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
  poseUtils.drawPoseOnCanvas(canvas, transformedPose, { scaleX: canvas.width / 640, scaleY: canvas.height / 480 });
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
  consecutiveHighSimilarity.value = 0;
  updateBorderColor(null);
  resetPoseAdjustments();
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