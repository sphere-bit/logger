import React, { useState, useEffect } from 'react';
import {
  convertToExcalidrawElements,
  Excalidraw,
  exportToBlob,
} from '@excalidraw/excalidraw';
import io from 'socket.io-client';
import { Button } from '@mui/material';
import { CompletedSinkImpl } from 'igniteui-react-core';

// Initialize socket connection
const socket = io('http://localhost:8081');

const Screen = () => {
  const [sensorTemps, setSensorTemps] = useState({});
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const [selectedSensors, setSelectedSensors] = useState([]);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const loadExcalidrawData = async () => {
      try {
        const response = await fetch('http://localhost:8081/get-excalidraw-data');

        if (!response.ok) {
          if (response.status === 404) {
            console.warn('Excalidraw data file does not exist. No data to load.');
            excalidrawAPI.updateScene({
              elements: [],
              appState: { collaborators: [] },
            });
          } else {
            console.error('Failed to load Excalidraw data, status:', response.status);
          }
          return;
        }

        const data = await response.json();
        if (data.elements && data.appState) {
          excalidrawAPI.updateScene(data);

          // Check which sensors are already on the board and update selectedSensors
          const initialSelectedSensors = data.elements
            .filter((element) => element.type === 'text')
            .map((element) => {
              const match = element.text.match(/^(\d+):/);
              return match ? `sensor${match[1]}` : null;
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
      } catch (error) {
        console.error('Error loading Excalidraw data:', error);
        excalidrawAPI.updateScene({
          elements: [],
          appState: { collaborators: [] },
        });
      }
    };

    if (excalidrawAPI) {
      loadExcalidrawData();
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
    // TODO: Fix upload and save image src to server and load image src.
    if (excalidrawAPI) {
      try {
        const elements = excalidrawAPI.getSceneElements();
        const appState = excalidrawAPI.getAppState();

        const imagePromises = elements
          .filter((element) => element.type === 'image')
          .map(async (imageElement) => {
            if (imageElement.fileId) {
              // If fileId is present, the image is not a direct data URL
              console.warn(
                `Image with fileId ${imageElement.fileId} found, skip processing.`
              );
              return;
            }

            const imageUrl = imageElement.src;
            if (imageUrl && imageUrl.startsWith('data:image/')) {
              // Extract image data URL and upload
              const blob = await fetch(imageUrl).then((res) => res.blob());
              const formData = new FormData();
              formData.append('file', blob, 'image.png'); // Use default filename

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

              const newImageUrl = await uploadResponse.text();
              imageElement.src = newImageUrl; // Update image URL in element
            }
          });

        await Promise.all(imagePromises);

        await fetch('http://localhost:8081/save-excalidraw-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ elements, appState }),
        });

        console.log('Drawing saved successfully');
      } catch (error) {
        console.error('Error saving drawing:', error);
      }
    }
  };

  return (
    <div style={{ height: `calc(100vh - 80px)` }}>
      <div>
        {['sensor1', 'sensor2', 'sensor3', 'sensor4'].map((sensorId) => (
          <Button
            key={sensorId}
            onClick={() => toggleSensor(sensorId)}
            variant={selectedSensors.includes(sensorId) ? 'contained' : 'outlined'}
          >
            {selectedSensors.includes(sensorId)
              ? `Remove ${sensorId}`
              : `Add ${sensorId}`}
          </Button>
        ))}
        <Button onClick={saveDrawing}>Save</Button>
      </div>
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={{
          elements: [],
          appState: { zenModeEnabled: true },
          scrollToContent: true,
        }}
      />
    </div>
  );
};

export default Screen;
