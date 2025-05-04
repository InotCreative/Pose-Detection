import React from 'react';

const ControlPanel = ({ 
  detectionEnabled, 
  setDetectionEnabled, 
  model, 
  setModel,
  isModelLoading
}) => {
  const handleModelChange = (e) => {
    const newModel = e.target.value;
    setModel(newModel);
    
    // Temporarily disable detection while the model loads
    if (detectionEnabled) {
      setDetectionEnabled(false);
    }
  };

  return (
    <div className="controls">
      <h2>Controls</h2>
      <div>
        <button
          onClick={() => setDetectionEnabled(!detectionEnabled)}
          disabled={isModelLoading}
        >
          {detectionEnabled ? 'Stop Detection' : 'Start Detection'}
        </button>
        
        <select value={model} onChange={handleModelChange} disabled={detectionEnabled || isModelLoading}>
          <option value="movenet">MoveNet (Fast)</option>
          <option value="blazepose">BlazePose (Accurate)</option>
          <option value="posenet">PoseNet (Balanced)</option>
        </select>
        
        {isModelLoading && <span>Loading model...</span>}
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <p>
          <strong>Model Info:</strong>{' '}
          {model === 'movenet' && 'MoveNet is optimized for speed and works well on mobile devices.'}
          {model === 'blazepose' && 'BlazePose provides the most accurate pose detection but may be slower.'}
          {model === 'posenet' && 'PoseNet offers a good balance between speed and accuracy.'}
        </p>
      </div>
    </div>
  );
};

export default ControlPanel;