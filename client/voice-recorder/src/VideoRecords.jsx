
import { useEffect, useState, useRef } from "react";
import './App.css';
import axios from "axios";
import ReactPlayer from 'react-player';
import Button from 'react-bootstrap/Button';
import { Video } from 'react-feather';
import { Toaster, toast } from 'react-hot-toast';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const VideoRecords = () => {
    const [currentVideo, setCurrentVideo] = useState('');
    const [isSeeking, setIsSeeking] = useState(false);
    const playerRef = useRef(null);
    const [recordings, setRecordings] = useState([]);

    //********set base URL********
    const baseURL = "http://localhost:8080";

    useEffect(() => {
        fetchRecordings();
    }, []);

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

    const deleteRecord = async (filename, sessionId) => {
        try {
            const response = await axios.delete(`${baseURL}/deleteVideo/${filename}`, {
                headers: {
                    "sessionId": sessionId
                },
            });
            console.log('File deleted:', response.data);
            toast.success('File deleted successfully!');
            setRecordings(() => recordings.filter((recording) => recording.filename !== filename));
            setCurrentVideo('');
            fetchRecordings();
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
    return (
        <div className="row">
            <div className="col">
                <ul className="audio-list">
                    {recordings.length > 0 ? (
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
                                <Row className="w-100">
                                    <Col lg={8} className="col-12">
                                        <span className="me-2"><Video color="red" size={32} /></span> {recording.filename}{recording.filename}
                                    </Col>
                                    <Col lg={4} className="col-12 mt-2 mt-lg-0 col-lg-4">
                                        <Button className="margin-30" variant="danger" onClick={(e) => {
                                            e.stopPropagation();
                                            deleteRecord(recording.filename, recording.sessionID);
                                        }
                                        }>delete</Button>
                                    </Col>
                                </Row>

                            </li>
                        ))
                    ) : <Alert variant={'danger'}>
                        No records to display. Please add one.
                    </Alert>}
                </ul>
                {currentVideo ? (
                    <>
                        <div className="player-wrapper position-relative">
                            <ReactPlayer ref={playerRef} url={currentVideo} controls className="react-player" />
                            <button onClick={fastBackward} className="overlay-button rewind-button">Rewind 10s</button>
                            <button onClick={fastForward} className="overlay-button forward-button">Forward 10s</button>
                            <Button className="close-btn-player" variant="danger" onClick={() => setCurrentVideo('')}>Close</Button>
                            {isSeeking && <div className="loading-overlay">seeking..</div>}
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}
export default VideoRecords;
