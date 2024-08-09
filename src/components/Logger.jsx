import { parse, unparse } from 'papaparse';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { saveAs } from 'file-saver';
import { Box, Button, IconButton, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

const socket = io(`http://localhost:${8081}`);

const Logger = () => {
  const [sensorTemps, setSensorTemps] = useState({});
  const [onSocket, setOnSocket] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (onSocket) {
      socket.on('serial-data', (dataString) => {
        const parsedData = parseSensorData(dataString);
        setSensorTemps((prevTemps) => ({ ...prevTemps, ...parsedData }));
        updateCSV(parsedData);
      });
    } else {
      socket.off('serial-data');
    }

    return () => {
      socket.off('serial-data');
    };
  }, [onSocket]);

  const parseSensorData = (dataString) => {
    const [date, time, ...temps] = dataString.split(',');
    const sensorData = { timestamp: `${date} ${time}` }; // Added timestamp
    temps.forEach((temp, index) => {
      const cleanedTemp = temp.trim().replace('°C', '');
      const temperature = parseFloat(cleanedTemp);
      sensorData[`ch${index + 1}`] = temperature;
    });
    return sensorData;
  };

  const handleToggle = async () => {
    if (onSocket) {
      // Stop data logging
      setOnSocket(false);
    } else {
      // Start data logging
      if (!selectedFile) {
        // Prompt user to save the file first
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const newFileName = `sensordata_${timestamp}.csv`;
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: newFileName,
          types: [
            { description: 'CSV Files', accept: { 'text/csv': ['.csv'] } },
          ],
        });
        setFileName(newFileName);
        setSelectedFile(fileHandle);
      }
      setOnSocket(true);
    }
  };

  const updateCSV = async (parsedData) => {
    if (!selectedFile) return alert('Please select a file first.');
    if (Object.keys(parsedData).length === 0) return;

    const fileHandle = selectedFile;
    const writer = await fileHandle.createWritable();

    const reader = new FileReader();
    reader.onload = async () => {
      let existingData = [];
      let fields = [];

      // Read existing data from file
      if (reader.result) {
        const csvContent = reader.result;
        const result = parse(csvContent, {
          header: true,
          skipEmptyLines: true,
        });
        existingData = result.data;
        fields = result.meta.fields || [];
      }

      // Check and update fields based on new data
      const newFields = Object.keys(parsedData);
      const newRow = newFields.map((field) => parsedData[field] || '');

      // Add any new fields that are not already in the existing fields list
      newFields.forEach((field) => {
        if (!fields.includes(field)) {
          fields.push(field);
        }
      });

      // Append new row to existing data
      existingData.push(
        newRow.reduce((obj, value, index) => {
          obj[fields[index]] = value;
          return obj;
        }, {})
      );

      // Convert to CSV
      const csv = unparse({ fields, data: existingData });
      console.log(csv);
      // Write the updated CSV to the file
      await writer.write(csv);
      await writer.close();
    };

    reader.readAsText(await fileHandle.getFile());
  };

  return (
    <Box display={'flex'} alignItems='center'>
      <Button onClick={handleToggle} variant="contained" color="primary" startIcon={onSocket ? <PauseIcon /> : <PlayArrowIcon />}>
        <Typography variant="button">
          {onSocket ? 'Pause' : 'Run'}
        </Typography>
      </Button>
    </Box>
  );
};

export default Logger;
