import express, { json } from 'express';
import { db, connectToDb } from './db.js';
import 'dotenv/config';
import { ObjectId } from 'mongodb';
import cors from 'cors';
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);


app.use(cors());
app.use(express.json());

// * Connect socketIO

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000"
    }
});

// * Changestream for socketIO to update chat in real time

io.on('connection', (socket) => {
    const changeStream = db.collection('rooms').watch();
    changeStream.on('change', (change) => {
        try {
            if (change.operationType === 'update') {
                socket.emit('messageResponse', Object.values(change.updateDescription.updatedFields)[0]);
            }
        } catch (error) {
            console.log(error);
        }
    })
});

// * Get all rooms

app.get('/api/rooms', async (req, res) => {
    const room = await db.collection('rooms').find({}).toArray();
    res.send(room);
});

// * Get a single room

app.get('/api/rooms/:id', async (req, res) => {
    const roomId = ObjectId(req.params.id);

    const room = await db.collection('rooms').findOne({ _id: roomId });
    res.send(room);
});

// * Post a new chat to a room

app.post('/api/rooms/:id', async (req, res) => {
    const { name, message, chatID, id, roomID, time, socketID } = req.body;
    const roomId = ObjectId(req.params.id);

    await db.collection('rooms').updateOne({ _id: roomId }, {
        $push: {
            chat: {
                name: name,
                message: message,
                chatID: chatID,
                id: id,
                roomID: roomID,
                time: time,
                socketID: socketID
            }
        }
    });

    const room = await db.collection('rooms').findOne({ _id: roomId });
    const chat = room.chat.find(chat => chat.id === id);
    res.send(chat);
});

// * Create a new room

app.post('/api/create', async (req, res) => {
    const { name } = req.body;
    const newRoom = await db.collection('rooms').insertOne({ name: name, chat: [] });

    const room = await db.collection('rooms').findOne({ _id: newRoom.insertedId });
    res.send(room);
});


// * Delete room 

app.delete('/api/rooms/delete/:id', async (req, res) => {
    const roomId = ObjectId(req.params.id);

    try {
        await db.collection('rooms').deleteOne({ _id: roomId });

        res.send('Room deleted');
    } catch (error) {
        console.log(error);
    };
});

// * =================== * //

const PORT = process.env.PORT || 8000;

connectToDb(() => {
    console.log('Successfully connected to database!');
    httpServer.listen(PORT, () => {
        console.log('Server is listening on port ' + PORT);
    });
});