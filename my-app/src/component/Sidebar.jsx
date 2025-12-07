import { Link, useLocation } from "react-router-dom";

const menu = [
  { label: "Home", icon: "🏠", path: "/home" },
  { label: "History", icon: "🕒", path: "/history" },
  { label: "Medical Assistant", icon: "🩺", path: "/chatbot" },
  { label: "Profile", icon: "👤", path: "/profile" },
];

export default function Sidebar({ isOpen }) {
  const location = useLocation();

  return (
    <aside
      className={`fixed top-0 left-0 h-screen w-56 bg-slate-900 text-white pt-20 border-r border-teal-400/20 z-40 flex flex-col transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-60"
      }`}
    >
      <nav className="flex flex-col gap-2 px-4">
        {menu.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
              location.pathname === item.path
                ? "bg-teal-700 text-white"
                : "hover:bg-teal-800 hover:text-teal-200"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
