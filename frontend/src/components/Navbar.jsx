import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  CalendarPlus,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Stethoscope,
  UserRound,
  X,
  Building2,
} from "lucide-react";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);

  const isActive = (path) => location.pathname === path;

  const baseLinkClass =
    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-black transition-all duration-300";

  const getLinkClass = (path) =>
    isActive(path)
      ? `${baseLinkClass} bg-[#e8fbfd] text-[#008e9b]`
      : `${baseLinkClass} text-gray-600 hover:bg-gray-50 hover:text-[#008e9b]`;

  const getMobileLinkClass = (path) =>
    isActive(path)
      ? "flex w-full items-center gap-3 rounded-2xl bg-[#e8fbfd] px-4 py-3 text-sm font-black text-[#008e9b]"
      : "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-gray-600 transition hover:bg-gray-50 hover:text-[#008e9b]";

  const roleLinks = {
    user: [
      {
        to: "/add-appointment",
        label: "Add Appointment",
        icon: <CalendarPlus size={17} />,
      },
      {
        to: "/my-appointments",
        label: "My Appointments",
        icon: <ClipboardList size={17} />,
      },
    ],
    doctor: [
      {
        to: "/doctor/appointments",
        label: "My Appointments",
        icon: <ClipboardList size={17} />,
      },
      {
        to: "/doctor/profile",
        label: "Profile",
        icon: <UserRound size={17} />,
      },
    ],
    admin: [
      {
        to: "/admin/dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard size={17} />,
      },
      {
        to: "/add-doctor",
        label: "Add Doctor",
        icon: <Stethoscope size={17} />,
      },
      {
        to: "/add-department",
        label: "Add Department",
        icon: <Building2 size={17} />,
      },
      {
        to: "/admin/appointments",
        label: "Appointments",
        icon: <ClipboardList size={17} />,
      },
    ],
  };

  const currentLinks = user?.role ? roleLinks[user.role] || [] : [];

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  const roleBadge = user?.role ? (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide text-white shadow-sm ${
        user.role === "admin"
          ? "bg-green-500"
          : user.role === "doctor"
            ? "bg-blue-500"
            : "bg-[#008e9b]"
      }`}
    >
      {user.role}
    </span>
  ) : null;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <img
            alt="MediCare Logo"
            className="h-14 w-auto object-contain"
            src="/logo.png"
          />
        </Link>

        <ul className="hidden items-center gap-2 md:flex">
          {currentLinks.map((item) => (
            <li key={item.to}>
              <Link to={item.to} className={getLinkClass(item.to)}>
                {item.icon}
                {item.label}
              </Link>
            </li>
          ))}

          {!user && (
            <>
              <li>
                <Link to="/login" className={getLinkClass("/login")}>
                  Login
                </Link>
              </li>

              <li>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-2xl !bg-[#008e9b] px-5 py-2.5 text-sm font-black text-white shadow-md transition-all hover:-translate-y-0.5 hover:!bg-[#007a85] hover:shadow-lg"
                >
                  Register
                </Link>
              </li>
            </>
          )}

          {user && (
            <li className="ml-2 flex items-center gap-3 border-l border-gray-100 pl-4">
              {roleBadge}

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-2xl !border-none !bg-red-50 px-4 py-2.5 text-sm font-black text-red-600 !shadow-none transition-all hover:-translate-y-0.5 hover:!bg-red-100"
              >
                <LogOut size={17} />
                Logout
              </button>
            </li>
          )}
        </ul>

        <button
          type="button"
          onClick={toggleMenu}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl !border-none !bg-[#e8fbfd] !p-0 text-[#008e9b] !shadow-none transition hover:!bg-[#d7f8fb] md:hidden"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 shadow-lg md:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col gap-2">
            {currentLinks.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={closeMenu}
                  className={getMobileLinkClass(item.to)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            ))}

            {!user ? (
              <li className="mt-3 grid grid-cols-1 gap-3 border-t border-gray-100 pt-4">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex w-full items-center justify-center rounded-2xl border border-[#008e9b]/20 bg-white px-5 py-3 text-sm font-black text-[#008e9b] transition hover:bg-[#e8fbfd]"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="flex w-full items-center justify-center rounded-2xl !bg-[#008e9b] px-5 py-3 text-sm font-black text-white shadow-md transition hover:!bg-[#007a85]"
                >
                  Register
                </Link>
              </li>
            ) : (
              <li className="mt-3 flex flex-col gap-3 border-t border-gray-100 pt-4">
                <div className="flex justify-center">{roleBadge}</div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl !border-none !bg-red-50 px-5 py-3 text-sm font-black text-red-600 !shadow-none transition hover:!bg-red-100"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
