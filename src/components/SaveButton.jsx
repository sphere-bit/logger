import { unparse } from 'papaparse';
import { useState } from 'react';
import { saveAs } from 'file-saver';
import { Button, IconButton, TextField } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SaveIcon from '@mui/icons-material/Save';

const SaveButton = ({ sensorTemps, selectedFile, setSelectedFile }) => {
  const [csvName, setCsvName] = useState('sensordata.csv');

  const transformData = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (data && typeof data === 'object') {
      // Convert object to array of rows
      return Object.keys(data).map((key) => {
        const row = { ...data[key], timestamp: key }; // Include timestamp if needed
        return row;
      });
    }

    return []; // Return an empty array if data is not valid
  };

  const handleSave = () => {
    try {
      console.log(sensorTemps);
      const transformedData = transformData(sensorTemps);
      const csvContent = unparse(transformedData, { header: true });
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

      // Use File System Access API for modern browsers
      if (window.showSaveFilePicker) {
        window
          .showSaveFilePicker({
            suggestedName: csvName,
            types: [
              {
                description: 'CSV Files',
                accept: { 'text/csv': ['.csv'] },
              },
            ],
          })
          .then((handle) => handle.createWritable())
          .then((writable) => writable.write(blob))
          .then((writable) => writable.close())
          .then(() => {
            setSelectedFile({ name: csvName }); // Update selectedFile to allow Play button to be enabled
          });
      } else {
        // Fallback for older browsers
        saveAs(blob, csvName);
        setSelectedFile({ name: csvName }); // Update selectedFile to allow Play button to be enabled
      }
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Failed to save the file. Please try again.');
    }
  };

  return (
    <div>
      {/* Logger */}
      {/* <Input
        type='file'
        onChange={handleFileChange}
        accept='.csv'
        style={{ display: 'none' }}
        id='file-input'
      />
      <SaveButton
        sensorTemps={sensorTemps}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
      />
      <Button
        component='label'
        role={undefined}
        variant='contained'
        tabIndex={-1}
        startIcon={<CloudUploadIcon />}
      >
        Upload .CSV
        <VisuallyHiddenInput type='file' />
      </Button> */}''
      <TextField
        type='text'
        value={csvName}
        onChange={(e) => setCsvName(e.target.value)}
        placeholder='Enter filename.csv'
        variant='outlined'
        size='small'
      />
      <IconButton
        variant='contained'
        onClick={handleSave}
      >
        <SaveIcon />
      </IconButton>
    </div>
  );
};

export default SaveButton;
