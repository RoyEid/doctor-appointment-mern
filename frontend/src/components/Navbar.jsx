import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Menu, X } from "lucide-react";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const getLinkClass = (path) => {
    return location.pathname === path
      ? "text-[#008e9b] font-bold border-b-2 border-[#008e9b] pb-1"
      : "text-gray-600 hover:text-[#008e9b] transition-colors";
  };
  
  const getMobileLinkClass = (path) => {
    return location.pathname === path
      ? "block w-full text-[#008e9b] font-bold bg-gray-50 p-2 rounded"
      : "block w-full text-gray-600 hover:text-[#008e9b] p-2 hover:bg-gray-50 transition-colors";
  };
  
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const roleLinks = {
    user: [
      { to: "/add-appointment", label: "Add Appointment" },
      { to: "/my-appointments", label: "My Appointments" },
    ],
    doctor: [
      { to: "/doctor/appointments", label: "My Appointments" },
      { to: "/doctor/profile", label: "Profile" },
    ],
    admin: [
      { to: "/admin/dashboard", label: "Dashboard" },
      { to: "/add-doctor", label: "Add Doctor" },
      { to: "/admin/appointments", label: "Manage Appointments" },
    ],
  };

  const currentLinks = user?.role ? roleLinks[user.role] || [] : [];

  return (
    <nav className="bg-white shadow-md text-[#008e9b] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-20">
        <Link to="/" onClick={closeMenu}>
          <img alt="MediCare Logo" className="w-32 hover:opacity-80 transition-opacity" src="/logo.png" />
        </Link>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="p-2 text-[#008e9b] hover:bg-gray-100 rounded-md focus:outline-none">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-8 items-center font-medium">
        {currentLinks.map((item, idx) => (
          <li key={`${item.to}-${idx}`}>
            <Link to={item.to} className={getLinkClass(item.to)}>{item.label}</Link>
          </li>
        ))}

        {!user && (
          <>
            <li>
              <Link to="/login" className={getLinkClass("/login")}>Login</Link>
            </li>
            <li>
              <Link to="/register" className={getLinkClass("/register")}>Register</Link>
            </li>
          </>
        )}

        {user && (
          <li className="flex items-center gap-3">
            {user.role === "admin" && (
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded font-bold shadow-sm">
                Admin
              </span>
            )}
            {user.role === "doctor" && (
              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded font-bold shadow-sm">
                Doctor
              </span>
            )}
            <button onClick={logout} className="bg-red-50 text-red-600 hover:bg-red-100 hover:scale-105 transition-all text-sm font-bold py-2 px-4 rounded-lg shadow-sm">Logout</button>
          </li>
        )}
      </ul>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t py-4 px-4 shadow-inner">
          <ul className="flex flex-col space-y-4 text-lg font-medium">
            {currentLinks.map((item, idx) => (
              <li key={`${item.to}-${idx}`}>
                <Link to={item.to} onClick={closeMenu} className={getMobileLinkClass(item.to)}>{item.label}</Link>
              </li>
            ))}
            
            {!user ? (
              <li className="pt-2 border-t flex flex-col space-y-3">
                <Link to="/login" onClick={closeMenu} className="text-center w-full bg-gray-50 text-[#008e9b] border border-[#008e9b] py-2 rounded-lg hover:bg-gray-100 transition">Login</Link>
                <Link to="/register" onClick={closeMenu} className="text-center w-full bg-[#008e9b] text-white py-2 rounded-lg hover:bg-[#007a85] transition">Register</Link>
              </li>
            ) : (
              <li className="pt-4 border-t flex flex-col space-y-3 items-center">
                {user.role === "admin" && (
                  <span className="text-xs bg-green-500 text-white px-3 py-1.5 rounded font-bold shadow-sm">
                    Admin
                  </span>
                )}
                {user.role === "doctor" && (
                  <span className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded font-bold shadow-sm">
                    Doctor
                  </span>
                )}
                <button onClick={() => { logout(); closeMenu(); }} className="w-full text-center bg-red-50 text-red-600 py-3 rounded-lg hover:bg-red-100 font-bold transition">Logout</button>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
