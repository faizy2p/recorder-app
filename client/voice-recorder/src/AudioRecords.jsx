
import { useEffect, useState } from "react";
import './App.css';
import axios from "axios";
import Button from 'react-bootstrap/Button';
import { Speaker } from 'react-feather';
import { Toaster, toast } from 'react-hot-toast';
import Alert from 'react-bootstrap/Alert';

const AudioRecords = () => {
    const [currentAudio, setCurrentAudio] = useState("");
    const [recordings, setRecordings] = useState([]);
    useEffect(() => {
        fetchRecordings();
    }, []);
    //********set base URL********
    const baseURL = "http://localhost:8080";
    // Handle click on an audio file
    const handleAudioClick = (path) => {
        setCurrentAudio(`${baseURL}/${path}`);
    };

    const deleteRecord = async (filename, sessionId) => {
        try {
            const response = await axios.delete(`${baseURL}/delete/${filename}`, {
                headers: {
                    "sessionId": sessionId,
                }
            });
            console.log('File deleted:', response.data);
            toast.success('File deleted successfully!');
            setRecordings(() => recordings.filter((recording) => recording.filename !== filename));
            setCurrentAudio('');
            fetchRecordings();
        } catch (error) {
            console.error('Error deleting file:', error);
            toast.error('Error deleting file!');
        }
    };

    const fetchRecordings = async () => {
        try {
            const response = await axios.get(`${baseURL}/getAll`);
            setRecordings(() => response.data);
        } catch (error) {
            console.error('Error fetching recordings:', error);
        }
    };
    return (
        <div className="row">
            <div className="col">
                <ul className="audio-list">
                    {(recordings.length > 0) ? (recordings.map((recording) => (
                        <li className="audio-item-bullet"
                            key={recording._id} onClick={() => handleAudioClick(recording.path)}>
                            <span className="me-2"><Speaker color="red" size={32} /></span> {recording.filename}
                            <Button className="margin-30" variant="danger" onClick={() => deleteRecord(recording.filename, recording.sessionID)}>delete</Button>
                        </li>)
                    )) : <Alert variant={'danger'}>
                        No records to display. Please add one.
                    </Alert>
                    }
                </ul>
                {currentAudio && (
                    <div className="margin-top-30">
                        <h3>Now Playing:</h3>
                        <audio controls key={currentAudio}>
                            <source src={currentAudio} type="audio/mpeg" />
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                )}
            </div>
        </div>
    );
}
export default AudioRecords;
