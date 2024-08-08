import React, { useState, useEffect } from 'react';
import {
  convertToExcalidrawElements,
  Excalidraw,
  exportToBlob,
  WelcomeScreen,
} from '@excalidraw/excalidraw';
import io from 'socket.io-client';
import { Box, Button, Grid, IconButton, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
// Initialize socket connection
const socket = io('http://localhost:8081');

const Screen = () => {
  const [sensorTemps, setSensorTemps] = useState({});
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const [selectedSensors, setSelectedSensors] = useState([]);
  const [initialData, setInitialData] = useState({
    elements: [],
    appState: { collaborators: [] },
  });
  const [sensorOptions, setSensorOptions] = useState([
    'sensor1',
    'sensor2',
    'sensor3',
    'sensor4',
  ]);
  const [newTagSensor, setNewTagSensor] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const dataResponse = await fetch(
          'http://localhost:8081/get-excalidraw-data'
        );
        if (!dataResponse.ok) {
          if (dataResponse.status === 404) {
            console.warn(
              'Excalidraw data file does not exist. No data to load.'
            );
            if (excalidrawAPI) {
              excalidrawAPI.updateScene({
                elements: [],
                appState: { collaborators: [] },
              });
            }
          } else {
            console.error(
              'Failed to load Excalidraw data, status:',
              dataResponse.status
            );
          }
          return;
        }

        const excalidrawData = await dataResponse.json();
        if (
          excalidrawData.elements &&
          excalidrawData.appState &&
          excalidrawData.appState.files
        ) {
          // Update initial data with combined elements and files
          console.log(Object.values(excalidrawData.appState.files));
          excalidrawAPI.addFiles(Object.values(excalidrawData.appState.files));
          setInitialData({
            elements: excalidrawData.elements,
            appState: excalidrawData.appState,
          });

          if (excalidrawAPI) {
            excalidrawAPI.updateScene({
              elements: excalidrawData.elements,
              appState: excalidrawData.appState,
            });
          }

          // Check which sensors are already on the board and update selectedSensors
          const initialSelectedSensors = excalidrawData.elements
            .filter((element) => element.type === 'text')
            .map((element) => {
              const match = element.text.match(/^(\d+):/);
              return match ? `sensor${match[1]}` : null;
            })
            .filter(Boolean);

          setSelectedSensors(initialSelectedSensors);
        } else {
          console.error('Invalid data format received from server');
          if (excalidrawAPI) {
            excalidrawAPI.updateScene({
              elements: [],
              appState: { collaborators: [] },
            });
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        if (excalidrawAPI) {
          excalidrawAPI.updateScene({
            elements: [],
            appState: { collaborators: [] },
          });
        }
      }
    };

    if (excalidrawAPI) {
      loadData();
    }
  }, [excalidrawAPI]);

  useEffect(() => {
    const handleSensorData = (dataString) => {
      const parsedData = parseSensorData(dataString);
      setSensorTemps((prevTemps) => ({ ...prevTemps, ...parsedData }));

      if (excalidrawAPI) {
        const elements = excalidrawAPI.getSceneElements();
        const updatedElements = updateElements(elements, parsedData);
        excalidrawAPI.updateScene({ elements: updatedElements });
      }
    };

    socket.on('serial-data', handleSensorData);

    return () => {
      socket.off('serial-data', handleSensorData);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [excalidrawAPI]);

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

  const updateElements = (elements, sensorData) => {
    return elements.map((element) => {
      if (element.type === 'text') {
        const match = element.text.match(/^(\d+):/);
        if (match) {
          const sensorId = `sensor${match[1]}`;
          if (sensorData[sensorId] !== undefined) {
            return {
              ...element,
              text: `${match[1]}: ${sensorData[sensorId].toFixed(2)}°C`,
            };
          }
        }
      }
      return element;
    });
  };

  const addSensorElement = (sensorId) => {
    if (excalidrawAPI) {
      const elements = excalidrawAPI.getSceneElements();
      const match = sensorId.match(/\d+/);
      const sensorNumber = match ? parseInt(match[0], 10) : null;
      const newElementSkeleton = {
        type: 'text',
        x: 100,
        y: 100 + sensorNumber * 50,
        text: `${sensorNumber}: ${
          parseFloat(sensorTemps[sensorId]).toFixed(2) || 'Loading...'
        }`,
        fontSize: 20,
        width: 100,
        height: 30,
        angle: 0,
        id: `sensor-${sensorId}`,
        groupIds: [],
      };
      const newElement = convertToExcalidrawElements([newElementSkeleton])[0];
      const updatedElements = [...elements, newElement];
      excalidrawAPI.updateScene({ elements: updatedElements });
    }
  };

  const removeSensorElement = (sensorId) => {
    if (excalidrawAPI) {
      const elements = excalidrawAPI.getSceneElements();

      // Convert sensorId to the format used in the element's text (e.g., "1:" for "sensor1")
      const match = sensorId.match(/\d+/);
      if (match) {
        const sensorNumber = match[0];

        // Filter out the elements whose text starts with the corresponding sensor number
        const updatedElements = elements.filter((element) => {
          if (element.type === 'text') {
            const elementMatch = element.text.match(/^(\d+):/);
            if (elementMatch && elementMatch[1] === sensorNumber) {
              return false; // Remove this element
            }
          }
          return true; // Keep this element
        });

        excalidrawAPI.updateScene({ elements: updatedElements });
      }
    }
  };

  const toggleSensor = (sensorId) => {
    setSelectedSensors((prevSelected) =>
      prevSelected.includes(sensorId)
        ? prevSelected.filter((id) => id !== sensorId)
        : [...prevSelected, sensorId]
    );

    if (selectedSensors.includes(sensorId)) {
      removeSensorElement(sensorId);
    } else {
      addSensorElement(sensorId);
    }
  };

  const saveDrawing = async () => {
    if (excalidrawAPI) {
      try {
        const elements = excalidrawAPI.getSceneElements();
        const appState = excalidrawAPI.getAppState();
        const files = excalidrawAPI.getFiles();
        const imagePromises = elements
          .filter((element) => element.type === 'image')
          .map(async (el) => {
            if (el.fileId) {
              const imageUrl = files[el?.fileId]?.dataURL;
              if (imageUrl && imageUrl.startsWith('data:image/')) {
                const blob = await fetch(imageUrl).then((res) => res.blob());
                const formData = new FormData();
                formData.append('file', blob, `${el.fileId}.png`);
                const uploadResponse = await fetch(
                  'http://localhost:8081/upload-image',
                  {
                    method: 'POST',
                    body: formData,
                  }
                );
                if (!uploadResponse.ok) {
                  throw new Error('Failed to upload image');
                }
              }
            }
          });

        await Promise.all(imagePromises);

        const filesToSend = {};
        Object.keys(files).forEach((fileId) => {
          filesToSend[fileId] = {
            mimeType: files[fileId].mimeType,
            id: fileId,
            dataURL: `http://localhost:8081/images/${fileId}.png`,
            lastRetrieved: Date.now(),
            created: Date.now(),
          };
        });

        appState.files = filesToSend;

        await fetch('http://localhost:8081/save-excalidraw-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ elements, appState }),
        });
        window.alert('Saved');
      } catch (error) {
        console.error('Error saving drawing:', error);
      }
    }
  };

  return (
    <div style={{ height: `calc(100vh - 80px)` }}>
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={initialData}
        renderTopRightUI={() => {
          return (
            <>
              <Box>
                Sensor
                <Box display='flex' flexDirection='column'>
                  <Grid container spacing={1}>
                    {['sensor1', 'sensor2'].map((sensorId) => (
                      <Grid item xs={6} key={sensorId}>
                        <button
                          key={sensorId}
                          onClick={() => toggleSensor(sensorId)}
                        >
                          <Box display='flex' alignItems='center'>
                            {selectedSensors.includes(sensorId) ? (
                              <>
                                <RemoveIcon
                                  fontSize='small'
                                  sx={{ marginRight: '4px' }}
                                />
                                {sensorId.replace(/^sensor/, '')}
                              </>
                            ) : (
                              <>
                                <AddIcon
                                  fontSize='small'
                                  sx={{ marginRight: '4px' }}
                                />
                                {sensorId.replace(/^sensor/, '')}
                              </>
                            )}
                          </Box>
                        </button>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>
              <Button color='primary' onClick={saveDrawing}>
                <SaveIcon />
                Save
              </Button>
            </>
          );
        }}
      ><WelcomeScreen /></Excalidraw>
    </div>
  );
};

export default Screen;
