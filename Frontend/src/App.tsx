import { Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './Home'
import Room from './Room'
import JoinRoom from './JoinRoom'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/join" element={<JoinRoom />} />
      </Routes>
    </>
  )
}

export default App