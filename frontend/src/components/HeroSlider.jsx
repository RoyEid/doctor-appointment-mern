import { useState, useEffect } from "react";
import carousel_1 from "../img/hero-carousel/hero-carousel-1.jpg";
import carousel_2 from "../img/hero-carousel/hero-carousel-2.jpg";
import carousel_3 from "../img/hero-carousel/hero-carousel-3.jpg";

function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    {
      image: carousel_1,
      title: "Your Health, Our Priority",
      text: "We provide advanced medical care with experienced doctors, modern technology, and a caring approach for every patient.",
    },
    {
      image: carousel_2,
      title: "Specialized Medical Services",
      text: "From cardiology to pediatrics, our expert teams are ready to help you and your family stay healthy and safe.",
    },
    {
      image: carousel_3,
      title: "Easy Online Appointments",
      text: "Book your appointment quickly and conveniently with top doctors at your preferred time.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative w-full h-[80vh] overflow-hidden bg-gray-900">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
          aria-hidden={index !== currentIndex}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center text-center text-white px-6">
            <h2 className="text-3xl md:text-5xl text-[#46daea] font-extrabold mb-4 md:mb-6">
              {slide.title}
            </h2>

            <p className="max-w-2xl text-lg md:text-2xl font-light mb-8 opacity-90">
              {slide.text}
            </p>

            <a
              href="#about"
              tabIndex={index === currentIndex ? 0 : -1}
              className="inline-block bg-[#46daea] bg-opacity-90 text-black font-bold py-3 md:py-4 px-8 md:px-10 rounded-full shadow-lg hover:bg-[#43b0ba] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              Read More
            </a>
          </div>
        </div>
      ))}

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-[#46daea] scale-125"
                : "bg-white/50 hover:bg-white"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroSlider;
