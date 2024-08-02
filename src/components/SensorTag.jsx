// SensorTag.jsx
import React from 'react';

const SensorTag = ({ id, name, temperature, x, y }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        backgroundColor: 'lightblue',
        padding: '4px',
        borderRadius: '4px',
        border: '1px solid #ccc',
      }}
    >
      <strong>{name}</strong>: {temperature}°C
    </div>
  );
};

export default SensorTag;
