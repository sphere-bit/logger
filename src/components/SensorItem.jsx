import React from 'react';
import '../styles/main.css';

const SensorItem = ({ id, temperature, top, left, onMouseDown, onClick }) => {
  return (
    <div
      id={id}
      className='sensor-item'
      style={{ top: `${top}px`, left: `${left}px` }}
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
