import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Channels from './pages/Channels.jsx';
import Logging from './pages/Logging.jsx';
import Display from './pages/Display.jsx';
import Navbar from './components/Navbar.jsx';
import Screen from './pages/Screen.jsx';

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
          <Route path='/screen' element={<Screen />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
