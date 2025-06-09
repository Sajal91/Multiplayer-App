import { io } from 'socket.io-client';

const URL = 'https://multiplayer-app.onrender.com/'; // Change if backend is hosted elsewhere
export const socket = io(URL, { autoConnect: false }); 

// https://multiplayer-app.onrender.com/
// http://localhost:5000/