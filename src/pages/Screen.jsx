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
  const [sensorSettings, setSensorSettings] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Fetch sensor data
  useEffect(() => {
    const fetchSensorData = () => {
      return fetch('http://localhost:8081/load-sensor-data')
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to load sensor data');
          }
          return response.json();
        })
        .then((data) => {
          setSensorSettings(data);
        })
        .catch((error) => {
          console.error('Error fetching sensor data:', error);
        });
    };

    fetchSensorData().then(() => setDataLoaded(true));
  }, []);

  // Load Excalidraw data after sensor data is fetched
  useEffect(() => {
    const loadData = () => {
      if (!dataLoaded || !excalidrawAPI) return;

      return fetch('http://localhost:8081/get-excalidraw-data')
        .then((response) => {
          if (!response.ok) {
            if (response.status === 404) {
              console.warn(
                'Excalidraw data file does not exist. No data to load.'
              );
              excalidrawAPI.updateScene({
                elements: [],
                appState: { collaborators: [] },
              });
            } else {
              throw new Error('Failed to load Excalidraw data');
            }
          }
          return response.json();
        })
        .then((excalidrawData) => {
          if (
            excalidrawData.elements &&
            excalidrawData.appState &&
            excalidrawData.appState.files
          ) {
            excalidrawAPI.addFiles(
              Object.values(excalidrawData.appState.files)
            );
            setInitialData({
              elements: excalidrawData.elements,
              appState: excalidrawData.appState,
            });

            excalidrawAPI.updateScene({
              elements: excalidrawData.elements,
              appState: excalidrawData.appState,
            });

            const initialSelectedSensors = excalidrawData.elements
              .filter((element) => element.type === 'text')
              .map((element) => {
                const sensorName = Object.keys(sensorSettings).find(
                  (sensorId) =>
                    sensorSettings[sensorId]?.name ===
                    element.text.split(':')[0]
                );
                return sensorName || null;
              })
              .filter(Boolean);

            setSelectedSensors(initialSelectedSensors);
          } else {
            console.error('Invalid data format received from server');
            excalidrawAPI.updateScene({
              elements: [],
              appState: { collaborators: [] },
            });
          }
        })
        .catch((error) => {
          console.error('Error loading data:', error);
          excalidrawAPI.updateScene({
            elements: [],
            appState: { collaborators: [] },
          });
        });
    };

    loadData();
  }, [dataLoaded, excalidrawAPI]);

  // Handle sensor data updates
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
  }, [dataLoaded, excalidrawAPI]);

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

  const updateElements = (elements, sensorData) => {
    return elements.map((element) => {
      if (element.type === 'text') {
        const sensorName = Object.keys(sensorSettings).find(
          (sensorId) =>
            sensorSettings[sensorId]?.name === element.text.split(':')[0]
        );
        if (sensorName && sensorData[sensorName] !== undefined) {
          return {
            ...element,
            text: `${sensorSettings[sensorName]?.name}: ${sensorData[
              sensorName
            ].toFixed(2)}°C`,
          };
        }
      }
      return element;
    });
  };

  const addSensorElement = (sensorId) => {
    if (excalidrawAPI) {
      const elements = excalidrawAPI.getSceneElements();
      const sensorName = sensorSettings[sensorId]?.name;
      const newElementSkeleton = {
        type: 'text',
        x: 100,
        y: 100 + Object.keys(sensorSettings).indexOf(sensorId) * 50,
        text: `${sensorName}: ${
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
      const sensorName = sensorSettings[sensorId]?.name;
      const updatedElements = elements.filter((element) => {
        if (element.type === 'text') {
          return !element.text.startsWith(sensorName);
        }
        return true;
      });
      excalidrawAPI.updateScene({ elements: updatedElements });
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
                    {Object.keys(sensorSettings).map((sensorId) => (
                      <Grid item xs={10} md={12} xl={6} key={sensorId}>
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
                                {sensorSettings[sensorId]?.name}
                              </>
                            ) : (
                              <>
                                <AddIcon
                                  fontSize='small'
                                  sx={{ marginRight: '4px' }}
                                />
                                {sensorSettings[sensorId]?.name}
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
      >
        <WelcomeScreen />
      </Excalidraw>
    </div>
  );
};

export default Screen;
