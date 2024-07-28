import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.js';
import io from 'socket.io-client';
import SidePanel from '../components/SidePanel.js';
import ThermalBox from '../components/ThermalBox.js';
import ChartTemperature from '../components/ChartTemperature.js';
import FileSaver from 'file-saver';

const socket = io('http://localhost:8081');

const Display = () => {
  const [data, setData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [sensorTemps, setSensorTemps] = useState({});
  const [selectedSensors, setSelectedSensors] = useState(new Set());

  useEffect(() => {
    socket.on('serial-data', (dataString) => {
      const parsedData = parseSensorData(dataString);
      console.log(dataString);
      setSensorTemps((prevTemps) => ({ ...prevTemps, ...parsedData }));
    });

    return () => {
      socket.off('serial-data');
    };
  }, []);

  const parseSensorData = (dataString) => {
    const [date, time, ...temps] = dataString.split(',');
    const sensorData = {};
    temps.forEach((temp, index) => {
      const cleanedTemp = temp.trim().replace('°C', '');
      const temperature = parseFloat(cleanedTemp);
      sensorData[`sensor${index + 1}`] = temperature;
    });
    return sensorData;
  };

  const handleAdjustPositions = () => {
    // Implement adjust positions logic
  };

  const handleResetPositions = () => {
    // Implement reset positions logic
  };

  const handleToggleLogging = () => {
    setIsLogging(!isLogging);
    if (!isLogging && fileName) {
      const blob = new Blob([JSON.stringify(data)], {
        type: 'text/plain;charset=utf-8',
      });
      FileSaver.saveAs(blob, `${fileName}.txt`);
    }
  };

  return (
    <div>
      <h2>Display</h2>
      {/* <Navbar /> */}
      <div className='flex-container'>
        <SidePanel
          onAdjustPositions={handleAdjustPositions}
          onResetPositions={handleResetPositions}
          onToggleLogging={handleToggleLogging}
          fileName={fileName}
          setFileName={setFileName}
        />
        <ThermalBox sensors={data} />
      </div>
      <ChartTemperature data={data} />
    </div>
  );
};

export default Display;
