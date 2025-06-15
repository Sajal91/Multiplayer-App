import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from './utils/socket';
import copyImg from "./assets/copy-icon.png"

interface Message {
  sender: string;
  message: string;
  timestamp: number;
  system?: boolean;
}

// interface AudioMessage {
//   sender: string;
//   audioBlob: Blob;
//   timestamp: number;
// }

const Room: React.FC = () => {
  const { roomId, username } = useParams<{ roomId: string, username: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [joined, setJoined] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [audio, setAudio] = useState<string | null>(null);
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!roomId) return;
    socket.connect();
    socket.emit('join-room', roomId, username, (res: any) => {
      if (res.success) {
        setJoined(true);
        // setMessages((msgs) => [...msgs, { sender: 'system', message: 'You joined the room.', timestamp: Date.now(), system: true }]);
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

    socket.on('receive-audio', (data: { sender: string, audioBlob: ArrayBuffer }) => {
      const audioBlob = new Blob([data.audioBlob], { type: 'audio/mp4' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      console.log(audio);
      setAudio(audioUrl);
      // audio.play();
    });

    return () => {
      socket.off('receive-message');
      socket.off('system-message');
      socket.off('receive-audio');
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

  const handleMic = async (e: any) => {
    e.preventDefault();
    setIsMicEnabled(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = []; // Reset chunks

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          socket.emit('voice-chunk', { roomId, chunk: event.data });
          audioChunksRef.current.push(event.data); // Save chunk locally
        }
      };

      mediaRecorder.start(200); // send data every 200ms
      console.log('Voice streaming started');
    } catch (err) {
      console.error('Error accessing mic:', err);
    }
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId || '');
  }

  const handleMicStop = (e: any) => {
    e.preventDefault();
    setIsMicEnabled(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      console.log(mediaRecorderRef.current.stream.getAudioTracks());
    }
    // Download the audio file
    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp4' });
      // const audioUrl = URL.createObjectURL(audioBlob);
      // const a = document.createElement('a');
      // a.href = audioUrl;
      // a.download = 'recorded-voice.mp4';
      // a.click();
      socket.emit('send-audio', { roomId, audioBlob, sender: username });
    }
    console.log('Voice streaming stopped');
  };

  if (!joined) {
    return <div className="flex items-center justify-center h-screen">Joining room...</div>;
  }

  return (
    <div className="flex justify-center flex-col items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4">
      <h2 className="text-2xl font-bold mb-2 flex items-center">Room ID: &nbsp;<span className="text-blue-600">{roomId}</span>&nbsp; <button onClick={handleCopyRoomId} className="text-white p-1 rounded h-6 w-6 cursor-pointer"><img src={copyImg} alt="" /></button></h2>
      <div className="w-full max-w-xl bg-white rounded-lg shadow p-4 flex flex-col h-[70vh]">
        <div className="flex-1 overflow-y-auto mb-2">
          {messages.map((msg, idx) => (
            <div key={idx} className={`mb-1 ${msg.system ? 'text-gray-500 text-center text-xs' : msg.sender === username ? 'text-right' : 'text-left'}`}>
              {!msg.system && <span className="font-semibold text-blue-700">{msg.sender}: </span>}
              <span>{msg.message}</span>
              {audio && <audio src={audio} controls></audio>}
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
          {!isMicEnabled ? <button onClick={(e) => handleMic(e)} className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 cursor-pointer">Mic</button> :
            <button onClick={e => handleMicStop(e)} className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 cursor-pointer">Stop</button>}
          <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 cursor-pointer">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Room;
