#!/usr/bin/env node
import express, { json } from 'express';
import fs from 'fs';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import Mime from 'mime';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // frontend port
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.static(join(__dirname, 'public')));
app.use(express.static(join(__dirname, 'src')));
app.use(express.json());
app.use('/images', express.static(join(__dirname, 'public', 'images')));
app.use(
  json({
    limit: '20mb',
  })
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'images')); // Save images to /public/images directory
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original file name
  },
});
const upload = multer({ storage });

const PORT = process.env.PORT || 8081;

// TODO: Auto-detect usb serial port
// const findSerialPort = async () => {
//   const ports = await SerialPort.list();
//   if (ports.length === 0) {
//     throw new Error('No serial ports found');
//   }
//   // Customize the logic to identify the correct port if needed
//   // For example, you can filter by manufacturer or path
//   const portInfo = ports.find((port) => port.manufacturer || port.path);
//   if (!portInfo) {
//     throw new Error('No suitable serial port found');
//   }
//   console.log(portInfo.path);
//   return portInfo.path;
// };

// findSerialPort();

const port = new SerialPort({
  path: 'COM4',
  baudRate: 115200,
});

const parser = port.pipe(new ReadlineParser({ delimeter: '\r\n' }));
parser.on('data', (data) => {
  console.log('Received data:', data);
  io.emit('serial-data', data);
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/src/display.html');
});

app.get('/navbar', (req, res) => {
  res.sendFile(__dirname + '/public/navbar.html');
});

app.get('/channels', (req, res) => {
  res.sendFile(__dirname + '/src/channels.html');
});

app.get('/logging', (req, res) => {
  res.sendFile(__dirname + '/src/logging.html');
});

app.get('/display', (req, res) => {
  res.sendFile(__dirname + '/src/display.html');
});

app.get('/chart.min.js', (req, res) => {
  res.sendFile(__dirname + '/chart.min.js');
});

app.get('/readings', async (req, res) => {
  try {
  } catch (error) {
    console.error('Error fetching sensor readings:', error);
    res.status(500).send('Error fetching sensor readings');
  }
});

app.get('/temperature', async (req, res) => {
  try {
  } catch (error) {
    console.error('Error fetching temperature:', error);
    res.status(500).send('Error fetching temperature');
  }
});

// EventSource for client events
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Example event sent to client
  res.write('data: hello!\n\n');

  // Close the response to the client
  res.end();
});

// Endpoint to serve the positions.json file
app.get('/positions.json', (req, res) => {
  fs.readFile(join(__dirname, 'src', 'positions.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Failed to load positions');
    }
    res.send(data);
  });
});

// Endpoint to save the positions
app.post('/save-positions', (req, res) => {
  const newPositions = req.body;
  console.log('saved');
  fs.readFile(join(__dirname, 'src', 'positions.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Failed to read positions file');
    }

    let positions = {};

    try {
      positions = JSON.parse(data);
    } catch (jsonError) {
      return res.status(500).send('Invalid JSON format in positions file');
    }

    // Update or add positions
    for (const key in newPositions) {
      if (positions[key]) {
        // If the key exists, update the existing entry
        positions[key].top = newPositions[key].top;
        positions[key].left = newPositions[key].left;
      } else {
        // If the key does not exist, add it
        positions[key] = newPositions[key];
      }
    }

    fs.writeFile(
      join(__dirname, 'src', 'positions.json'),
      JSON.stringify(positions, null, 2),
      (err) => {
        if (err) {
          return res.status(500).send('Failed to save positions');
        }
        res.send('Positions saved successfully');
      }
    );
  });
});

app.post('/save-data', (req, res) => {
  const { data, directory } = req.body;

  const savePath = join(__dirname, 'src', directory, 'sensorData.json');
  fs.writeFile(savePath, JSON.stringify({ data }, null, 2), 'utf8', (err) => {
    if (err) {
      return res.status(500).send('Failed to save sensor data');
    }
    res.send('Sensor data saved successfully');
  });
});

app.post('/save-excalidraw-data', (req, res) => {
  const { elements, appState } = req.body;

  // Check for required properties
  if (!elements || !appState) {
    return res.status(400).send('Invalid data format');
  }

  // Ensure collaborators is an array
  if (!Array.isArray(appState.collaborators)) {
    appState.collaborators = [];
  }

  const data = { elements, appState };
  const filePath = join(__dirname, 'src', 'excalidraw_data.json');

  fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Failed to save Excalidraw data:', err);
      return res.status(500).send('Failed to save Excalidraw data');
    }
    res.send('Excalidraw data saved successfully');
  });
});

app.get('/get-excalidraw-data', (req, res) => {
  const filePath = join(__dirname, 'src', 'excalidraw_data.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File does not exist, return empty data
        return res.json({
          elements: [],
          appState: { collaborators: [] },
          files: [],
        });
      } else {
        console.error('Failed to load Excalidraw data:', err);
        return res.status(500).send('Failed to load Excalidraw data');
      }
    }

    try {
      const parsedData = JSON.parse(data);

      // Ensure appState.collaborators is an array
      if (!Array.isArray(parsedData.appState.collaborators)) {
        parsedData.appState.collaborators = [];
      }

      res.json(parsedData);
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError);
      res.status(500).send('Invalid JSON format in Excalidraw data file');
    }
  });
});

app.get('/get-images', (req, res) => {
  const imagesDir = path.join(__dirname, 'public', 'images');

  fs.readdir(imagesDir, (err, files) => {
    if (err) {
      return res.status(500).send('Error reading images directory');
    }

    const imageFiles = files.map((file) => {
      const filePath = path.join(imagesDir, file);
      const mimeType = Mime.getType(filePath);
      const fileId = path.basename(file, path.extname(file));

      // Convert the image to a data URL
      const dataURL = `data:${mimeType};base64,${fs.readFileSync(
        filePath,
        'base64'
      )}`;
      return { fileId, mimeType, dataURL };
    });

    res.json(imageFiles);
  });
});

// Route to handle image uploads
app.post('/upload-image', upload.single('file'), (req, res) => {
  const imageUrl = `/images/${req.file.filename}`;
  res.send(imageUrl);
});

// Save sensor names to a JSON file
app.post('/save-sensor-data', (req, res) => {
  const sensorData = req.body;
  console.log(sensorData);
  const filePath = path.join(__dirname, 'src', 'sensor_data.json');

  fs.writeFile(filePath, JSON.stringify(sensorData, null, 2), (err) => {
    if (err) {
      console.error('Error saving sensor data:', err);
      return res.status(500).json({ message: 'Failed to save sensor data.' });
    }
    res.json({ message: 'Sensor names saved successfully!' });
  });
});

// Load sensor names from the JSON file
app.get('/load-sensor-data', (req, res) => {
  const filePath = path.join(__dirname, 'src', 'sensor_data.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error loading sensor data:', err);
      return res.status(500).json({ message: 'Failed to load sensor data.' });
    }
    res.json(JSON.parse(data));
  });
});

io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
