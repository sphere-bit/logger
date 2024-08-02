import React, { useEffect, useState } from 'react';
import { TLComponents, Tldraw, useEditor, useEditorComponents, useValue } from 'tldraw';
import 'tldraw/tldraw.css';
import Navbar from '../components/Navbar';
import io from 'socket.io-client';

// Initialize socket connection
const socket = io(`http://localhost:${8081}`);

const components: TLComponents = {
  OnTheCanvas: () => {
    const editor = useEditor();
    const [sensorTemps, setSensorTemps] = useState({});

    // Get rendering shapes
    const renderingShapes = useValue(
      'rendering shapes',
      () => editor.getRenderingShapes().filter(() => true),
      [editor]
    );

    // Get ShapeIndicator component
    const { ShapeIndicator } = useEditorComponents();
    if (!ShapeIndicator) return null;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      // Handle incoming sensor data
      const handleSensorData = (dataString) => {
        const parsedData = parseSensorData(dataString);
        setSensorTemps((prevTemps) => ({ ...prevTemps, ...parsedData }));
      };

      socket.on('serial-data', handleSensorData);

      return () => {
        socket.off('serial-data', handleSensorData);
      };
    }, []);

    // Function to parse sensor data
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

    // Update shape text with sensor temperature
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      renderingShapes.forEach(({ id, shape }, index) => {
        console.log(index);
        const sensorId = `sensor${index}`;
        const sensorTemp = sensorTemps[sensorId];
        if (sensorTemp !== undefined) {
          editor.updateShape({
            id: shape.id,
            type: shape.type,
            props: {
              text: `${sensorTemp}°C`, // Update text with sensor temperature
            },
          });
        }
      });
    }, [sensorTemps, renderingShapes, editor]);

    return (
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 9999 }}>
        {renderingShapes.map(({ id }) => (
          <ShapeIndicator
            key={id + '_indicator'}
            shapeId={id}
          />
        ))}
      </div>
    );
  },
};

export default function Canvas() {
  return (
    <div style={{ position: 'fixed', inset: 0, height: `calc(100% - 68px)` }}>
      <Navbar />
      <Tldraw
        components={components}
        onMount={(editor) => {
          if (editor.getCurrentPageShapeIds().size === 0) {
            editor.createShapes([
              {
                type: 'geo',
                x: 100,
                y: 100,
                props: { w: 300, h: 300, text: '' }, // Initialize with empty text
              },
              {
                type: 'geo',
                x: 500,
                y: 150,
                props: { w: 300, h: 300, text: '' }, // Initialize with empty text
              },
              {
                type: 'geo',
                x: 100,
                y: 500,
                props: { w: 300, h: 300, text: '' }, // Initialize with empty text
              },
              {
                type: 'geo',
                x: 500,
                y: 500,
                props: { w: 300, h: 300, text: '' }, // Initialize with empty text
              },
            ]);
          }
        }}
      />
    </div>
  );
}
