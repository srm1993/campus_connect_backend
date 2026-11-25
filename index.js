const express = require('express');
const app = express();

const http = require('http');
const { Server } = require('socket.io');

const UserRouter = require('./Routes/UserRouter');
const ClubRouter = require('./Routes/ClubRoutes');
const PostRouter = require('./Routes/PostRoutes');

const cors = require('cors');
const mongoose = require('mongoose');

const Club = require('./Models/ClubModel');

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/campus_connect')
    .then(() => console.log('MongoDb Connected'))
    .catch((err) => console.log(err));

// Event Status Scheduler
const {
    startEventStatusJob
} = require('./Jobs/eventStatusJob');

startEventStatusJob();

// Express Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({
    origin: "http://localhost:5173",
    methods: ['POST', 'GET', 'PUT', 'PATCH', 'DELETE']
}));

// Existing Routes
app.use('/api', UserRouter);
app.use('/club', ClubRouter);
app.use('/post', PostRouter);

// Static folders
app.use('/events', express.static('events'));
app.use('/clubs', express.static('clubs'));
app.use('/posts', express.static('posts'));

// Create HTTP Server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Make Socket.IO accessible inside controllers
app.set('io', io);

// Socket.IO Connection
io.on('connection', (socket) => {

    console.log('User connected:', socket.id);

    // Join Club Chat Room
    socket.on('joinClub', async ({ clubId, userId }) => {

        try {

            if (
                !mongoose.Types.ObjectId.isValid(clubId) ||
                !mongoose.Types.ObjectId.isValid(userId)
            ) {
                return socket.emit('chatError', {
                    message: 'Invalid club ID or user ID'
                });
            }

            // Check whether student is a club member
            const club = await Club.findOne({
                _id: clubId,
                members: userId,
                status: 'active'
            });

            if (!club) {

                return socket.emit('chatError', {
                    message: 'You are not authorized to join this club chat'
                });

            }

            // Join specific club room
            socket.join(`club:${clubId}`);

            console.log(
                `User ${userId} joined club chat ${clubId}`
            );

            socket.emit('joinedClub', {
                clubId,
                message: 'Successfully joined club chat'
            });

        } catch (error) {

            console.log('Socket Join Error:', error);

            socket.emit('chatError', {
                message: 'Unable to join club chat'
            });

        }

    });


    // Leave Club Chat Room
    socket.on('leaveClub', (clubId) => {

        socket.leave(`club:${clubId}`);

        console.log(
            `Socket ${socket.id} left club ${clubId}`
        );

    });


    // Disconnect
    socket.on('disconnect', () => {

        console.log('User disconnected:', socket.id);

    });

});


// Start HTTP + Socket.IO Server
const port = 8000;

server.listen(port, () => {

    console.log(`Server is running on ${port} port`);

    console.log('Socket.IO is ready');

});