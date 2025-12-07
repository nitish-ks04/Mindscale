import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/signup",
        formData
      );

      if (res.data?.token) {
        localStorage.setItem("userInside", res.data.token);
      }
      if (res.data?.user) {
        localStorage.setItem("currentuser", JSON.stringify(res.data.user));
      }

      toast.success("Signup successful! 🎉");
      navigate("/home");
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left Section - Signup Form */}
          <div className="bg-slate-900/95 p-8 md:p-10 relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2 text-white font-bold text-xl tracking-wide">
                <span className="text-teal-400 text-2xl">🏥</span>
                <span>MediCare Assistant</span>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-white mb-2">
              Create Account
            </h1>
            <p className="text-slate-400 mb-8">
              Sign up to get started with your AI Medical Assistant 🩺
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full bg-slate-800/50 border-2 border-slate-700 text-white placeholder-slate-500 py-3 px-4 focus:border-teal-500 focus:outline-none transition-colors"
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full bg-slate-800/50 border-2 border-slate-700 text-white placeholder-slate-500 py-3 px-4 focus:border-teal-500 focus:outline-none transition-colors"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full bg-slate-800/50 border-2 border-slate-700 text-white placeholder-slate-500 py-3 px-4 focus:border-teal-500 focus:outline-none transition-colors"
                required
              />

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-teal-500/50"
              >
                Sign Up
              </button>

              {/* Route to Login */}
              <p className="text-center text-sm text-slate-400 mt-4">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-teal-400 hover:text-teal-300 font-medium"
                >
                  Login here
                </Link>
              </p>
            </form>
          </div>

          {/* Right Section - Image */}
          <div className="hidden md:block bg-slate-800/50 min-h-[600px] relative">
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop"
              alt="Medical Care"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/800x600/14b8a6/white?text=MediCare+AI";
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
