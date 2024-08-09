import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Channels from './pages/Channels.jsx';
import Logging from './pages/Logging.jsx';
import Display from './pages/Display.jsx';
import Navbar from './components/Navbar.jsx';
import Screen from './pages/Screen.jsx';
import Canvas from './pages/Canvas.tsx';

const App = () => {
  return (
    <div className='app'>
      <BrowserRouter>
        <Navbar />
        <div className='content'>
          <Routes>
            <Route path='/' element={<Logging />} />
            <Route path='/channels' element={<Channels />} />
            <Route path='/logging' element={<Logging />} />
            <Route path='/display' element={<Display />} />
            <Route path='/screen' element={<Screen />} />
            {/* <Route path='/canvas' element={<Canvas />} /> */}
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
};

export default App;
