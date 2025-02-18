import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Toaster, toast } from 'react-hot-toast';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const Camcorder = () => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);


  //********set base URL********
  const baseURL = "http://localhost:8080";


  // Start recording
  const startRecording = async () => {
    try {
      setRecordedChunks([]);
      const stream = await navigator.mediaDevices.getUserMedia({ video:{frameRate:15} , audio: true});
      videoRef.current.srcObject = stream;
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9', bitsPerSecond: 500000 });

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
        headers: {
          'Content-Type': 'multipart/form-data',
          'sessionId': sessionStorage.getItem('sessionId'),
        },
      });
      console.log("sess:", sessionStorage.getItem('sessionId'));
      console.log("File uploaded:", response.data);
      toast.success('Video uploaded successfully!');
      setRecordedChunks([]);
    } catch (err) {
      console.error('Error uploading video:', err);
      toast.error('Error uploading video!');
    }
  };

  return (
    <div>

      <h3>Video Recorder</h3>
      <Card className="mt-4">
        <Card.Body>
          <div className="canvas-audio" >
            <div className="audio-recorder-component flex-column align-items-center">
              <Row className="w-50 video-capture d-column flex-column flex-lg-row justify-content-lg-center">
                <Col className="mb-4 mb-lg-0 video-capture-video">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    width="320"
                    height={isRecording ? 240 : 0}
                    className="video-player-container"
                  ></video></Col>
              </Row>
              <Row className="w-50">

                <Col className="mb-4 mb-lg-0">
                  <Button variant="primary" onClick={startRecording} disabled={isRecording}>Start Recording</Button>
                </Col>
                <Col className="mb-4 mb-lg-0">
                  <Button variant="warning" onClick={stopRecording} disabled={!isRecording}>Stop Recording</Button>
                </Col>
                <Col>
                  <Button variant="success" onClick={uploadVideo} disabled={isRecording || recordedChunks.length === 0}>Upload Video</Button>
                </Col>
              </Row>
            </div>
          </div>
        </Card.Body>
      </Card>


    </div>
  );
};

export default Camcorder;