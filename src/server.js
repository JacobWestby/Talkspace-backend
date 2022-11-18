import express, { json } from 'express';
import { db, connectToDb } from './db.js';
import 'dotenv/config';
import { ObjectId } from 'mongodb';


// ADD ROOMS/CHATS TO MONGO DB AND GET THEM FROM THERE Done
//  SETUP UP LOGIN OR AUTO COOKIE AND ID FOR USER Done

// TODO: Add axios post request to frontend to post new chats to the DB
// TODO: Add post request to create new room and add it to the DB

const app = express();
app.use(express.json());

app.get('/api/rooms', async (req, res) => {
    const room = await db.collection('rooms').find({}).toArray();
    res.send(room);
});

app.post('/api/rooms/:id', async (req, res) => {
    const { name, message, chatID, id } = req.body;

    const roomId = ObjectId(req.params.id);

    await db.collection('rooms').updateOne({ _id: roomId }, {
        $push: { chat: { name: name, message: message, chatID: chatID, id: id } }
    });

    const room = await db.collection('rooms').findOne({ _id: roomId });

    console.log(req.body);
    res.send(room.chat);
});

// app.get('/api/rooms/:currentRoom', async (req, res) => {
//     const { currentRoom } = req.params;
//     console.log(currentRoom);
//     const room = await db.collection('rooms').findOne({ currentRoom });
//     res.json(room);
// });

const PORT = process.env.PORT || 8000;

connectToDb(() => {
    console.log('Successfully connected to database!');
    app.listen(PORT, () => {
        console.log('Server is listening on port ' + PORT);
    });
});