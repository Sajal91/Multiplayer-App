import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { socket } from './assets/socket';
import { v4 as uuidv4 } from 'uuid';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isCreateRoomBtnClicked, setIsCreateRoomBtnClicked] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");

  const handleCreateRoom = async () => {
    setIsCreateRoomBtnClicked(true);
  };

  const handleConfirmBtn = (e: any) => {
    e.preventDefault();
    socket.connect();
    const roomId = uuidv4();
    socket.emit('create-room', { roomId, username });
    navigate(`/room/${roomId}/${username}`);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
      <h1 className="text-4xl font-bold mb-10 text-gray-800">Welcome to Multiplayer Game</h1>
      {!isCreateRoomBtnClicked ? <div className="flex gap-8">
        <button
          onClick={handleCreateRoom}
          className="block p-8 rounded-xl shadow-lg bg-white hover:bg-blue-100 transition-all border-2 border-blue-300 hover:border-blue-500 text-center w-64"
        >
          <h2 className="text-2xl font-semibold mb-2 text-blue-700">Create a Room</h2>
          <p className="text-gray-600">Start a new game and invite your friends.</p>
        </button>
        <Link to="/join" className="block p-8 rounded-xl shadow-lg bg-white hover:bg-purple-100 transition-all border-2 border-purple-300 hover:border-purple-500 text-center w-64">
          <h2 className="text-2xl font-semibold mb-2 text-purple-700">Join a Room</h2>
          <p className="text-gray-600">Enter a code to join an existing game room.</p>
        </Link>
      </div> :
        <form onSubmit={e => handleConfirmBtn(e)} className='bg-white p-8 rounded-xl shadow-lg flex flex-col gap-4 w-80'>
          <input
            type="text"
            className='border rounded px-3 py-1 h-10'
            name="username"
            placeholder='Enter Your Name'
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            required
          />
          <button type='submit' className='px-2 bg-purple-500 text-white py-2 rounded hover:bg-purple-600 transition'>Confirm</button>
        </form>
      }
    </div>
  );
};

export default Home;
