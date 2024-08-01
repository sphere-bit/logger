import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import RectangleIcon from '@mui/icons-material/Rectangle';
import CircleIcon from '@mui/icons-material/Circle';
import TriangleIcon from '@mui/icons-material/ChangeHistory';
import AddGraphIcon from '@mui/icons-material/ShowChart';
import CarIcon from '@mui/icons-material/DirectionsCar';

const CategoryDrawer = ({ open, onClose, selectedTab }) => {
  const getDrawerContent = () => {
    switch (selectedTab) {
      case 0:
        return (
          <List>
            <ListItemButton>
              <ListItemIcon><CategoryIcon /></ListItemIcon>
              <ListItemText primary="Add Image" />
            </ListItemButton>
            {/* Add more options as needed */}
          </List>
        );
      case 1:
        return (
          <List>
            <ListItemButton>
              <ListItemIcon><RectangleIcon /></ListItemIcon>
              <ListItemText primary="Rectangle" />
            </ListItemButton>
            <ListItemButton>
              <ListItemIcon><CircleIcon /></ListItemIcon>
              <ListItemText primary="Circle" />
            </ListItemButton>
            <ListItemButton>
              <ListItemIcon><TriangleIcon /></ListItemIcon>
              <ListItemText primary="Triangle" />
            </ListItemButton>
          </List>
        );
      case 2:
        return (
          <List>
            <ListItemButton>
              <ListItemIcon><AddGraphIcon /></ListItemIcon>
              <ListItemText primary="Add Graph" />
            </ListItemButton>
          </List>
        );
      case 3:
        return (
          <List>
            <ListItemButton>
              <ListItemIcon><CarIcon /></ListItemIcon>
              <ListItemText primary="Fuel Gauge" />
            </ListItemButton>
          </List>
        );
      default:
        return null;
    }
  };

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
    >
      {getDrawerContent()}
    </Drawer>
  );
};

export default CategoryDrawer;
