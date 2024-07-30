import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

// Configure your socket connection
const socket = io(`http://localhost:${8081}`);

const Channels = () => {
  const [sensorData, setSensorData] = useState({});
  const [selectedSensors, setSelectedSensors] = useState(new Set()); // Replace with your method of tracking active sensors

  useEffect(() => {
    // Event listener for receiving sensor data
    socket.on('serial-data', (dataString) => {
      const parsedData = parseSensorData(dataString);
      setSensorData((prevData) => {
        // Update existing data with new sensor readings
        const updatedData = { ...prevData };
        Object.keys(parsedData).forEach(sensorName => {
          updatedData[sensorName] = parsedData[sensorName];
        });
        return updatedData;
      });
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

  // Determine if a sensor is active (replace with your logic)
  const isSensorActive = (sensorName) => selectedSensors.has(sensorName);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Sensor Name</TableCell>
            <TableCell>Temperature</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(sensorData).map((sensorName) => (
            <TableRow key={sensorName}>
              <TableCell>{sensorName}</TableCell>
              <TableCell>{sensorData[sensorName]} °C</TableCell>
              <TableCell>{isSensorActive(sensorName) ? 'Yes' : 'No'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Channels;
