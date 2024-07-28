import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Channels from './pages/Channels.js';
import Logging from './pages/Logging.js';
import Display from './pages/Display.js';

const App = () => {
  return (
    <div className='app'>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Display />} />
          <Route path='/channels' component={<Channels/>} />
          <Route path='/logging' component={<Logging/>} />
          <Route path='/display' component={<Display/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
