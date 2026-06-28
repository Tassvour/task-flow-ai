import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-indigo-400 tracking-tight">
        TaskFlow
      </Link>

      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 hidden sm:block">
            Hi, {user.name}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
