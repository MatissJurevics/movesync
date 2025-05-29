<template>
  <div>
    <h1>Review Session</h1>
    <div class="h-fit relative">
      <div v-if="!previewVideo" class="flex items-center justify-center h-64 bg-gray-100">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
      <video v-else :src="previewVideo" id="video"></video>
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
            v-model="timestamp"
            @input="scrubVideo"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            :style="{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                (timestamp / videoLength) * 100
              }%, #e5e7eb ${(timestamp / videoLength) * 100}%, #e5e7eb 100%)`,
            }"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>{{ formatTime(timestamp) }}</span>
            <span>{{ formatTime(videoLength) }}</span>
          </div>
        </div>
        <div class="w-full mt-4 px-4">
            <button class="btn btn-primary" @click="() => {
                let current = currentPose;
                current.timestamp = timestamp.value;
                keyPoints.push(current);
            }">
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
                        class="flex items-center justify-between p-3 bg-gray-100 rounded-lg"
                        @click="gotoKeyPoint(index)"
                    >
                        <span class="text-sm font-medium">
                            Key Pose {{ index + 1 }}
                        </span>
                        <span class="text-xs text-gray-600">
                            {{  keyPoint.timestamp }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";

definePageMeta({
  layout: "appmainnonav",
});
const sessionData = ref(null);
const previewVideo = ref(null);
const sessionId = useRoute().params.id;
let supabase = useSupabase();
let session = ref(null);
const videoLength = ref(0);
const timestamp = ref(0);
const currentPose = ref(null);
const videoPoseDataArray = ref([]);
const poseCanvas = ref(null);
const isPlaying = ref(false);
const keyPoints = ref([]);

const gotoKeyPoint = (index) => {
  timestamp.value = keyPoints.value[index].timestamp;
  scrubVideo();
}

const togglePlayPause = () => {
  const video = document.getElementById("video");
  if (isPlaying.value) {
    video.pause();
  } else {
    video.play();
    video.addEventListener("timeupdate", () => {
      timestamp.value = video.currentTime * 1000;
      currentPose.value = getClosestPose(timestamp.value);
      drawPose();
    });
  }

  isPlaying.value = !isPlaying.value;
};

const scrubVideo = () => {
  let video = document.getElementById("video");
  video.currentTime = timestamp.value / 1000;
  currentPose.value = getClosestPose(timestamp.value);
  drawPose();
};

const formatTime = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const getClosestPose = () => {
  console.log("getting closest pose");
  // if (!poseCanvas.value || !videoPoseDataArray.value || videoPoseDataArray.value.length === 0) {
  //     return;
  // }

  // Find the closest pose data to the given timestamp
  let closestPoseData = null;
  let minTimeDifference = Infinity;
  console.log("posedatakeys", videoPoseDataArray.value);

  for (const poseData of videoPoseDataArray.value) {
    const timeDifference = Math.abs(poseData.timestamp - timestamp.value);
    if (timeDifference < minTimeDifference) {
      minTimeDifference = timeDifference;
      closestPoseData = poseData;
    }
  }

  if (!closestPoseData || !closestPoseData.pose) {
    return;
  }

  console.log("closestPoseData", closestPoseData);
  return closestPoseData;
};

onMounted(async () => {
  session.value = await supabase.auth.getSession();
  const { data, error } = await supabase
    .from("motions")
    .select("*")
    .eq("id", sessionId);
  videoPoseDataArray.value = JSON.parse(data[0].pose_data);
  poseCanvas.value = document.getElementById("poseCanvas");
  if (error) {
    console.error("Error fetching session data:", error);
  } else {
    sessionData.value = data;
  }

  const { data: publicUrlData } = supabase.storage
    .from("videos")
    .getPublicUrl(sessionData.value[0].video);
  console.log("publicUrlData", publicUrlData);
  let videoUrl = publicUrlData.publicUrl.replace("/videos/videos", "/videos")
  if (publicUrlData && publicUrlData.publicUrl) {
    previewVideo.value = videoUrl;
  } else {
    console.error("Error getting video public URL");
  }
  if (currentPose.value) {
    drawPose();
  } else {
    console.log("No pose data found");
  }
  console.log("previewVideo", previewVideo.value);
  setTimeout(() => {
    loadPose();
  }, 500);
});

const loadPose = () => {
  videoLength.value = document.getElementById("video").duration * 1000;
  timestamp.value = 0;
  drawPose();
};

const drawPose = () => {
  const canvasContext = poseCanvas.value.getContext("2d");
  const video = document.getElementById("video");
  
  if (!video || !poseCanvas.value) return;
  
  // Set canvas dimensions to match video display size
  const videoRect = video.getBoundingClientRect();
  poseCanvas.value.width = videoRect.width;
  poseCanvas.value.height = videoRect.height;
  
  const canvasWidth = poseCanvas.value.width;
  const canvasHeight = poseCanvas.value.height;

  // Clear previous drawings
  canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

  const poseDataLength = videoPoseDataArray.value.length;
  let durationFrac = timestamp.value / videoLength.value;
  const poseIndex = Math.floor(durationFrac * poseDataLength);
  console.log("poseIndex", poseIndex);
  currentPose.value =
    videoPoseDataArray.value[Math.min(poseIndex, poseDataLength - 1)];
  console.log("currentPose", currentPose.value);
  const pose = currentPose.value;
  console.log(pose);

  // Calculate scaling factors
  const scaleX = canvasWidth / video.videoWidth;
  const scaleY = canvasHeight / video.videoHeight;

  // Draw connections (skeleton)
  const connections = poseDetection.util.getAdjacentPairs(
    poseDetection.SupportedModels.BlazePose
  );

  if (pose.keypoints) {
    connections.forEach(([i, j]) => {
      const kp1 = pose.keypoints[i];
      const kp2 = pose.keypoints[j];

      // Only draw if both keypoints are detected with good confidence
      if (kp1 && kp2 && kp1.score > 0.5 && kp2.score > 0.5) {
        canvasContext.beginPath();
        canvasContext.moveTo(kp1.x * scaleX, kp1.y * scaleY);
        canvasContext.lineTo(kp2.x * scaleX, kp2.y * scaleY);
        canvasContext.lineWidth = 2;
        canvasContext.strokeStyle = "#0000ffa0";
        canvasContext.stroke();
      }
    });

    // Draw keypoints
    pose.keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.5) {
        canvasContext.beginPath();
        canvasContext.arc(keypoint.x * scaleX, keypoint.y * scaleY, 5, 0, 2 * Math.PI);
        canvasContext.fillStyle = "#ff0000";
        canvasContext.fill();
      }
    });
  }
};


</script>
