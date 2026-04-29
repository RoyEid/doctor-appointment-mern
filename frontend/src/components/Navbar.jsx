import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Menu, X } from "lucide-react";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="bg-white shadow-md text-[#008e9b] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-20">
        <Link to="/" onClick={closeMenu}>
          <img alt="MediCare Logo" className="w-32 hover:opacity-80 transition-opacity" src="./logo.png" />
        </Link>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="p-2 text-[#008e9b] hover:bg-gray-100 rounded-md focus:outline-none">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-8 items-center font-medium">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <a href="#services">Services</a>
        </li>

        <li>
          <a href="#about">About</a>
        </li>

        {user?.role === "admin" && (
          <>
            <li>
              <Link to="/add-doctor">Add Doctor</Link>
            </li>
            <li>
              <Link to="/add-department">Add Department</Link>
            </li>
          </>
        )}

        {user?.role === "user" && (
          <>
            <li>
              <Link to="/add-appointment">Add Appointment</Link>
            </li>
            <li>
              <Link to="/my-appointments">My Appointments</Link>
            </li>
          </>
        )}

        {!user && (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
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
            <button onClick={logout} className="bg-red-50 text-red-600 hover:bg-red-100 hover:scale-105 transition-all text-sm font-bold py-2 px-4 rounded-lg shadow-sm">Logout</button>
          </li>
        )}
      </ul>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t py-4 px-4 shadow-inner absolute w-full">
          <ul className="flex flex-col space-y-4 text-lg font-medium">
            <li><Link to="/" onClick={closeMenu} className="block w-full hover:text-[#43b0ba]">Home</Link></li>
            <li><a href="#services" onClick={closeMenu} className="block w-full hover:text-[#43b0ba]">Services</a></li>
            <li><a href="#about" onClick={closeMenu} className="block w-full hover:text-[#43b0ba]">About</a></li>
            
            {user?.role === "admin" && (
              <>
                <li><Link to="/add-doctor" onClick={closeMenu} className="block w-full hover:text-[#43b0ba]">Add Doctor</Link></li>
                <li><Link to="/add-department" onClick={closeMenu} className="block w-full hover:text-[#43b0ba]">Add Department</Link></li>
              </>
            )}
            
            {user?.role === "user" && (
              <>
                <li><Link to="/add-appointment" onClick={closeMenu} className="block w-full hover:text-[#43b0ba]">Add Appointment</Link></li>
                <li><Link to="/my-appointments" onClick={closeMenu} className="block w-full hover:text-[#43b0ba]">My Appointments</Link></li>
              </>
            )}
            
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
