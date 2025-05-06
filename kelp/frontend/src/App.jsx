import { Routes, Route } from 'react-router-dom';
import Login from './Components/Login.jsx';
import Chatbot from './Components/Chatbot.jsx';
import './App.css'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chatbot" element={<Chatbot />} />
        {/* <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} /> */}

      </Routes>
    </>
  )
}

export default App
