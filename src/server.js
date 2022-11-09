import express from 'express';
import { db, connectToDb } from './db.js';
import 'dotenv/config';


// TODO: ADD ROOMS/CHATS TO MONGO DB AND GET THEM FROM THERE
// TODO: SETUP UP LOGIN OR AUTO COOKIE AND ID FOR USER

const app = express();


app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/api/rooms', async (req, res) => {
    const room = await db.collection('rooms').find({ name: "Room 1" }).toArray();
    res.send(room);
});

const PORT = process.env.PORT || 8000;

connectToDb(() => {
    console.log('Successfully connected to database!');
    app.listen(PORT, () => {
        console.log('Server is listening on port ' + PORT);
    });
})