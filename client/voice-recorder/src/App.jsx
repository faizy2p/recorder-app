import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios';
import Recorder from './Recorder';
import Camcorder from './Camcorder';
import { Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';


function App() {
    return(
      <>
      <Navbar />
        <Routes>
          <Route path="/" element={<Recorder />} />
          <Route path="/camcorder" element={<Camcorder />} />
        </Routes>
      </>
    )
}
export default App;
