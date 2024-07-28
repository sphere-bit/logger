import React from 'react';
import '../styles/main.css';

const ThermalBox = ({ sensors }) => {
  return (
    <div className="thermal-box">
      <div id="sensors">{sensors}</div>
      <img src="images/thermalBox.png" alt="Thermal Box" className="thermal-box-img" />
    </div>
  );
};

export default ThermalBox;
