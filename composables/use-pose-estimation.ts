// This composable is an object that takes in a html video element and a canvas element

import * as tf from "@tensorflow/tfjs"
import * as poseDetection from "@tensorflow-models/pose-detection"

export const usePoseEstimation = () => {
    const detector = ref(null);
    const canvasContext = ref(null);
    const isModelLoaded = ref(false);
    const isDetecting = ref(false);

    // Setup webcam access
    const setupWebcam = async (videoElement: HTMLVideoElement) => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoElement) {
                    videoElement.srcObject = stream;
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
    const setupCanvas = (videoElement: HTMLVideoElement, canvasId: string = "#pose") => {
        const canvas = document.querySelector(canvasId) as HTMLCanvasElement;
        if (videoElement && canvas) {
            canvas.width = videoElement.videoWidth || 640;
            canvas.height = videoElement.videoHeight || 480;
            canvasContext.value = canvas.getContext("2d");
            return canvasContext.value;
        }
        return null;
    };

    // Load BlazePose model
    const loadBlazePoseModel = async (videoElement: HTMLVideoElement) => {
        console.log("Video Width", videoElement.videoWidth, "VideoHeight: ", videoElement.videoHeight);
        videoElement.height = videoElement.videoHeight;
        videoElement.width = videoElement.videoWidth;

        // Create detector with BlazePose model
        const model = poseDetection.SupportedModels.BlazePose;
        const detectorConfig = {
            runtime: 'tfjs',
            modelType: 'full',
            enableSmoothing: true
        };
        
        detector.value = await poseDetection.createDetector(model, detectorConfig);
        isModelLoaded.value = true;
        return detector.value;
    };

    // Draw the detected pose on canvas
    const drawPose = (pose: any, ctx: CanvasRenderingContext2D, videoWidth: number, videoHeight: number) => {
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

    // Start pose detection
    const startPoseDetection = async (videoElement: HTMLVideoElement) => {
        if (!detector.value || !videoElement || !canvasContext.value) return;
        
        isDetecting.value = true;
        
        const detectFrame = async () => {
            if (!isDetecting.value) return;
            
            try {
                const poses = await detector.value.estimatePoses(videoElement, {
                    flipHorizontal: false
                });
                
                if (poses && poses.length > 0) {
                    drawPose(poses[0], canvasContext.value, videoElement.videoWidth, videoElement.videoHeight);
                }
                
                // Continue detecting in the next frame
                requestAnimationFrame(detectFrame);
            } catch (error) {
                console.error("Error detecting pose:", error);
                requestAnimationFrame(detectFrame);
            }
        };
        
        detectFrame();
    };

    // Stop pose detection
    const stopPoseDetection = () => {
        isDetecting.value = false;
    };

    // Initialize pose estimation
    const initializePoseEstimation = async (videoElement: HTMLVideoElement, canvasId?: string) => {
        // Setup canvas
        const ctx = setupCanvas(videoElement, canvasId);
        if (!ctx) {
            throw new Error("Failed to setup canvas");
        }

        // Ensure TensorFlow backend is ready
        await tf.ready();
        
        // Load BlazePose model
        await loadBlazePoseModel(videoElement);
        
        return true;
    };

    // Cleanup resources
    const cleanup = () => {
        stopPoseDetection();
        detector.value = null;
        canvasContext.value = null;
        isModelLoaded.value = false;
    };

    return {
        // State
        detector: readonly(detector),
        canvasContext: readonly(canvasContext),
        isModelLoaded: readonly(isModelLoaded),
        isDetecting: readonly(isDetecting),
        
        // Methods
        setupWebcam,
        setupCanvas,
        loadBlazePoseModel,
        drawPose,
        startPoseDetection,
        stopPoseDetection,
        initializePoseEstimation,
        cleanup
    };
};

export default () => {

}