import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./toaststyle.css";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Chatbot from "./pages/chatbot";
import Histroy from "./pages/history";

function App() {
  useEffect(() => {
    // Inject dummy data to bypass auth checks throughout the app
    if (!localStorage.getItem("userInside")) {
      localStorage.setItem("userInside", "dummy_token");
      localStorage.setItem("currentuser", JSON.stringify({
        _id: "dummy123",
        name: "Guest User",
        email: "guest@example.com"
      }));
    }
  }, []);

  return (
    <BrowserRouter>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable={false}
        theme="colored"
        toastClassName="custom-toast"
      />


      <Routes>
        {/* Bypass landing page directly to home */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/history" element={<Histroy />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
