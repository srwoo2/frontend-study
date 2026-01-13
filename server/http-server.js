require('dotenv').config();

const express = require("express");
const path = require("path");
const https = require("https");
const { loadSSL } = require("./config/ssl");
const corsMiddleware = require("./config/cors");
const { logClientMessage } = require("./config/logger");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(corsMiddleware);

// Static Files
app.use(express.static(path.join(__dirname, "../dist")));

// Firebase Config API Endpoint
app.get('/api/firebase-config', (req, res) => {
  res.json({
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.GA_MEASUREMENT_ID
  });
});

// Log Endpoint
app.post("/log", logClientMessage);

// HTTPS Server
const server = https.createServer(loadSSL(), app);

server.listen(PORT, () => {
  console.log(`HTTPS web server running at https://localhost:${PORT}`);
  console.log(`- Log Endpoint: POST https://localhost:${PORT}/log`);
});