import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // Replace with your server URL

export default function Home() {
  const [roomId, setRoomId] = useState<string>("room1");
  const [playerId, setPlayerId] = useState<string>("");
  const [isRoomJoined, setIsRoomJoined] = useState<boolean>(false);

  useEffect(() => {
    socket.on("welcome", (message) => {
      console.log(message)
    })

    return () => {
      socket.off('welcome');
    };
  }, [roomId]);

  const handleJoinRoom = () => {
    socket.on("player-joined", async(id) => {
      let playerId = await id
      console.log(playerId, "player joined")
      setPlayerId(playerId)
    }) 
    setIsRoomJoined(true)
  }

  return (
    <>
      {
        !isRoomJoined ? <button onClick={handleJoinRoom}>Join Room</button> :
        <div>
          <h2>Multiplayer Room: {roomId}</h2>
          <h3>{playerId} player joined</h3>
        </div>
      }
    </>
  );
}