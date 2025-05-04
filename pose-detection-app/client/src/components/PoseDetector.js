import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import PoseCanvas from './PoseCanvas';
import { saveDetection } from '../services/api';

const PoseDetector = ({ detectionEnabled, model, onPoseDetected, setIsModelLoading }) => {
  const webcamRef = useRef(null);
  const [detector, setDetector] = useState(null);
  const [poses, setPoses] = useState([]);
  const [webcamReady, setWebcamReady] = useState(false);
  const requestAnimationRef = useRef(null);

  // Load TensorFlow.js and the selected pose detection model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsModelLoading(true);
        
        // Load TensorFlow.js
        await tf.ready();
        
        // Configure the model based on selection
        let detectorConfig;
        
        if (model === 'movenet') {
          detectorConfig = {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
            enableTracking: true,
            trackerType: poseDetection.TrackerType.BoundingBox
          };
        } else if (model === 'blazepose') {
          detectorConfig = {
            runtime: 'tfjs',
            modelType: 'full'
          };
        } else { // poseNet
          detectorConfig = {
            architecture: 'MobileNetV1',
            outputStride: 16,
            inputResolution: { width: 640, height: 480 },
            multiplier: 0.75
          };
        }
        
        // Create the detector
        const detector = await poseDetection.createDetector(
          model === 'movenet' 
            ? poseDetection.SupportedModels.MoveNet
            : model === 'blazepose'
              ? poseDetection.SupportedModels.BlazePose
              : poseDetection.SupportedModels.PoseNet,
          detectorConfig
        );
        
        setDetector(detector);
        setIsModelLoading(false);
      } catch (error) {
        console.error('Error loading the pose detection model:', error);
        setIsModelLoading(false);
      }
    };

    loadModel();

    // Cleanup function
    return () => {
      if (requestAnimationRef.current) {
        cancelAnimationFrame(requestAnimationRef.current);
      }
    };
  }, [model, setIsModelLoading]);

  // Handle pose detection
  useEffect(() => {
    const detectPose = async () => {
      if (
        detector && 
        webcamRef.current && 
        webcamRef.current.video && 
        webcamRef.current.video.readyState === 4 && // HAVE_ENOUGH_DATA
        detectionEnabled
      ) {
        // Get video properties
        const video = webcamRef.current.video;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        // Set video dimensions
        video.width = videoWidth;
        video.height = videoHeight;

        try {
          // Detect poses
          const detectedPoses = await detector.estimatePoses(video);
          
          if (detectedPoses.length > 0) {
            setPoses(detectedPoses);
            
            // Process and send data for analytics
            const timestamp = new Date().toISOString();
            const processedData = {
              timestamp,
              poses: detectedPoses,
              model
            };
            
            onPoseDetected(processedData);
            
            // Optionally save to backend
            try {
              await saveDetection(processedData);
            } catch (error) {
              // Silent fail - this is optional functionality
              console.log('Could not save detection to backend:', error);
            }
          }
        } catch (error) {
          console.error('Error detecting poses:', error);
        }
      }
      
      // Continue the detection loop
      if (detectionEnabled) {
        requestAnimationRef.current = requestAnimationFrame(detectPose);
      }
    };

    if (detectionEnabled) {
      detectPose();
    } else {
      // Clear poses when detection is disabled
      setPoses([]);
      if (requestAnimationRef.current) {
        cancelAnimationFrame(requestAnimationRef.current);
      }
    }

    return () => {
      if (requestAnimationRef.current) {
        cancelAnimationFrame(requestAnimationRef.current);
      }
    };
  }, [detector, detectionEnabled, model, onPoseDetected]);

  const handleWebcamReady = () => {
    setWebcamReady(true);
  };

  return (
    <div className="webcam-container">
      <Webcam
        ref={webcamRef}
        className="webcam"
        mirrored={true}
        screenshotFormat="image/jpeg"
        onUserMedia={handleWebcamReady}
        videoConstraints={{
          width: 640,
          height: 480,
          facingMode: "user"
        }}
      />
      {webcamReady && (
        <PoseCanvas 
          poses={poses} 
          webcamRef={webcamRef} 
        />
      )}
      {!webcamReady && (
        <div className="loading">
          Loading webcam...
        </div>
      )}
    </div>
  );
};

export default PoseDetector;