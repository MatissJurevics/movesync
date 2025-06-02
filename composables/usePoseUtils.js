export const usePoseUtils = () => {
  
  // Standardize pose structure across the app
  const standardizePose = (pose, timestamp = null) => {
    if (!pose || !pose.keypoints) {
      return null;
    }
    
    return {
      keypoints: pose.keypoints.map(kp => ({
        x: typeof kp.x === 'number' ? kp.x : 0,
        y: typeof kp.y === 'number' ? kp.y : 0,
        z: typeof kp.z === 'number' ? kp.z : 0,
        score: typeof kp.score === 'number' ? kp.score : 0,
        name: kp.name || ''
      })),
      score: typeof pose.score === 'number' ? pose.score : 0,
      ...(timestamp !== null && { timestamp })
    };
  };
  
  // Validate pose structure
  const isValidPose = (pose) => {
    return pose && 
           pose.keypoints && 
           Array.isArray(pose.keypoints) &&
           pose.keypoints.length > 0 &&
           pose.keypoints.every(kp => 
             typeof kp.x === 'number' && 
             typeof kp.y === 'number' &&
             typeof kp.score === 'number'
           );
  };
  
  // Calculate pose similarity with consistent structure
  const calculatePoseSimilarity = (pose1, pose2) => {
    if (!isValidPose(pose1) || !isValidPose(pose2)) return 0;
    
    const validComparisons = [];
    const minLength = Math.min(pose1.keypoints.length, pose2.keypoints.length);
    
    for (let i = 0; i < minLength; i++) {
      const kp1 = pose1.keypoints[i];
      const kp2 = pose2.keypoints[i];
      
      if (kp1.score > 0.5 && kp2.score > 0.5) {
        const distance = Math.sqrt(
          Math.pow(kp1.x - kp2.x, 2) + 
          Math.pow(kp1.y - kp2.y, 2)
        );
        
        // Normalize distance (assuming standard dimensions)
        const normalizedDistance = distance / Math.sqrt(640 * 640 + 480 * 480);
        const similarity = Math.max(0, 1 - normalizedDistance * 5);
        
        validComparisons.push(similarity);
      }
    }
    
    if (validComparisons.length === 0) return 0;
    
    return validComparisons.reduce((sum, sim) => sum + sim, 0) / validComparisons.length;
  };
  
  // Draw pose on canvas with consistent rendering
  const drawPoseOnCanvas = (canvas, pose, options = {}) => {
    if (!canvas || !isValidPose(pose)) return;

    const context = canvas.getContext('2d');
    const { 
      scaleX = 1, 
      scaleY = 1, 
      lineColor = '#3b82f6', 
      pointColor = '#ef4444',
      lineWidth = 2,
      pointRadius = 4
    } = options;

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Import pose detection utils if available
    if (typeof poseDetection !== 'undefined') {
      const connections = poseDetection.util.getAdjacentPairs(
        poseDetection.SupportedModels.BlazePose
      );

      // Draw skeleton connections
      connections.forEach(([i, j]) => {
        const keypoint1 = pose.keypoints[i];
        const keypoint2 = pose.keypoints[j];

        if (keypoint1 && keypoint2 && keypoint1.score > 0.5 && keypoint2.score > 0.5) {
          context.beginPath();
          context.moveTo(keypoint1.x * scaleX, keypoint1.y * scaleY);
          context.lineTo(keypoint2.x * scaleX, keypoint2.y * scaleY);
          context.lineWidth = lineWidth;
          context.strokeStyle = lineColor;
          context.stroke();
        }
      });
    }

    // Draw keypoints
    pose.keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.5) {
        context.beginPath();
        context.arc(keypoint.x * scaleX, keypoint.y * scaleY, pointRadius, 0, 2 * Math.PI);
        context.fillStyle = pointColor;
        context.fill();
      }
    });
  };
  
  return {
    standardizePose,
    isValidPose,
    calculatePoseSimilarity,
    drawPoseOnCanvas
  };
}; 