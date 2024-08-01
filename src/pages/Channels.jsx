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

  useEffect(() => {
    // Event listener for receiving sensor data
    socket.on('serial-data', (dataString) => {
      const parsedData = parseSensorData(dataString);
      setSensorData((prevData) => {
        // Update existing data with new sensor readings
        const updatedData = { ...prevData };
        Object.keys(parsedData).forEach((sensorName) => {
          updatedData[sensorName] = parsedData[sensorName];
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

  const handleOpenDialog = (sensorName) => {
    setCurrentSensor(sensorName);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

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
    <div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sensor Name</TableCell>
              <TableCell>Temperature</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Settings</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(sensorData).map((sensorName) => (
              <TableRow key={sensorName}>
                <TableCell>{sensorName}</TableCell>
                <TableCell>{sensorData[sensorName]} °C</TableCell>
                <TableCell>
                  {isSensorActive(sensorName) ? 'Yes' : 'No'}
                </TableCell>
                <TableCell>
                  <IconButton
                    color='primary'
                    onClick={() => handleOpenDialog(sensorName)}
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
          <Box
            sx={{
              width: '100%', // Adjust the width as needed
              maxWidth: '500px', // Max width of the box
              height: '300px', // Fixed height for the graph container
              overflow: 'hidden', // Hide any overflow
              position: 'relative', // For positioning child elements
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
                value={m}
                onChange={(e) => setM(e.target.value)}
              />
              x +
              <TextField
                variant='outlined'
                size='small'
                placeholder='c'
                sx={{ width: '80px', margin: '0 8px' }}
                value={c}
                onChange={(e) => setC(e.target.value)}
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
