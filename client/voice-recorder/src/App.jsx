import { useEffect, useState } from 'react';
import './App.css';
import Recorder from './Recorder';
import Camcorder from './Camcorder';
import { Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import AudioRecords from './AudioRecords';
import VideoRecords from './VideoRecords';

function App() {
  const [sessionId, setSessionId] = useState('');
  const [sessionCreated, setSessionCreated] = useState(false);


  const baseURL = 'http://localhost:8080';

  //create a session ID
  useEffect(() => {
    if (!sessionCreated) {
      getSessionId();
      setSessionCreated(true);
    }

  }, [sessionCreated]);

  const getSessionId = async () => {
    try {
      const response = await axios.get(`${baseURL}/session`);
      const newSessionId = response.data.sessionId;
      //console.log('newSessionId:', newSessionId);
      setSessionId(newSessionId);
      sessionStorage.setItem('sessionId', newSessionId);
      toast.success('Session ID created!');
    } catch (error) {
      console.error('Error getting session ID:', error);
      sessionStorage.setItem('sessionId', '');
      toast.error('Error getting session ID!');

    }
  };

  return (
    <>
      <div class="container">
        <div class="row">
          <div class="col">
            <Navbar />
            <Routes>
              {sessionId !== '' && <Route path="/" element={<Recorder />} />}
              {sessionId !== '' && <Route path="/camcorder" element={<Camcorder />} />}
              {sessionId !== '' && <Route path="/audio-records" element={<AudioRecords />} />}
              {sessionId !== '' && <Route path="/video-records" element={<VideoRecords />} />}
              {sessionId === '' && <Route path="/error" element={<Error />} />}
            </Routes>

            <Toaster />
          </div>
        </div>
      </div>
    </>
  )
}
export default App;
