import React, { useRef, useState,useEffect } from 'react';
import axios from 'axios';
import './App.css';
import ReactPlayer from 'react-player';
import { Toaster, toast } from 'react-hot-toast';

const Camcorder = () => {
  const videoRef = useRef(null);
  const [currentVideo, setCurrentVideo] = useState('');
  const [closePlayback, setClosePlayback] = useState(false);
  const playerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [getRecordsClicked, setGetRecordsClicked] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [isSeeking, setIsSeeking] = useState(false);


  //********set base URL********
  const baseURL="http://localhost:8080";

 
  // Start recording
  const startRecording = async () => {
    try {
      setRecordedChunks([])
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
        const response = await axios.post(`${baseURL}/video-upload/${sessionStorage.getItem('sessionId')}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data',
          'sessionId': sessionStorage.getItem('sessionId'),
         }, 
      });
      console.log("sess:", sessionStorage.getItem('sessionId'));
      console.log("File uploaded:", response.data);
      toast.success('Video uploaded successfully!');
      fetchRecordings();
    } catch (err) {
      console.error('Error uploading video:', err);
      toast.error('Error uploading video!');
    }
  };

  const getRecordsClickedEvent = () => {
    //fetchRecordings();
    setGetRecordsClicked(() => !getRecordsClicked);
    };

  useEffect(() => {
    if (getRecordsClicked) {
          fetchRecordings();
        }
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
    const handleVideoClick = (path) => {
      const url = `${baseURL}/${path}`;
      console.log(url)
        setCurrentVideo(url);
    };

    // useEffect(() => {
    //     if (videoplayRef.current && currentVideo) {
    //         videoplayRef.current.src = currentVideo;
    //     }
    // }, [currentVideo]);

    const closePlaybackEvent = () => {
        setClosePlayback(()=>!closePlayback);
    };

    const deleteRecord = async(filename) => {
        try {
          const response = await axios.delete(`${baseURL}/deleteVideo/${filename}`);
          console.log('File deleted:', response.data);
          toast.success('File deleted successfully!');
          setRecordings(()=>recordings.filter((recording) => recording.filename !== filename));
          if(currentVideo == `${baseURL}/video-uploads/${sessionStorage.getItem('sessionId')}/${filename}`)
            setCurrentVideo('');
        } catch (error) {
          console.error('Error deleting file:', error);
        }
        };

        const fastForward = async () => {
          if (playerRef.current) {
            setIsSeeking(true);
            playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10, 'seconds');
            setIsSeeking(false);
          }
        };
      
        const fastBackward = async () => {
          if (playerRef.current) {
            setIsSeeking(true);
            await playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10, 'seconds');
            setIsSeeking(false);
          }
        };

        // const handleDoubleClick = (e) => {
        //   e.stopPropagation();
        //   e.preventDefault();
        //   const playerWidth = playerRef.current.wrapper.clientWidth;
        //   const clickPositionX = e.clientX;
            
        //   if (clickPositionX < playerWidth / 2) {
        //     fastBackward();
        //   } else {
        //     fastForward();
        //   }
        // };

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
                                handleVideoClick(recording.path);
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
            <div className="player-wrapper">
            <ReactPlayer ref={playerRef} url={currentVideo} controls className="react-player" />
            <button onClick={fastBackward} className="overlay-button rewind-button">Rewind 10s</button>
            <button onClick={fastForward} className="overlay-button forward-button">Forward 10s</button>
            {isSeeking && <div className="loading-overlay">seeking..</div>}
          </div>
            </>
        ) : null}

        <h1>Video Recorder</h1>
        {
            <video
                ref={videoRef}
                autoPlay
                muted
                width="320"
                height="240"
                className="video-player-container"
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