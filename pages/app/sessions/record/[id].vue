<template>
    <div class="bg-slate-900 h-full">
        <div class="relative bg-gray-100 border-none overflow-hidden h-fit w-full">
                <div v-if="!drawingStarted" class="w-[100vw] h-[50vh] flex items-center justify-center bg-base-300">
                    <div class="loading loading-spinner loading-lg"></div>
                </div>
                <video 
                    v-show="drawingStarted"
                    ref="webcamVideo" 
                    class="w-[100vw] h-[fit] object-cover" 
                    autoplay 
                    playsinline
                ></video>
                <canvas id="pose" class="absolute w-full top-0 left-0 h-full bg-white/05 z-10">

                </canvas>
        </div>
        <div v-if="videoSession" class="flex flex-row items-center px-4 justify-between absolute top-0 left-0 w-full min-h-[5em] bg-black/30 z-20">
            <button @click="$router.back()" class="btn btn-circle btn-sm bg-white/20 hover:bg-white/30 border-none text-white">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
            </button>
            <div class="flex flex-col items-left">
                <h1 class="text-2xl font-bold text-white">{{ videoSession.title }}</h1>
                <p class="text-sm text-white/80">{{ videoSession.description }}</p>
            </div>
            <div class="w-8"></div>
        </div>
        <div v-else class="flex flex-row items-center px-4 justify-between absolute top-0 left-0 w-full min-h-[5em] bg-black/30 z-10 animate-pulse">
            <button @click="$router.back()" class="btn btn-circle btn-sm bg-white/20 hover:bg-white/30 border-none text-white">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
            </button>
            <div class="flex flex-col items-left">
                <div class="h-6 w-1/3 bg-white/30 rounded mb-2"></div>
                <div class="h-4 w-2/3 bg-white/20 rounded"></div>
            </div>
            <div class="w-8"></div>
        </div>
        <button
            @click="() => toggleRecording()"
            class="btn btn-circle btn-lg mx-auto absolute bottom-24 z-10 right-1/2  transform translate-x-1/2 flex items-center justify-center bg-red-600 hover:bg-red-700 border-none shadow-lg"
            aria-label="Toggle Recording"
        >
            <span
                :class="[
                    'block rounded-full transition-all duration-200',
                    recording ? 'bg-gray-200 w-8 h-8' : 'bg-red-500 w-8 h-8'
                ]"
            ></span>
        </button>
    <div
        v-if="recording"
        class="absolute top-24 left-1/2 transform -translate-x-1/2 z-20 flex items-center bg-black/70 px-4 py-2 rounded-full shadow-lg"
    >
        <svg class="w-4 h-4 mr-2 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" />
        </svg>
        <span class="text-white font-mono text-lg">{{ formattedRecordingTime }}</span>
    </div>
    </div>
</template>
<script setup>
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { usePoseUtils } from '~/composables/usePoseUtils';

definePageMeta({
    layout: "appmainnonav"
})

const webcamVideo = ref(null)
const recording = ref(false)
let detector = null
const recordingTime = ref(0)
const formattedRecordingTime = computed(() => {
    const minutes = Math.floor(recordingTime.value / 60)
    const seconds = recordingTime.value % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
})
const poseData = ref([])
let videoStartTime = null

const { standardizePose, isValidPose, drawPoseOnCanvas } = usePoseUtils();

// Setup webcam access
const setupWebcam = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (webcamVideo.value) {
                webcamVideo.value.srcObject = stream;
            }
            return true;
        } catch (error) {
            console.error("Error accessing webcam:", error);
            return false;
        }
    }
    return false;
};

// Setup canvas for pose drawing
const setupCanvas = () => {
    const canvas = document.querySelector("#pose");
    if (webcamVideo.value && canvas) {
        canvas.width = webcamVideo.value.videoWidth || 640;
        canvas.height = webcamVideo.value.videoHeight || 480;
        return canvas.getContext("2d");
    }
    return null;
};

// Load BlazePose model
const loadBlazePoseModel = async () => {
    console.log("Loading BlazePose Model")
    console.log("Video Width", webcamVideo.value.videoWidth, "VideoHeight: ", webcamVideo.value.videoHeight)
    webcamVideo.value.height = webcamVideo.value.videoHeight
    webcamVideo.value.width = webcamVideo.value.videoWidth

    // Create detector with BlazePose model
    const model = poseDetection.SupportedModels.BlazePose;
    const detectorConfig = {
        runtime: 'tfjs',
        modelType: 'full',
        enableSmoothing: true
    };
    
    const detector = await poseDetection.createDetector(model, detectorConfig);
    return detector;
};

// Start pose detection
const startPoseDetection = async () => {
    if (!detector || !webcamVideo.value) return;
    
    try {
        const poses = await detector.estimatePoses(webcamVideo.value, {
            flipHorizontal: false
        });
        if (videoStartTime) {
            const standardizedPose = standardizePose(poses[0], Date.now() - videoStartTime);
            if (standardizedPose) {
                poseData.value.push(standardizedPose);
            }
        }
        if (poses && poses.length > 0) {
            drawPose(poses[0], canvasContext, webcamVideo.value.videoWidth, webcamVideo.value.videoHeight);
        }
        
        // Continue detecting in the next frame
        requestAnimationFrame(startPoseDetection);
    } catch (error) {
        console.error("Error detecting pose:", error);
        requestAnimationFrame(startPoseDetection);
    }
};

let drawingStarted = ref(false)

