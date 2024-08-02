import React, { useState } from 'react';
import { TextField, Slider, Box, Button } from '@mui/material';

const drawerWidth = '20%';

const RightSidePanel = ({ selectedItem, onUpdateProperty }) => {
  const [property, setProperty] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProperty((prev) => ({ ...prev, [name]: value }));
    onUpdateProperty(name, value);
  };

  const handleImageUpload = () => {};
  const handleUploadClick = () => {
    // Open file input dialog
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          handleImageUpload(reader.result);
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };

  return (
    <Box
      sx={{
        position: 'relative',
        top: 0,
        right: 0,
        p: 1,
        width: drawerWidth,
        zIndex: 1200, // Ensure it's above other content
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {!selectedItem && 'No selection'}
      {selectedItem && (
        <>
          {selectedItem.key === 'image' && (
            <Button
              variant='contained'
              color='primary'
              onClick={handleUploadClick}
              sx={{ mb: 2 }}
            >
              Upload Image
            </Button>
          )}
          <TextField
            label='Name'
            name='name'
            value={property.name || ''}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label='Color'
            name='color'
            value={property.color || ''}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Slider
            name='size'
            value={property.size || 0}
            onChange={(_, value) =>
              handleChange({ target: { name: 'size', value } })
            }
            aria-labelledby='size-slider'
            valueLabelDisplay='auto'
            step={1}
            min={10}
            max={100}
            sx={{ mb: 2 }}
          />
        </>
      )}
    </Box>
  );
};

export default RightSidePanel;
