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

  const [isSavingData, setIsSavingData] = useState(false);
  const [fileHandle, setFileHandle] = useState(null);
  const [sensorData, setSensorData] = useState([]);

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
      // console.log(dataString);
      setSensorTemps((prevTemps) => ({ ...prevTemps, ...parsedData }));
      plotTemperature(parsedData);
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
      savePositions(positions);
    }
    setIsAdjustingPositions(!isAdjustingPositions);
  };

  const handleSensorClick = (id) => {
    console.log(`clicked ${id}`);
    setSelectedSensors((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  };

  const plotTemperature = (sensorData) => {
    const seriesData = Array.from(selectedSensors).map((sensorKey) => {
      const sensorName = sensorKey.replace('b', 'sensor');
      return {
        name: sensorName,
        data: data.map(([time, temps]) => [time, temps[sensorName]]),
        type: 'line',
        color: '#FF0000', // You can set a color here
      };
    });

    setData(seriesData);
  };

  const savePositions = async (data) => {
    try {
      const response = await fetch('http://localhost:8081/save-positions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const result = await response.text();
      console.log('Positions saved:', result);
    } catch (error) {
      console.error('Error saving positions:', error);
    }
  };

  const resetSensorPositions = () => {
    if (
      window.confirm('Are you sure you want to reset the sensor positions?')
    ) {
      // Calculate new positions based on default positions
      const updatedPositions = {};
      Array.from({ length: 43 }, (_, index) => {
        updatedPositions[`b${index + 1}`] = {
          top: index * 16, // Update top value based on index
          left: 0, // Default left value
        };
      });

      setPositions(updatedPositions);
      savePositions(updatedPositions);
    } else {
      console.log('Reset canceled');
    }
  };

  const collectSensorData = (dataString) => {
    setSensorData((prevData) => [...prevData, dataString]);
  };

  const saveDataToFile = async () => {
    if (!fileHandle) {
      console.error('No file handle available. Cannot save data.');
      return;
    }
    try {
      const writableStream = await fileHandle.createWritable();
      await writableStream.write(sensorData.join('\n'));
      await writableStream.close();
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const startSavingData = async () => {
    const fileName =
      document.getElementById('file-name').value.trim() ||
      `sensordata_${new Date().toISOString().replace(/[:.-]/g, '_')}.txt`;
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: 'Text files',
            accept: {
              'text/plain': ['.txt'],
            },
          },
        ],
      });
      setIsSavingData(true);
      document.getElementById('toggle-save-button').textContent =
        'Pause Logging to File';
      setFileHandle(handle);
      setSensorData([]); // Clear previous data
      socket.on('serial-data', collectSensorData);
    } catch (error) {
      console.error('Error selecting file:', error);
    }
  };

  const stopSavingData = async () => {
    setIsSavingData(false);
    document.getElementById('toggle-save-button').textContent =
      'Start Logging to File';
    socket.off('serial-data', collectSensorData);
    saveDataToFile();
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
      <button id='reset-button' onClick={resetSensorPositions}>
        Reset Positions
      </button>
      <input id='file-name' type='text' placeholder='Enter file name' />
      <button
        id='toggle-save-button'
        onClick={() => {
          if (isSavingData) {
            stopSavingData();
          } else {
            startSavingData();
          }
        }}
      >
        Start Logging to File
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
            onClick={() => handleSensorClick(`b${index + 1}`)}
          />
        ))}
      </div>
      <ChartTemperature
        sensorTemps={sensorTemps}
        selectedSensors={Array.from(selectedSensors)}
      />
    </div>
  );
};

export default Display;
