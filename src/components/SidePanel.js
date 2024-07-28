import React from 'react';
import '../styles/main.css';

const SidePanel = ({ onAdjustPositions, onResetPositions, onToggleLogging, fileName, setFileName }) => {
  return (
    <div className="side-panel" id="controls">
      <button className="side-button" onClick={onAdjustPositions}>Adjust Positions</button>
      <button className="side-button" onClick={onResetPositions}>Reset Positions</button>
      <button className="side-button" onClick={onToggleLogging}>Start Logging to File</button>
      <input
        type="text"
        id="file-name"
        placeholder="Enter file name"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
      />
    </div>
  );
};

export default SidePanel;
