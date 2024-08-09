import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Box } from '@mui/material';
import '../index.css';
import Logger from './Logger';

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: '#f0f0f0',
        borderBottom: '1px solid #ddd',
        zIndex: 999,
        p: 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
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
      </Box>
      <Logger />
    </Box>
  );
};

export default Navbar;
