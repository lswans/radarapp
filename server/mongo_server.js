import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import {config} from 'dotenv';
import { defineConfig } from 'vite';

// Load environment variables from .env file
config(); 

export default defineConfig({
  // Your Vite configuration
  define: {
    'process.env': process.env
  }
});
// Check environment variables
console.log(import.meta.env.VITE_SERVER_PORT)
console.log(import.meta.env.VITE_MONGODB_CONNECTION_STRING)


const app = express();
const port = import.meta.env.VITE_SERVER_PORT || 3001; // Fallback to 3001

// Middleware
app.use(cors());
app.use(express.json()); 

// MongoDB setup
const uri = import.meta.env.VITE_MONGODB_CONNECTION_STRING;
if (!uri) {
    console.error('MongoDB connection string is not defined in environment variables');
    process.exit(1);
}
const client = new MongoClient(uri);

const dbName = "radar-app-database";
const collectionName = "user-locations";
let db; // Declare db in outer scope so it's available to all routes

async function connectToMongo() {
    try {
        await client.connect();
        db = client.db(dbName);
        await db.collection(collectionName).createIndex({ "location": "2dsphere" });
        console.log('Connected to MongoDB Atlas');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

// Connect to MongoDB when server starts
connectToMongo();

// POST

app.post('/api/track', async (req, res) => {
    try {
        const { radarLocation, userId, geofenceId } = req.body;
        
        if (!radarLocation || !radarLocation.latitude || !radarLocation.longitude) {
            return res.status(400).json({ error: 'Invalid location data' });
        }

        const trackingData = {
            userId: userId || 'anonymous',
            geofenceId: geofenceId,
            location: {
                type: 'Point',
                coordinates: [radarLocation.longitude, radarLocation.latitude]
            },
            timestamp: new Date(),
            accuracy: radarLocation.accuracy,
            provider: radarLocation.provider
        };

        const result = await db.collection('locations').insertOne(trackingData);
        
        res.status(201).json({
            message: 'Location tracked successfully',
            trackingId: result.insertedId
        });
    } catch (error) {
        console.error('Error saving location:', error);
        res.status(500).json({ error: 'Failed to save location data' });
    }
});

// GET endpoint
app.get('/api/tracks/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const tracks = await db.collection('locations')
            .find({ userId })
            .sort({ timestamp: -1 })
            .limit(10)
            .toArray();
            
        res.json(tracks);
    } catch (error) {
        console.error('Error retrieving tracks:', error);
        res.status(500).json({ error: 'Failed to retrieve tracking data' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});