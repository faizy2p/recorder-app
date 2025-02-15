import React, { useState, useEffect } from "react";
// import { ReactMic } from "react-mic";
import axios from "axios";
import './App.css';
import { Toaster, toast } from 'react-hot-toast';
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const Recorder = () => {


  //********set base URL********
  const baseURL = "http://localhost:8080";


  const onStop = (recordedBlob) => {
    console.log("Recording saved:", recordedBlob);
  };

  const saveRecording = async () => {
    const formData = new FormData();
    console.log(recorderControls.recordingBlob)
    formData.append("file", recorderControls.recordingBlob, "recording.mp3");

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
      // fetchRecordings();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error('Error uploading audio!');
    }
  };

  const recorderControls = useAudioRecorder();
  return (
    <Row>
      <Col>
        <div style={{ width: '100%', height: '100%' }}>

          <h3>Voice notes</h3>
          <Card className="mt-4">
            <Card.Body>
              <div className="canvas-audio" >
                <div className="audio-recorder-component">
                  <Row className="w-100 d-column flex-column flex-lg-row justify-content-lg-center">
                    <Col lg={4} className="mb-4 mb-lg-0"> 
                      <AudioRecorder
                        onRecordingComplete={onStop}
                        recorderControls={recorderControls}
                      /></Col>
                    <Col lg={4}>
                      <Row className="d-flex justify-content-start flex-column flex-lg-row">
                        <Col className="mb-4 mb-lg-0">
                          <Button variant="warning" onClick={recorderControls.stopRecording} disabled={!recorderControls.isRecording}>Stop Recording</Button>
                        </Col>
                        <Col>
                          <Button variant="success" onClick={saveRecording} disabled={!recorderControls.recordingBlob}>Save Recording</Button>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </div>
              </div>
            </Card.Body>
          </Card>

        </div>
      </Col>
    </Row>

  );
};

export default Recorder;