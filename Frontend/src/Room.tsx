import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from './assets/socket';

interface Message {
  sender: string;
  message: string;
  timestamp: number;
  system?: boolean;
}

const Room: React.FC = () => {
  const { roomId, username } = useParams<{ roomId: string, username: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  // const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roomId) return;
    socket.connect();
    socket.emit('join-room', roomId, username, (res: any) => {
      if (res.success) {
        setJoined(true);
        setMessages((msgs) => [...msgs, { sender: 'system', message: 'You joined the room.', timestamp: Date.now(), system: true }]);
      } else {
        alert(res.error || 'Failed to join room');
        navigate('/');
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [roomId, navigate]);

  useEffect(() => {
    socket.on('receive-message', (msg: Message) => {
      setMessages((msgs) => [...msgs, msg]);
    });
    socket.on('system-message', (msg: string) => {
      setMessages((msgs) => [...msgs, { sender: 'system', message: msg, timestamp: Date.now(), system: true }]);
    });
    return () => {
      socket.off('receive-message');
      socket.off('system-message');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !username?.trim()) return;
    socket.emit('send-message', { roomId, message: input, sender: username });
    setInput('');
  };

  if (!joined) {
    return <div className="flex items-center justify-center h-screen">Joining room...</div>;
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4">
      <h2 className="text-2xl font-bold mb-2">Room: <span className="text-blue-600">{roomId}</span></h2>
      <div className="w-full max-w-xl bg-white rounded-lg shadow p-4 flex flex-col h-[70vh]">
        <div className="flex-1 overflow-y-auto mb-2">
          {messages.map((msg, idx) => (
            <div key={idx} className={`mb-1 ${msg.system ? 'text-gray-500 text-center text-xs' : msg.sender === username ? 'text-right' : 'text-left'}`}>
              {!msg.system && <span className="font-semibold text-blue-700">{msg.sender}: </span>}
              <span>{msg.message}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={sendMessage} className="flex gap-2 mt-2">
          {/* <input
            className="flex-1 border rounded px-2 py-1"
            placeholder="Your name"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          /> */}
          <input
            className="flex-1 border rounded px-2 py-1"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            required
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Room;
