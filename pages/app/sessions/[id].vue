<template>
    <div class="">
        <div class="relative bg-gray-100 border-none overflow-hidden h-[40em] w-full">
                <video 
                    ref="webcamVideo" 
                    class="w-[100vw] h-[40em] object-cover" 
                    autoplay 
                    playsinline
                ></video>
                <canvas id="pose" class="absolute w-full top-0 left-0 h-[40em] bg-white/10 z-10">

                </canvas>
        </div>
        <button @click="() => toggleRecording()" class="btn btn-primary mx-auto">{{ !recording ? "Start Recording" : "Stop Recording" }}</button>
    </div>
</template>
<script setup>
import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';

definePageMeta({
    layout: "appmain"
})

const webcamVideo = ref(null)
const recording = ref(false)
let poseNetModel = null

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

// Load PoseNet model
const loadPoseNetModel = async () => {
    console.log("Video Width", webcamVideo.value.videoWidth, "VideoHeight: ", webcamVideo.value.videoHeight)
    webcamVideo.value.height = webcamVideo.value.videoHeight
    webcamVideo.value.width = webcamVideo.value.videoWidth

    // Create options object for PoseNet
    const options = {
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: webcamVideo.value.width, height: webcamVideo.value.height },
        multiplier: 0.75,
        quantBytes: 2
    };

    // Initialize PoseNet
    const model = await posenet.load(options);
    return model;
};

// Start pose detection
const startPoseDetection = async () => {
    if (!poseNetModel || !webcamVideo.value) return;
    
    try {
        const pose = await poseNetModel.estimateSinglePose(webcamVideo.value, {
            flipHorizontal: false
        });
        
        if (pose) {
            drawPose(pose, canvasContext, webcamVideo.value.videoWidth, webcamVideo.value.videoHeight);
        }
        
        // Continue detecting in the next frame
        requestAnimationFrame(startPoseDetection);
    } catch (error) {
        console.error("Error detecting pose:", error);
        requestAnimationFrame(startPoseDetection);
    }
};

// Draw the detected pose on canvas
const drawPose = (pose, ctx, videoWidth, videoHeight) => {
    if (!pose || !ctx) return;
    
    // Clear previous drawings
    ctx.clearRect(0, 0, videoWidth, videoHeight);
    
    // Draw keypoints
    if (pose.keypoints) {
        pose.keypoints.forEach(keypoint => {
            if (keypoint.score > 0.5) {
                ctx.beginPath();
                ctx.arc(keypoint.position.x, keypoint.position.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'red';
                ctx.fill();
            }
        });
    }
    
    // Draw skeleton
    const adjacentKeyPoints = posenet.getAdjacentKeyPoints(pose.keypoints, 0.5);
    if (adjacentKeyPoints) {
        adjacentKeyPoints.forEach(([startPoint, endPoint]) => {
            ctx.beginPath();
            ctx.moveTo(startPoint.position.x, startPoint.position.y);
            ctx.lineTo(endPoint.position.x, endPoint.position.y);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'blue';
            ctx.stroke();
        });
    }
};

let canvasContext = null;

onMounted(async () => {
    const webcamReady = await setupWebcam();
    
    if (webcamReady) {
        // Wait for video to be ready
        webcamVideo.value.onloadedmetadata = async () => {
            canvasContext = setupCanvas();
            
            // Ensure TensorFlow backend is ready
            await tf.ready();
            
            // Load PoseNet model
            poseNetModel = await loadPoseNetModel();
            
            // Start pose detection
            if (poseNetModel) {
                startPoseDetection();
            }
        };
    }
});

const mediaRecorder = ref(null)
const recordedChunks = ref([])
const supabase = useSupabase()
const route = useRoute()

const toggleRecording = async () => {
  if (!recording.value) {
    // Start recording
    recording.value = true
    recordedChunks.value = []
    
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
    if (mediaRecorder.value) {
      mediaRecorder.value.stop()
    }
  }
}

const saveRecording = async (blob) => {
  try {
    const session = await getUserSession()
    const userId = session.user.id
    const sessionId = route.params.id
    
    // Generate a unique filename
    const fileName = `${userId}_${Date.now()}.webm`
    const filePath = `${userId}/${fileName}`
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, blob)
    
    if (error) {
      console.error("Error uploading recording:", error)
      return
    }
    
   
    
    if (dbError) {
      console.error("Error saving recording to database:", dbError)
    }
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