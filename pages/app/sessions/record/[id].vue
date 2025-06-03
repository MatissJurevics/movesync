<template>
    <div class="bg-slate-900 h-full">
        <div class="relative bg-gray-100 border-none overflow-hidden h-fit w-full">
                <div v-if="!loadedVideo" class="w-[100vw] h-[50vh] flex items-center justify-center bg-base-300">
                    <div class="loading loading-spinner loading-lg"></div>
                </div>
                <video 
                    v-show="loadedVideo"
                    ref="videoElement" 
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
        <span class="text-white font-mono text-lg">{{ formatTime(videoLength) }}</span>
    </div>
    </div>
</template>
<script setup>
definePageMeta({
    layout: "appmainnonav"
})

const poseUtils = useStandardPose()
const cameraStream = poseUtils.cameraStream
const videoElement = ref(null)
const canvas = ref(null)
const savedPoses = ref([])

const recording = ref(false)
const loadedVideo = ref(false)
const videoLength = ref(0)
const videoStartTime = ref(0)

const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}


const getSession = async () => {
    const { data, error } = await supabase.from("motions").select("*").eq("id", route.params.id).single();
    if (error) {
        throw error
    }
    videoSession.value = data
    return data
}
let isMounted = false

const setupVideo = async () => {
    let detectorStarted = await poseUtils.initializePoseDetector()
    if (detectorStarted) {
        console.log("Detector Started")
        poseUtils.startPoseDetection(videoElement.value, processPose)
       
    } else {
        console.log("Detector Not Started")
    }
}

const processPose = async (pose) => {
    const poseData = await poseUtils.getStandardPose(videoElement.value)
    poseUtils.drawOnCanvas(canvas.value, poseData)
    if (recording.value) {
        poseData.timestamp = Date.now() - videoStartTime.value
        savedPoses.value.push(poseData)
    }
    let animationFrameId = requestAnimationFrame(processPose)
}


onMounted(async () => {
    if (isMounted) return
    isMounted = true
    await getSession()
    canvas.value = document.getElementById('pose')

    const webcamReady = await poseUtils.startCamera(videoElement.value);
    loadedVideo.value = true
    if (webcamReady) {
        // Check if video is already loaded
        if (cameraStream.value.readyState >= 2) {
            await setupVideo();
        } else {
            // Set up event handler for when video loads
            videoElement.value.onloadedmetadata = setupVideo;
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
    videoLength.value = 0
    videoStartTime.value = Date.now()
    const interval = setInterval(() => {
        videoLength.value++
    }, 1000)

    if (videoElement.value && videoElement.value.srcObject) {
      mediaRecorder.value = new MediaRecorder(videoElement.value.srcObject)
      
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
    console.log(savedPoses.value)
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
    const video = videoElement.value
    if (video && savedPoses.value.length > 0) {
      const videoDimensions = {
        width: video.videoWidth,
        height: video.videoHeight
      }
      
      // Add dimensions to the first pose data entry or create a metadata entry
      if (savedPoses.value[0]) {
        savedPoses.value[0].videoDimensions = videoDimensions
      }
    }
    let jsonPoseData = JSON.stringify(savedPoses.value)
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
    if (videoElement.value && videoElement.value.srcObject) {
        const tracks = videoElement.value.srcObject.getTracks()
        tracks.forEach(track => track.stop())
    }
})
</script>~