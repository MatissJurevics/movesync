<template>
  <div>
    <h1>Review Session</h1>
    <div class="h-fit relative">
      <div
        v-if="!previewVideo"
        class="flex items-center justify-center h-64 bg-gray-100"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
        ></div>
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
        <div class="w-full mt-4">
          <button
            class="btn btn-primary"
            @click="
              () => {
                let current = currentPose;
                keyPoints.push(current);
              }
            "
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
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";

definePageMeta({
  layout: "appmainnonav",
});
const poseUtils = usePoseUtils()
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
const animationFrameId = ref(null);
const keyPoints = ref([]);

const gotoKeyPoint = (index) => {
  timestamp.value = keyPoints.value[index].timestamp;
  scrubVideo();
};

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

  if (!videoPoseDataArray.value || videoPoseDataArray.value.length === 0) {
    return;
  }

  // Binary search to find the closest pose data to the given timestamp
  let left = 0;
  let right = videoPoseDataArray.value.length - 1;
  let closestPoseData = null;
  let minTimeDifference = Infinity;

  console.log("posedatakeys", videoPoseDataArray.value);

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const currentPoseData = videoPoseDataArray.value[mid];
    const timeDifference = Math.abs(
      currentPoseData.timestamp - timestamp.value
    );

    if (timeDifference < minTimeDifference) {
      minTimeDifference = timeDifference;
      closestPoseData = currentPoseData;
    }

    if (currentPoseData.timestamp < timestamp.value) {
      left = mid + 1;
    } else if (currentPoseData.timestamp > timestamp.value) {
      right = mid - 1;
    } else {
      // Exact match found
      break;
    }
  }

  // Check adjacent elements for potentially closer matches
  if (left < videoPoseDataArray.value.length) {
    const rightPoseData = videoPoseDataArray.value[left];
    const rightTimeDifference = Math.abs(
      rightPoseData.timestamp - timestamp.value
    );
    if (rightTimeDifference < minTimeDifference) {
      closestPoseData = rightPoseData;
    }
  }

  if (right >= 0) {
    const leftPoseData = videoPoseDataArray.value[right];
    const leftTimeDifference = Math.abs(
      leftPoseData.timestamp - timestamp.value
    );
    if (leftTimeDifference < minTimeDifference) {
      closestPoseData = leftPoseData;
    }
  }

  if (!closestPoseData || !closestPoseData.pose) {
    return;
  }

  console.log("closestPoseData", closestPoseData);
  return closestPoseData;
};

const updatePoseLoop = () => {
  if (isPlaying.value) {
    const video = document.getElementById("video");
    if (video) {
      timestamp.value = video.currentTime * 1000; // Convert to milliseconds
      drawPose();
    }
    animationFrameId.value = requestAnimationFrame(updatePoseLoop);
  }
};

const startPoseUpdates = () => {
  isPlaying.value = true;
  updatePoseLoop();
};

const stopPoseUpdates = () => {
  isPlaying.value = false;
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
    animationFrameId.value = null;
  }
};

onMounted(async () => {
  session.value = await supabase.auth.getSession();
  const { data, error } = await supabase
    .from("motions")
    .select("*")
    .eq("id", sessionId);

  if (error) {
    console.error("Error fetching session data:", error);
    return;
  }

  videoPoseDataArray.value = JSON.parse(data[0].pose_data);
  poseCanvas.value = document.getElementById("poseCanvas");
  sessionData.value = data;

  const { data: publicUrlData } = supabase.storage
    .from("videos")
    .getPublicUrl(sessionData.value[0].video);
  console.log("publicUrlData", publicUrlData);
  let videoUrl = publicUrlData.publicUrl.replace("/videos/videos", "/videos");
  if (publicUrlData && publicUrlData.publicUrl) {
    previewVideo.value = videoUrl;

    // Wait for video to be ready before setting up event listeners
    nextTick(() => {
      setupVideoEventListeners();
    });
  } else {
    console.error("Error getting video public URL");
  }
});

const setupVideoEventListeners = () => {
  const video = document.getElementById("video");
  if (!video) {
    console.error("Video element not found");
    return;
  }

  // Wait for video metadata to load before calling loadPose
  video.addEventListener("loadedmetadata", () => {
    loadPose();
  });

  video.addEventListener("play", startPoseUpdates);
  video.addEventListener("pause", stopPoseUpdates);
  video.addEventListener("ended", stopPoseUpdates);

  video.addEventListener("seeked", () => {
    timestamp.value = video.currentTime * 1000;
    drawPose();
  });

  // Handle video loading errors
  video.addEventListener("error", (e) => {
    console.error("Video loading error:", e);
  });
};

const loadPose = () => {
  const video = document.getElementById("video");
  if (!video || isNaN(video.duration)) {
    console.error("Video not ready or duration not available");
    return;
  }

  videoLength.value = video.duration * 1000;
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
  let currentPoseValue = videoPoseDataArray.value[Math.min(poseIndex, poseDataLength - 1)];
  currentPoseValue.timestamp = timestamp.value;
  currentPose.value = currentPoseValue;
  const pose = currentPose.value;

  // Calculate scaling factors
  const scaleX = canvasWidth / video.videoWidth;
  const scaleY = canvasHeight / video.videoHeight;

  // Draw connections (skeleton)
  const connections = poseDetection.util.getAdjacentPairs(
    poseDetection.SupportedModels.MoveNet
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
        canvasContext.arc(
          keypoint.x * scaleX,
          keypoint.y * scaleY,
          5,
          0,
          2 * Math.PI
        );
        canvasContext.fillStyle = "#ff0000";
        canvasContext.fill();
      }
    });
  }
};

// Add cleanup when component unmounts
onUnmounted(() => {
  stopPoseUpdates();
  const video = document.getElementById("video");
  if (video) {
    video.removeEventListener("play", startPoseUpdates);
    video.removeEventListener("pause", stopPoseUpdates);
    video.removeEventListener("ended", stopPoseUpdates);
  }
});

const submitPose = async () => {
  let keyPoses = keyPoints.value;
  let { data: sessionData, error: sessionError } = await supabase
    .from("motions")
    .update({
      key_poses: keyPoses,
      completed: true,
    })
    .eq("id", sessionId);
  if (sessionError) {
    console.error("Error submitting pose:", sessionError);
  } else {
    navigateTo(`/app/motions/${sessionId}`);
  }
};
</script>
