import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JoinRoom: React.FC = () => {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      navigate(`/room/${roomId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
      <h2 className="text-3xl font-bold mb-6 text-purple-700">Join a Room</h2>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg flex flex-col gap-4 w-80">
        <input
          className="border rounded px-3 py-2"
          placeholder="Enter Room Code"
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
          required
        />
        <button type="submit" className="bg-purple-500 text-white py-2 rounded hover:bg-purple-600 transition">Join Room</button>
      </form>
    </div>
  );
};

export default JoinRoom; 