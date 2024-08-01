import React, { useState } from 'react';
import {
  Drawer,
  TextField,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const drawerWidth = '20%';

const RightSidePanel = ({
  selectedElement,
  onUpdateProperty,
}) => {
  const [property, setProperty] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProperty((prev) => ({ ...prev, [name]: value }));
    onUpdateProperty(name, value);
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
      {!selectedElement && ('No selection')}
      {selectedElement && (
        <>
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
