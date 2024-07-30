import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Channels from './pages/Channels.js';
import Logging from './pages/Logging.js';
import Display from './pages/Display.js';
import Navbar from './components/Navbar.js';

const App = () => {
  return (
    <div className='app'>
      <BrowserRouter>
        <Navbar></Navbar>
        <Routes>
          <Route path='/' element={<Display />} />
          <Route path='/channels' element={<Channels />} />
          <Route path='/logging' element={<Logging />} />
          <Route path='/display' element={<Display />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
