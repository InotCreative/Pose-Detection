import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = ({ poseData }) => {
  const [confidenceData, setConfidenceData] = useState({
    labels: [],
    datasets: []
  });
  const [posePrediction, setPosePrediction] = useState('');
  const [stablePosition, setStablePosition] = useState(false);

  useEffect(() => {
    if (poseData.length === 0) return;

    // Process data for the confidence chart (average confidence of all keypoints over time)
    const labels = poseData.slice(-20).map((_, index) => `Frame ${index + 1}`);
    
    const confidenceValues = poseData.slice(-20).map(data => {
      if (data.poses && data.poses.length > 0) {
        const keypoints = data.poses[0].keypoints;
        return keypoints.reduce((sum, kp) => sum + kp.score, 0) / keypoints.length;
      }
      return 0;
    });

    setConfidenceData({
      labels,
      datasets: [
        {
          label: 'Average Confidence',
          data: confidenceValues,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        }
      ]
    });

    // Analyze the most recent pose for predictions
    analyzePose(poseData[poseData.length - 1]);

    // Check if the position is stable (not much movement)
    checkStability(poseData.slice(-10));
  }, [poseData]);

  const analyzePose = (data) => {
    if (!data || !data.poses || data.poses.length === 0) return;

    const pose = data.poses[0];
    const keypoints = pose.keypoints;

    // Simple pose classification based on joint positions
    // This is a very basic implementation - can be expanded with ML models
    
    // Map keypoints by name
    const keypointMap = {};
    keypoints.forEach(kp => {
      keypointMap[kp.name] = kp;
    });

    // Check for basic poses
    if (isStandingPose(keypointMap)) {
      setPosePrediction('Standing');
    } else if (isRaisingHandPose(keypointMap)) {
      setPosePrediction('Raising Hand');
    } else if (isTPose(keypointMap)) {
      setPosePrediction('T-Pose');
    } else {
      setPosePrediction('Unknown Pose');
    }
  };

  const isStandingPose = (keypointMap) => {
    // Basic check for standing - vertical alignment of shoulders, hips, knees
    const nose = keypointMap.nose;
    const leftShoulder = keypointMap.left_shoulder;
    const rightShoulder = keypointMap.right_shoulder;
    const leftHip = keypointMap.left_hip;
    const rightHip = keypointMap.right_hip;
    
    if (!nose || !leftShoulder || !rightShoulder || !leftHip || !rightHip) {
      return false;
    }

    // Check if shoulders are roughly at the same height
    const shoulderYDiff = Math.abs(leftShoulder.y - rightShoulder.y);
    
    // Check if hips are roughly at the same height
    const hipYDiff = Math.abs(leftHip.y - rightHip.y);
    
    // Check if body is roughly vertical
    const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
    const hipMidX = (leftHip.x + rightHip.x) / 2;
    const verticalAlignment = Math.abs(shoulderMidX - hipMidX);
    
    return shoulderYDiff < 30 && hipYDiff < 30 && verticalAlignment < 30;
  };

  const isRaisingHandPose = (keypointMap) => {
    // Check if either hand is raised above the shoulder
    const leftShoulder = keypointMap.left_shoulder;
    const rightShoulder = keypointMap.right_shoulder;
    const leftWrist = keypointMap.left_wrist;
    const rightWrist = keypointMap.right_wrist;
    
    if (!leftShoulder || !rightShoulder || !leftWrist || !rightWrist) {
      return false;
    }
    
    return (
      (leftWrist.y < leftShoulder.y - 50) || 
      (rightWrist.y < rightShoulder.y - 50)
    );
  };

  const isTPose = (keypointMap) => {
    // Check for T-pose (arms outstretched horizontally)
    const leftShoulder = keypointMap.left_shoulder;
    const rightShoulder = keypointMap.right_shoulder;
    const leftElbow = keypointMap.left_elbow;
    const rightElbow = keypointMap.right_elbow;
    const leftWrist = keypointMap.left_wrist;
    const rightWrist = keypointMap.right_wrist;
    
    if (!leftShoulder || !rightShoulder || !leftElbow || !rightElbow || !leftWrist || !rightWrist) {
      return false;
    }
    
    // Check if arms are roughly horizontal
    const leftArmYDiff = Math.abs(leftShoulder.y - leftWrist.y);
    const rightArmYDiff = Math.abs(rightShoulder.y - rightWrist.y);
    
    // Check if arms are outstretched
    const isLeftArmOutstretched = leftWrist.x < leftShoulder.x - 50;
    const isRightArmOutstretched = rightWrist.x > rightShoulder.x + 50;
    
    return leftArmYDiff < 30 && rightArmYDiff < 30 && isLeftArmOutstretched && isRightArmOutstretched;
  };

  const checkStability = (recentPoses) => {
    if (recentPoses.length < 5) {
      setStablePosition(false);
      return;
    }

    let totalMovement = 0;
    let count = 0;

    // Calculate the average movement of keypoints between frames
    for (let i = 1; i < recentPoses.length; i++) {
      const prevPose = recentPoses[i-1];
      const currPose = recentPoses[i];
      
      if (!prevPose.poses || !prevPose.poses[0] || !currPose.poses || !currPose.poses[0]) {
        continue;
      }
      
      const prevKeypoints = prevPose.poses[0].keypoints;
      const currKeypoints = currPose.poses[0].keypoints;
      
      for (let j = 0; j < Math.min(prevKeypoints.length, currKeypoints.length); j++) {
        const prev = prevKeypoints[j];
        const curr = currKeypoints[j];
        
        // Calculate movement distance
        const movementDistance = Math.sqrt(
          Math.pow(prev.x - curr.x, 2) + Math.pow(prev.y - curr.y, 2)
        );
        
        totalMovement += movementDistance;
        count++;
      }
    }
    
    const averageMovement = count > 0 ? totalMovement / count : 0;
    setStablePosition(averageMovement < 3); // Threshold for stability
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Pose Detection Confidence',
      },
    },
    scales: {
      y: {
        min: 0,
        max: 1,
        title: {
          display: true,
          text: 'Confidence'
        }
      }
    }
  };

  return (
    <div className="analytics">
      <h2>Pose Analytics</h2>
      
      {poseData.length > 0 ? (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h3>Detected Pose</h3>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: stablePosition ? '#28a745' : '#6c757d'
            }}>
              {posePrediction}
              {stablePosition && ' (Stable)'}
            </div>
          </div>
          
          <div style={{ height: '300px' }}>
            <Line options={chartOptions} data={confidenceData} />
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h3>Suggestions</h3>
            <ul>
              {stablePosition ? (
                <li>Great job maintaining a stable pose! Try to maintain it for 5 more seconds.</li>
              ) : (
                <li>Try to stand still and maintain a stable position.</li>
              )}
              {posePrediction === 'Unknown Pose' && (
                <li>Try different poses like standing straight, T-pose, or raising a hand.</li>
              )}
              <li>Make sure your full body is visible in the camera frame.</li>
            </ul>
          </div>
        </>
      ) : (
        <div className="loading">
          Start detection to see analytics
        </div>
      )}
    </div>
  );
};

export default Analytics;