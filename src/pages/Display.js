import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import FileSaver from 'file-saver';
import SidePanel from '../components/SidePanel.js';
import ThermalBox from '../components/ThermalBox.js';
import ChartTemperature from '../components/ChartTemperature.js';
import SensorItem from '../components/SensorItem.js';
import useDraggable from '../hooks/useDraggable.js';

const socket = io(`http://localhost:${8081}`);

const Display = () => {
  const [data, setData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [sensorTemps, setSensorTemps] = useState({});
  const [selectedSensors, setSelectedSensors] = useState(new Set());
  const [isAdjustingPositions, setIsAdjustingPositions] = useState(false);
  const { positions, setPositions, onMouseDown } =
    useDraggable(isAdjustingPositions);

  useEffect(() => {
    // Load initial positions
    const loadPositions = async () => {
      try {
        const response = await fetch('http://localhost:8081/positions.json');
        const text = await response.text();
        try {
          const positions = JSON.parse(text);
          setPositions(positions);
        } catch (jsonError) {
          console.error('Failed to parse JSON:', jsonError);
          console.log('Response text:', text);
        }
      } catch (fetchError) {
        console.error('Failed to fetch positions:', fetchError);
      }
    };

    loadPositions();
    socket.on('serial-data', (dataString) => {
      const parsedData = parseSensorData(dataString);
      console.log(dataString);
      setSensorTemps((prevTemps) => ({ ...prevTemps, ...parsedData }));
    });

    return () => {
      socket.off('serial-data');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleToggleLogging = () => {
    setIsLogging(!isLogging);
    if (!isLogging && fileName) {
      const blob = new Blob([JSON.stringify(data)], {
        type: 'text/plain;charset=utf-8',
      });
      FileSaver.saveAs(blob, `${fileName}.txt`);
    }
  };

  const handleAdjustPositions = () => {
    if (isAdjustingPositions) {
      savePositions();
    }
    setIsAdjustingPositions(!isAdjustingPositions);
  };

  const savePositions = () => {
    fetch(`http://localhost:8081/save-positions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(positions),
    })
      .then((response) => response.text())
      .then((data) => console.log('saved'))
      .catch((error) => console.error('Error:', error));
  };

  return (
    <div>
      <h2>Display</h2>
      <button
        id='toggle-button'
        onClick={() => {
          handleAdjustPositions();
        }}
      >
        {isAdjustingPositions
          ? 'Lock Sensor Positions'
          : 'Adjust Sensor Positions'}
      </button>
      <button
        id='reset-button'
        onClick={() => {
          if (alert('Are you sure you want to reset the sensor positions?')) {
            // resetSensorPositions();
          }
        }}
      >
        Reset Positions
      </button>
      <div className='flex-container'>
        <SidePanel
          onToggleLogging={handleToggleLogging}
          fileName={fileName}
          setFileName={setFileName}
        />
        <ThermalBox sensors={data} />
      </div>
      <div
        className='sensor-container'
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {Array.from({ length: 43 }, (_, index) => (
          <SensorItem
            key={index}
            id={`b${index + 1}`}
            temperature={sensorTemps[`sensor${index + 1}`]}
            top={positions[`b${index + 1}`]?.top || index * 15}
            left={positions[`b${index + 1}`]?.left || 0}
            onMouseDown={
              isAdjustingPositions
                ? (e) => onMouseDown(e, `b${index + 1}`)
                : null
            }
          />
        ))}
      </div>
      <ChartTemperature data={data} />
    </div>
  );
};

export default Display;
