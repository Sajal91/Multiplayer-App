import { io } from 'socket.io-client';

const URL = 'http://localhost:5000'; // Change if backend is hosted elsewhere
export const socket = io(URL, { autoConnect: false }); 