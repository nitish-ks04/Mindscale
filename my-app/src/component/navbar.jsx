import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import jwt_decode from "jwt-decode";

export default function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("userInside");
    if (token) {
      try {
        const decoded = jwt_decode(token);
        const isExpired = decoded.exp * 1000 < Date.now();
        setIsLoggedIn(!isExpired);
        if (isExpired) localStorage.clear();
      } catch {
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [location]);

  const handleSignOut = () => {
    localStorage.removeItem("userInside");
    localStorage.removeItem("currentuser");
    setIsLoggedIn(false);
    navigate("/");
  };

  if (!isLoggedIn) return null;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-slate-900/70 backdrop-blur-xl border-b border-teal-400/20 shadow-lg px-6 md:px-10 py-4 flex items-center justify-between">
      <button
        onClick={onToggleSidebar}
        className="mr-4 text-white text-2xl focus:outline-none"
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isSidebarOpen ? "✖" : "☰"}
      </button>
      <Link
        to="/home"
        className="flex items-center gap-2 text-white font-bold text-xl tracking-wide hover:text-teal-300 transition-colors"
      >
        <span className="text-teal-400 text-2xl">🏥</span>
        <span>MindScale AI</span>
      </Link>
      <div className="flex items-center space-x-4">
        {location.pathname === "/profile" && (
          <button
            onClick={handleSignOut}
            className="px-5 py-1 border border-teal-400 text-white rounded-full font-semibold hover:bg-teal-500/20 transition-all transform hover:scale-[1.03]"
          >
            Sign Out
          </button>
        )}
      </div>
    </nav>
  );
}
