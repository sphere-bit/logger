import React from 'react';
import '../styles/main.css';

const SidePanel = ({ onAdjustPositions, onResetPositions, onToggleLogging, fileName, setFileName }) => {
  return (
    <div className="side-panel" id="controls"><input
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
