import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { List, ListItemButton, ListItemIcon, Box, Grid } from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CarIcon from '@mui/icons-material/DirectionsCar';
import PinIcon from '@mui/icons-material/Pin';
import LooksOneOutlinedIcon from '@mui/icons-material/LooksOneOutlined';
import Whiteboard from './Whiteboard';
import RightSidePanel from './RightSidePanel';

function CustomPanel(props) {
  const { children, position, ...other } = props;

  if (!position) return null;

  return (
    <div
      role='tabpanel'
      {...other}
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        border: '1px solid #ccc',
        borderRadius: 4,
        backgroundColor: '#fff',
        boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        visibility: position ? 'visible' : 'hidden',
      }}
    >
      <Box sx={{ p: 1 }}>{children}</Box>
    </div>
  );
}

CustomPanel.propTypes = {
  children: PropTypes.node,
  position: PropTypes.object, // { top: number, left: number }
};

export default function SideToolbar({ onItemSelect, onDragStart }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [panelPosition, setPanelPosition] = useState(null);
  const [draggingItem, setDraggingItem] = useState(null);
  const itemRefs = useRef([]);
  const dragImageRef = useRef(null);

  const handleItemClick = (index) => {
    if (selectedItem === index) {
      setSelectedItem(null); // Deselect if already selected
      setPanelPosition(null);
    } else {
      const itemRect = itemRefs.current[index]?.getBoundingClientRect();
      setPanelPosition({
        top: itemRect.top,
        left: itemRect.right + 10,
      });
      setSelectedItem(index);
      onItemSelect && onItemSelect(index);
    }
  };

  const handleClickOutside = (event) => {
    if (itemRefs.current.every((ref) => ref && !ref.contains(event.target))) {
      setSelectedItem(null);
      setPanelPosition(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDragStart = (event, type) => {
    // Create a placeholder image if not already created
    const img = document.createElement('img');
    if (!dragImageRef.current) {
      img.src = 'https://via.placeholder.com/150'; // Placeholder image URL
      img.style.width = '150px'; // Set dimensions
      img.style.height = '150px';
      img.style.position = 'absolute'; // Ensure it's positioned absolutely
      img.style.top = '-9999px'; // Position it off-screen
      document.body.appendChild(img);
      dragImageRef.current = img;
    }
    setDraggingItem(img.src);
    onDragStart && onDragStart(event, 'add');
  };
  useEffect(() => {
    const handleDragEnd = () => {
      if (dragImageRef.current) {
        document.body.removeChild(dragImageRef.current);
        dragImageRef.current = null;
      }
    };
  
    document.addEventListener('dragend', handleDragEnd);
    return () => {
      document.removeEventListener('dragend', handleDragEnd);
    };
  }, []);
  const handleIconClick = (event) => {
    event.preventDefault();
    const img = document.createElement('img');
    img.src = 'https://via.placeholder.com/150'; // Placeholder image URL
    img.className = 'drag-image';
    img.style.position = 'absolute';
    img.style.width = '150px';
    img.style.height = '150px';
    img.style.left = `${event.clientX}px`;
    img.style.top = `${event.clientY}px`;
    img.style.display = 'block'; // Show the image
    document.body.appendChild(img);
    setDraggingItem(img.src);

    // Optional: Notify parent component
    onDragStart && onDragStart(event, 'add');
  };

  return (
    <div className='flex-container'>
      <div className='side-toolbar'>
        <List>
          {['Numerics', 'Category', 'Assessment', 'Car'].map((text, index) => (
            <ListItemButton
              key={text}
              ref={(el) => (itemRefs.current[index] = el)}
              selected={selectedItem === index}
              onClick={() => handleItemClick(index)}
            >
              <ListItemIcon>
                {index === 0 && <PinIcon />}
                {index === 1 && <CategoryIcon />}
                {index === 2 && <AssessmentIcon />}
                {index === 3 && <CarIcon />}
              </ListItemIcon>
            </ListItemButton>
          ))}
        </List>
        {selectedItem === 0 && (
          <CustomPanel position={panelPosition}>
            Numerics
            <Grid container spacing={2}>
              <Grid item>
                <ListItemButton
                  draggable
                  ref={(el) => (itemRefs.current[0] = el)}
                  key={'Indicator'}
                  onDragStart={(e) => handleDragStart(e, 'add')}
                  onClick={handleIconClick} // Handle click for image creation
                  className='icon-container'
                >
                  <LooksOneOutlinedIcon />
                  Indicator
                </ListItemButton>
              </Grid>
            </Grid>
          </CustomPanel>
        )}
      </div>
      <Whiteboard
        className='whiteboard-container'
        draggedImage={draggingItem}
      />
      <RightSidePanel /*selectedElement={selectedElement}*/ />
    </div>
  );
}
