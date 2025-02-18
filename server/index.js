import express from 'express';
import cors from 'cors';
import multer from 'multer';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import session from 'express-session';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());

const port = 8080;
const connection_string = "mongodb://localhost:27017/voice-recorder";

//create session
app.use(session({
  secret: 'top-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

//endpoint to generate session
app.get('/session', (req, res) => {
  const sessionId1 = req.sessionID;
  req.session.sessionId = sessionId1;
  req.session.userId = sessionId1;
  createUploadFolders(sessionId1);
  res.json({ sessionId: sessionId1 });
  //console.log('Session ID:', sessionId1);
  //console.log('req sess:'+req.session.userId);
  //console.log('req-og sess:'+req.session.userId);
});

function createUploadFolders(sessionId1) {
  var dirAudio = `./uploads/${sessionId1}`;
  var dirVideo = `./video-uploads/${sessionId1}`;
  //Create uploads folder if not existing
  if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
  }
  if (!fs.existsSync('./video-uploads')) {
    fs.mkdirSync('./video-uploads');
  }
  if (!fs.existsSync(dirAudio)) {
    fs.mkdirSync(dirAudio);
  }
  if (!fs.existsSync(dirVideo)) {
    fs.mkdirSync(dirVideo);
  }
}

//expose uploads folders
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/video-uploads', express.static(path.join(__dirname, 'video-uploads')));

//endpoint delete
app.delete('/delete/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const result = await Recording.deleteOne({ filename: filename });
    fs.unlink(`uploads/${req.headers.sessionid}/${filename}`, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        return;
      }
      console.log('File deleted successfully from uploads');
      res.status(200).json({ message: "Recording deleted successfully!" });
    });

  }
  catch (err) {
    res.status(500).json({ error: "Error deleting recording" });
  }
});
//expose server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
//
// Middleware
app.use(express.json());

// MongoDB connection
mongoose.connect(connection_string);

const recordingSchema = new mongoose.Schema({
  filename: String,
  path: String,
  sessionID: String,
});

const recordingSchemaV = new mongoose.Schema({
  filename: String,
  path: String,
  sessionID: String,
});

//schema for voice recording
const Recording = mongoose.model("Recording", recordingSchema);
//schema for video recording
const Video = mongoose.model("Video", recordingSchemaV);

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `uploads/${req.headers.sessionid}`);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
//getAll endpoint
app.get("/getAll", async (req, res) => {
  try {
    const recordings = await Recording.find();
    res.status(200).json(recordings);
  } catch (error) {
    res.status(500).json({ error: "Error getting recordings" });
  }
});
// Upload endpoint
app.post("/upload/:sessionid", upload.single("file"), async (req, res) => {
  try {
    const sessionIdUrl = req.params.sessionid;
    const newRecording = new Recording({
      filename: req.file.filename,
      path: req.file.path.replace(/\\/g, "/"),
      sessionID: req.headers.sessionid,
    });
    //console.log("req sess:"+req.headers.sessionid);
    //console.log("saved sess:"+req.session.userId);
    await newRecording.save();
    res.status(200).json({ message: "File uploaded successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error uploading file" });
  }
});

//enpoints for camcorder
// Configure multer for file uploads
const video_storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `video-uploads/${req.headers.sessionid}`);
  },
  filename: (req, file, cb) => {
    cb(null, `video-${Date.now()}-${file.originalname}`);
  },
});

const video_upload = multer({ storage: video_storage });

// Ensure uploads directory exists
// if (!fs.existsSync('video-uploads')) {
//   fs.mkdirSync('video-uploads');
// }

// Endpoint to handle video uploads
app.post('/video-upload/:sessionid', video_upload.single('video'), async (req, res) => {
  try {
    console.log('Video upload hit');
    //as param
    //sessionIdUrl = req.params.sessionid;
    const newRecordingV = new Video({
      filename: req.file.filename,
      path: req.file.path.replace(/\\/g, "/"),
      //also as header
      sessionID: req.headers.sessionid,
    });
    //console.log(req.headers.sessionid);
    await newRecordingV.save();
    res.status(200).json({ message: "video uploaded successfully!" + req.file.filename });
  } catch (error) {
    res.status(500).json({ error: "Error uploading video" });
  }
});

//getAllVideo endpoint
app.get("/getAllVideo", async (req, res) => {
  try {
    const recordingsV = await Video.find();
    res.status(200).json(recordingsV);
  } catch (error) {
    res.status(500).json({ error: "Error getting recordings" });
  }
});
//deleteVideo endpoint
app.delete('/deleteVideo/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const result = await Video.deleteOne({ filename: filename });
    fs.unlink(`video-uploads/${req.headers.sessionid}/${filename}`, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        return;
      }
      console.log('Video deleted successfully from uploads');
      res.status(200).json({ message: "video deleted successfully!" });
    });

  }
  catch (err) {
    res.status(500).json({ error: "Error deleting video" });
  }
});