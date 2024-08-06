import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Box } from '@mui/material';
import '../index.css';

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderBottom: '1px solid #ddd',
        zIndex: 999,
        gap: 0, // No gap between buttons
      }}
    >
      <Button
        component={Link}
        to='/channels'
        sx={{
          textTransform: 'none',
          color: currentPath === '/channels' ? '#fff' : 'inherit',
          backgroundColor:
            currentPath === '/channels' ? '#007bff' : 'transparent',
          padding: '8px 16px',
          margin: 0,
          '&:hover': {
            textDecoration: 'none',
            backgroundColor: currentPath === '/channels' ? '#0056b3' : '#ddd',
          },
        }}
      >
        Channels
      </Button>
      <Box
        sx={{
          width: '1px',
          height: '24px', // Adjust height to fit the button
          backgroundColor: '#ddd',
          margin: '0 8px', // Adjust spacing around the separator
        }}
      />
      <Button
        component={Link}
        to='/logging'
        sx={{
          textTransform: 'none',
          color: currentPath === '/logging' ? '#fff' : 'inherit',
          backgroundColor:
            currentPath === '/logging' ? '#007bff' : 'transparent',
          padding: '8px 16px',
          margin: 0,
          '&:hover': {
            textDecoration: 'none',
            backgroundColor: currentPath === '/logging' ? '#0056b3' : '#ddd',
          },
        }}
      >
        Logging
      </Button>
      <Box
        sx={{
          width: '1px',
          height: '24px', // Adjust height to fit the button
          backgroundColor: '#ddd',
          margin: '0 8px', // Adjust spacing around the separator
        }}
      />
      <Button
        component={Link}
        to='/display'
        sx={{
          textTransform: 'none',
          color: currentPath === '/display' ? '#fff' : 'inherit',
          backgroundColor:
            currentPath === '/display' ? '#007bff' : 'transparent',
          padding: '8px 16px',
          margin: 0,
          '&:hover': {
            textDecoration: 'none',
            backgroundColor: currentPath === '/display' ? '#0056b3' : '#ddd',
          },
        }}
      >
        Display
      </Button>{' '}
      <Box
        sx={{
          width: '1px',
          height: '24px', // Adjust height to fit the button
          backgroundColor: '#ddd',
          margin: '0 8px', // Adjust spacing around the separator
        }}
      />
      <Button
        component={Link}
        to='/screen'
        sx={{
          textTransform: 'none',
          color: currentPath === '/screen' ? '#fff' : 'inherit',
          backgroundColor:
            currentPath === '/screen' ? '#007bff' : 'transparent',
          padding: '8px 16px',
          margin: 0,
          '&:hover': {
            textDecoration: 'none',
            backgroundColor: currentPath === '/screen' ? '#0056b3' : '#ddd',
          },
        }}
      >
        Screen
      </Button>
      <Box
        sx={{
          width: '1px',
          height: '24px', // Adjust height to fit the button
          backgroundColor: '#ddd',
          margin: '0 8px', // Adjust spacing around the separator
        }}
      />
      <Button
        component={Link}
        to='/canvas'
        sx={{
          textTransform: 'none',
          color: currentPath === '/canvas' ? '#fff' : 'inherit',
          backgroundColor:
            currentPath === '/canvas' ? '#007bff' : 'transparent',
          padding: '8px 16px',
          margin: 0,
          '&:hover': {
            textDecoration: 'none',
            backgroundColor: currentPath === '/canvas' ? '#0056b3' : '#ddd',
          },
        }}
      >
        Canvas
      </Button>
    </Box>
  );
};

export default Navbar;
