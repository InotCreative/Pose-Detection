import React, { useState } from 'react';
import PoseDetector from './components/PoseDetector';
import ControlPanel from './components/ControlPanel';
import Analytics from './components/Analytics';
import './App.css';

function App() {
  const [detectionEnabled, setDetectionEnabled] = useState(false);
  const [model, setModel] = useState('movenet');
  const [poseData, setPoseData] = useState([]);
  const [isModelLoading, setIsModelLoading] = useState(false);

  const handlePoseDataUpdate = (newPoseData) => {
    setPoseData(prev => [...prev, newPoseData].slice(-100)); // Keep last 100 frames for analytics
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Human Pose Detection</h1>
      </header>
      
      <ControlPanel 
        detectionEnabled={detectionEnabled}
        setDetectionEnabled={setDetectionEnabled}
        model={model}
        setModel={setModel}
        isModelLoading={isModelLoading}
      />
      
      <PoseDetector
        detectionEnabled={detectionEnabled}
        model={model}
        onPoseDetected={handlePoseDataUpdate}
        setIsModelLoading={setIsModelLoading}
      />
      
      <Analytics poseData={poseData} />
    </div>
  );
}

export default App;