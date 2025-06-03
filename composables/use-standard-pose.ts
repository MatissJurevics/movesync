/*

This is seperate pose detection composable that aims to replace the first one. 
All pose detection and drawing will be done on this one and all of the data will be standardized on a scale of 0-1.


@ts-nocheck
*/
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-core';
// Register WebGL backend.
import '@tensorflow/tfjs-backend-webgl';
import '@mediapipe/pose';


export const useStandardPose = () => {
  const detector = ref(null);
  const connections = ref(null);
  const cameraStream = ref(null);
  const cameraActive = ref(false);
  const isDetecting = ref(false);
  const backendInitialized = ref(false);
  const colors = {
    point: "#ff0000",
    line: "#0000ff",
  };

  const initializeBackends = async () => {
    if (backendInitialized.value) return;
    try {
        backendInitialized.value = true;
    } catch (err) {
        console.error("Error initializing backends", err)
        backendInitialized.value = false;
    }
  }
  // For the time being all of these functions will be empty
  const initializePoseDetector = async () => {
    await initializeBackends();
    const model = poseDetection.SupportedModels.BlazePose;
    const newDetector = await poseDetection.createDetector(model, markRaw({
      runtime: 'mediapipe',
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose',
      enableSmoothing: false,   // set false for static images
      modelType: "full"
    }));
    detector.value = markRaw(newDetector);
    connections.value = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.BlazePose);
    return true;
  };

  const startCamera = async (videoElement, options = {}) => {
    const defaultOptions = {
        video: true,
        audio: false
    }
    const streamOptions = { ...defaultOptions, ...options };
    try {
        cameraStream.value = await navigator.mediaDevices.getUserMedia(streamOptions);
        if (videoElement) {
            videoElement.srcObject = cameraStream.value;
            cameraActive.value = true;
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.error(err)
        return false
    }
  };

  const setupCanvas = (canvas, options = {}) => {
    if (!canvas) return;
    const defaultOptions = {
        width: 640,
        height: 480
    }
    const canvasOptions = { ...defaultOptions, ...options };
    canvas.width = canvasOptions.width;
    canvas.height = canvasOptions.height;
    return canvas.getContext('2d');
  }

  const stopCamera = (videoElement = null) => {
    if (cameraStream.value) {
        cameraStream.value.getTracks().forEach(track => track.stop());
        cameraStream.value = null;
    }

    if (videoElement) {
        videoElement.srcObject = null;
    }

    if (animationFrame.value) {
        cancelAnimationFrame(animationFrame.value);
        animationFrame.value = null;
      }

    cameraActive.value = false
    isDetecting.value = false
  };

  /**
   * This function will start the pose detection loop where.
   * @param videoElement The element being scanned
   * @param onPoseDetected The function to call when a pose is detected
   * @param options The options for the pose detection
   * @returns 
   */
  const startPoseDetection = async ( videoElement, onPoseDetected, options = {}) => {
    if (isDetecting.value) return;

    isDetecting.value = true;
    const interval = options.interval || 1;
    let frameCounter = 0;

    if (!isDetecting.value) return;
        frameCounter++

        if (frameCounter % interval === 0) {
            console.log("Getting Standard Pose")
            const pose = await getStandardPose(videoElement);
            if (pose && onPoseDetected) {
                onPoseDetected(pose);
            }
        }
  };

  const getStandardPose = async (videoElement) => {
    try {
        if (!detector.value || !videoElement ) {
            return null;
        }
        // console.log("Detector", detector.value)
        const videoDimensions = {
            width: videoElement.videoWidth,
            height: videoElement.videoHeight
        }
        const estimationConfig = {flipHorizontal: false,};        
        if (videoDimensions.width === 0 || videoDimensions.height === 0) {
            throw Error("Video Dimentions are invalid")
        }
        let poses = null;

        try {
            poses = await detector.value.estimatePoses(videoElement);
        } catch (err) {
            console.error(err)
            return null;
        }
        if (poses.length > 0) {
            poses[0].keypoints.forEach(keypoint => {
                keypoint.x = keypoint.x / videoDimensions.width;
                keypoint.y = keypoint.y / videoDimensions.height;
            })
            return poses[0];
        }
        return null;
    } catch (err) {
        console.error(err)
        return null;
    }
  }

  const stopPoseDetection = () => {
    isDetecting.value = false;
    if (animationFrame.value) {
        cancelAnimationFrame(animationFrame.value);
        animationFrame.value = null;
    }
  };

  const clearCanvas = (canvas) => {
    if (!canvas) return;

    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const drawOnCanvas = (canvas, pose, options = {}) => {
    if (!canvas || !pose || !pose.keypoints) return;
    const canvasDimensions = {
        width: canvas.width,
        height: canvas.height
    }
    const {
        color = '#10B981',
        lineWidth = 1,
        pointRadius = 1.5,
        scaleX = 1,
        scaleY = 1,
        alpha = 1,
        clear = true
      } = options;


    if (clear) {
        clearCanvas(canvas)
    }

    const context = canvas.getContext('2d');
    context.save();
    context.globalAlpha = alpha;
    // convert 0-1 to 0-canvas dimensions
    const updatedPose = pose.keypoints.map(keypoint => {
        return {
            x: keypoint.x * canvasDimensions.width,
            y: keypoint.y * canvasDimensions.height,
            score: keypoint.score
        }
    })
    context.fillStyle = color;
    context.lineWidth = lineWidth;
    context.strokeStyle = color;

    connections.value.forEach(([startIdx, endIdx]) => {
        const startPoint = updatedPose[startIdx];
        const endPoint = updatedPose[endIdx];
        
        if (startPoint && endPoint && startPoint.score > 0.3 && endPoint.score > 0.3) {
            context.beginPath();
            context.moveTo(startPoint.x, startPoint.y);
            context.lineTo(endPoint.x, endPoint.y);
            context.stroke();
        }
    })

    updatedPose.forEach(keypoint => {
        if (keypoint && keypoint.score > 0.3) {
            context.beginPath();
            context.arc(keypoint.x, keypoint.y, pointRadius, 0, 2 * Math.PI);
            context.fill();
        }
    })

    context.restore();
  };

  const getSimilarity = (pose1, pose2) => {
    if (!pose1 || !pose2 || !pose1.keypoints || !pose2.keypoints) {
        return 0;
    }

    const distance = pose1.keypoints.reduce((acc, keypoint1, index) => {
        const keypoint2 = pose2.keypoints[index];
        if (keypoint1 && keypoint2) {
            return acc + Math.sqrt(
                Math.pow(keypoint1.x - keypoint2.x, 2) +
                Math.pow(keypoint1.y - keypoint2.y, 2)
            )
        }
        return acc;
    }, 0);

    const maxDistance = 200;
    const similarity = Math.max(0, 1 - (distance / maxDistance));
    return similarity;
  };

  const cleanup = () => {
    stopPoseDetection();
    stopCamera();
    detector.value = null;
    connections.value = null;
    cameraStream.value = null;
    cameraActive.value = false;
    isDetecting.value = false;
  };

  return {
    // State
    detector: readonly(detector),
    connections: readonly(connections),
    cameraStream: readonly(cameraStream),
    cameraActive: readonly(cameraActive),
    isDetecting: readonly(isDetecting),
    
    // Methods
    initializePoseDetector,
    startCamera,
    stopCamera,
    startPoseDetection,
    stopPoseDetection,
    getStandardPose,
    drawOnCanvas,
    getSimilarity,
    cleanup,
    setupCanvas
  }
};
