import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';

// nagm.io: marketing landing + the pre-auth flow (login / register / verify).
// After a successful sign-in these hand the session off to app.nagm.io.
export default function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
