import React, { useRef, useState,useEffect } from 'react';
import axios from 'axios';
import './App.css';

const Camcorder = () => {
  const videoRef = useRef(null);
  const [currentVideo, setCurrentVideo] = useState('');
  const [closePlayback, setClosePlayback] = useState(false);
  const videoplayRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [getRecordsClicked, setGetRecordsClicked] = useState(false);
  const [recordings, setRecordings] = useState([]);

  //********set base URL********
  const baseURL="http://localhost:8080";

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = stream;
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing media devices:', err);
    }
  };

  // Stop recording
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    const tracks = videoRef.current.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    setIsRecording(false);
  };

  // Upload recorded video to the backend
  const uploadVideo = async () => {
    if (recordedChunks.length === 0) {
      alert('No video recorded.');
      return;
    }

    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const formData = new FormData();
    formData.append('video', blob, 'recording.webm');

    try {
        const response = await axios.post(`${baseURL}/video-upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log("File uploaded:", response.data);
      fetchRecordings();
    } catch (err) {
      console.error('Error uploading video:', err);
    }
  };

  const getRecordsClickedEvent = () => {
    //fetchRecordings();
    setGetRecordsClicked(() => !getRecordsClicked);
    };

  useEffect(() => {
          fetchRecordings();
        }, [getRecordsClicked]);

  // Get all recordings
    const fetchRecordings = async () => {
        try {
        const response = await axios.get(`${baseURL}/getAllVideo`);
        setRecordings(response.data);
        } catch (error) {
        console.error('Error fetching recordings:', error);
        }
    };

    // Handle click on a video file
    const handleVideoClick = (file) => {
        setCurrentVideo(`${baseURL}/video-uploads/${file}`);
    };

    useEffect(() => {
        if (videoplayRef.current && currentVideo) {
            videoplayRef.current.src = currentVideo;
        }
    }, [currentVideo]);

    const closePlaybackEvent = () => {
        setClosePlayback(()=>!closePlayback);
    };

    const deleteRecord = async(filename) => {
        try {
          const response = await axios.delete(`${baseURL}/deleteVideo/${filename}`);
          console.log('File deleted:', response.data);
          setRecordings(()=>recordings.filter((recording) => recording.filename !== filename));
        } catch (error) {
          console.error('Error deleting file:', error);
        }
        };

return (
    <div>
        <button onClick={getRecordsClickedEvent} className="margin-top-30" >records</button>
        <ul className="audio-list">
            {getRecordsClicked && recordings.length > 0 ? (
                recordings.map((recording) => (
                    <li
                        className="audio-item-bullet"
                        key={recording._id}
                        onClick={(e) => {
                            if (e.target.tagName !== 'BUTTON') {
                                handleVideoClick(recording.filename);
                            }
                        }}
                    >
                        {recording.filename}
                        <button
                            className="margin-30"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteRecord(recording.filename);
                            }}
                        >
                            delete
                        </button>
                    </li>
                ))
            ) : null}
        </ul>
        {currentVideo ? (
            <>
                <div>
                    <video
                        ref={videoplayRef}
                        controls
                        width="320"
                        height="240"
                        style={{ borderRadius: '10px', border: '2px solid white' }}
                    ></video>
                </div>
            </>
        ) : null}

        <h1>Camcorder</h1>
        {
            <video
                ref={videoRef}
                autoPlay
                muted
                width="320"
                height="240"
                style={{ borderRadius: '10px', border: '2px solid white' }}
            ></video>
        }
        <div>
            {!isRecording ? (
                <button onClick={startRecording} className='margin-10' >Start Recording</button>
            ) : (
                <button onClick={stopRecording} className='margin-10' >Stop Recording</button>
            )}
            <button onClick={uploadVideo} disabled={isRecording || recordedChunks.length === 0} className='margin-10' >
                Upload Video
            </button>
        </div>
    </div>
);
};

export default Camcorder;