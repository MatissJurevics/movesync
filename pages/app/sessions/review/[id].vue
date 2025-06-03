<template>
  <div>
    <h1>Review Session </h1>
    <div class="h-fit relative">
      <div
        v-if="!previewVideo"
        class="flex items-center justify-center h-64 bg-gray-100"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
        ></div>
      </div>
      <video 
        ref="video"
        :src="previewVideo" 
        id="displayVideo"
        preload="metadata"
        playsinline
        webkit-playsinline
      ></video>
      <canvas
        ref="poseCanvas"
        id="poseCanvas"
        class="absolute top-0 left-0 w-full h-full"
      ></canvas>
    </div>
    <!-- <button class="btn btn-primary" @click="loadPose">Load pose</button> -->
    <div class="p-2">
      <div class="flex justify-around w-full">
        <button class="btn btn-secondary" @click="togglePlayPause">
          {{ isPlaying ? "Pause" : "Play" }}
        </button>
      </div>
      <div class="w-full mt-4 px-4">
        <div class="relative">
          <input
            type="range"
            min="0"
            :max="videoLength"
            v-model="currentTimestamp"
            @input="scrubVideo"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            :style="{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                (currentTimestamp / videoLength) * 100
              }%, #e5e7eb ${(currentTimestamp / videoLength) * 100}%, #e5e7eb 100%)`,
            }"
          />

          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>{{ formatTime(currentTimestamp) }}</span>
            <span>{{ formatTime(videoLength) }}</span>
          </div>
        </div>
        <div class="w-full mt-4">
          <button
            class="btn btn-primary"
            @click="savePose"
          >
            Save Pose
          </button>
          <div class="mt-4">
            <h3 class="text-lg font-semibold mb-2">Saved Key Poses</h3>
            <div v-if="keyPoints.length === 0" class="text-gray-500 text-sm">
              No key poses saved yet
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="(keyPoint, index) in keyPoints"
                :key="index"
                class="flex items-center justify-between p-3 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors border border-gray-300"
                @click="gotoKeyPoint(index)"
              >
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-medium">
                    Key Pose {{ index + 1 }}
                  </span>
                  <span class="text-xs text-gray-600">
                    {{ formatTime(keyPoint.timestamp) }}
                  </span>
                </div>
                <button
                  @click.stop="keyPoints.splice(index, 1)"
                  class="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1 transition-colors"
                  title="Remove key pose"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="w-full mt-4">
        <button class="btn btn-primary" @click="submitPose">Submit Pose</button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "appmainnonav",
});
const poseUtils = useStandardPose();
const supabase = useSupabase();

const video = ref(null);
const poseCanvas = ref(null);

// Session Data
const sessionId = useRoute().params.id;
const session = ref(null);

// Video Data
const previewVideo = ref(null);
const currentTimestamp = ref(0);
const currentPose = ref(null);
const videoLength = ref(0);
const isPlaying = ref(false);

// Pose Data
const availablePoses = ref([]);
const selectedPoses = ref([]);
const keyPoints = ref([])


const formatTime = (time) => {
  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const togglePlayPause = () => {
  if (videoLength.value == 0) {
    videoLength.value = video.value.duration*1000;
    getClosestPose();
  }
  if (video.value) {
    if (isPlaying.value) {
      video.value.pause();
      isPlaying.value = false;
    } else {
      video.value.play();
      isPlaying.value = true;
    }
  }
}



const getSession = async () => {
  const { data, err } = await supabase.auth.getSession()
  if (err) {
    console.error(err);
  }
  session.value = data.session;
}
const loadPoses = async () => {
  const { data, err } = await supabase.from("motions").select("pose_data").eq("id", sessionId)
  if (err) {
    console.error(err);
  }
  availablePoses.value = JSON.parse(data[0].pose_data);
  currentPose.value = availablePoses.value[0];
}
const loadVideo = async () => {
  const { data: videoData, err: videoError } = await supabase.from("motions").select("video").eq("id", sessionId).single()
  const { data: videoUrl, err: videoUrlError } = await supabase.storage.from("videos").getPublicUrl(videoData.video)
  if (videoUrlError) {
    console.error(videoUrlError);
  }
  previewVideo.value = videoUrl.publicUrl.replace("/videos/videos", "/videos/");
  poseUtils.drawOnCanvas(poseCanvas.value, currentPose.value)
  
  video.value.addEventListener("loadeddata", () => {
    if (video.value.duration) {
      videoLength.value = video.value.duration*1000;
    } else {
      console.error("Video duration is NaN")
      videoLength.value = 0;
    }
  })
  video.value.addEventListener("timeupdate", () => {
    if (video.value.currentTime != currentTimestamp.value) {
      
        currentTimestamp.value = video.value.currentTime * 1000;
        getClosestPose();
      

    }
  })
  console.log("Video Length", videoLength.value)
}

const getClosestPose = () => {
  if (video.value && availablePoses.value.length > 0) {
    
    // Find the closest pose based on timestamp
    const targetTimestamp = currentTimestamp.value; // Convert to milliseconds
    let closestPose = availablePoses.value[0];
    let minDifference = Math.abs(closestPose.timestamp - targetTimestamp);
    
    for (const pose of availablePoses.value) {
      const difference = Math.abs(pose.timestamp - targetTimestamp);
      if (difference < minDifference) {
        minDifference = difference;
        closestPose = pose;
      }
    }
    
    currentPose.value = closestPose;
    currentTimestamp.value = currentTimestamp.value;
    
    // Draw the pose on canvas
    if (poseCanvas.value && currentPose.value) {
      poseUtils.drawOnCanvas(poseCanvas.value, currentPose.value);
    }
  }
}

const scrubVideo = async () => {
  console.log("Scrubbing video", currentTimestamp.value)
  if (video.value) {
    video.value.currentTime = currentTimestamp.value / 1000;
  }
}
const savePose = async () => {
  keyPoints.value.push(currentPose.value);
}
const submitPose = async () => {
  const { data, err } = await supabase.from("motions").update({
    key_poses: keyPoints.value
  }).eq("id", sessionId).select()
  if (err) {
    console.error(err);
    return;
  }
  console.log("Pose submitted", data)
  navigateTo("/app/motions/" + sessionId)
}
const gotoKeyPoint = (index) => {
  currentPose.value = keyPoints.value[index];
  currentTimestamp.value = keyPoints.value[index].timestamp;
  video.value.currentTime = keyPoints.value[index].timestamp / 1000;
}


const isMounted = ref(false);

onMounted(async () => {
  if (isMounted.value) return; isMounted.value = true;
  poseUtils.initializePoseDetector();
  await getSession();
  await loadPoses();
  await loadVideo();
})





</script>
