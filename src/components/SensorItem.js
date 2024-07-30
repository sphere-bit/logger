import React from 'react';

const SensorItem = ({ id, temperature, top, left, onMouseDown, onClick }) => {
  return (
    <div
      id={id}
      className='sensor-item'
      style={{
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        backgroundColor: 'rgba(255, 0, 0, 0.5)', // Example style
        padding: '5px',
        borderRadius: '5px',
        cursor: 'pointer',
      }}
      onMouseDown={onMouseDown}
      onClick={(e) => {
        e.stopPropagation(); // Prevent interference from other elements
        console.log(`Sensor ${id} clicked`);
        onClick();
      }}
    >
      {temperature ? `${temperature}°C` : '%TEMP%'}
    </div>
  );
};

export default SensorItem;
