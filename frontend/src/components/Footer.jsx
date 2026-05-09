import { Link } from "react-router-dom";
import {
  CalendarCheck,
  Facebook,
  HeartPulse,
  Instagram,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
  Twitter,
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
    "Online Appointments",
    "Doctor Profiles",
    "Medical Departments",
    "Appointment Reminders",
  ];

  return (
    <footer className="relative overflow-hidden border-t border-gray-100 bg-white text-gray-700 transition-colors dark:border-[#1f3a40] dark:bg-[#071416] dark:text-slate-300">
      <div className="pointer-events-none absolute left-[-180px] top-[-160px] h-96 w-96 rounded-full bg-[#46daea]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-180px] right-[-160px] h-96 w-96 rounded-full bg-[#008e9b]/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
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

            <div className="mt-6 flex items-center gap-3">
              <a
                href="#top"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8fbfd] text-[#008e9b] transition-all hover:-translate-y-0.5 hover:bg-[#008e9b] hover:text-white dark:bg-[#46daea]/15 dark:text-[#46daea] dark:hover:bg-[#46daea] dark:hover:text-[#071416]"
              >
                <Facebook size={18} />
              </a>

              <a
                href="#top"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8fbfd] text-[#008e9b] transition-all hover:-translate-y-0.5 hover:bg-[#008e9b] hover:text-white dark:bg-[#46daea]/15 dark:text-[#46daea] dark:hover:bg-[#46daea] dark:hover:text-[#071416]"
              >
                <Instagram size={18} />
              </a>

              <a
                href="#top"
                aria-label="Twitter"
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8fbfd] text-[#008e9b] transition-all hover:-translate-y-0.5 hover:bg-[#008e9b] hover:text-white dark:bg-[#46daea]/15 dark:text-[#46daea] dark:hover:bg-[#46daea] dark:hover:text-[#071416]"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

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

          <div>
            <h3 className="mb-5 text-lg font-black text-gray-900 dark:text-white">
              Services
            </h3>

            <ul className="space-y-3">
              {services.map((service) => (
                <li
                  key={service}
                  className="flex items-center gap-3 text-sm font-bold text-gray-500 dark:text-slate-400"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e8fbfd] text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
                    {service === "Online Appointments" ? (
                      <CalendarCheck size={15} />
                    ) : service === "Doctor Profiles" ? (
                      <Stethoscope size={15} />
                    ) : service === "Medical Departments" ? (
                      <HeartPulse size={15} />
                    ) : (
                      <ShieldCheck size={15} />
                    )}
                  </span>
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-lg font-black text-gray-900 dark:text-white">
              Contact
            </h3>

            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm font-bold text-gray-500 dark:text-slate-400">
                <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#e8fbfd] text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
                  <MapPin size={17} />
                </span>
                Lebanon
              </li>

              <li className="flex items-start gap-3 text-sm font-bold text-gray-500 dark:text-slate-400">
                <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#e8fbfd] text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
                  <Mail size={17} />
                </span>
                support@medicare.com
              </li>

              <li className="flex items-start gap-3 text-sm font-bold text-gray-500 dark:text-slate-400">
                <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#e8fbfd] text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
                  <Phone size={17} />
                </span>
                +961 00 000 000
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-100 pt-6 dark:border-[#1f3a40]">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">
              © {year} MediCare Medical Center. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.14em] text-gray-400 dark:text-slate-500">
              <span>Secure</span>
              <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-slate-600" />
              <span>Modern</span>
              <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-slate-600" />
              <span>Patient-first</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;