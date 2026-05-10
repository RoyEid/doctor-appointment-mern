import { Link } from "react-router-dom";
import {
  CalendarCheck,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

function Footer() {
  const year = new Date().getFullYear();

  const quickLinks = [
    { label: "Home", to: "/" },
    { label: "Doctors", to: "/allDoctors" },
    { label: "Book Appointment", to: "/add-appointment" },
    { label: "My Appointments", to: "/my-appointments" },
  ];

  const services = [
    {
      label: "Online Appointments",
      icon: <CalendarCheck size={15} />,
    },
    {
      label: "Doctor Profiles",
      icon: <Stethoscope size={15} />,
    },
    {
      label: "Medical Departments",
      icon: <HeartPulse size={15} />,
    },
    {
      label: "Appointment Reminders",
      icon: <ShieldCheck size={15} />,
    },
  ];

  const contactItems = [
    {
      label: "Lebanon",
      icon: <MapPin size={17} />,
    },
    {
      label: "support@medicare.com",
      icon: <Mail size={17} />,
    },
    {
      label: "+961 81 123 456",
      icon: <Phone size={17} />,
    },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-gray-100 bg-white text-gray-700 transition-colors dark:border-[#1f3a40] dark:bg-[#071416] dark:text-slate-300">
      {/* Decorative Blur Elements */}
      <div className="pointer-events-none absolute left-[-180px] top-[-160px] h-96 w-96 rounded-full bg-[#46daea]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-180px] right-[-160px] h-96 w-96 rounded-full bg-[#008e9b]/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo & Description */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <img
                src="/logo.png"
                alt="MediCare Logo"
                className="h-16 w-auto rounded-2xl object-contain"
              />
            </Link>

            <p className="mt-5 max-w-sm text-sm font-medium leading-relaxed text-gray-500 dark:text-slate-400">
              MediCare helps patients book appointments with trusted doctors,
              manage visits, and receive healthcare updates in one modern
              platform.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 text-lg font-black text-gray-900 dark:text-white">
              Quick Links
            </h3>

            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition-colors hover:text-[#008e9b] dark:text-slate-400 dark:hover:text-[#46daea]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#008e9b] dark:bg-[#46daea]" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-5 text-lg font-black text-gray-900 dark:text-white">
              Services
            </h3>

            <ul className="space-y-3">
              {services.map((service) => (
                <li
                  key={service.label}
                  className="flex items-center gap-3 text-sm font-bold text-gray-500 dark:text-slate-400"
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#e8fbfd] text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
                    {service.icon}
                  </span>

                  <span className="leading-none">{service.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="mb-5 text-lg font-black text-gray-900 dark:text-white">
              Contact
            </h3>

            <ul className="space-y-3">
              {contactItems.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-3 text-sm font-bold text-gray-500 dark:text-slate-400"
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#e8fbfd] text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
                    {item.icon}
                  </span>

                  <span className="leading-none">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 border-t border-gray-100 pt-6 dark:border-[#1f3a40]">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">
              © {year} MediCare Medical Center. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.14em] text-gray-400 dark:text-slate-500">
              <span>Online Care</span>
              <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-slate-600" />
              <span>Trusted Doctors</span>
              <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-slate-600" />
              <span>Easy Booking</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
