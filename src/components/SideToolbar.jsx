import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { List, ListItemButton, ListItemIcon, Box, Grid } from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import ImageIcon from '@mui/icons-material/Image';
import LooksOneOutlinedIcon from '@mui/icons-material/LooksOneOutlined';
import SquareIcon from '@mui/icons-material/Square'; // Import square icon
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
        left: position.left - 10,
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
      img.src =
        type === 'square'
          ? 'data:image/svg+xml;base64,' +
            btoa(
              '<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg"><rect width="150" height="150" fill="blue"/></svg>'
            )
          : 'https://via.placeholder.com/150';
      img.style.width = '150px'; // Set dimensions
      img.style.height = '150px';
      img.style.position = 'absolute'; // Ensure it's positioned absolutely
      img.style.top = '-9999px'; // Position it off-screen
      document.body.appendChild(img);
      dragImageRef.current = img;
    }
    setDraggingItem(img.src);
  };

  const handleIconClick = (event, type) => {
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
    img.style.pointerEvents = 'none'; // Disable pointer events so it doesn't block the mouse events
    document.body.appendChild(img);

    const moveAt = (pageX, pageY) => {
      img.style.left = `${pageX - img.width / 2}px`;
      img.style.top = `${pageY - img.height / 2}px`;
    };

    moveAt(event.pageX, event.pageY);

    const onMouseMove = (event) => {
      moveAt(event.pageX, event.pageY);
    };

    const onMouseUp = (event) => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      // Trigger a custom drop event
      const dropEvent = new MouseEvent('drop', {
        clientX: event.clientX,
        clientY: event.clientY,
        bubbles: true,
        cancelable: true,
      });

      const whiteboard = document.querySelector('.whiteboard');
      if (whiteboard) {
        whiteboard.dispatchEvent(dropEvent);
      }

      // Update the dragging state
      setDraggingItem(img.src);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
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

  return (
    <div className='flex-container'>
      <div className='side-toolbar'>
        <List>
          {['Category', 'Image', 'Shapes'].map((text, index) => (
            <ListItemButton
              key={text}
              ref={(el) => (itemRefs.current[index] = el)}
              selected={selectedItem === index}
              onClick={() => handleItemClick(index)}
            >
              <ListItemIcon>
                {index === 0 && <CategoryIcon />}
                {index === 1 && <ImageIcon />}
                {index === 2 && <SquareIcon />} {/* Square icon for Shapes */}
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
                  key={'indicator'}
                  onDragStart={(e) => handleDragStart(e, 'add')}
                  onClick={(e) => handleIconClick(e, 'add')} // Handle click for image creation
                  className='icon-container'
                >
                  <LooksOneOutlinedIcon />
                  Indicator
                </ListItemButton>
              </Grid>
            </Grid>
          </CustomPanel>
        )}
        {selectedItem === 1 && (
          <CustomPanel position={panelPosition}>
            Shapes
            <Grid container spacing={2}>
              <Grid item>
                <ListItemButton
                  draggable
                  ref={(el) => (itemRefs.current[1] = el)}
                  key={'image'}
                  onDragStart={(e) => handleDragStart(e, 'image')}
                  onClick={(e) => handleIconClick(e, 'image')} // Handle click for image creation
                  className='icon-container'
                >
                  <ImageIcon />
                  Image
                </ListItemButton>
              </Grid>
              <Grid item>
                <ListItemButton
                  draggable
                  ref={(el) => (itemRefs.current[2] = el)}
                  key={'square'}
                  onDragStart={(e) => handleDragStart(e, 'square')}
                  onClick={(e) => handleIconClick(e, 'square')}
                  className='icon-container'
                >
                  <SquareIcon />
                  Square
                </ListItemButton>
              </Grid>
            </Grid>
          </CustomPanel>
        )}
      </div>
      <Whiteboard
        className='whiteboard-container'
        draggedItem={draggingItem}
      />
    </div>
  );
}
