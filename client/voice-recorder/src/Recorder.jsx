import React, { useState,useEffect } from "react";
import { ReactMic } from "react-mic";
import axios from "axios";
import './App.css';
import { Toaster, toast } from 'react-hot-toast';

const Recorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [getRecordsClicked, setGetRecordsClicked] = useState(false);
  const [recordings, setRecordings] = useState([]);
  //const [currentDirectory, setCurrentDirectory] = useState('');
  const [currentAudio, setCurrentAudio] = useState("");

  //********set base URL********
  const baseURL="http://localhost:8080";
  
  const startRecording = () => {
    setAudioBlob(null);
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const onData = (recordedBlob) => {
    console.log("Chunk of real-time data:", recordedBlob);
  };

  const onStop = (recordedBlob) => {
    setAudioBlob(recordedBlob);
    console.log("Recording saved:", recordedBlob);
  };

  const getRecordsClickedEvent = () => {
    setGetRecordsClicked(()=>!getRecordsClicked);
  };

   // Handle click on an audio file
   const handleAudioClick = (file) => {
    setCurrentAudio(`${baseURL}/uploads/${file}`);
    };

    useEffect(() => {
        fetchRecordings();
      }, []);
  
      const fetchRecordings = async () => {
        try {
          const response = await axios.get(`${baseURL}/getAll`);
          setRecordings(()=>response.data);
        } catch (error) {
          console.error('Error fetching recordings:', error);
        }
      };

  const deleteRecord = async(filename) => {
    try {
      const response = await axios.delete(`${baseURL}/delete/${filename}`);
      console.log('File deleted:', response.data);
      toast.success('File deleted successfully!');
      setRecordings(()=>recordings.filter((recording) => recording.filename !== filename));
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Error deleting file!');
    }
  };

  const saveRecording = async () => {
    const formData = new FormData();
    formData.append("file", audioBlob.blob, "recording.mp3");

    try {
      const response = await axios.post(`${baseURL}/upload/${sessionStorage.getItem('sessionId')}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "sessionId": sessionStorage.getItem('sessionId'),
        },
      });
      console.log("sess:", sessionStorage.getItem('sessionId'));
      console.log("File uploaded:", response.data);
      toast.success('Audio uploaded successfully!');
      fetchRecordings();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error('Error uploading audio!');
    }
  };


  return (
    <div style={{ width: '100%', height: '100%' }}>
      <button onClick={ getRecordsClickedEvent } className="margin-top-30" >records</button>
      <ul className="audio-list">
        { getRecordsClicked && (recordings.length > 0) ? (recordings.map((recording) => (
          <li className="audio-item-bullet"
            key={recording._id} onClick={() => handleAudioClick(recording.filename)}>
            {recording.filename}
            <button className="margin-30" onClick={()=>deleteRecord(recording.filename)}>delete</button>
          </li>)
        ) ): null
        }
      </ul>
      <br/>

      {currentAudio && (
        <div className="margin-top-30">
          <h3>Now Playing:</h3>
          <audio controls key={currentAudio}>
            <source src={currentAudio} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      <h1>Voice notes</h1>
      <div className="canvas-audio" >
        <ReactMic
          visualSetting="sinewave"
          record={isRecording}
          onStop={onStop}
          onData={onData}
          mimeType="audio/mp3"
          className="react-mic"
        />
      </div>
      <button onClick={startRecording} disabled={isRecording} className='margin-10' >
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!isRecording} className='margin-10' >
        Stop Recording
      </button>
      <button onClick={saveRecording} disabled={!audioBlob} className='margin-10' >Save Recording</button>
      
    </div>
  );
};

export default Recorder;