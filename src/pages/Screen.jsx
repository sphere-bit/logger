import React, { useState } from 'react';
import SideToolbar from '../components/SideToolbar';
import RightSidePanel from '../components/RightSidePanel';
import Whiteboard from '../components/Whiteboard';
import { Box, IconButton } from '@mui/material';
import ArrowLeftOutlinedIcon from '@mui/icons-material/ArrowLeftOutlined';
import ArrowRightOutlinedIcon from '@mui/icons-material/ArrowRightOutlined';

const Screen = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedElement, setSelectedElement] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [draggedImage, setDraggedImage] = useState(null);

  const handleTabChange = (tabIndex) => {
    setSelectedTab(tabIndex);
  };

  return (
    <div className='flex-container'>
      <SideToolbar onTabChange={handleTabChange} />
    </div>
  );
};

export default Screen;