// Draw the detected pose on canvas
const drawPose = (pose, ctx, videoWidth, videoHeight) => {
    if (!drawingStarted.value) {
        drawingStarted.value = true
        console.log("Drawing Started")
    }
    if (!pose || !ctx) return;
    
    // Clear previous drawings
    ctx.clearRect(0, 0, videoWidth, videoHeight);

    const connections = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.BlazePose);
    if (connections && pose.keypoints) {
        connections.forEach(([i, j]) => {
            const kp1 = pose.keypoints[i];
            const kp2 = pose.keypoints[j];
            
            // Only draw if both keypoints are detected with good confidence
            if (kp1.score > 0.5 && kp2.score > 0.5) {
                ctx.beginPath();
                ctx.moveTo(kp1.x, kp1.y);
                ctx.lineTo(kp2.x, kp2.y);
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#0000ffa0';
                ctx.stroke();
            }
        });
    }
    
    // Draw keypoints
    if (pose.keypoints) {
        pose.keypoints.forEach(keypoint => {
            if (keypoint.score > 0.5) {
                ctx.beginPath();
                ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = '#ff0000';
                ctx.fill();
            }
        });
    }
};

let canvasContext = null;

const getSession = async () => {
    const { data, error } = await supabase.from("motions").select("*").eq("id", route.params.id).single();
    if (error) {
        throw error
    }
    videoSession.value = data
    return data
}
let isMounted = false

// Add this function to handle video initialization
const initializeVideo = async () => {
    console.log("Video Loaded")
    canvasContext = setupCanvas();
    
    // Ensure TensorFlow backend is ready
    await tf.ready();
    
    // Load BlazePose model
    detector = await loadBlazePoseModel();
    
    // Start pose detection
    if (detector) {
        startPoseDetection();
    }
};

onMounted(async () => {
    if (isMounted) return
    isMounted = true
    const webcamReady = await setupWebcam();
    await getSession()
    
    if (webcamReady) {
        // Check if video is already loaded
        if (webcamVideo.value.readyState >= 2) {
            await initializeVideo();
        } else {
            // Set up event handler for when video loads
            webcamVideo.value.onloadedmetadata = initializeVideo;
        }
    }
});

const mediaRecorder = ref(null)
const recordedChunks = ref([])
const supabase = useSupabase()
const route = useRoute()
const videoSession = ref(null)

const toggleRecording = async () => {
    console.log("Toggling Recording")
  if (!recording.value) {
    // Start recording
    recording.value = true
    recordedChunks.value = []
    recordingTime.value = 0
    videoStartTime = Date.now()
    const interval = setInterval(() => {
        recordingTime.value++
    }, 1000)

    if (webcamVideo.value && webcamVideo.value.srcObject) {
      mediaRecorder.value = new MediaRecorder(webcamVideo.value.srcObject)
      
      mediaRecorder.value.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.value.push(event.data)
        }
      }
      
      mediaRecorder.value.onstop = async () => {
        const blob = new Blob(recordedChunks.value, { type: 'video/webm' })
        await saveRecording(blob)
      }
      
      mediaRecorder.value.start()
    }
  } else {
    // Stop recording
    recording.value = false
    console.log(poseData.value)
    if (mediaRecorder.value) {
      mediaRecorder.value.stop()
    }
  }
}

const saveRecording = async (blob) => {
  try {
    const session = await getUserSession()

    const userId = session.user.id
    const sessionId = videoSession.value.id
    const fileName = `${sessionId}_${Date.now()}.webm`
    const filePath = `${userId}/${fileName}`
    console.log(videoSession.value)

    // Cache the video blob in localStorage for later use
    console.log("Caching Video")
    const reader = new FileReader()
    reader.onload = function() {
      const base64Video = reader.result
      const cacheData = {
        video: base64Video,
        timestamp: Date.now(),
        ttl: 24 * 60 * 60 * 1000 // 1 day in milliseconds
      }
    }
    reader.readAsDataURL(blob)

    const { data: videoData, error: videoError } = await supabase.storage
      .from('videos')
      .upload(filePath, blob)
    
    let videoUrl = videoData.fullPath
    // Get video dimensions and append to pose data
    const video = webcamVideo.value
    if (video && poseData.value.length > 0) {
      const videoDimensions = {
        width: video.videoWidth,
        height: video.videoHeight
      }
      
      // Add dimensions to the first pose data entry or create a metadata entry
      if (poseData.value[0]) {
        poseData.value[0].videoDimensions = videoDimensions
      }
    }
    let jsonPoseData = JSON.stringify(poseData.value)
    console.log("Pose Data", jsonPoseData, videoUrl)

    const { data: poseInfo, error: poseError } = await supabase.from("motions").update({
      video: videoUrl,
      pose_data: jsonPoseData
    }).eq("id", sessionId)
    console.log("Pose Data", poseInfo, poseError)

    if (videoError || poseError) {
      console.error("Error uploading recording:", videoError || poseError)
      return
    }
    
    navigateTo(`/app/sessions/review/${sessionId}`)
  } catch (err) {
    console.error("Error saving recording:", err)
  }
}

const getUserSession = async () => {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error(error)
  }
  return data.session
}

onBeforeUnmount(() => {
    // Clean up video stream when component is destroyed
    if (webcamVideo.value && webcamVideo.value.srcObject) {
        const tracks = webcamVideo.value.srcObject.getTracks()
        tracks.forEach(track => track.stop())
    }
})
</script>