import { Link } from "react-router-dom";

function CallToAction() {
  return (
    <section className="bg-gradient-to-r from-[#e0fbff] to-[#bdfeff] text-gray-800 py-20 px-6 sm:px-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-[#46daea] opacity-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#008e9b] opacity-10 blur-3xl"></div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h3 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">
          In an emergency? Need help now?
        </h3>
        <p className="mt-4 mb-10 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Our team is available 24/7 to provide urgent care and immediate
          medical assistance whenever you need it most.
        </p>

        <Link
          to="/add-appointment"
          className="inline-flex items-center justify-center font-bold rounded-lg bg-[#008e9b] text-white py-4 px-10 text-lg hover:bg-[#007a85] focus:outline-none focus:ring-4 focus:ring-[#008e9b]/50 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
        >
          Make An Appointment
        </Link>
      </div>
    </section>
  );
}

export default CallToAction;
