import AboutUs from "../img/about.jpg";
function About() {
  return (
    <section id="about" className="py-16 bg-gray-50">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3 text-[#008e9b]">About Us</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We are dedicated to providing high-quality healthcare services with
          experienced doctors, modern facilities, and compassionate care. Our
          mission is to ensure every patient receives the attention and
          treatment they deserve.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 px-6 lg:px-8 items-center">
        <div className="relative group overflow-hidden rounded-2xl shadow-xl">
          <img src={AboutUs} alt="About Us" className="w-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <a
              href="https://www.youtube.com/watch?v=Y7f98aduVJ8"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-[#008e9b] rounded-full p-5 shadow-2xl hover:scale-110 transition-transform flex items-center justify-center w-20 h-20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <h3 className="text-2xl lg:text-3xl font-extrabold mb-6 text-gray-800 leading-tight">
            We are committed to providing trusted healthcare services with
            skilled professionals and advanced technology.
          </h3>
          <div className="bg-blue-50 border-l-4 border-[#008e9b] p-6 mb-8 rounded-r-lg">
            <p className="text-[#007a85] italic font-medium leading-relaxed">
              "We strive to deliver exceptional healthcare with a patient-first
              approach, combining expert medical knowledge, modern facilities, and
              compassionate care to improve lives."
            </p>
          </div>

          <ul className="space-y-4 text-gray-700 font-medium">
            <li className="flex items-start">
              <span className="text-[#46daea] mr-3 mt-1">✔</span>
              Quick and easy online appointment booking.
            </li>
            <li className="flex items-start">
              <span className="text-[#46daea] mr-3 mt-1">✔</span>
              Comprehensive healthcare services for your entire family.
            </li>
            <li className="flex items-start">
              <span className="text-[#46daea] mr-3 mt-1">✔</span>
              Compassionate care focused on your well-being.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default About;
