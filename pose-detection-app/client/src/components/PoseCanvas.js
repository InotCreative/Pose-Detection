import React, { useRef, useEffect } from 'react';

// Keypoint connections for different models
const MOVENET_CONNECTIONS = [
  ['nose', 'left_eye'], ['nose', 'right_eye'],
  ['left_eye', 'left_ear'], ['right_eye', 'right_ear'],
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'], ['right_shoulder', 'right_elbow'],
  ['left_elbow', 'left_wrist'], ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'], ['right_hip', 'right_knee'],
  ['left_knee', 'left_ankle'], ['right_knee', 'right_ankle']
];

const PoseCanvas = ({ poses, webcamRef }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (
      !canvasRef.current || 
      !webcamRef.current || 
      !webcamRef.current.video || 
      webcamRef.current.video.readyState !== 4 ||
      poses.length === 0
    ) {
      return;
    }

    const video = webcamRef.current.video;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    // Set canvas dimensions to match video
    const canvas = canvasRef.current;
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw poses
    poses.forEach(pose => {
      drawPose(pose, ctx, videoWidth, videoHeight);
    });
  }, [poses, webcamRef]);

  const drawPose = (pose, ctx, videoWidth, videoHeight) => {
    // Map keypoints by name for easier reference
    const keypointsByName = {};
    pose.keypoints.forEach(keypoint => {
      keypointsByName[keypoint.name] = keypoint;
    });

    // Draw skeleton (connecting lines)
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;

    MOVENET_CONNECTIONS.forEach(([start, end]) => {
      const startKeypoint = keypointsByName[start];
      const endKeypoint = keypointsByName[end];

      if (startKeypoint && endKeypoint && 
          startKeypoint.score > 0.3 && endKeypoint.score > 0.3) {
        ctx.beginPath();
        ctx.moveTo(startKeypoint.x, startKeypoint.y);
        ctx.lineTo(endKeypoint.x, endKeypoint.y);
        ctx.stroke();
      }
    });

    // Draw keypoints
    pose.keypoints.forEach(keypoint => {
      if (keypoint.score > 0.3) {
        const { x, y } = keypoint;
        
        // Draw keypoint circle
        ctx.fillStyle = getKeypointColor(keypoint.name);
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        
        // Optionally draw keypoint name labels
        // ctx.fillStyle = '#FFFFFF';
        // ctx.font = '10px Arial';
        // ctx.fillText(keypoint.name, x + 7, y + 3);
      }
    });
  };

  const getKeypointColor = (name) => {
    // Different colors based on body part category
    if (name.includes('nose') || name.includes('eye') || name.includes('ear')) {
      return '#FF0000'; // Red for face
    } else if (name.includes('shoulder') || name.includes('elbow') || name.includes('wrist')) {
      return '#00FFFF'; // Cyan for arms
    } else if (name.includes('hip') || name.includes('knee') || name.includes('ankle')) {
      return '#FFFF00'; // Yellow for legs
    } else {
      return '#FF00FF'; // Magenta for others
    }
  };

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
      }}
    />
  );
};

export default PoseCanvas;