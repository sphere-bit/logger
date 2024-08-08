import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Grid,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import SingleChart from '../components/SingleChart.jsx';

// Configure your socket connection
const socket = io(`http://localhost:${8081}`);

const Channels = () => {
  const [sensorData, setSensorData] = useState({});
  const [sensorTemps, setSensorTemps] = useState({});
  const [selectedSensors, setSelectedSensors] = useState(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentSensor, setCurrentSensor] = useState(null);
  const [m, setM] = useState('');
  const [c, setC] = useState('');

  const [sensorSettings, setSensorSettings] = useState({});

  const [currentSensorName, setCurrentSensorName] = useState('');
  const [sensorNames, setSensorNames] = useState({});

  useEffect(() => {
    // Load sensor data from the server
    fetch('http://localhost:8081/load-sensor-data')
      .then((response) => response.json())
      .then((data) => {
        setSensorSettings(data);
        const names = {};
        Object.keys(data).forEach((sensor) => {
          names[sensor] = data[sensor].sensorName || 'Unset';
        });
        setSensorNames(names);
      })
      .catch((error) => console.error('Error loading sensor data:', error));

      
    // Event listener for receiving sensor data
    socket.on('serial-data', (dataString) => {
      const parsedData = parseSensorData(dataString);
      setSensorData((prevData) => {
        // Update existing data with new sensor readings
        const updatedData = { ...prevData };
        Object.keys(parsedData).forEach((channel) => {
          updatedData[channel] = parsedData[channel];
        });
        return updatedData;
      });
      setSensorTemps((prevTemps) => ({
        ...prevTemps,
        ...parsedData,
      }));
    });

    return () => {
      socket.off('serial-data');
    };
  }, []);

  const handleOpenDialog = (channel) => {
    setCurrentSensor(channel);
    setCurrentSensorName(sensorNames[channel] || '');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    const updatedSensorNames = {
      ...sensorNames,
      [currentSensor]: sensorSettings[currentSensor]?.sensorName || 'Unset',
    };

    setSensorNames(updatedSensorNames);
    const saveSensorData = () => {
      const updatedSensorData = {};
      Object.keys(sensorData).forEach((sensor) => {
        updatedSensorData[sensor] = {
          sensorName: updatedSensorNames[sensor] || 'Unset',
          m: sensorSettings[sensor]?.m || '',
          c: sensorSettings[sensor]?.c || '',
        };
      });
      console.log(updatedSensorData);

      // Save updated sensor data to the server
      fetch('http://localhost:8081/save-sensor-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSensorData),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message);
        })
        .catch((error) => console.error('Error saving sensor data:', error));
    };

    // Using setTimeout to ensure state is updated before saving data
    setTimeout(saveSensorData, 0);

    // Close the dialog
    setDialogOpen(false);
  };

  const parseSensorData = (dataString) => {
    const [date, time, ...temps] = dataString.split(',');
    const sensorData = {};
    temps.forEach((temp, index) => {
      const cleanedTemp = temp.trim().replace('°C', '');
      const temperature = parseFloat(cleanedTemp);
      sensorData[`ch${index + 1}`] = temperature;
    });
    return sensorData;
  };

  // Determine if a sensor is active (replace with your logic)
  const isSensorActive = (channel) => selectedSensors.has(channel);

  return (
    <div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Channel</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Temperature</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Settings</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(sensorData).map((channel) => (
              <TableRow key={channel}>
                <TableCell>{channel}</TableCell>
                <TableCell>{sensorNames[channel] || 'Unset'}</TableCell>
                <TableCell>{sensorData[channel]} °C</TableCell>
                <TableCell>{isSensorActive(channel) ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <IconButton
                    color='primary'
                    onClick={() => handleOpenDialog(channel)}
                    aria-label='settings'
                  >
                    <SettingsIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Custom Dialog */}
      <Dialog
        onClose={handleCloseDialog}
        open={dialogOpen}
        aria-labelledby='custom-dialog-title'
        fullWidth
        maxWidth='md'
      >
        <DialogTitle id='custom-dialog-title'>
          Configure {currentSensor}
          <IconButton
            aria-label='close'
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            Configure settings for {currentSensor}.
          </Typography>
          <TextField
            label='Sensor Name'
            variant='outlined'
            fullWidth
            value={sensorSettings[currentSensor]?.sensorName || ''} // Controlled input for sensor name from sensorSettings
            onChange={(e) =>
              setSensorSettings((prevSettings) => ({
                ...prevSettings,
                [currentSensor]: {
                  ...prevSettings[currentSensor],
                  sensorName: e.target.value,
                },
              }))
            }
            sx={{ marginBottom: 2 }}
          />
          <Box
            sx={{
              width: '100%',
              maxWidth: '500px',
              height: '300px',
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid black',
            }}
          >
            <SingleChart
              sensorTemps={sensorTemps}
              currentSensor={currentSensor}
              m={m}
              c={c}
            />
          </Box>
          <Typography variant='h6'>Linear Calibration</Typography>
          <Box
            sx={{
              border: '1px solid #ccc',
              padding: 1,
              borderRadius: 1,
              backgroundColor: '#f5f5f5',
              maxWidth: '300px',
            }}
          >
            <Typography variant='h6' gutterBottom sx={{ fontStyle: 'italic' }}>
              y =
              <TextField
                variant='outlined'
                size='small'
                placeholder='m'
                sx={{ width: '80px', margin: '0 8px' }}
                value={sensorSettings[currentSensor]?.m || ''} // Value for m from sensorSettings
                onChange={(e) =>
                  setSensorSettings((prevSettings) => ({
                    ...prevSettings,
                    [currentSensor]: {
                      ...prevSettings[currentSensor],
                      m: e.target.value,
                    },
                  }))
                }
              />
              x +
              <TextField
                variant='outlined'
                size='small'
                placeholder='c'
                sx={{ width: '80px', margin: '0 8px' }}
                value={sensorSettings[currentSensor]?.c || ''} // Value for m from sensorSettings
                onChange={(e) =>
                  setSensorSettings((prevSettings) => ({
                    ...prevSettings,
                    [currentSensor]: {
                      ...prevSettings[currentSensor],
                      c: e.target.value,
                    },
                  }))
                }
              />
            </Typography>
            <Typography variant='body2' gutterBottom>
              Where:
            </Typography>
            <Grid container spacing={0.5}>
              <Grid item xs={2}>
                <Typography variant='body2'>
                  <span style={{ fontStyle: 'italic' }}>y</span>
                </Typography>
              </Grid>
              <Grid item xs={1}>
                <Typography variant='body2'>=</Typography>
              </Grid>
              <Grid item xs={9}>
                <Typography variant='body2'>output</Typography>
              </Grid>

              <Grid item xs={2}>
                <Typography variant='body2'>
                  <span style={{ fontStyle: 'italic' }}>m</span>
                </Typography>
              </Grid>
              <Grid item xs={1}>
                <Typography variant='body2'>=</Typography>
              </Grid>
              <Grid item xs={9}>
                <Typography variant='body2'>gradient</Typography>
              </Grid>

              <Grid item xs={2}>
                <Typography variant='body2'>
                  <span style={{ fontStyle: 'italic' }}>x</span>
                </Typography>
              </Grid>
              <Grid item xs={1}>
                <Typography variant='body2'>=</Typography>
              </Grid>
              <Grid item xs={9}>
                <Typography variant='body2'>input</Typography>
              </Grid>

              <Grid item xs={2}>
                <Typography variant='body2'>
                  <span style={{ fontStyle: 'italic' }}>c</span>
                </Typography>
              </Grid>
              <Grid item xs={1}>
                <Typography variant='body2'>=</Typography>
              </Grid>
              <Grid item xs={9}>
                <Typography variant='body2'>y-intercept</Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCloseDialog}>
            Save changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Channels;
