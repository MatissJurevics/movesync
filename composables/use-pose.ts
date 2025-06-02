import * as poseDetection from "@tensorflow-models/pose-detection";
// @ts-nocheck

export const usePoseUtils = () => {
  // Pose detection state
  const detector = ref(null);
  const cameraStream = ref(null);
  const connections = ref(null);
  const cameraActive = ref(false);
  const animationFrame = ref(null);
  const isDetecting = ref(false);

  // Initialize pose detector
  const initializePoseDetector = async () => {
    try {
      const model = poseDetection.SupportedModels.MoveNet;
      detector.value = await poseDetection.createDetector(model, {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER
      });
      connections.value = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet);
      return true;
    } catch (error) {
      console.error('Error initializing pose detector:', error);
      return false;
    }
  };

  // Camera management
  const startCamera = async (videoElement, options = {}) => {
    try {
      const defaultOptions = {
        video: { width: 640, height: 480 },
        audio: false
      };
      
      const streamOptions = { ...defaultOptions, ...options };
      
      cameraStream.value = await navigator.mediaDevices.getUserMedia(streamOptions);
      
      if (videoElement) {
        videoElement.srcObject = cameraStream.value;
        cameraActive.value = true;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error accessing camera:', error);
      return false;
    }
  };

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
    
    cameraActive.value = false;
    isDetecting.value = false;
  };

  // Pose detection
  const detectPose = async (videoElement) => {
    if (!detector.value || !videoElement || !cameraActive.value) {
      return null;
    }

    try {
      const poses = await detector.value.estimatePoses(videoElement);
      
      if (poses.length > 0) {
        return standardizePose(poses[0]);
      }
      
      return null;
    } catch (error) {
      console.error('Error detecting pose:', error);
      return null;
    }
  };

  const getAdjacentPairs = () => {
    return poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet);
  }

  // Continuous pose detection loop
  const startPoseDetection = async (videoElement, onPoseDetected, options = {}) => {
    if (isDetecting.value) return;
    
    isDetecting.value = true;
    const interval = options.interval || 1; // Check every frame by default
    let frameCounter = 0;

    const detectLoop = async () => {
      if (!isDetecting.value) return;

      frameCounter++;
      
      if (frameCounter % interval === 0) {
        const pose = await detectPose(videoElement);
        if (pose && onPoseDetected) {
          onPoseDetected(pose);
        }
      }

      animationFrame.value = requestAnimationFrame(detectLoop);
    };

    await detectLoop();
  };

  const stopPoseDetection = () => {
    isDetecting.value = false;
    if (animationFrame.value) {
      cancelAnimationFrame(animationFrame.value);
      animationFrame.value = null;
    }
  };

  // Canvas utilities
  const setupCanvas = (canvas, videoElement) => {
    if (!canvas || !videoElement) return;
    
    canvas.width = videoElement.videoWidth || 640;
    canvas.height = videoElement.videoHeight || 480;
  };

  const clearCanvas = (canvas) => {
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Enhanced pose drawing with overlay support
  const drawPoseWithOverlay = (canvas, currentPose, referencePose = null, scaleConfig = {}) => {
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    const { scaleX = 1, scaleY = 1, offsetX = 0, offsetY = 0 } = scaleConfig;
    
    clearCanvas(canvas);
    
    // Draw current pose in green
    if (currentPose) {
      drawPoseOnCanvas(canvas, currentPose, { 
        color: '#10B981', 
        scaleX, 
        scaleY 
      });
    }
    
    // Draw reference pose in semi-transparent blue
    if (referencePose) {
      const transformedPose = {
        keypoints: referencePose.keypoints?.map(keypoint => ({
          ...keypoint,
          x: (keypoint.x * scaleX) + offsetX,
          y: (keypoint.y * scaleY) + offsetY
        })) || []
      };
      
      drawPoseOnCanvas(canvas, transformedPose, { 
        color: 'rgba(59, 130, 246, 0.7)', 
        scaleX, 
        scaleY 
      });
    }
  };

  // Pose standardization
  const standardizePose = (pose) => {
    if (!pose || !pose.keypoints || pose.keypoints.length === 0) {
      return null;
    }

    // Filter keypoints with confidence > 0.3
    const validKeypoints = pose.keypoints.filter(kp => kp.score > 0.3);
    
    if (validKeypoints.length < 5) {
      return null; // Not enough valid keypoints
    }

    return {
      keypoints: pose.keypoints.map(kp => ({
        x: Math.round(kp.x),
        y: Math.round(kp.y),
        score: Math.round(kp.score * 100) / 100,
        name: kp.name
      })),
      score: pose.score
    };
  };

  // Pose validation
  const isValidPose = (pose) => {
    if (!pose || !pose.keypoints) return false;
    
    const validKeypoints = pose.keypoints.filter(kp => kp.score > 0.3);
    return validKeypoints.length >= 5;
  };

  // Pose similarity calculation
  const calculatePoseSimilarity = (pose1, pose2) => {
    if (!isValidPose(pose1) || !isValidPose(pose2)) {
      return 0;
    }

    const CONFIDENCE_THRESHOLD = 0.3;
    let totalDistance = 0;
    let comparedKeypoints = 0;

    for (let i = 0; i < Math.min(pose1.keypoints.length, pose2.keypoints.length); i++) {
      const kp1 = pose1.keypoints[i];
      const kp2 = pose2.keypoints[i];
      
      if (kp1.score > CONFIDENCE_THRESHOLD && kp2.score > CONFIDENCE_THRESHOLD) {
        const distance = Math.sqrt(
          Math.pow(kp1.x - kp2.x, 2) + 
          Math.pow(kp1.y - kp2.y, 2)
        );
        totalDistance += distance;
        comparedKeypoints++;
      }
    }

    if (comparedKeypoints === 0) return 0;

    const averageDistance = totalDistance / comparedKeypoints;
    const maxDistance = 200;
    const similarity = Math.max(0, 1 - (averageDistance / maxDistance));
    
    return Math.round(similarity * 100) / 100;
  };
  

  // Enhanced pose drawing on canvas
  const drawPoseOnCanvas = (canvas, pose, options = {}) => {
    if (!canvas || !pose || !pose.keypoints) return;

    const context = canvas.getContext('2d');
    const {
      color = '#10B981',
      lineWidth = 3,
      pointRadius = 4,
      scaleX = 1,
      scaleY = 1,
      alpha = 1
    } = options;

    context.save();
    context.globalAlpha = alpha;

    // Draw skeleton connections
    const connections = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet);
    
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    
    connections.forEach(([startIdx, endIdx]) => {
      const startPoint = pose.keypoints[startIdx];
      const endPoint = pose.keypoints[endIdx];
      
      if (startPoint && endPoint && startPoint.score > 0.3 && endPoint.score > 0.3) {
        context.beginPath();
        context.moveTo(startPoint.x * scaleX, startPoint.y * scaleY);
        context.lineTo(endPoint.x * scaleX, endPoint.y * scaleY);
        context.stroke();
      }
    });

    // Draw keypoints
    context.fillStyle = color;
    
    pose.keypoints.forEach((keypoint) => {
      if (keypoint && keypoint.score > 0.3) {
        context.beginPath();
        context.arc(
          keypoint.x * scaleX, 
          keypoint.y * scaleY, 
          pointRadius, 
          0, 
          2 * Math.PI
        );
        context.fill();
      }
    });

    context.restore();
  };

  // Cleanup function
  const cleanup = (videoElement = null) => {
    stopPoseDetection();
    stopCamera(videoElement);
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
    detectPose,
    startPoseDetection,
    stopPoseDetection,
    setupCanvas,
    clearCanvas,
    drawPoseWithOverlay,
    standardizePose,
    isValidPose,
    calculatePoseSimilarity,
    drawPoseOnCanvas,
    cleanup,
    getAdjacentPairs
  };
}; 